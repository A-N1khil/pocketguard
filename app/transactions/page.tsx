"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BulkUploadTransactionDialog from "@/components/bulk-upload/bulk-upload-component";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { IconTableImport } from "@tabler/icons-react";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Page() {
	const [openBulkUploadDialog, setOpenBulkUploadDialog] =
		useState<boolean>(false);

	return (
		<>
			<Button type="button" onClick={() => setOpenBulkUploadDialog(true)}>
				Open Dialog
			</Button>

			<Dialog
				key="bulkUploadTransactionDialog"
				open={openBulkUploadDialog}
				onOpenChange={setOpenBulkUploadDialog}
				modal={true}
			>
				<DialogContent className="h-auto w-[75vw] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-none">
					<DialogHeader>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink render={<a href="#">Transactions</a>} />
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink render={<a href="#">Bulk Upload</a>} />
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<DialogTitle className="flex items-center gap-2 mt-2">
							<IconTableImport /> Bulk Upload Transactions
						</DialogTitle>
					</DialogHeader>
					<div className="min-w-0 overflow-auto">
						<BulkUploadTransactionDialog />
					</div>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Close</Button>} />
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
