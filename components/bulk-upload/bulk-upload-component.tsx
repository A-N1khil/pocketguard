"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	IconChevronLeft,
	IconChevronRight,
	IconCircleNumber1,
	IconCircleNumber1Filled,
	IconCircleNumber2,
	IconCircleNumber2Filled,
	IconCircleNumber3,
	IconCircleNumber3Filled,
	IconCircleNumber4,
	IconCircleNumber4Filled,
	IconTableExclamation,
	IconTableImport,
	IconThumbUp,
} from "@tabler/icons-react";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { BulkUploadStep1 } from "@/components/bulk-upload/bulk-upload-step-1";
import { ComponentType, useEffect, useState } from "react";
import { TempHoldTransaction } from "@/models/transaction-model";
import { BulkUploadStep2 } from "@/components/bulk-upload/bulk-upload-step-2";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TempHoldCategory } from "@/models/category-model";

type IconComponent = ComponentType<{ size: number }>;

function DelayedFillIcon({
	OutlineIcon,
	FilledIcon,
	filled,
}: {
	OutlineIcon: IconComponent;
	FilledIcon: IconComponent;
	filled: boolean;
}) {
	const [delayElapsed, setDelayElapsed] = useState(false);

	useEffect(() => {
		if (!filled) return;

		const timer = setTimeout(() => setDelayElapsed(true), 500);
		return () => clearTimeout(timer);
	}, [filled]);

	if (!filled && delayElapsed) {
		setDelayElapsed(false);
	}

	const Icon = filled && delayElapsed ? FilledIcon : OutlineIcon;
	return <Icon size={48} />;
}

type BulkUploadTransactionDialogProps = {
	dialog: { openDialog: boolean; setOpenDialog: (open: boolean) => void };
};

export default function BulkUploadTransactionDialog({
	dialog,
}: BulkUploadTransactionDialogProps) {
	const { openDialog, setOpenDialog } = dialog;

	const [introStep, setIntroStep] = useState<number>(1);

	// CSV upload from Step 1
	const [uploadedCSV, setUploadedCSV] = useState<File | undefined>();

	// Temp transactions from Step 2
	const [tempHoldTransactions, setTempHoldTransactions] = useState<
		TempHoldTransaction[]
	>([]);
	// Temp categories from Step 2
	const [tempHoldCategories, setTempHoldCategories] = useState<
		TempHoldCategory[]
	>([]);

	const canAdvanceByStep: Record<number, boolean> = {
		1: Boolean(uploadedCSV),
		2: tempHoldTransactions.length > 0,
	};

	return (
		<Dialog
			key="bulkUploadTransactionDialog"
			open={openDialog}
			onOpenChange={setOpenDialog}
			modal={true}
		>
			<DialogContent className="h-auto w-[75vw] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-none">
				<DialogHeader>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink render={<a href="#">Transactions</a>} />
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink render={<a href="#">Bulk Upload</a>} />
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<DialogTitle className="flex items-center gap-2 mt-2">
						<IconTableImport /> Bulk Upload Transactions
					</DialogTitle>
				</DialogHeader>

				{/* Content */}
				<div className="min-w-0 overflow-auto">
					<div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-y-1">
						{/* Row 1: Step icons */}
						<div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-x-2 pt-0">
							<DelayedFillIcon
								OutlineIcon={IconCircleNumber1}
								FilledIcon={IconCircleNumber1Filled}
								filled={introStep >= 1}
							/>

							<Progress value={introStep >= 2 ? 100 : 0} />

							<DelayedFillIcon
								OutlineIcon={IconCircleNumber2}
								FilledIcon={IconCircleNumber2Filled}
								filled={introStep > 1}
							/>

							<Progress value={introStep >= 3 ? 100 : 0} />

							<DelayedFillIcon
								OutlineIcon={IconCircleNumber3}
								FilledIcon={IconCircleNumber3Filled}
								filled={introStep > 2}
							/>
							<Progress value={introStep >= 4 ? 100 : 0} />

							<DelayedFillIcon
								OutlineIcon={IconCircleNumber4}
								FilledIcon={IconCircleNumber4Filled}
								filled={introStep > 3}
							/>
						</div>
						<div className="min-h-0 overflow-y-auto">
							{introStep === 1 && (
								<BulkUploadStep1 file={uploadedCSV} setFile={setUploadedCSV} />
							)}
							{introStep === 2 && uploadedCSV && (
								<BulkUploadStep2
									file={uploadedCSV}
									setTempHoldTransactions={setTempHoldTransactions}
									tempHoldTransactions={tempHoldTransactions}
									setTempHoldCategories={setTempHoldCategories}
								/>
							)}
						</div>
					</div>
				</div>
				<DialogFooter className="flex-row justify-between items-center sm:justify-between">
					<DialogClose
						className="justify-start"
						render={<Button variant="outline">Close</Button>}
					/>
					<div className="flex items-center gap-2">
						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button type="button" hidden={introStep === 1}>
										<IconChevronLeft />
										Previous
									</Button>
								}
							/>
							<AlertDialogContent size="sm">
								<AlertDialogHeader>
									<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
										<IconTableExclamation />
									</AlertDialogMedia>
									<AlertDialogTitle>Go back?</AlertDialogTitle>
									<AlertDialogDescription>
										This <span className="underline font-semibold">might</span>{" "}
										reset your progress so far. Are you sure?
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel variant="outline">
										Cancel
									</AlertDialogCancel>
									<AlertDialogCancel
										variant="destructive"
										onClick={() => {
											setIntroStep((prev) => prev - 1);
										}}
									>
										Yes, Go Back
									</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							type="button"
							onClick={() => {
								setIntroStep((prev) => prev + 1);
							}}
							disabled={!canAdvanceByStep[introStep]}
						>
							{introStep === 4 ? (
								<>
									<IconThumbUp />
									Finish
								</>
							) : (
								<>
									Next <IconChevronRight />
								</>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
