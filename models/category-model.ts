export interface Category {
	id: number;
	name: string;
}

export interface SubCategory {
	id: number;
	name: string;
	categoryId: number;
}

export interface CategorySchema extends Category {
	subCategories?: SubCategory[];
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

export type TempHoldCategory = {
	name: string;
	subCategories?: string[];
};
