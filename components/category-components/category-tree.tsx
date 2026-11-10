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

type CategoryTreeProps = {
	category: Category;
	subCategories?: SubCategorySchema[];
};

export default function CategoryTree({
	category,
	subCategories,
}: CategoryTreeProps) {
	return (
		<>
			<TreeProvider defaultExpandedIds={[category.name]}>
				<TreeView>
					<TreeNode nodeId={category.name}>
						<TreeNodeTrigger>
							<TreeExpander hasChildren />
							<TreeIcon hasChildren icon={<IconBadges />} />
							<TreeLabel>{category.name}</TreeLabel>
						</TreeNodeTrigger>
						{subCategories && (
							<TreeNodeContent hasChildren>
								{subCategories.map(
									(subCategory: SubCategorySchema, index: number) => {
										return (
											<TreeNode
												level={1}
												key={subCategory.name}
												nodeId={subCategory.name}
												className={cn("relative rounded-md")}
											>
												<CometBorder />
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
						)}
					</TreeNode>
				</TreeView>
			</TreeProvider>
		</>
	);
}
