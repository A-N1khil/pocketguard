import { Category, SubCategory } from "@/models/category-model";

export enum TransactionType {
	CREDIT = "CREDIT",
	DEBIT = "DEBIT",
}

export interface Transaction {
	id: number;
	title: string;
	transactionType: TransactionType;
	category: Category;
	subCategory: SubCategory;
	amount: number;
	timestamp: Date;
}

export interface TransactionSchema {
	id: number;
	title: string;
	transactionType: "CREDIT" | "DEBIT";
	amount: number;
	timestamp: Date | null;
	categoryId: number;
	subCategoryId: number;
}
