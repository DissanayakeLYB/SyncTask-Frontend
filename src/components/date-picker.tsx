"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	leaveDates?: Date[];
	onDateClick?: (date: Date) => void;
	placeholder?: string;
	className?: string;
}

export function DatePicker({
	date,
	onDateChange,
	leaveDates = [],
	onDateClick,
	placeholder = "Pick a date",
	className,
}: DatePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);
	const [open, setOpen] = React.useState(false);

	const handleSelect = (newDate: Date | undefined) => {
		setSelectedDate(newDate);
		onDateChange?.(newDate);
		if (newDate && onDateClick) {
			onDateClick(newDate);
		}
	};

	// Modifier for dates that have leaves - compare by date string to avoid timezone issues
	const leaveModifier = {
		leave: (date: Date) => {
			return leaveDates.some(
				(leaveDate) =>
					leaveDate.getFullYear() === date.getFullYear() &&
					leaveDate.getMonth() === date.getMonth() &&
					leaveDate.getDate() === date.getDate(),
			);
		},
	};

	const modifiersClassNames = {
		leave: "[&>button]:bg-red-500/30 [&>button]:text-red-400 [&>button]:font-bold",
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!selectedDate && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{selectedDate ? (
						format(selectedDate, "dd/MM/yyyy")
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={handleSelect}
					modifiers={leaveModifier}
					modifiersClassNames={modifiersClassNames}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

// Inline calendar variant for sidebar display
export function DatePickerInline({
	date,
	onDateChange,
	leaveDates = [],
	onDateClick,
	className,
}: Omit<DatePickerProps, "placeholder">) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);

	const handleSelect = (newDate: Date | undefined) => {
		setSelectedDate(newDate);
		onDateChange?.(newDate);
		if (newDate && onDateClick) {
			onDateClick(newDate);
		}
	};

	// Modifier for dates that have leaves - compare by date string to avoid timezone issues
	const leaveModifier = {
		leave: (date: Date) => {
			return leaveDates.some(
				(leaveDate) =>
					leaveDate.getFullYear() === date.getFullYear() &&
					leaveDate.getMonth() === date.getMonth() &&
					leaveDate.getDate() === date.getDate(),
			);
		},
	};

	const modifiersClassNames = {
		leave: "[&>button]:bg-red-500/30 [&>button]:text-red-400 [&>button]:font-bold",
	};

	return (
		<Calendar
			mode="single"
			selected={selectedDate}
			onSelect={handleSelect}
			modifiers={leaveModifier}
			modifiersClassNames={modifiersClassNames}
			className={cn(
				"rounded-md border w-full max-w-full [--cell-size:28px] p-2",
				"[&_.rdp-month]:w-full [&_.rdp-table]:w-full",
				"[&_.rdp-weekday]:text-[0.65rem] [&_.rdp-day_button]:text-xs",
				className,
			)}
		/>
	);
}
