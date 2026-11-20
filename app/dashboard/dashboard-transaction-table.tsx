"use client";

import { Transaction } from "@/models/transaction-model";
import { useEffect, useState } from "react";
import { getAllTransactions } from "@/actions/transaction-actions";
import TransactionDataTable from "@/components/transaction/transaction-table/transaction-data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionTable } from "@/hooks/use-transaction-table";

import { transactionColumns } from "@/app/dashboard/dashboard-transaction-table-columns";

export default function DashboardTransactionTable() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		const fetchTransactions = async () => {
			setTransactions(
				await getAllTransactions({
					sorting: { key: "timestamp", order: "desc" },
				}),
			);
		};

		void fetchTransactions();
	}, []);

	const table = useTransactionTable<Transaction>({
		data: transactions,
		columns: transactionColumns,
	});

	// TODO: Add tabs and other controls
	return (
		<>
			{transactions && (
				<>
					<div id="table-actions" className="mb-2.5">
						<Tabs defaultValue="all" className="w-100">
							<TabsList>
								<TabsTrigger
									value="all"
									onClick={() =>
										table
											.getColumn("transactionType")
											?.setFilterValue(undefined)
									}
								>
									All Transactions
								</TabsTrigger>
								<TabsTrigger
									value="only-debit"
									onClick={() =>
										table.getColumn("transactionType")?.setFilterValue("DEBIT")
									}
								>
									DEBIT only
								</TabsTrigger>
								<TabsTrigger
									value="only-credit"
									onClick={() =>
										table.getColumn("transactionType")?.setFilterValue("CREDIT")
									}
								>
									CREDIT only
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
					<TransactionDataTable table={table} />
				</>
			)}
		</>
	);
}
