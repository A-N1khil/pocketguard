"use client";

import { Transaction } from "@/models/transaction-model";
import { useEffect, useState } from "react";
import { getAllTransactionsSorted } from "@/actions/transaction-actions";
import TransactionDataTable from "@/components/transaction/transaction-table/transaction-data-table";

export default function DashboardTransactionTable() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		const fetchTransactions = async () => {
			setTransactions(await getAllTransactionsSorted("timestamp", "desc"));
		};

		void fetchTransactions();
	}, []);

	// TODO: Add tabs and other controls
	return (
		<>{transactions && <TransactionDataTable transactions={transactions} />}</>
	);
}
