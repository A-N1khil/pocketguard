import { defineRelations } from "drizzle-orm";
import { categoryTable, subCategoryTable, transactionTable } from "@/db/schema";

export const relations = defineRelations(
	{
		t: transactionTable,
		c: categoryTable,
		sc: subCategoryTable,
	},
	(r) => ({
		c: {
			subCategories: r.many.sc(),
			transactions: r.many.t(),
		},
		sc: {
			category: r.one.c({
				from: r.sc.categoryId,
				to: r.c.id,
				optional: false,
			}),
			transactions: r.many.t(),
		},
		t: {
			category: r.one.c({
				from: r.t.categoryId,
				to: r.c.id,
				optional: false,
			}),
			subCategory: r.one.sc({
				from: r.t.subCategoryId,
				to: r.sc.id,
				optional: false,
			}),
		},
	}),
);
