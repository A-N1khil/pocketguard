"use client";

import { useTable, type TableOptions } from "@tanstack/react-table";
import {
	features,
	type BaseDataTableFeatures,
} from "@/components/transaction/transaction-table/transaction-table-base-features";
import type { Transaction } from "@/models/transaction-model";

type TransactionTableRow<TRow extends Transaction> = Omit<
	TableOptions<BaseDataTableFeatures, TRow>,
	"features" | "getRowId"
>;

export function useTransactionTable<TRow extends Transaction>(
	options: TransactionTableRow<TRow>,
) {
	return useTable<BaseDataTableFeatures, TRow>({
		...options,
		features,
		getRowId: (transaction: TRow): string => String(transaction.id),
	});
}
