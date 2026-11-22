"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BulkUploadTransactionDialog from "@/components/bulk-upload/bulk-upload-component";

export default function Page() {
	const [openDialog, setOpenDialog] = useState<boolean>(false);

	return (
		<>
			<Button type="button" onClick={() => setOpenDialog(true)}>
				Open Dialog
			</Button>

			{openDialog && (
				<BulkUploadTransactionDialog dialog={{ openDialog, setOpenDialog }} />
			)}
		</>
	);
}
