"use server";

import { db } from "@/index";
import { transactionTable } from "@/db/schema";
import {
	CreateTransaction,
	Transaction,
	UpdateTransaction,
} from "@/models/transaction-model";
import { eq } from "drizzle-orm";

type _PaginationOptions = {
	page?: number;
	pageSize?: number;
};

function _getPaginationOptions(pagination?: _PaginationOptions) {
	if (!pagination) {
		return {};
	}

	const { page = 1, pageSize = 10 } = pagination;

	if (
		!Number.isSafeInteger(page) ||
		!Number.isSafeInteger(pageSize) ||
		page < 1 ||
		pageSize < 1
	) {
		throw new Error("Page and pagesize must be > 1");
	}

	return {
		limit: pageSize,
		offset: (page - 1) * pageSize,
	};
}

export async function getAllTransactions(
	pagination?: _PaginationOptions,
): Promise<Transaction[]> {
	return await db.query.t.findMany({
		columns: { categoryId: false, subCategoryId: false },
		with: { category: true, subCategory: true },
		..._getPaginationOptions(pagination),
	});
}

export async function getAllTransactionsSorted(
	key: keyof Transaction,
	orderBy: "asc" | "desc" = "asc",
	pagination?: _PaginationOptions,
): Promise<Transaction[]> {
	return await db.query.t.findMany({
		columns: { categoryId: false, subCategoryId: false },
		with: { category: true, subCategory: true },
		orderBy: { [key]: orderBy },
		..._getPaginationOptions(pagination),
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
