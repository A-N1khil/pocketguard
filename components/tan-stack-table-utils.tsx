import type { ReactTable, RowData } from "@tanstack/react-table";
import { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type MetadataVisibility = {
	selectBoxes?: boolean;
	itemCount?: boolean;
};

type TanStackTableUtilsProps<TData extends RowData> = {
	table: ReactTable<BaseDataTableFeatures, TData>;
	className?: string;
	showMetadata?: MetadataVisibility;
};

export function TanStackTableUtils<TData extends RowData>({
	table,
	className = "",
	showMetadata = { selectBoxes: false, itemCount: false },
}: TanStackTableUtilsProps<TData>) {
	return (
		<div
			className={cn("grid grid-cols-[1fr_auto_1fr] items-center", className)}
		>
			{showMetadata.itemCount && <ShowItemCount table={table} />}
			<TablePagination
				className="col-start-3 justify-end mx-0 w-auto"
				table={table}
			/>
		</div>
	);
}

function TablePagination<TData extends RowData>({
	table,
	className,
}: TanStackTableUtilsProps<TData>) {
	const pageIndex = table.state.pagination.pageIndex;
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
	return (
		<Pagination className={className}>
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
	);
}

function ShowItemCount<TData extends RowData>({
	table,
}: TanStackTableUtilsProps<TData>) {
	const { pageIndex, pageSize } = table.state.pagination;
	const rowCount: number = table.getPrePaginatedRowModel().rows.length;
	const end: number = Math.min((pageIndex + 1) * pageSize, rowCount);
	const start: number = end === 0 ? 0 : Math.min(pageIndex * pageSize + 1, end);

	return (
		<div className="col-start-2 whitespace-nowrap justify-between text-sm">
			Showing items <span className="font-semibold">{start}</span>
			{" - "}
			<span className="font-semibold">{end}</span>
			{"  "}
			of <span className="font-semibold">{rowCount}</span> records
		</div>
	);
}
