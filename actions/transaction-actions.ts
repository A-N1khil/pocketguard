"use server";

import { db } from "@/index";
import { transactionTable } from "@/db/schema";
import {
	CreateTransaction,
	Transaction,
	TransactionSchema,
} from "@/models/transaction-model";
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

export async function insertTransaction(
	transaction: CreateTransaction,
): Promise<Transaction | undefined> {
	console.log(transaction);
	const { createdId }: { createdId: number } = (
		await db
			.insert(transactionTable)
			.values(transaction)
			.returning({ createdId: transactionTable.id })
	)[0];

	if (createdId) {
		return getTransactionWithId(createdId);
	}
}

export async function getTransactionWithId(
	transactionId: number,
): Promise<Transaction | undefined> {
	return await db.query.t.findFirst({
		where: { id: transactionId },
		with: { category: true, subCategory: true },
	});
}

export async function getAllTransactionsNew(): Promise<Transaction[]> {
	return await db.query.t.findMany({
		columns: { categoryId: false, subCategoryId: false },
		with: { category: true, subCategory: true },
	});
}

// getTransactionWithId(1);
// getAllTransactionsNew();
