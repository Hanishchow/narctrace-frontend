import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { EvidenceRecord, ResultClass } from "../../api/types";
import { Button } from "../Button";
import { cn } from "../../lib/utils";

interface RecordsTableProps {
  records: EvidenceRecord[];
  onOpenRecord?: (testId: string) => void;
}

const RESULT_TEXT: Record<ResultClass, string> = {
  Positive: "text-positive",
  Negative: "text-negative",
  Inconclusive: "text-inconclusive",
};

const RESULT_DOT: Record<ResultClass, string> = {
  Positive: "bg-positive",
  Negative: "bg-negative",
  Inconclusive: "bg-inconclusive",
};

const columns: ColumnDef<EvidenceRecord>[] = [
  {
    accessorKey: "test_id",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        Test ID
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
      </button>
    ),
    cell: ({ row }) => <span className="mono text-sm font-medium">{row.original.test_id}</span>,
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", RESULT_DOT[row.original.result])} aria-hidden="true" />
        <span className={cn("text-sm font-medium", RESULT_TEXT[row.original.result])}>
          {row.original.result}
        </span>
      </span>
    ),
  },
  {
    accessorKey: "profile_id",
    header: "Kit profile",
    cell: ({ row }) => <span className="mono text-xs text-muted-foreground">{row.original.profile_id}</span>,
  },
  {
    accessorKey: "operator_id",
    header: "Operator",
    cell: ({ row }) => <span className="mono text-xs text-muted-foreground">{row.original.operator_id}</span>,
  },
  {
    accessorKey: "timestamp_utc",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        Timestamp
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.timestamp_local || row.original.timestamp_utc}</span>
    ),
  },
  {
    accessorKey: "quality",
    header: "Quality",
    cell: ({ row }) => (
      <span
        className={cn(
          "text-xs font-medium",
          row.original.quality.passed ? "text-muted-foreground" : "text-destructive",
        )}
      >
        {row.original.quality.passed ? "Passed" : "Failed"}
      </span>
    ),
  },
];

export function RecordsTable({ records, onOpenRecord }: RecordsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "timestamp_utc", desc: true }]);
  const data = useMemo(() => records, [records]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onOpenRecord?.(row.original.test_id)}
                className={cn(
                  "border-b border-border last:border-0",
                  onOpenRecord && "cursor-pointer hover:bg-accent",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <Button variant="secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
