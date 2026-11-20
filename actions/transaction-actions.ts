"use server";

import { db } from "@/index";
import { transactionTable } from "@/db/schema";
import {
	CreateTransaction,
	Transaction,
	TransactionType,
	UpdateTransaction,
} from "@/models/transaction-model";
import { eq } from "drizzle-orm";

type _SortingOptions = {
	key?: keyof typeof transactionTable.$inferSelect;
	order?: "asc" | "desc";
};

function _getSortingOptions(
	sortingOptions: _SortingOptions,
	defaultTimestampSort: boolean,
):
	| Partial<Record<keyof typeof transactionTable.$inferSelect, "asc" | "desc">>
	| undefined {
	if (defaultTimestampSort) {
		return { timestamp: "asc" };
	}

	const { key, order = "asc" } = sortingOptions;
	return key ? { [key]: order } : undefined;
}

export async function getAllTransactions({
	defaultTimestampSort = false,
	sorting = {},
}: { sorting?: _SortingOptions; defaultTimestampSort?: boolean } = {}): Promise<
	Transaction[]
> {
	return await db.query.t.findMany({
		columns: { categoryId: false, subCategoryId: false },
		with: { category: true, subCategory: true },
		orderBy: _getSortingOptions(sorting, defaultTimestampSort),
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

export async function getAllTransactionsOfType(
	transactionType: TransactionType,
	{
		defaultTimestampSort = false,
		sorting = {},
	}: { sorting?: _SortingOptions; defaultTimestampSort?: boolean } = {},
): Promise<Transaction[]> {
	return await db.query.t.findMany({
		where: { transactionType },
		with: { category: true, subCategory: true },
		orderBy: _getSortingOptions(sorting, defaultTimestampSort),
	});
}

// getTransactionWithId(1);
// getAllTransactionsNew();
