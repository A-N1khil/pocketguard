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
import {
	IconCircleCheck,
	IconCircleX,
	IconListTree,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker";
import CategoryTree from "@/components/category-components/category-tree";
import { cn } from "cn";

const newSubCategorySchema = z.object({
	name: z.string().trim().min(3, "Name should be at least 3 characters long"),
});

type NewSubCategory = z.infer<typeof newSubCategorySchema>;

type NewSubCategoryProps = {
	parentCategory: Category;
};

type SubmitState = "PENDING" | "SUBMITTING" | "DONE" | "ERROR";

export default function CreateSubCategory({
	parentCategory,
}: NewSubCategoryProps) {
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedSubCategory, setInsertedSubCategory] =
		useState<SubCategorySchema>();
	const [treeSubcategories, setTreeSubcategories] = useState<
		SubCategorySchema[]
	>([]);

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
		uniquenessCheck?.name === name &&
		uniquenessCheck?.category === parentCategory;
	const isChecking = isCurrentCheck && uniquenessCheck?.status === "checking";
	const isUnique = isCurrentCheck && uniquenessCheck?.status === "unique";

	useEffect(() => {
		const value = name.trim();

		if (value.length < 3) {
			return;
		}

		let cancelled: boolean = false;

		const timer = setTimeout(async () => {
			setUniquenessCheck({
				name,
				category: parentCategory,
				status: "checking",
			});

			try {
				const subcategory: SubCategorySchema | undefined =
					await getSubCategoryByName(parentCategory, value);

				if (cancelled || getValues("name") !== name) {
					return;
				}

				if (subcategory) {
					setError("name", {
						type: "manual",
						message: "Subcategory name already exists",
					});
					setUniquenessCheck({
						name,
						category: parentCategory,
						status: "duplicate",
					});
				} else {
					clearErrors("name");
					setUniquenessCheck({
						name,
						category: parentCategory,
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
						category: parentCategory,
						status: "error",
					});
				}
			}
		}, 500);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [name, parentCategory, setError, clearErrors, getValues]);

	const [counter, setCounter] = useState<number>(10);

	async function handleCreateNewSubCategory(newSubCategory: NewSubCategory) {
		if (!isUnique || isChecking) return;

		setSubmitState("SUBMITTING");
		try {
			// const createdSubCategory: SubCategorySchema = await createSubCategory(
			// 	parentCategory,
			// 	newSubCategory.name,
			// );
			const createdSubCategory: SubCategorySchema = {
				id: counter,
				name: newSubCategory.name,
				categoryId: parentCategory.id,
			};
			setCounter((counter) => counter + 1);
			setInsertedSubCategory(createdSubCategory);
			setSubmitState("DONE");
			setTreeSubcategories((currentTree) => [
				...currentTree,
				createdSubCategory,
			]);
		} catch {
			setSubmitState("ERROR");
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
			<Marker variant="separator" className={cn("mt-4")}>
				<MarkerIcon>
					<IconListTree />
				</MarkerIcon>
				<MarkerContent>Category Tree</MarkerContent>
			</Marker>
			<CategoryTree
				category={parentCategory}
				subCategories={treeSubcategories}
			/>
		</div>
	);
}
