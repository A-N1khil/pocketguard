import dayjs from "dayjs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChangeEvent, useRef } from "react";

type BulkUploadStep1Props = {
	file: File | undefined;
	setFile: (file: File) => void;
};

export function BulkUploadStep1({ file, setFile }: BulkUploadStep1Props) {
	const csvInputRef = useRef<HTMLInputElement>(null);

	const demoTableData = [
		{
			time: dayjs().format("L LT"),
			title: "Something I got",
			type: "DEBIT",
			category: "Important",
			subCategory: "Expenditure",
			amount: 25.2,
		},
		{
			time: dayjs().subtract(2, "days").subtract(4, "hours").format("L LT"),
			title: "Another thing..",
			type: "DEBIT",
			category: "Household",
			subCategory: "Rent-ish",
			amount: 34.1,
		},
		{
			time: dayjs().format("L LT"),
			title: "Yayyy money!",
			type: "CREDIT",
			category: "Income",
			subCategory: "Jobs",
			amount: 2520.89,
		},
	];

	function downloadTemplate() {
		const link = document.createElement("a");
		link.href = "/bulk-transactions.csv";
		link.download = "transactions.csv";
		link.click();
	}

	function handleFileUpload(
		event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
	) {
		const file: File | undefined = event.currentTarget.files?.[0];

		if (!file) {
			return;
		}

		setFile(file);

		// Clear the input so selecting the same file again triggers onChange.
		event.currentTarget.value = "";
	}

	return (
		<>
			<div className="grid grid-cols-3 gap-4 m-2">
				<div className="col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Welcome to Bulk Upload!</CardTitle>
							<CardDescription>
								Add multiple transactions with ease..
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Accordion defaultValue={["q1"]}>
								<AccordionItem value="q1">
									<AccordionTrigger>How does it work?</AccordionTrigger>
									<AccordionContent>
										<p className="text-xs">
											It&apos;s easy. You download the CSV provided, fill in the
											details, and upload it back.
										</p>{" "}
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="q2">
									<AccordionTrigger>Why CSV?</AccordionTrigger>
									<AccordionContent>
										<p className="text-xs">
											We try to exclude any other problems an (advanced) Excel
											sheet might cause. All we care about is the data and CSV
											does it just right!
										</p>{" "}
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="q3">
									<AccordionTrigger>Can I use my own CSV?</AccordionTrigger>
									<AccordionContent>
										<p className="text-xs">
											Yes of course! Create any CSV with the template on the
											right side and get going.
										</p>{" "}
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</CardContent>
						<CardFooter className="flex items-center justify-end">
							<Button onClick={downloadTemplate}>
								<IconDownload data-icon="inline-start" />
								Download Template
							</Button>
						</CardFooter>
					</Card>
				</div>
				<div className="h-full col-span-2">
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Template</CardTitle>
							<CardDescription>
								Follow this template if you&apos;re creating your own sheet
							</CardDescription>
						</CardHeader>
						<CardContent className="h-full">
							<Table>
								<TableHeader>
									<TableRow>
										{[
											"Time",
											"Title",
											"Type",
											"Category",
											"Sub Category",
											"Amount",
										].map((heading: string) => (
											<TableHead key={heading}>{heading}</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{demoTableData.map((item) => (
										<TableRow key={item.title}>
											{Object.keys(item).map((key: string) => (
												// @ts-expect-error -- Just demo
												<TableCell key={key}>{item[key]}</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
						<CardFooter className="flex items-center justify-end">
							<input
								ref={csvInputRef}
								type="file"
								accept=".csv,text/csv"
								hidden
								onChange={handleFileUpload}
							/>
							<p className="text-sm mr-2" hidden={!file}>
								Upload Successful: {file?.name}
							</p>
							<Button onClick={() => csvInputRef.current?.click()}>
								<IconUpload data-icon="inline-start" />
								Upload
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</>
	);
}
