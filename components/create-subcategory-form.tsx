import { useState, useEffect } from "react";
import { z } from "zod";
import { Category, SubCategorySchema } from "@/models/category-model";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createSubCategory,
	getSubCategoryByName,
} from "@/actions/category-actions";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

const newSubCategorySchema = z.object({
	name: z.string().trim().min(3, "Name should be at least 3 characters long"),
});

type NewSubCategory = z.infer<typeof newSubCategorySchema>;

type NewSubCategoryProps = {
	category: Category;
	setStackActiveIndex?: (index: number) => void;
};

type SubmitState = "PENDING" | "SUBMITTING" | "DONE" | "ERROR";

export default function CreateSubCategory({
	category,
	setStackActiveIndex,
}: NewSubCategoryProps) {
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedSubCategory, setInsertedSubCategory] =
		useState<SubCategorySchema>();

	const {
		register,
		handleSubmit,
		control,
		setError,
		clearErrors,
		getValues,
		formState: { errors, isSubmitting, isValid },
	} = useForm<NewSubCategory>({
		resolver: zodResolver(newSubCategorySchema, undefined, { mode: "async" }),
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			name: "",
		},
	});

	const name: string = useWatch({
		control,
		name: "name",
	});

	const [uniquenessCheck, setUniquenessCheck] = useState<{
		name: string;
		category: Category;
		status: "checking" | "unique" | "duplicate" | "error";
	}>();
	const isCurrentCheck =
		uniquenessCheck?.name === name && uniquenessCheck?.category === category;
	const isChecking = isCurrentCheck && uniquenessCheck?.status === "checking";
	const isUnique = isCurrentCheck && uniquenessCheck?.status === "unique";

	useEffect(() => {
		const value = name.trim();

		if (value.length < 3) {
			return;
		}

		let cancelled: boolean = false;

		const timer = setTimeout(async () => {
			setUniquenessCheck({ name, category, status: "checking" });

			try {
				const subcategory: SubCategorySchema | undefined =
					await getSubCategoryByName(category, value);

				if (cancelled || getValues("name") !== name) {
					return;
				}

				if (subcategory) {
					setError("name", {
						type: "manual",
						message: "Subcategory name already exists",
					});
					setUniquenessCheck({ name, category, status: "duplicate" });
				} else {
					clearErrors("name");
					setUniquenessCheck({ name, category, status: "unique" });
				}
			} catch {
				if (!cancelled && getValues("name") === name) {
					setError("name", {
						type: "manual",
						message: "Failed to verify subcategory",
					});
					setUniquenessCheck({ name, category, status: "error" });
				}
			}
		}, 500);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [name, category, setError, clearErrors, getValues]);

	async function handleCreateNewSubCategory(newSubCategory: NewSubCategory) {
		if (!isUnique || isChecking) return;

		setSubmitState("SUBMITTING");
		try {
			const createdSubCategory = await createSubCategory(
				category,
				newSubCategory.name,
			);
			setInsertedSubCategory(createdSubCategory);
			setSubmitState("DONE");
		} catch {
			setSubmitState("ERROR");
		}
	}

	return (
		<div className="flex-1 scroll-fade mt-4">
			<h2 className="mb-4 font-semibold">
				Create Subcategory under {category.name}
			</h2>
			<form onSubmit={handleSubmit(handleCreateNewSubCategory)}>
				<FieldGroup>
					<Field data-invalid={Boolean(errors.name)}>
						<FieldLabel htmlFor="subcategory-name">Subcategory Name</FieldLabel>
						<Input
							id="subcategory-name"
							type="text"
							placeholder="Reason to spend.."
							{...register("name")}
							aria-invalid={Boolean(errors.name)}
							aria-busy={isChecking}
							disabled={isSubmitting}
						/>
						<FieldDescription>
							Name your new subcategory (min 3 characters)
						</FieldDescription>
						<FieldError errors={[errors.name]} />
						{isChecking && <p role="status">Checking subcategory name…</p>}
					</Field>
					<div className="flex justify-end gap-2">
						{setStackActiveIndex && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setStackActiveIndex(0)}
							>
								Back to Transaction
							</Button>
						)}
						<Button
							type="submit"
							disabled={!isValid || !isUnique || isSubmitting || isChecking}
						>
							{isSubmitting ? (
								<>
									<Spinner /> Creating...
								</>
							) : (
								"Create Subcategory"
							)}
						</Button>
					</div>
				</FieldGroup>
				{["DONE", "ERROR"].includes(submitState) && (
					<>
						<Separator className="mt-4" />
						<Item className="p-0 mt-4" role="status">
							<ItemContent>
								<ItemTitle
									className={
										submitState === "DONE" ? "text-green-600" : "text-red-400"
									}
								>
									{submitState === "DONE" ? (
										<>
											<IconCircleCheck /> Created subcategory:{" "}
											{insertedSubCategory?.name}
										</>
									) : (
										<>
											<IconCircleX /> Failed to create subcategory
										</>
									)}
								</ItemTitle>
							</ItemContent>
						</Item>
					</>
				)}
			</form>
			<Separator className="mt-4" />
		</div>
	);
}
