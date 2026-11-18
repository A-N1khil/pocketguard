import { z } from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Category, SubCategory } from "@/models/category-model";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	getAllCategories,
	getAllSubCategories,
} from "@/actions/category-actions";
import CreateCategoryForm from "@/components/category-components/create-category-form";
import { Drawer } from "@/components/ui/drawer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	CreateTransaction,
	Transaction,
	TransactionType,
} from "@/models/transaction-model";
import TransactionFormDateTimePicker from "./TransactionFormDateTimePicker";
import { insertTransaction } from "@/actions/transaction-actions";
import { cn, SubmitState } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
	IconCashBanknote,
	IconCircleCheck,
	IconCircleX,
	IconCurrencyDollar,
	IconMenu3,
	IconTag,
	IconTags,
} from "@tabler/icons-react";
import { toast } from "@/components/ui/toast";

const newTransactionSchema = z.object({
	title: z.string().trim().min(5, "Title must be at least 5 characters"),
	categoryId: z.number().positive("Select a category"),
	subCategoryId: z.number().positive("Select a subcategory"),
	transactionType: z.enum(["CREDIT", "DEBIT"], "Select CREDIT or DEBIT"),
	timestamp: z.iso.datetime(),
	amount: z
		.number({ error: "Enter a valid amount" })
		.positive("Amount should be greater than 0"),
});

export type TransactionFormValues = z.infer<typeof newTransactionSchema>;

type TransactionFormProps = {
	dialog: {
		openDialog: boolean;
		setOpenDialog: (open: boolean) => void;
	};
	transaction?: Transaction;
};

type CreateCategoryDrawerState =
	{ mode: "Category" } | { mode: "SubCategory"; category: Category };

export default function TransactionForm({
	dialog,
	transaction,
}: TransactionFormProps) {
	const { openDialog, setOpenDialog } = dialog;
	const [categories, setCategories] = useState<Category[]>([]);
	const [currentCategory, setCurrentCategory] = useState<Category>();
	const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
	const [drawerState, setDrawerState] =
		useState<CreateCategoryDrawerState | null>(null);
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedTransaction, setInsertedTransaction] = useState<
		Transaction | undefined
	>(undefined);

	const refreshCategories = useCallback(async () => {
		return Promise.all([getAllCategories(), getAllSubCategories()]).then(
			([newCategories, newSubCategories]) => {
				setCategories(newCategories);
				setSubCategories(newSubCategories);
			},
		);
	}, []);

	// Fetch categories and subcategories upon component load
	useEffect(() => {
		void refreshCategories().catch(console.error);
	}, [refreshCategories]);

	// Change subcategory options with category select
	const currentSubCategories: SubCategory[] = subCategories.filter(
		(subCat: SubCategory) => subCat.categoryId === currentCategory?.id,
	);

	const {
		control,
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting, isValid },
	} = useForm<TransactionFormValues>({
		resolver: zodResolver(newTransactionSchema),
		mode: "onChange",
		defaultValues: {
			categoryId: transaction?.category.id ?? -1,
			subCategoryId: transaction?.subCategory.id ?? -1,
			title: transaction?.title ?? "",
			transactionType: transaction?.transactionType ?? "DEBIT",
			timestamp: transaction
				? new Date(transaction.timestamp).toISOString()
				: new Date().toISOString(),
			amount: transaction?.amount ?? 0,
		},
	});
	const timestamp = useWatch({ control, name: "timestamp" });

	async function handleTransactionSubmit(
		formTransaction: TransactionFormValues,
	) {
		if (!formTransaction.categoryId || !formTransaction.subCategoryId) {
			return;
		}

		setSubmitState("SUBMITTING");

		const createTransaction: CreateTransaction = {
			...formTransaction,
			transactionType: formTransaction.transactionType as TransactionType,
		};
		try {
			setInsertedTransaction(await insertTransaction(createTransaction));
			if (insertedTransaction) {
				setSubmitState("DONE");
			}
			toast.add({
				title: "Transaction Created",
				type: "success",
				description: `#${insertedTransaction?.id} - ${insertedTransaction?.title} for ${insertedTransaction?.amount}.`,
				data: {
					className: "dark:bg-green-500 bg-green-400",
				},
			});
		} catch (error) {
			console.error(error);
			setSubmitState("ERROR");
			toast.add({
				title: "Failed to create transaction",
				type: "error",
				description: `#${insertedTransaction?.id} - ${insertedTransaction?.title} for ${insertedTransaction?.amount}.`,
				data: {
					className: "dark:bg-red-500 bg-green-400",
				},
			});
		}
	}

	function handleDrawerOpen(fromSubCategory: boolean = false): void {
		if (fromSubCategory) {
			// Handler check, to stop TS warning
			if (!currentCategory) return;

			setDrawerState({
				mode: "SubCategory",
				category: currentCategory,
			});
		} else {
			setDrawerState({ mode: "Category" });
		}
	}

	const isCategoryUpdated = useRef<boolean>(false);

	function handleDrawerOpenChange(open: boolean): void {
		// do nothing if open
		if (open) {
			return;
		}

		setDrawerState(null);

		// check if categories has changed by the drawer
		if (isCategoryUpdated.current) {
			// Mark as acknowledged
			isCategoryUpdated.current = true;

			void refreshCategories().catch((error) => {
				// revert ack to try again
				isCategoryUpdated.current = true;
				console.error(error);
			});
		}
	}

	function handleCategoryUpdate(): void {
		isCategoryUpdated.current = true;
	}

	function renderSubmitButton() {
		if (["DONE", "ERROR"].includes(submitState)) {
			return (
				<Button
					type="button"
					disabled
					className={cn(
						submitState === "DONE" ? "bg-success" : "bg-destructive",
					)}
				>
					{submitState === "DONE" ? (
						<>
							<IconCircleCheck /> Transaction created
						</>
					) : (
						<>
							<IconCircleX /> An error occurred
						</>
					)}
				</Button>
			);
		} else {
			return (
				<Button type="submit" disabled={!isValid || isSubmitting}>
					{isSubmitting ? (
						<>
							<Spinner /> Creating...
						</>
					) : (
						"Create transaction"
					)}
				</Button>
			);
		}
	}

	/**
	 * Resets submit state on form value change
	 */
	function resetSubmitState(): void {
		setSubmitState("PENDING");
	}

	return (
		<>
			<div className="flex">
				<Dialog onOpenChange={setOpenDialog} open={openDialog}>
					{/* Create transaction dialog */}
					<DialogContent className="sm:max-w-1/3">
						<DialogHeader>
							<DialogTitle>
								{transaction ? "Create" : "Update"} transaction
							</DialogTitle>
							<DialogDescription>
								Enter the details of your transaction.
							</DialogDescription>
						</DialogHeader>
						<form
							onChange={resetSubmitState}
							onSubmit={handleSubmit(handleTransactionSubmit)}
							noValidate
						>
							<FieldGroup>
								<Field data-invalid={Boolean(errors.title)}>
									<FieldLabel htmlFor="title">
										<IconMenu3 size={18} /> Title
									</FieldLabel>
									<Input
										id="title"
										type="text"
										placeholder="Random Purchase"
										{...register("title")}
										aria-invalid={Boolean(errors.title)}
										aria-describedby={`title-description${errors.title ? " title-error" : ""}`}
									/>
									<FieldDescription id="title-description">
										Use at least 5 characters to describe the transaction.
									</FieldDescription>
									<FieldError id="title-error" errors={[errors.title]} />
								</Field>
								<Controller
									name="transactionType"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="transactionType">
												<IconCashBanknote size={18} />
												Transaction type
											</FieldLabel>
											<Select
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="transactionType"
													ref={field.ref}
													onBlur={field.onBlur}
													aria-invalid={fieldState.invalid}
													aria-describedby={`transactionType-description${fieldState.error ? " transactionType-error" : ""}`}
													className="w-full"
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="DEBIT">Debit</SelectItem>
													<SelectItem value="CREDIT">Credit</SelectItem>
												</SelectContent>
											</Select>
											<FieldDescription id="transactionType-description">
												Choose credit for money received or debit for money
												spent.
											</FieldDescription>
											<FieldError
												id="transactionType-error"
												errors={[fieldState.error]}
											/>
										</Field>
									)}
								/>
								<TransactionFormDateTimePicker
									register={register}
									timestamp={timestamp}
									error={errors.timestamp?.message}
									onTimestampChange={(value) => {
										setValue("timestamp", value, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
										resetSubmitState();
									}}
								/>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<Controller
										name="categoryId"
										control={control}
										render={({ field }) => (
											<Field>
												<FieldLabel htmlFor="category">
													<IconTag size={18} />
													Category
												</FieldLabel>
												<Select
													name={field.name}
													value={field.value === -1 ? null : field.value}
													onValueChange={(value) => {
														field.onChange(value);
														setCurrentCategory(
															categories.find(
																(category) => category.id === value,
															),
														);
														setValue("subCategoryId", -1, {
															shouldValidate: true,
															shouldDirty: true,
														});
														resetSubmitState();
													}}
												>
													<SelectTrigger
														id="category"
														ref={field.ref}
														onBlur={field.onBlur}
														aria-describedby="category-description"
														className="w-full"
													>
														<SelectValue placeholder="Select a Category">
															{
																categories.find(
																	(category) => category.id === field.value,
																)?.name
															}
														</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{categories.map((category) => (
															<SelectItem key={category.id} value={category.id}>
																{category.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldDescription id="category-description">
													Choose a category for this transaction.
												</FieldDescription>
											</Field>
										)}
									/>
									<Controller
										name="subCategoryId"
										control={control}
										render={({ field }) => (
											<Field>
												<FieldLabel htmlFor="subcategory">
													<IconTags size={18} />
													Subcategory
												</FieldLabel>
												<Select
													name={field.name}
													value={field.value === -1 ? null : field.value}
													onValueChange={(value) => {
														field.onChange(value);
														resetSubmitState();
													}}
													disabled={
														!currentCategory ||
														currentSubCategories.length === 0
													}
												>
													<SelectTrigger
														id="subcategory"
														ref={field.ref}
														onBlur={field.onBlur}
														aria-describedby="subcategory-description"
														className="w-full"
													>
														<SelectValue
															placeholder={
																!currentCategory
																	? "Select a Category"
																	: currentSubCategories.length === 0
																		? "No SubCategory for current category"
																		: "Select a Subcategory"
															}
														>
															{
																currentSubCategories.find(
																	(subCategory) =>
																		subCategory.id === field.value,
																)?.name
															}
														</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{currentSubCategories.map((subCategory) => (
															<SelectItem
																key={subCategory.id}
																value={subCategory.id}
															>
																{subCategory.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldDescription id="subcategory-description">
													{!currentCategory ? (
														<>Select a category first</>
													) : (
														<>Select a subcategory from the list</>
													)}
												</FieldDescription>
											</Field>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
									<p className="text-xs text-left">
										<a
											href="#"
											className="hover:underline"
											onClick={() => handleDrawerOpen()}
										>
											Can&apos;t find your category?&nbsp;Create a new one!
										</a>
									</p>
									{currentCategory && (
										<p className="text-xs text-left">
											<a
												href="#"
												className="hover:underline"
												onClick={() => handleDrawerOpen(true)}
											>
												Click to create a subcategory under{" "}
												{currentCategory.name}
											</a>
										</p>
									)}
								</div>
								<Field data-invalid={Boolean(errors.amount)}>
									<FieldLabel htmlFor="amount">
										<IconCurrencyDollar size={18} />
										Amount
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<InputGroupText>$</InputGroupText>
										</InputGroupAddon>
										<InputGroupInput
											id="amount"
											type="number"
											inputMode="decimal"
											min="0.01"
											step="0.01"
											placeholder="0.00"
											{...register("amount", { valueAsNumber: true })}
											aria-invalid={Boolean(errors.amount)}
											aria-describedby={`amount-description${errors.amount ? " amount-error" : ""}`}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupText>USD</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									<FieldDescription id="amount-description">
										Enter a positive amount in USD.
									</FieldDescription>
									<FieldError id="amount-error" errors={[errors.amount]} />
								</Field>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpenDialog(false)}
									>
										Cancel
									</Button>
									{renderSubmitButton()}
								</div>
							</FieldGroup>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<Drawer
				open={drawerState !== null}
				onOpenChange={handleDrawerOpenChange}
				swipeDirection="right"
			>
				{drawerState && (
					<CreateCategoryForm
						category={
							drawerState && drawerState.mode === "SubCategory"
								? drawerState.category
								: undefined
						}
						handleCategoryUpdate={handleCategoryUpdate}
					/>
				)}
			</Drawer>
		</>
	);
}
