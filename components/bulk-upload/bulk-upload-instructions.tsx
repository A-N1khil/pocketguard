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
} from "@tabler/icons-react";
import { useState, useEffect, type ComponentType } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
	return <Icon size={72} />;
}

export default function BulkUploadInstructions() {
	const [introStep, setIntroStep] = useState<number>(1);

	return (
		<>
			<div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-x-2">
				{introStep >= 1 ? (
					<IconCircleNumber1Filled size={72} />
				) : (
					<IconCircleNumber1 size={72} />
				)}

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
			</div>
			<div className="flex items-center justify-self-end gap-2">
				<Button
					type="button"
					onClick={() => {
						setIntroStep((prev) => prev - 1);
					}}
					disabled={introStep === 1}
				>
					<IconChevronLeft />
					Previous
				</Button>
				<Button
					type="button"
					onClick={() => {
						setIntroStep((prev) => prev + 1);
					}}
					disabled={introStep === 3}
				>
					Next <IconChevronRight />
				</Button>
			</div>
		</>
	);
}
