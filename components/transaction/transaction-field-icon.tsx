"use client";

import {
	IconCalendarDollar,
	IconCashBanknote,
	IconClock12,
	IconCurrencyDollar,
	IconMenu3,
	IconNumber,
	IconTag,
	IconTags,
	type TablerIcon,
} from "@tabler/icons-react";

const fieldIconMap: Record<string, TablerIcon> = {
	id: IconNumber,
	title: IconMenu3,
	transactionType: IconCashBanknote,
	category: IconTag,
	subCategory: IconTags,
	amount: IconCurrencyDollar,
	date: IconCalendarDollar,
	time: IconClock12,
};

type TransactionFieldIconProps = {
	field: keyof typeof fieldIconMap;
	size?: number;
};

export default function TransactionFieldIcon({
	field,
	size,
}: TransactionFieldIconProps) {
	const Icon: TablerIcon = fieldIconMap[field];
	return <Icon size={size} aria-hidden />;
}
