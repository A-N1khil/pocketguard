"use client";

import {
	IconChevronLeft,
	IconChevronRight,
	IconCircleNumber1,
	IconCircleNumber1Filled,
	IconCircleNumber2,
	IconCircleNumber2Filled,
	IconCircleNumber3,
	IconCircleNumber3Filled,
	IconCircleNumber4,
	IconCircleNumber4Filled,
	IconThumbUp,
} from "@tabler/icons-react";
import { type ComponentType, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";
import { BulkUploadStep1 } from "@/components/bulk-upload/bulk-upload-step-1";

dayjs.extend(LocalizedFormat);

type IconComponent = ComponentType<{ size: number }>;

function DelayedFillIcon({
	OutlineIcon,
	FilledIcon,
	filled,
}: {
	OutlineIcon: IconComponent;
	FilledIcon: IconComponent;
	filled: boolean;
}) {
	const [delayElapsed, setDelayElapsed] = useState(false);

	useEffect(() => {
		if (!filled) return;

		const timer = setTimeout(() => setDelayElapsed(true), 500);
		return () => clearTimeout(timer);
	}, [filled]);

	if (!filled && delayElapsed) {
		setDelayElapsed(false);
	}

	const Icon = filled && delayElapsed ? FilledIcon : OutlineIcon;
	return <Icon size={48} />;
}

export default function BulkUploadInstructions() {
	const [introStep, setIntroStep] = useState<number>(1);

	// CSV upload from Step 1
	const [uploadedCSV, setUploadedCSV] = useState<File | undefined>();

	const canAdvanceByStep: Record<number, boolean> = {
		1: Boolean(uploadedCSV),
	};

	return (
		<>
			<div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-y-1">
				{/* Row 1: Step icons */}
				<div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-x-2 pt-0">
					<DelayedFillIcon
						OutlineIcon={IconCircleNumber1}
						FilledIcon={IconCircleNumber1Filled}
						filled={introStep >= 1}
					/>

					<Progress value={introStep >= 2 ? 100 : 0} />

					<DelayedFillIcon
						OutlineIcon={IconCircleNumber2}
						FilledIcon={IconCircleNumber2Filled}
						filled={introStep > 1}
					/>

					<Progress value={introStep >= 3 ? 100 : 0} />

					<DelayedFillIcon
						OutlineIcon={IconCircleNumber3}
						FilledIcon={IconCircleNumber3Filled}
						filled={introStep > 2}
					/>
					<Progress value={introStep >= 4 ? 100 : 0} />

					<DelayedFillIcon
						OutlineIcon={IconCircleNumber4}
						FilledIcon={IconCircleNumber4Filled}
						filled={introStep > 3}
					/>
				</div>
				<div className="min-h-0 overflow-y-auto">
					{introStep === 1 && (
						<BulkUploadStep1 file={uploadedCSV} setFile={setUploadedCSV} />
					)}
				</div>

				{/* Row 3: Buttons */}
				<div className="flex items-center justify-self-end gap-2">
					<Button
						type="button"
						onClick={() => {
							setIntroStep((prev) => prev - 1);
						}}
						hidden={introStep === 1}
					>
						<IconChevronLeft />
						Previous
					</Button>
					<Button
						type="button"
						onClick={() => {
							setIntroStep((prev) => prev + 1);
						}}
						disabled={!canAdvanceByStep[introStep]}
					>
						{introStep === 4 ? (
							<>
								<IconThumbUp />
								Finish
							</>
						) : (
							<>
								Next <IconChevronRight />
							</>
						)}
					</Button>
				</div>
			</div>
		</>
	);
}
