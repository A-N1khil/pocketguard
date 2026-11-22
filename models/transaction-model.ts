import { Category, SubCategory } from "@/models/category-model";

export type TransactionType = "CREDIT" | "DEBIT";

export interface Transaction {
	id: number;
	title: string;
	transactionType: TransactionType;
	category: Category;
	subCategory: SubCategory;
	amount: number;
	timestamp: string;
}

export interface TransactionSchema {
	id: number;
	title: string;
	transactionType: "CREDIT" | "DEBIT";
	amount: number;
	timestamp: string;
	categoryId: number;
	subCategoryId: number;
}

export interface CreateTransaction {
	title: string;
	transactionType: TransactionType;
	amount: number;
	timestamp: string;
	categoryId: number;
	subCategoryId: number;
}

export interface UpdateTransaction extends CreateTransaction {
	id: number;
}

export interface TempHoldTransaction extends Omit<
	CreateTransaction,
	"categoryId" | "subCategoryId"
> {
	categoryName: string;
	subCategoryName: string;
}
