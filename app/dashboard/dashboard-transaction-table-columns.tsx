import type { Transaction } from "@/models/transaction-model";
import TransactionFieldIcon from "@/components/transaction/transaction-field-icon";
import dayjs, { Dayjs } from "dayjs";
import { Pill, PillIndicator } from "@/components/kibo-ui/pill";
import { createColumnHelper } from "@tanstack/react-table";
import { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";

const columnHelper = createColumnHelper<BaseDataTableFeatures, Transaction>();

export const transactionColumns = columnHelper.columns([
	columnHelper.accessor("timestamp", {
		header: () => (
			<div className="flex items-center justify-center gap-2">
				<TransactionFieldIcon field={"timestamp"} /> Time
			</div>
		),
		cell: ({ row }) => {
			const dayjsDate: Dayjs = dayjs(row.getValue("timestamp"));
			const formattedDate: string = dayjsDate.format("ll");
			const formattedTime: string = dayjsDate.format("LT");
			return (
				<div className="text-center">
					{formattedDate}&nbsp;
					<p className="text-muted-foreground">{formattedTime}</p>
				</div>
			);
		},
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
	columnHelper.accessor(
		(transaction: Transaction) => transaction.category.name,
		{
			id: "category",
			header: () => (
				<div className="flex items-center justify-start gap-2">
					<TransactionFieldIcon field={"category"} />
					Category
				</div>
			),
		},
	),
	columnHelper.accessor(
		(transaction: Transaction) => transaction.subCategory.name,
		{
			id: "subCategory",
			header: () => (
				<div className="flex items-center justify-start gap-2">
					<TransactionFieldIcon field={"subCategory"} />
					SubCategory
				</div>
			),
		},
	),
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
