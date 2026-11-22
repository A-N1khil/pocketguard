import type { CategorySchema, TempHoldCategory } from "@/models/category-model";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";

type BulkUploadStep3Props = {
	tempHoldCategories: TempHoldCategory[];
	categoriesUpdated: (categories: CategorySchema[]) => void;
};

export function BulkUploadStep3({
	tempHoldCategories,
	categoriesUpdated,
}: BulkUploadStep3Props) {
	return (
		<div className="grid grid-cols-3 gap-4 m-2">
			<div className="col-span-1">
				<Card className="ring-0 shadow-none" size="sm">
					<CardHeader>
						<CardTitle>Let&apos;s set your Categories</CardTitle>
						<CardDescription>
							Go through the categories you want and select which ones
							you&apos;d like to add to the database
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CategoryAlert />
					</CardContent>
				</Card>
			</div>
			<div className="h-full col-span-2">
				<Card className="h-full">
					<CardHeader>
						<CardTitle>Status</CardTitle>
					</CardHeader>
					<CardContent className="h-full"></CardContent>
				</Card>
			</div>
		</div>
	);
}

function CategoryAlert() {
	return (
		<Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
			<IconAlertTriangle />
			<AlertTitle>Categories affect your Transactions.</AlertTitle>
			<AlertDescription>
				Only those transactions will be shown, whose category you choose to
				update in this step.{" "}
				<span className="font-semibold">
					Any category that is not selected, all transactions belonging to that
					category will be discarded in the next step.
				</span>
			</AlertDescription>
		</Alert>
	);
}

function CategoryTable() {}
