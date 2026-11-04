export interface Category {
	id: number;
	name: string;
}

export interface SubCategory {
	id: number;
	name: string;
	category: string;
}

export interface CategorySchema extends Category {
	subCategories?: SubCategorySchema[];
}

export interface SubCategorySchema extends Omit<SubCategory, "category"> {
	categoryId: number;
}

export interface SubCategoryDTO {
	subCategoryId: number;
	subCategoryName: string;
}

export interface CategoryDTO {
	categoryId: number;
	categoryName: string;
	subCategories?: Map<number, SubCategoryDTO>;
}
