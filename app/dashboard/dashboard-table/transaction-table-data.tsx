import { TransactionType } from "@/models/transaction-model";
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_includesString,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";
import TransactionFieldIcon from "@/components/transaction/transaction-field-icon";
import { Pill, PillIndicator } from "@/components/kibo-ui/pill";

export type TransactionTableData = {
	id: number;
	title: string;
	transactionType: TransactionType;
	category: string;
	subCategory: string;
	amount: number;
};

export const features = tableFeatures({
	columnFilteringFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: { includesString: filterFn_includesString },
	sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
export type DataTableFeatures = typeof features;

const columnHelper = createColumnHelper<
	DataTableFeatures,
	TransactionTableData
>();

export const transactionColumns = columnHelper.columns([
	columnHelper.accessor("id", {
		header: () => (
			<div className="flex items-center justify-start gap-2">
				<TransactionFieldIcon field={"id"} />
			</div>
		),
	}),
	columnHelper.accessor("title", {
		header: () => (
			<div className="flex items-center justify-start gap-2">
				<TransactionFieldIcon field={"title"} />
				Title
			</div>
		),
	}),
	columnHelper.accessor("transactionType", {
		header: () => (
			<div className="flex items-center justify-start gap-2">
				<TransactionFieldIcon field={"transactionType"} />
				Type
			</div>
		),
		cell: ({ row }) => {
			const type = row.getValue("transactionType");
			return (
				<Pill>
					<PillIndicator
						pulse={type === "CREDIT"}
						variant={type === "CREDIT" ? "success" : "error"}
					/>
					{row.getValue("transactionType")}
				</Pill>
			);
		},
	}),
	columnHelper.accessor("category", {
		header: () => (
			<div className="flex items-center justify-start gap-2">
				<TransactionFieldIcon field={"category"} />
				Category
			</div>
		),
	}),
	columnHelper.accessor("subCategory", {
		header: () => (
			<div className="flex items-center justify-start gap-2">
				<TransactionFieldIcon field={"subCategory"} />
				SubCategory
			</div>
		),
	}),
	columnHelper.accessor("amount", {
		header: () => (
			<div className="flex items-center justify-end gap-2">
				<TransactionFieldIcon field={"amount"} />
				Amount
			</div>
		),
		cell: ({ row }) => {
			const amount: number = parseFloat(row.getValue("amount"));
			const parts = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).formatToParts(amount);
			const finalFormattedAmount = `${parts[0].value} ${parts.slice(1).reduce((acc, part) => `${acc}${part.value}`, "")}`;
			return <div className="text-right">{finalFormattedAmount}</div>;
		},
	}),
]);
