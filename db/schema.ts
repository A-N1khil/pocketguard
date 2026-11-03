import { doublePrecision, integer, pgEnum, snakeCase, timestamp, varchar } from "drizzle-orm/pg-core";

export const categoryTable = snakeCase.table("category" , {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({length: 255}).notNull().unique()
});

export const subCategoryTable = snakeCase.table("subCategory", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	categoryId: integer().notNull().references(() => categoryTable.id)
});

export const transactionTypeEnum = pgEnum("trancType", ["CREDIT", "DEBIT"]);

export const transactionTable = snakeCase.table("transactions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	transactionType: transactionTypeEnum().notNull(),
	timestamp: timestamp({ withTimezone: true}),
	categoryId: integer().notNull().references(() => categoryTable.id),
	subCategoryId: integer().notNull().references(() => subCategoryTable.id),
	amount: doublePrecision().notNull(),
});