import type { UseFormRegister } from "react-hook-form";
import { useId, useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { TransactionFormValues } from "./create-transaction-form";
import { IconChevronDown } from "@tabler/icons-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import TransactionFieldIcon from "@/components/transaction/transaction-field-icon";

type TransactionFormProps = {
	register: UseFormRegister<TransactionFormValues>;
	timestamp: string;
	onTimestampChange: (timestamp: string) => void;
	error?: string;
};

export default function TransactionFormDateTimePicker({
	register,
	timestamp,
	onTimestampChange,
	error,
}: TransactionFormProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const date = new Date(timestamp);
	const errorId = error ? `${id}-error` : undefined;

	return (
		<div>
			<input type="hidden" {...register("timestamp")} />
			<div className="grid grid-cols-2 gap-4">
				<Field data-invalid={Boolean(error)}>
					<FieldLabel htmlFor={id}>
						<TransactionFieldIcon field="date" size={18} />
					</FieldLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger
							render={
								<Button
									type="button"
									variant="outline"
									className="w-full justify-between font-normal"
									id={id}
									aria-invalid={Boolean(error)}
									aria-describedby={errorId}
								>
									{dayjs(date).format("MMM D, YYYY")}
									<IconChevronDown />
								</Button>
							}
						/>
						<PopoverContent
							className="overflow-hidden w-auto p-0"
							align="start"
						>
							<Calendar
								mode="single"
								selected={date}
								captionLayout="dropdown"
								defaultMonth={date}
								required
								onSelect={(selectedDate) => {
									date.setFullYear(
										selectedDate.getFullYear(),
										selectedDate.getMonth(),
										selectedDate.getDate(),
									);
									onTimestampChange(date.toISOString());
									setOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>
				</Field>
				<Field data-invalid={Boolean(error)}>
					<FieldLabel htmlFor={`${id}-time`}>
						<TransactionFieldIcon field="time" size={18} />
					</FieldLabel>
					<Input
						id={`${id}-time`}
						type="time"
						step={1}
						value={dayjs(date).format("HH:mm")}
						aria-invalid={Boolean(error)}
						aria-describedby={errorId}
						className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
						onChange={(event) => {
							const value = event.currentTarget.value;
							if (!value) return;

							const [hours, minutes] = value.split(":").map(Number);
							date.setHours(hours, minutes);
							onTimestampChange(date.toISOString());
						}}
					/>
				</Field>
			</div>
			{error && <FieldError id={errorId}>{error}</FieldError>}
		</div>
	);
}
