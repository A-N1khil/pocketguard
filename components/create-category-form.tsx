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
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	IconChevronDown,
	IconCircleCheck,
	IconCircleX,
	IconListTree,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import CreateSubCategory from "@/components/create-subcategory-form";
import {
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "cn";

const newCategorySchema = z.object({
	name: z
		.string()
		.trim()
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
	category?: Category;
};

type SubmitState = "PENDING" | "SUBMITTING" | "DONE" | "ERROR";

export default function CreateCategoryForm({
	category,
}: CreateCategoryDrawerProps) {
	const [submitState, setSubmitState] = useState<SubmitState>("PENDING");
	const [insertedCategory, setInsertedCategory] = useState<Category>();
	const [createSubCategory, setCreateSubCategory] = useState<boolean>(false);

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
			<DrawerContent className="p-2">
				<DrawerHeader>
					<DrawerTitle>Create new category</DrawerTitle>
					<DrawerDescription>
						You found a reason to spend? Add it here...
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex-1 scroll-fade overflow-y-auto p-4">
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
							<Item className="p-0">
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
														<IconCircleCheck size={16} className={"p-0"} />{" "}
														Created category
													</>
												) : (
													<>
														<IconCircleX /> Failed to create category
													</>
												)}
											</ItemTitle>
											<ItemDescription className={cn("text-xs")}>
												{insertedCategory?.name} is ready to use
											</ItemDescription>
										</>
									)}
								</ItemContent>
								<ItemActions>
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
								</ItemActions>
							</Item>
						</FieldGroup>
					</form>
					{insertedCategory && (
						<Item
							size="xs"
							variant="outline"
							className={cn("mt-4")}
							render={
								<a href="#" onClick={() => setCreateSubCategory(true)}>
									<ItemMedia>
										<IconListTree size={16} />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>Click here to create sub categories</ItemTitle>
									</ItemContent>
									<ItemActions>
										<IconChevronDown size={16} />
									</ItemActions>
								</a>
							}
						/>
					)}
					{insertedCategory && createSubCategory && (
						<>
							<Separator className="mt-4" />
							<CreateSubCategory category={insertedCategory} />
						</>
					)}
				</div>
				<DrawerFooter>
					<DrawerClose render={<Button>Back to transaction</Button>} />
				</DrawerFooter>
			</DrawerContent>
		</>
	);
}
