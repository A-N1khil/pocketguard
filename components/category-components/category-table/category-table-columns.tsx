import type { CategorySchema } from "@/models/category-model";
import { createColumnHelper } from "@tanstack/react-table";
import { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";
import { IconTag, IconTags } from "@tabler/icons-react";

const columnHelper = createColumnHelper<
	BaseDataTableFeatures,
	CategorySchema
>();

export const categoryColumns = columnHelper.columns([
	columnHelper.accessor("name", {
		header: () => (
			<div className="flex items-center justify-center gap-2">
				<IconTag /> Category
			</div>
		),
	}),
	columnHelper.accessor("subCategories.name", {
		header: () => (
			<div className="flex items-center justify-center gap-2">
				<IconTags /> Sub-Category
			</div>
		),
	}),
]);
