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

	// Modifier for dates that have leaves
	const leaveModifier = {
		leave: leaveDates,
	};

	const modifiersStyles = {
		leave: {
			backgroundColor: "rgb(239 68 68 / 0.2)",
			borderRadius: "4px",
		},
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
						format(selectedDate, "PPP")
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
					modifiersStyles={modifiersStyles}
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

	// Modifier for dates that have leaves
	const leaveModifier = {
		leave: leaveDates,
	};

	const modifiersStyles = {
		leave: {
			backgroundColor: "rgb(239 68 68 / 0.2)",
			borderRadius: "4px",
		},
	};

	return (
		<Calendar
			mode="single"
			selected={selectedDate}
			onSelect={handleSelect}
			modifiers={leaveModifier}
			modifiersStyles={modifiersStyles}
			className={cn(
				"rounded-md border w-full max-w-full [--cell-size:28px] p-2",
				"[&_.rdp-month]:w-full [&_.rdp-table]:w-full",
				"[&_.rdp-weekday]:text-[0.65rem] [&_.rdp-day_button]:text-xs",
				className,
			)}
		/>
	);
}
