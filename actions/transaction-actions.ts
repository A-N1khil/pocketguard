import { db } from "@/index";
import { transactionTable } from "@/db/schema";
import { Transaction, TransactionSchema } from "@/models/transaction-model";
import {
	getCategoryById,
	getSubCategoryById,
} from "@/actions/category-actions";
import { Category } from "@/models/category-model";

export async function getAllTransactions(): Promise<Transaction[]> {
	const rawTransactionsFromDB: TransactionSchema[] = await db
		.select()
		.from(transactionTable);

	const transactions: Transaction[] = [];
	for (const dbTransaction of rawTransactionsFromDB) {
		const category: Category | undefined = await getCategoryById(
			dbTransaction.categoryId,
		);
		const subCategory = await getSubCategoryById(
			dbTransaction.subCategoryId,
			dbTransaction.categoryId,
		);
		const transaction = {
			id: dbTransaction.id,
			title: dbTransaction.title,
			transactionType: dbTransaction.transactionType,
			amount: dbTransaction.amount,
			timestamp: dbTransaction.timestamp,
			category: category,
			subCategory: subCategory,
		} as Transaction;
		transactions.push(transaction);
	}

	return transactions;
}
