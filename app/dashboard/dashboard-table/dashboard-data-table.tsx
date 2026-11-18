"use client";

import { useTable, type ColumnDef } from "@tanstack/react-table";
import {
	features,
	type DataTableFeatures,
	type TransactionTableData,
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
import {
	getAllTransactions,
	getAllTransactionsSorted,
} from "@/actions/transaction-actions";

interface DashboardDataTableProps {
	columns: ColumnDef<DataTableFeatures, TransactionTableData>[];
	data: TransactionTableData[];
}

/*
 * TODO: Add Select box
 *    TODO: Make cells clickable and open CreateTransactionForm in update mode
 */

function DataTable({ columns, data }: DashboardDataTableProps) {
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

export default function DashboardDataTable() {
	const [transactionTableData, setTransactionTableData] =
		useState<TransactionTableData[]>();

	useEffect(() => {
		const fetchAllTransactions = async () => {
			const rawTransactions: Transaction[] = await getAllTransactionsSorted(
				"timestamp",
				"desc",
			);
			if (rawTransactions) {
				setTransactionTableData(rawTransactions);
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
