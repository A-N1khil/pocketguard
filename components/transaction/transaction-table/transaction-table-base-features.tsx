import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_equalsString,
	filterFn_includesString,
	filterFn_inDateRange,
	filterFn_inNumberRange,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);

export const features = tableFeatures({
	columnFilteringFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: {
		includesString: filterFn_includesString,
		inNumberRange: filterFn_inNumberRange,
		inDateRange: filterFn_inDateRange,
		equals: filterFn_equalsString,
	},
	sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
export type BaseDataTableFeatures = typeof features;
