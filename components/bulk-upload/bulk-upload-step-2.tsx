import type { CSVValidationResponse } from "@/actions/csv-actions";
import { type TempHoldTransaction } from "@/models/transaction-model";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
	Trace,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@/components/ui/trace";
import {
	IconAlertCircle,
	IconCircleCheck,
	IconFidgetSpinner,
	IconHourglassLow,
} from "@tabler/icons-react";
import { TempHoldCategory } from "@/models/category-model";

const validationStages = [
	"Parse CSV",
	"Validate headers",
	"Validate data",
	"Create transactions",
	"Create categories and subcategories",
];

type BulkUploadStep2Props = {
	file: File;
	tempHoldTransactions: TempHoldTransaction[];
	setTempHoldTransactions: (
		tempHoldTransactions: TempHoldTransaction[],
	) => void;
	setTempHoldCategories: (tempHoldCategories: TempHoldCategory[]) => void;
};

export function BulkUploadStep2({
	file,
	setTempHoldTransactions,
	tempHoldTransactions,
	setTempHoldCategories,
}: BulkUploadStep2Props) {
	const [status, setStatus] = useState<{
		file: File;
		update: CSVValidationResponse;
	}>();
	const update = status?.file === file ? status.update : undefined;
	let activeStep: number;
	if (update?.type === "done" || tempHoldTransactions.length !== 0) {
		activeStep = 6;
	} else {
		activeStep = update?.step ?? 1;
	}

	useEffect(() => {
		const controller = new AbortController();
		let step = 1;

		async function validateFile() {
			try {
				const formData = new FormData();
				formData.set("csv", file);

				const response = await fetch("/api/transactions/validate-csv", {
					method: "POST",
					body: formData,
					signal: controller.signal,
				});

				if (!response.ok || !response.body) {
					throw new Error("CSV validation request failed.");
				}

				const reader = response.body
					.pipeThrough(new TextDecoderStream())
					.getReader();
				let buffer = "";

				try {
					while (!controller.signal.aborted) {
						const { value, done } = await reader.read();
						if (done) {
							throw new Error("CSV validation ended without a result.");
						}
						if (controller.signal.aborted) {
							return;
						}

						buffer += value;
						const lines = buffer.split("\n");
						buffer = lines.pop() ?? "";

						for (const line of lines) {
							const update: CSVValidationResponse = JSON.parse(line);
							setStatus({ file, update });

							if (update.type === "done") {
								setTempHoldTransactions(update.transactions);
								setTempHoldCategories(update.categories);
								return;
							}
							if (update.type === "error") return;
							step = update.step;
						}
					}
				} finally {
					reader.releaseLock();
				}
			} catch {
				if (!controller.signal.aborted) {
					setStatus({
						file,
						update: {
							type: "error",
							step,
							message: "Could not validate the CSV file.",
						},
					});
				}
			}
		}

		void validateFile();
		return () => controller.abort();
	}, [file, setTempHoldTransactions, setTempHoldCategories]);

	return (
		<>
			<div className="grid grid-cols-3 gap-4 m-2">
				<div className="col-span-1">
					<Card className="ring-0 shadow-none">
						<CardHeader>
							<CardTitle>Parsing your file</CardTitle>
							<CardDescription>
								Please wait while we go through your CSV and read transactions
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
				<div className="h-full col-span-2">
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Status</CardTitle>
						</CardHeader>
						<CardContent className="h-full">
							<Trace role="status">
								{validationStages.map((stage, index) => {
									const step = index + 1;
									const isActive = step === activeStep;
									const isError = isActive && update?.type === "error";

									return (
										<TraceLine
											key={stage}
											status={
												isError
													? "error"
													: isActive
														? "running"
														: step > activeStep
															? "pending"
															: undefined
											}
										>
											<TraceIcon
												className={isActive && !isError ? "animate-spin" : ""}
											>
												{isError && <IconAlertCircle />}
												{isActive && !isError && <IconFidgetSpinner />}
												{!isError &&
													!isActive &&
													(step > activeStep ? (
														<IconHourglassLow />
													) : (
														<IconCircleCheck />
													))}
											</TraceIcon>
											<TraceTitle>{stage}</TraceTitle>
											{step < activeStep && (
												<TraceDescription>Complete</TraceDescription>
											)}
											{isActive && !isError && (
												<TraceDescription>In progress</TraceDescription>
											)}
										</TraceLine>
									);
								})}
								{update?.type === "error" && (
									<p className="text-sm text-destructive">{update.message}</p>
								)}
							</Trace>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
