import {
	Category,
	CategoryDTO,
	CategorySchema,
	SubCategory,
	SubCategoryDTO,
	SubCategorySchema,
} from "@/models/category-model";
import { db } from "@/index";

export async function getCategoryById(
	id: number,
): Promise<Category | undefined> {
	return await db.query.c.findFirst({
		where: { id: id },
	});
}

export async function getCategorySubCategory(
	categoryId: number,
): Promise<CategoryDTO | null> {
	const rawCats: CategorySchema | undefined = await db.query.c.findFirst({
		where: { id: categoryId },
		with: { subCategories: true },
	});

	if (rawCats) {
		const categoryDTO: CategoryDTO = {
			categoryId: rawCats.id,
			categoryName: rawCats.name,
		};
		if (rawCats.subCategories) {
			categoryDTO.subCategories = new Map(
				rawCats.subCategories.map((subCat) => [
					subCat.id,
					subCat as unknown as SubCategoryDTO,
				]),
			);
		}
		return categoryDTO;
	}

	return null;
}

export async function getSubCategoryById(
	subCategoryId: number,
	categoryId: number,
): Promise<SubCategory | null> {
	const subCatFromDb = await db.query.sc.findFirst({
		where: { id: subCategoryId, categoryId: categoryId },
		with: { category: true },
	});

	if (subCatFromDb) {
		return {
			id: subCatFromDb.id,
			name: subCatFromDb.name,
			category: subCatFromDb.category.name,
		} as SubCategory;
	}

	return null;
}

const values = await getSubCategoryById(1, 1);
console.log(values);
