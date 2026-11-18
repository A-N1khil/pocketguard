"use client";

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import {
	features,
	type DataTableFeatures,
	TransactionTableData,
	transactionColumns,
} from "@/app/dashboard/dashboard-table/transaction-table-data";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/models/transaction-model";
import { useEffect, useState } from "react";
import { getAllTransactions } from "@/actions/transaction-actions";

interface DashboardDataTableProps<TData extends RowData> {
	columns: ColumnDef<DataTableFeatures, TData>[];
	data: TData[];
}

/*
 * TODO: Add Select box
 *  TODO: Add timestamp as column (formatting enabled)
 *   TODO: Add pills
 *    TODO: Make cells clickable and open CreateTransactionForm in update mode
 */

function DataTable<TData extends RowData>({
	columns,
	data,
}: DashboardDataTableProps<TData>) {
	const table = useTable({
		features,
		data,
		columns,
	});

	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader className="sticky top-0 z-10 bg-muted">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : (
										<table.FlexRender header={header} />
									)}
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
										<table.FlexRender cell={cell} />
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default function DashboardDataTable() {
	const [transactionTableData, setTransactionTableData] =
		useState<TransactionTableData[]>();

	useEffect(() => {
		const fetchAllTransactions = async () => {
			const rawTransactions: Transaction[] = await getAllTransactions();
			// TODO: Add sorting by timestamp
			if (rawTransactions) {
				setTransactionTableData(
					rawTransactions.map((transaction: Transaction) => {
						return {
							...transaction,
							category: transaction.category.name,
							subCategory: transaction.subCategory.name,
						};
					}),
				);
			}
		};

		void fetchAllTransactions();
	}, []);

	return (
		<>
			{transactionTableData && (
				<DataTable columns={transactionColumns} data={transactionTableData} />
			)}
		</>
	);
}
