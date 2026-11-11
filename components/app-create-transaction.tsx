import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
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
import { Category, SubCategorySchema } from "@/models/category-model";
import { useEffect, useState } from "react";
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

const newTransactionSchema = z.object({
	title: z.string().trim().min(5, "Title must be at least 5 characters"),
	categoryId: z.string().nullable(),
	subCategoryId: z.string().nullable(),
	transactionType: z.enum(["CREDIT", "DEBIT"], "Select CREDIT or DEBIT"),
	amount: z
		.number({ error: "Enter a valid amount" })
		.positive("Amount should be greater than 0"),
});

type TransactionFormValues = z.infer<typeof newTransactionSchema>;

type TransactionFormProps = {
	transaction: {
		title?: string;
		transactionType?: "CREDIT" | "DEBIT";
		amount?: number;
	};
	dialog: {
		openDialog: boolean;
		setOpenDialog: (open: boolean) => void;
	};
};

export default function TransactionForm({
	transaction,
	dialog,
}: TransactionFormProps) {
	const { openDialog, setOpenDialog } = dialog;
	const [categories, setCategories] = useState<Category[]>([]);
	const [currentCategory, setCurrentCategory] = useState<Category>();
	const [subCategories, setSubCategories] = useState<SubCategorySchema[]>([]);
	const [openDrawer, setOpenDrawer] = useState<boolean>(false);

	// Fetch categories and subcategories upon component load
	useEffect(() => {
		const fetchCategories = async () => {
			setCategories(await getAllCategories());
		};
		const fetchSubcategories = async () => {
			setSubCategories(await getAllSubCategories());
		};

		void fetchCategories();
		void fetchSubcategories();
	}, []);

	// Change subcategory options with category select
	const currentSubCategories = subCategories.filter(
		(subCat) => subCat.categoryId === currentCategory?.id,
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
			categoryId: null,
			subCategoryId: null,
			title: transaction.title || "",
			transactionType: transaction.transactionType || "DEBIT",
			amount: transaction.amount || 0,
		},
	});

	async function handleTransactionSubmit() {
		// do something
	}

	return (
		<>
			<div className="flex">
				<Dialog onOpenChange={setOpenDialog} open={openDialog}>
					{/* Create transaction dialog */}
					<DialogContent className="sm:max-w-1/3">
						<DialogHeader>
							<DialogTitle>Create transaction</DialogTitle>
							<DialogDescription>
								Enter the details of your transaction.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit(handleTransactionSubmit)} noValidate>
							<FieldGroup>
								<Field data-invalid={Boolean(errors.title)}>
									<FieldLabel htmlFor="title">Title</FieldLabel>
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
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<Controller
										name="categoryId"
										control={control}
										render={({ field }) => (
											<Field>
												<FieldLabel htmlFor="category">Category</FieldLabel>
												<Select
													name={field.name}
													value={field.value}
													onValueChange={(value) => {
														field.onChange(value);
														setCurrentCategory(
															categories.find(
																(category) => category.id === value,
															),
														);
														setValue("subCategoryId", null, {
															shouldValidate: true,
															shouldDirty: true,
														});
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
													Subcategory
												</FieldLabel>
												<Select
													name={field.name}
													value={field.value}
													onValueChange={field.onChange}
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
											onClick={() => setOpenDrawer(true)}
										>
											Can&apos;t find your category?&nbsp;Create a new one!
										</a>
									</p>
									{currentCategory && (
										<p className="text-xs text-left">
											<a
												href="#"
												className="hover:underline"
												onClick={() => setOpenDrawer(true)}
											>
												Click to create a subcategory under{" "}
												{currentCategory.name}
											</a>
										</p>
									)}
								</div>
								<Field data-invalid={Boolean(errors.amount)}>
									<FieldLabel htmlFor="amount">Amount</FieldLabel>
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
									<Button type="submit" disabled={!isValid || isSubmitting}>
										{isSubmitting ? "Creating…" : "Create transaction"}
									</Button>
								</div>
							</FieldGroup>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<Drawer
				open={openDrawer}
				onOpenChange={setOpenDrawer}
				swipeDirection="right"
			>
				{/* FIXME: Find a better way to handle heading into drawer */}
				<CreateCategoryForm category={currentCategory ?? undefined} />
			</Drawer>
		</>
	);
}
