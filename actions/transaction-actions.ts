"use server";

import { db } from "@/index";
import { transactionTable } from "@/db/schema";
import {
	CreateTransaction,
	Transaction,
	UpdateTransaction,
} from "@/models/transaction-model";
import { eq } from "drizzle-orm";

export async function getAllTransactionsNew(): Promise<Transaction[]> {
	return await db.query.t.findMany({
		columns: { categoryId: false, subCategoryId: false },
		with: { category: true, subCategory: true },
	});
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

export async function updateTransactionById(
	modifiedTransaction: UpdateTransaction,
): Promise<Transaction | undefined> {
	const updateResponse: { updatedId: number }[] = await db
		.update(transactionTable)
		.set(modifiedTransaction)
		.where(eq(transactionTable.id, modifiedTransaction.id))
		.returning({ updatedId: transactionTable.id });

	if (updateResponse && updateResponse.length > 0) {
		return getTransactionWithId(updateResponse[0].updatedId);
	}
}

// getTransactionWithId(1);
// getAllTransactionsNew();
