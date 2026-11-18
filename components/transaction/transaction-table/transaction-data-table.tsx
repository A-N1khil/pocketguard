"use client";

import { useTable, type ColumnDef } from "@tanstack/react-table";
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

interface DataTableProps {
	columns: ColumnDef<DataTableFeatures, TransactionTableData>[];
	data: TransactionTableData[];
}

/*
 * TODO: Add Select box
 *    TODO: Make cells clickable and open CreateTransactionForm in update mode
 */

function DataTable({ columns, data }: DataTableProps) {
	const table = useTable({
		features,
		data,
		columns,
		getRowId: (transaction: TransactionTableData) => String(transaction.id),
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

	return <DataTable columns={transactionColumns} data={transactionTableData} />;
}
