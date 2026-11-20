"use client";

import { useState } from "react";
import BulkUploadInstructions from "@/components/bulk-upload/bulk-upload-instructions";

export type BulkUploadState =
	| "Introduction"
	| "Upload"
	| "Validation"
	| "UserInput"
	| "SaveReady"
	| "Errors"
	| "SaveComplete";

export default function BulkUploadTransactionDialog() {
	const [skipIntro, setSkipIntro] = useState<boolean>(false);

	return (
		<>
			<BulkUploadInstructions />
		</>
	);
}
