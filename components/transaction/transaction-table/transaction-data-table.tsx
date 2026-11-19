"use client";

import {
	useTable,
	type Table as TanStackTable,
	FlexRender,
} from "@tanstack/react-table";
import {
	features,
	type DataTableFeatures,
	type TransactionTableData,
	transactionColumns,
} from "@/components/transaction/transaction-table/transaction-table-data";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/models/transaction-model";
import { useState } from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTableProps {
	table: TanStackTable<DataTableFeatures, TransactionTableData>;
}

/*
 * TODO: Add Select box
 *    TODO: Make cells clickable and open CreateTransactionForm in update mode
 */

function DataTable({ table }: DataTableProps) {
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

type TransactionDataTableProps = {
	transactions: Transaction[];
};

function _toTableData(transactions: Transaction[]): TransactionTableData[] {
	return transactions.map((transaction: Transaction): TransactionTableData => {
		return {
			...transaction,
			isUpdated: false,
		};
	});
}

export default function TransactionDataTable({
	transactions,
}: TransactionDataTableProps) {
	const [previousTransactions, setPreviousTransactions] =
		useState<Transaction[]>(transactions);

	const [transactionTableData, setTransactionTableData] = useState<
		TransactionTableData[]
	>(() => _toTableData(transactions));

	if (transactions !== previousTransactions) {
		setPreviousTransactions(transactions);
		setTransactionTableData(_toTableData(transactions));
	}

	const table = useTable({
		features,
		data: transactionTableData,
		columns: transactionColumns,
		getRowId: (transaction: TransactionTableData) => String(transaction.id),
	});

	const { pageIndex } = table.state.pagination;
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
		<div className="grid grid-cols-4 gap-2">
			{transactionTableData && (
				<>
					<div className="col-span-full col-start-1">
						<DataTable table={table} />
					</div>
					<div className="col-span-full flex items-center justify-between gap-4">
						<div className="whitespace-nowrap text-sm">
							Showing items{" "}
							<span className="font-semibold">
								{table.state.pagination.pageIndex * 10 + 1}
							</span>
							{" - "}
							<span className="font-semibold">
								{Math.min(
									table.state.pagination.pageIndex * 10 + 10,
									transactionTableData.length,
								)}
							</span>
							{"  "}
							of{" "}
							<span className="font-semibold">
								{transactionTableData.length}
							</span>{" "}
							records
						</div>
						<Pagination className="justify-end mx-0 w-auto">
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
				</>
			)}
		</div>
	);
}
