import "server-only";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import Papa from "papaparse";
import type { TempHoldTransaction } from "@/models/transaction-model";

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

type CSVRow = Partial<Record<string, string>>;

type ImportedCategory = {
	name: string;
	subcategories: string[];
};

export type CSVValidationResponse =
	| { type: "progress"; message: string; step: number }
	| { type: "error"; message: string; step: number }
	| {
			type: "done";
			transactions: TempHoldTransaction[];
			categories: ImportedCategory[];
	  };

const requiredHeaders = [
	"Time",
	"Title",
	"Type",
	"Category",
	"SubCategory",
	"Amount",
];

export async function* parseTransactionCsv(
	file: File,
): AsyncGenerator<CSVValidationResponse> {
	let step = 1;
	yield { type: "progress", step, message: "Parsing CSV…" };

	try {
		const { data, errors, meta } = Papa.parse<CSVRow>(await file.text(), {
			header: true,
			skipEmptyLines: "greedy",
			transformHeader: (header) => header.trim(),
		});

		const parseError = errors.find((error) => error.type !== "FieldMismatch");
		if (parseError) {
			yield { type: "error", step, message: parseError.message };
			return;
		}

		step = 2;
		yield { type: "progress", step, message: "Validating headers…" };

		const missingHeaders = requiredHeaders.filter(
			(header) => !meta.fields?.includes(header),
		);

		if (missingHeaders.length > 0) {
			yield {
				type: "error",
				step,
				message: `Missing columns: ${missingHeaders.join(", ")}.`,
			};
			return;
		}

		step = 3;
		yield { type: "progress", step, message: "Validating data…" };

		if (errors.length > 0) {
			yield { type: "error", step, message: errors[0].message };
			return;
		}

		if (data.length === 0) {
			yield {
				type: "error",
				step,
				message: "The CSV contains no transactions.",
			};
			return;
		}

		const validatedRows: (Omit<TempHoldTransaction, "timestamp"> & {
			timestamp: dayjs.Dayjs;
		})[] = [];

		for (const [index, row] of data.entries()) {
			const title = row.Title?.trim() ?? "";
			const transactionType = row.Type?.trim().toUpperCase();
			const categoryName = row.Category?.trim() ?? "";
			const subCategoryName = row.SubCategory?.trim() ?? "";
			const amountText = row.Amount?.trim() ?? "";
			const amount = Number(amountText);
			const timestamp = dayjs.utc(row.Time?.trim() ?? "", "L LT", true);

			if (!timestamp.isValid()) {
				yield {
					type: "error",
					step,
					message: `Record ${index + 1} has an invalid Time. Expected a date and time like "10/11/2026 2:30 PM".`,
				};
				return;
			}

			if (
				!title ||
				(transactionType !== "CREDIT" && transactionType !== "DEBIT") ||
				!categoryName ||
				!subCategoryName ||
				!/^[-+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(amountText) ||
				!Number.isFinite(amount)
			) {
				yield {
					type: "error",
					step,
					message: `Record ${index + 1} has a missing or invalid transaction field.`,
				};
				return;
			}

			const invalidField = [
				{ name: "Title", value: title, forbidden: "Random Purchase" },
				{ name: "Category", value: categoryName, forbidden: "Random" },
				{ name: "SubCategory", value: subCategoryName, forbidden: "Random" },
			].find(({ value, forbidden }) =>
				value.toLowerCase().includes(forbidden.toLowerCase()),
			);

			if (invalidField) {
				yield {
					type: "error",
					step,
					message: `Record ${index + 1}: ${invalidField.name} contains "${invalidField.forbidden}".`,
				};
				return;
			}

			validatedRows.push({
				title,
				transactionType,
				categoryName,
				subCategoryName,
				amount,
				timestamp,
			});
		}

		step = 4;
		yield { type: "progress", step, message: "Creating transactions…" };
		const transactions: TempHoldTransaction[] = validatedRows.map((row) => ({
			...row,
			timestamp: row.timestamp.toISOString(),
		}));

		step = 5;
		yield {
			type: "progress",
			step,
			message: "Creating categories and subcategories…",
		};

		const subcategoriesByCategory = new Map<string, Set<string>>();

		for (const { categoryName, subCategoryName } of transactions) {
			let subcategories = subcategoriesByCategory.get(categoryName);

			if (!subcategories) {
				subcategories = new Set<string>();
				subcategoriesByCategory.set(categoryName, subcategories);
			}

			subcategories.add(subCategoryName);
		}

		const categories = Array.from(
			subcategoriesByCategory,
			([name, subcategories]) => ({
				name,
				subcategories: [...subcategories],
			}),
		);

		yield { type: "done", transactions, categories };
	} catch {
		yield {
			type: "error",
			step,
			message: "Could not read or process the CSV file.",
		};
	}
}
