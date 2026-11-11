import { Category, SubCategorySchema } from "@/models/category-model";
import {
	TreeExpander,
	TreeIcon,
	TreeLabel,
	TreeNode,
	TreeNodeContent,
	TreeNodeTrigger,
	TreeProvider,
	TreeView,
} from "@/components/kibo-ui/tree";
import { IconBadges, IconChevronRight } from "@tabler/icons-react";
import { cn } from "cn";
import CometBorder from "@/components/ui/comet-border";
import { useEffect, useState } from "react";
import { getAllSubCategoriesForCategory } from "@/actions/category-actions";
import { ScrollArea } from "@/components/ui/scroll-area";

type CategoryTreeProps = {
	category: Category;
	subCategories?: SubCategorySchema[];
};

export default function CategoryTree({
	category,
	subCategories,
}: CategoryTreeProps) {
	const [treeSubCategories, setTreeSubCategories] = useState<
		SubCategorySchema[]
	>(subCategories || []);

	useEffect(() => {
		const refreshSubCategories = async () => {
			const existingSubcategories: SubCategorySchema[] =
				await getAllSubCategoriesForCategory(category.id);

			setTreeSubCategories((prev: SubCategorySchema[]) => [
				...prev,
				...existingSubcategories,
			]);
		};

		void refreshSubCategories();
	}, [category.id]);

	return (
		<>
			<ScrollArea className={cn("h-64 w-full rounded-md")}>
				<TreeProvider defaultExpandedIds={[category.name]}>
					<TreeView>
						<TreeNode nodeId={category.name}>
							<TreeNodeTrigger>
								<TreeExpander hasChildren />
								<TreeIcon hasChildren icon={<IconBadges />} />
								<TreeLabel>{category.name}</TreeLabel>
							</TreeNodeTrigger>

							<TreeNodeContent hasChildren>
								{treeSubCategories.map((subCategory: SubCategorySchema) => {
									return (
										<TreeNode
											level={1}
											key={subCategory.name}
											nodeId={subCategory.name}
											className={cn("relative rounded-md")}
										>
											<TreeNodeTrigger>
												<TreeExpander />
												<TreeIcon icon={<IconChevronRight />} />
												<TreeLabel>{subCategory.name}</TreeLabel>
											</TreeNodeTrigger>
										</TreeNode>
									);
								})}
								{subCategories &&
									subCategories.map(
										(subCategory: SubCategorySchema, index: number) => {
											return (
												<TreeNode
													level={1}
													key={subCategory.name}
													nodeId={subCategory.name}
													className={cn("relative rounded-md")}
												>
													{index === treeSubCategories.length && (
														<CometBorder />
													)}
													<TreeNodeTrigger>
														<TreeExpander />
														<TreeIcon icon={<IconChevronRight />} />
														<TreeLabel>{subCategory.name}</TreeLabel>
													</TreeNodeTrigger>
												</TreeNode>
											);
										},
									)}
							</TreeNodeContent>
						</TreeNode>
					</TreeView>
				</TreeProvider>
			</ScrollArea>
		</>
	);
}
