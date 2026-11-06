import { useState } from "react";
import { z } from "zod";
import { Category } from "@/models/category-model";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategory, getCategoryByName } from "@/actions/category-actions";
import { Spinner } from "@/components/ui/spinner";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

const newCategorySchema = z.object({
	name: z
		.string()
		.min(3, "Minimum name length should be 3")
		.superRefine(async (name, ctx) => {
			if (name.length < 3) return;

			try {
				const category: Category | undefined = await getCategoryByName(name);
				if (category) {
					ctx.addIssue({
						code: "custom",
						message: "A category with the same name exists",
					});
				}
			} catch {
				ctx.addIssue({
					code: "custom",
					message: "Unable to check category name. Please try again.",
				});
			}
		}),
});

type NewCategory = z.infer<typeof newCategorySchema>;

type CreateCategoryDrawerProps = {
	setStackActiveIndex: (index: number) => void;
	category?: Category;
};

type SubmitState = "PENDING" | "SUBMITTING" | "DONE" | "ERROR";

export default function CreateCategoryForm({
	category,
	setStackActiveIndex,
}: CreateCategoryDrawerProps) {
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedCategory, setInsertedCategory] = useState<Category>();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid, isValidating },
	} = useForm<NewCategory>({
		resolver: zodResolver(newCategorySchema, undefined, { mode: "async" }),
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			name: category?.name || "",
		},
	});

	async function handleCreateNewCategory(newCategory: NewCategory) {
		setSubmitState("SUBMITTING");
		try {
			const createdCategory: Category = await createCategory(newCategory.name);
			setInsertedCategory(createdCategory);
		} catch {
			setSubmitState("ERROR");
		}
	}

	return (
		<>
			<div className="flex-1 scroll-fade">
				<form onSubmit={handleSubmit(handleCreateNewCategory)}>
					<FieldGroup>
						<Field data-invalid={Boolean(errors.name)}>
							<FieldLabel htmlFor="name">Category Name</FieldLabel>
							<Input
								id="name"
								type="text"
								placeholder="Reason to spend.."
								{...register("name")}
								aria-invalid={Boolean(errors.name)}
								aria-busy={isValidating}
							/>
							<FieldDescription>
								Name your new category (min 3 characters)
							</FieldDescription>
							<FieldError errors={[errors.name]} />
							{isValidating && <p role="status">Checking category name…</p>}
						</Field>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant={"outline"}
								onClick={() => setStackActiveIndex(0)}
							>
								Back to Transaction
							</Button>
							<Button
								type="submit"
								disabled={!isValid || isSubmitting || isValidating}
							>
								{isSubmitting ? (
									<>
										<Spinner /> Creating...
									</>
								) : (
									"Create Category"
								)}
							</Button>
						</div>
					</FieldGroup>
					{["DONE", "ERROR"].includes(submitState) && (
						<>
							<Separator className="mt-4" />
							<Item className="p-0 mt-4">
								<ItemContent>
									<ItemTitle
										className={
											submitState === "DONE" ? "text-green-600" : "text-red-400"
										}
									>
										{submitState === "DONE" ? (
											<>
												<IconCircleCheck /> Created category:{" "}
												{insertedCategory?.name}
											</>
										) : (
											<>
												<IconCircleX /> Failed to create category
											</>
										)}
									</ItemTitle>
								</ItemContent>
								{submitState === "DONE" && (
									<ItemActions>
										<Button>Create sub-category</Button>
									</ItemActions>
								)}
							</Item>
						</>
					)}
				</form>
			</div>
		</>
	);
}
