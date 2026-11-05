import { z } from "zod";
import { Category } from "@/models/category-model";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
	DialogStackContent,
	DialogStackPrevious,
} from "@/components/kibo-ui/dialog-stack";

const newCategorySchema = z.object({
	name: z.string().min(3, "Minimum name length should be 3"),
});

const newSubCategorySchema = z.object({
	name: z.string().min(3, "Minimum name length should be 3"),
});

type newCategory = z.infer<typeof newCategorySchema>;
type newSubcategory = z.infer<typeof newSubCategorySchema>;

type CreateCategoryDrawerProps = {
	setStackActiveIndex: (index: number) => void;
	category?: Category;
};

export default function CreateCategoryForm({
	category,
	setStackActiveIndex,
}: CreateCategoryDrawerProps) {
	const [addSubcategory, setAddSubCategory] = useState<boolean>(false);
	const [currentCategory, setCurrentCategory] = useState<Category | undefined>(
		category,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<newCategory>({
		resolver: zodResolver(newCategorySchema),
		mode: "onChange",
		defaultValues: {
			name: category?.name || "",
		},
	});

	async function handleCreateNewCategory() {
		// do something later
	}

	return (
		<>
			<div className="flex-1 scroll-fade p-4">
				<form onSubmit={handleSubmit(handleCreateNewCategory)}>
					<FieldGroup>
						<Field data-invalid={Boolean(errors.name)}>
							<FieldLabel htmlFor="name">Category Name</FieldLabel>
							<Input
								id="name"
								type="text"
								placeholder="Reason to spend.."
								{...register("name")}
							/>
							<FieldDescription>
								Name your new category (min 3 characters)
							</FieldDescription>
							<FieldError errors={[errors.name]} />{" "}
						</Field>
						<div className="flex justify-end gap-2">
							<Button type="submit" disabled={!isValid || isSubmitting}>
								{isSubmitting ? "Creating…" : "Create transaction"}
							</Button>
							<Button
								type="button"
								variant={"outline"}
								onClick={() => setStackActiveIndex(0)}
							>
								Back to Transaction
							</Button>
						</div>
					</FieldGroup>
				</form>
			</div>
		</>
	);
}
