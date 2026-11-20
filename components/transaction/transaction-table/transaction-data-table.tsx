"use client";

import { type ReactTable, FlexRender } from "@tanstack/react-table";
import type { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/models/transaction-model";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

type DataTableProps<TRow extends Transaction> = {
	table: ReactTable<BaseDataTableFeatures, TRow>;
};

function DataTable<TRow extends Transaction>({ table }: DataTableProps<TRow>) {
	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader className="sticky top-0 z-10 bg-muted">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : <FlexRender header={header} />}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										<FlexRender cell={cell} />
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default function TransactionDataTable<TRow extends Transaction>({
	table,
}: DataTableProps<TRow>) {
	const { pageIndex, pageSize } = table.state.pagination;
	const pageCount = table.getPageCount();
	const visiblePageCount = Math.min(3, pageCount);
	const firstPageIndex = Math.max(
		0,
		Math.min(pageIndex - 1, pageCount - visiblePageCount),
	);
	const endPageIndex = firstPageIndex + visiblePageCount;
	const visiblePageIndexes = Array.from(
		{ length: visiblePageCount },
		(_, offset) => firstPageIndex + offset,
	);

	// Metadata
	const rowCount: number = table.getPrePaginatedRowModel().rows.length;
	const end: number = Math.min((pageIndex + 1) * pageSize, rowCount);
	const start: number = end === 0 ? 0 : Math.min(pageIndex * pageSize + 1, end);

	return (
		<div className="grid grid-cols-4 gap-2">
			<div className="col-span-full col-start-1">
				<DataTable table={table} />
			</div>
			<div className="col-span-full grid grid-cols-[1fr_auto_1fr] items-center">
				<div className="col-start-2 whitespace-nowrap justify-between text-sm">
					Showing items <span className="font-semibold">{start}</span>
					{" - "}
					<span className="font-semibold">{end}</span>
					{"  "}
					of <span className="font-semibold">{rowCount}</span> records
				</div>
				<Pagination className="col-start-3 justify-end mx-0 w-auto">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => table.previousPage()}
								aria-disabled={!table.getCanPreviousPage()}
								className={
									!table.getCanPreviousPage()
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>
						{firstPageIndex > 0 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
						{visiblePageIndexes.map((index) => (
							<PaginationItem key={index}>
								<PaginationLink
									onClick={() => table.setPageIndex(index)}
									isActive={pageIndex === index}
								>
									{index + 1}
								</PaginationLink>
							</PaginationItem>
						))}
						{endPageIndex < pageCount && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
						<PaginationItem>
							<PaginationNext
								onClick={() => table.nextPage()}
								aria-disabled={!table.getCanNextPage()}
								className={
									!table.getCanNextPage()
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
