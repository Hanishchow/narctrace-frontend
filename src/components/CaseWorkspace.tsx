import { useEffect, useState } from "react";
import { ArrowRight, ClipboardPlus, FileText, RefreshCw } from "lucide-react";
import { ApiError, addLabReport, createCase, getCases, transitionCase } from "../api/client";
import type { FieldCase } from "../api/types";
import { Button } from "./Button";

const NEXT_ACTION: Partial<Record<FieldCase["status"], { action: string; label: string }>> = {
  open: { action: "submit", label: "Submit to lab" },
  submitted: { action: "receive", label: "Mark lab received" },
  received_by_lab: { action: "review", label: "Mark reviewed" },
  reviewed: { action: "close", label: "Close case" },
};

function LabReportForm({ fieldCase, onSaved }: { fieldCase: FieldCase; onSaved: (value: FieldCase) => void }) {
  const [laboratory, setLaboratory] = useState("");
  const [outcome, setOutcome] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!laboratory.trim() || !outcome.trim() || !reference.trim()) return;
    setSaving(true);
    try {
      const response = await addLabReport(fieldCase, laboratory, outcome, reference);
      onSaved(response.case);
      setLaboratory("");
      setOutcome("");
      setReference("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
      <input value={laboratory} onChange={(event) => setLaboratory(event.target.value)} placeholder="Laboratory" className="min-h-[38px] rounded-md border border-input bg-background px-2 text-xs" />
      <input value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Confirmatory outcome" className="min-h-[38px] rounded-md border border-input bg-background px-2 text-xs" />
      <div className="flex gap-2">
        <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Report reference" className="min-h-[38px] min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
        <button type="submit" disabled={saving || !laboratory || !outcome || !reference} className="rounded-md px-2 text-xs font-semibold text-accent-strong disabled:opacity-50">
          {saving ? "Saving" : "Attach"}
        </button>
      </div>
    </form>
  );
}

export function CaseWorkspace() {
  const [cases, setCases] = useState<FieldCase[]>([]);
  const [reference, setReference] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getCases()
      .then((response) => setCases(response.cases))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load cases."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reference.trim() || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await createCase(reference, title);
      setCases((current) => [response.case, ...current]);
      setReference("");
      setTitle("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create case.");
    } finally {
      setSaving(false);
    }
  };

  const advance = async (fieldCase: FieldCase) => {
    const next = NEXT_ACTION[fieldCase.status];
    if (!next) return;
    setError(null);
    try {
      const response = await transitionCase(fieldCase, next.action);
      setCases((current) => current.map((item) => item.case_id === fieldCase.case_id ? response.case : item));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update this case.");
      load();
    }
  };

  return (
    <section className="measurement-rail rounded-r-xl bg-card px-5 py-5 shadow-[0_12px_30px_hsl(160_20%_12%/0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Case workspace</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Field-to-lab handoff</h2>
        </div>
        <button type="button" onClick={load} className="text-muted-foreground hover:text-foreground" aria-label="Refresh cases">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[0.8fr_1.4fr_auto]">
        <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Case reference" className="min-h-[44px] rounded-lg border border-input bg-background px-3 text-sm" />
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Case title" className="min-h-[44px] rounded-lg border border-input bg-background px-3 text-sm" />
        <Button type="submit" disabled={saving || !reference.trim() || !title.trim()}>
          <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving" : "Create"}
        </Button>
      </form>

      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-4 grid gap-2">
        {!loading && cases.length === 0 && <p className="rounded-lg bg-muted/70 p-3 text-sm text-muted-foreground">Create a case before submitting field evidence for laboratory review.</p>}
        {cases.slice(0, 4).map((fieldCase) => {
          const next = NEXT_ACTION[fieldCase.status];
          return (
            <article key={fieldCase.case_id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mono text-xs text-muted-foreground">{fieldCase.reference}</p>
                  <p className="mt-1 text-sm font-semibold">{fieldCase.title}</p>
                </div>
                <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium">{fieldCase.status.replaceAll("_", " ")}</span>
              </div>
              {fieldCase.lab_reports?.length ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5" aria-hidden="true" />{fieldCase.lab_reports.length} laboratory report{fieldCase.lab_reports.length === 1 ? "" : "s"} attached</p>
              ) : null}
              {next && (
                <button type="button" onClick={() => advance(fieldCase)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong hover:opacity-75">
                  {next.label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              {fieldCase.status === "received_by_lab" && (
                <LabReportForm fieldCase={fieldCase} onSaved={(updated) => setCases((current) => current.map((item) => item.case_id === updated.case_id ? updated : item))} />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
