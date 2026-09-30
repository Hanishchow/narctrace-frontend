import type { Gps } from "../api/types";

const DATABASE = "narctrace-offline";
const STORE = "captures";
export const CAPTURE_QUEUE_CHANGED = "narctrace:capture-queue-changed";

function announceQueueChange() {
  window.dispatchEvent(new Event(CAPTURE_QUEUE_CHANGED));
}

export interface QueuedCapture {
  idempotencyKey: string;
  image: Blob;
  profileId: string;
  operatorId: string;
  gps: Gps | null;
  capturedAt: string;
  status: "queued" | "retryable_error";
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onerror = () => reject(request.error ?? new Error("Could not open offline storage."));
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "idempotencyKey" });
    request.onsuccess = () => resolve(request.result);
  });
}

async function transact<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = work(transaction.objectStore(STORE));
    request.onerror = () => reject(request.error ?? new Error("Offline storage operation failed."));
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("Offline storage transaction failed."));
    };
  });
}

export async function queueCapture(capture: QueuedCapture): Promise<IDBValidKey> {
  const result = await transact("readwrite", (store) => store.put(capture));
  announceQueueChange();
  return result;
}

export async function removeQueuedCapture(idempotencyKey: string): Promise<undefined> {
  const result = await transact("readwrite", (store) => store.delete(idempotencyKey));
  announceQueueChange();
  return result;
}

export async function queuedCapturesFor(operatorId: string): Promise<QueuedCapture[]> {
  const records = await transact<QueuedCapture[]>("readonly", (store) => store.getAll());
  return records.filter((record) => record.operatorId === operatorId);
}

export async function flushQueuedCaptures(
  operatorId: string,
  submit: (capture: QueuedCapture) => Promise<unknown>,
): Promise<{ submitted: number; remaining: number }> {
  const captures = await queuedCapturesFor(operatorId);
  let submitted = 0;
  for (const capture of captures) {
    try {
      await submit(capture);
      await removeQueuedCapture(capture.idempotencyKey);
      submitted += 1;
    } catch {
      await queueCapture({ ...capture, status: "retryable_error" });
    }
  }
  return { submitted, remaining: captures.length - submitted };
}
