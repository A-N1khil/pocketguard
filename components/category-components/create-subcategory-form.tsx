import { useState, useEffect } from "react";
import { z } from "zod";
import { Category, SubCategory } from "@/models/category-model";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createSubCategory,
	getAllSubCategoriesForCategory,
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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import {
	IconCircleCheck,
	IconCircleX,
	IconListTree,
} from "@tabler/icons-react";
import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker";
import CategoryTree from "@/components/category-components/category-tree";
import { cn } from "cn";

const newSubCategorySchema = z.object({
	name: z.string().trim().min(3, "Name should be at least 3 characters long"),
});

type NewSubCategory = z.infer<typeof newSubCategorySchema>;

type NewSubCategoryProps = {
	parentCategory: Category;
	handleCategoryUpdate: () => void;
};

type SubmitState = "PENDING" | "SUBMITTING" | "DONE" | "ERROR";

export default function CreateSubCategory({
	parentCategory,
	handleCategoryUpdate,
}: NewSubCategoryProps) {
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedSubCategory, setInsertedSubCategory] = useState<SubCategory>();
	const [treeSubcategories, setTreeSubcategories] = useState<
		SubCategory[] | null
	>(null);

	// Flag to set when a new subcategory has been inserted
	const [hasNewSubCategory, setHasNewSubCategory] = useState<boolean>(false);

	useEffect(() => {
		const populateSubCategories = async () => {
			const subCatsFromDB: SubCategory[] = await getAllSubCategoriesForCategory(
				parentCategory.id,
			);

			// Subcategory is set
			setTreeSubcategories((): SubCategory[] => [...subCatsFromDB]);
		};

		void populateSubCategories();
	}, [parentCategory]);

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
		status: "checking" | "unique" | "duplicate" | "error" | "random";
	}>();
	const isCurrentCheck = uniquenessCheck?.name === name;
	const isChecking = isCurrentCheck && uniquenessCheck?.status === "checking";
	const isUnique = isCurrentCheck && uniquenessCheck?.status === "unique";
	const isSaved = submitState === "DONE";

	useEffect(() => {
		const value = name.trim();

		if (isSaved || value.length < 3 || !treeSubcategories) {
			return;
		}

		let cancelled: boolean = false;

		const timer = setTimeout(async () => {
			setUniquenessCheck({
				name,
				status: "checking",
			});

			try {
				const isSubCategoryPresent = treeSubcategories.find(
					(subCategory: SubCategory) => subCategory.name === value,
				);

				if (cancelled || getValues("name") !== name) {
					return;
				}

				if (isSubCategoryPresent) {
					setError("name", {
						type: "manual",
						message: "Subcategory name already exists",
					});
					setUniquenessCheck({
						name,
						status: "duplicate",
					});
				} else {
					clearErrors("name");
					setUniquenessCheck({
						name,
						status: "unique",
					});
				}
			} catch {
				if (!cancelled && getValues("name") === name) {
					setError("name", {
						type: "manual",
						message: "Failed to verify subcategory",
					});
					setUniquenessCheck({
						name,
						status: "error",
					});
				}
			}
		}, 500);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [name, setError, clearErrors, getValues, treeSubcategories, isSaved]);

	async function handleCreateNewSubCategory(newSubCategory: NewSubCategory) {
		if (isSaved || !isUnique || isChecking) return;

		setSubmitState("SUBMITTING");
		try {
			const createdSubCategory: SubCategory = await createSubCategory(
				parentCategory,
				newSubCategory.name,
			);
			setInsertedSubCategory(createdSubCategory);
			setUniquenessCheck(undefined);
			setSubmitState("DONE");
			setTreeSubcategories((currentTree) => [
				...(currentTree || []),
				createdSubCategory,
			]);
			setHasNewSubCategory(true);
		} catch {
			setSubmitState("ERROR");
		} finally {
			handleCategoryUpdate();
		}
	}

	return (
		<div className="flex-1 scroll-fade mt-4">
			<h2 className="mb-4 font-semibold">
				Create Subcategory under {parentCategory.name}
			</h2>
			<form onSubmit={handleSubmit(handleCreateNewSubCategory)}>
				<FieldGroup>
					<Field data-invalid={Boolean(errors.name)}>
						<FieldLabel htmlFor="subcategory-name">Subcategory Name</FieldLabel>
						<Input
							id="subcategory-name"
							type="text"
							placeholder="Reason to spend.."
							{...register("name", {
								onChange: () => {
									if (isSaved) setSubmitState("PENDING");
								},
							})}
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
					<Item className={"p-0"}>
						<ItemContent>
							{["DONE", "ERROR"].includes(submitState) && (
								<>
									<ItemTitle
										className={cn(
											submitState === "DONE"
												? "text-green-600"
												: "text-red-400",
											"text-xs",
										)}
									>
										{submitState === "DONE" ? (
											<>
												<IconCircleCheck /> Created: {insertedSubCategory?.name}
											</>
										) : (
											<>
												<IconCircleX /> Failed to create subcategory
											</>
										)}
									</ItemTitle>
								</>
							)}
						</ItemContent>
						<ItemActions>
							<Button
								type="submit"
								disabled={
									isSaved || !isValid || !isUnique || isSubmitting || isChecking
								}
							>
								{isSubmitting ? (
									<>
										<Spinner /> Creating...
									</>
								) : (
									"Create Subcategory"
								)}
							</Button>
						</ItemActions>
					</Item>
				</FieldGroup>
			</form>
			<Marker variant="separator" className={cn("mt-4")}>
				<MarkerIcon>
					<IconListTree />
				</MarkerIcon>
				<MarkerContent>Category Tree</MarkerContent>
			</Marker>
			<CategoryTree
				category={parentCategory}
				subCategories={
					treeSubcategories !== null ? treeSubcategories : undefined
				}
				hasNewSubCategory={hasNewSubCategory}
			/>
		</div>
	);
}
