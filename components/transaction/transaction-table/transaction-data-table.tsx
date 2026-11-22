"use client";

import { type ReactTable, FlexRender } from "@tanstack/react-table";
import type { BaseDataTableFeatures } from "@/components/transaction/transaction-table/transaction-table-base-features";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/models/transaction-model";
import { TanStackTableUtils } from "@/components/tan-stack-table-utils";

type DataTableProps<TRow extends Transaction> = {
	table: ReactTable<BaseDataTableFeatures, TRow>;
};

function DataTable<TRow extends Transaction>({ table }: DataTableProps<TRow>) {
	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader className="sticky top-0 z-10 bg-muted">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : <FlexRender header={header} />}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										<FlexRender cell={cell} />
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default function TransactionDataTable<TRow extends Transaction>({
	table,
}: DataTableProps<TRow>) {
	return (
		<div className="grid grid-cols-4 gap-2">
			<div className="col-span-full col-start-1">
				<DataTable table={table} />
			</div>
			<div className="col-span-full">
				<TanStackTableUtils
					table={table}
					className="col-span-full"
					showMetadata={{ itemCount: true }}
				/>
			</div>
		</div>
	);
}
