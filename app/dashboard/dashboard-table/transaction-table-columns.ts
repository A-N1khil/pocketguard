import { TransactionType } from "@/models/transaction-model";

export type TransactionTableColumns = {
	id: number;
	title: string;
	transactionType: TransactionType;
	category: string;
	subCategory: string;
	amount: number;
};
