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
import type { LeaveType } from "@/types/database.types";

interface LeaveInfo {
	date: Date;
	type: LeaveType;
}

interface DatePickerProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	leaves?: LeaveInfo[];
	ownLeaves?: LeaveInfo[];
	onDateClick?: (date: Date) => void;
	placeholder?: string;
	className?: string;
	// Legacy props for backward compatibility
	leaveDates?: Date[];
	ownLeaveDates?: Date[];
}

export function DatePicker({
	date,
	onDateChange,
	leaves = [],
	ownLeaves = [],
	onDateClick,
	placeholder = "Pick a date",
	className,
	// Legacy props
	leaveDates,
	ownLeaveDates,
}: DatePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);
	const [open, setOpen] = React.useState(false);

	// Convert legacy props to new format if provided
	const normalizedLeaves: LeaveInfo[] =
		leaves.length > 0
			? leaves
			: (leaveDates || []).map((d) => ({ date: d, type: "full_day" as LeaveType }));
	const normalizedOwnLeaves: LeaveInfo[] =
		ownLeaves.length > 0
			? ownLeaves
			: (ownLeaveDates || []).map((d) => ({
					date: d,
					type: "full_day" as LeaveType,
				}));

	const handleSelect = (newDate: Date | undefined) => {
		setSelectedDate(newDate);
		onDateChange?.(newDate);
		if (newDate && onDateClick) {
			onDateClick(newDate);
		}
	};

	// Helper to check if date matches any in list
	const dateMatches = (date: Date, leaveList: LeaveInfo[]) => {
		return leaveList.some(
			(l) =>
				l.date.getFullYear() === date.getFullYear() &&
				l.date.getMonth() === date.getMonth() &&
				l.date.getDate() === date.getDate(),
		);
	};

	// Helper to get leave types for a date
	const getLeaveTypesForDate = (date: Date, leaveList: LeaveInfo[]) => {
		return leaveList
			.filter(
				(l) =>
					l.date.getFullYear() === date.getFullYear() &&
					l.date.getMonth() === date.getMonth() &&
					l.date.getDate() === date.getDate(),
			)
			.map((l) => l.type);
	};

	// Modifier for dates that have leaves - compare by date string to avoid timezone issues
	const leaveModifier = {
		// Own leave - blue color
		owns_leave: (date: Date) => dateMatches(date, normalizedOwnLeaves),
		// Own full day leave
		owns_leave_full: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("full_day");
		},
		// Own half day morning leave
		owns_leave_half_morning: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("half_day_morning");
		},
		// Own half day afternoon leave
		owns_leave_half_afternoon: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("half_day_afternoon");
		},
		// Others' leave (but not own) - orange color
		others_leave: (date: Date) => {
			const hasOthersLeave = dateMatches(date, normalizedLeaves);
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			return hasOthersLeave && !hasOwnLeave;
		},
		// Others' full day leave
		others_leave_full: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("full_day");
		},
		// Others' half day morning leave
		others_leave_half_morning: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("half_day_morning");
		},
		// Others' half day afternoon leave
		others_leave_half_afternoon: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("half_day_afternoon");
		},
		// Both own and others - purple color
		both_leave: (date: Date) => {
			const hasOthersLeave = dateMatches(date, normalizedLeaves);
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			return hasOthersLeave && hasOwnLeave;
		},
	};

	const modifiersClassNames = {
		owns_leave: "rdp-leave-own",
		owns_leave_full: "rdp-leave-own-full",
		owns_leave_half_morning: "rdp-leave-own-half-morning",
		owns_leave_half_afternoon: "rdp-leave-own-half-afternoon",
		others_leave: "rdp-leave-others",
		others_leave_full: "rdp-leave-others-full",
		others_leave_half_morning: "rdp-leave-others-half-morning",
		others_leave_half_afternoon: "rdp-leave-others-half-afternoon",
		both_leave: "rdp-leave-both",
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
	leaves = [],
	ownLeaves = [],
	onDateClick,
	className,
	// Legacy props
	leaveDates,
	ownLeaveDates,
}: Omit<DatePickerProps, "placeholder">) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);

	// Convert legacy props to new format if provided
	const normalizedLeaves: LeaveInfo[] =
		leaves.length > 0
			? leaves
			: (leaveDates || []).map((d) => ({ date: d, type: "full_day" as LeaveType }));
	const normalizedOwnLeaves: LeaveInfo[] =
		ownLeaves.length > 0
			? ownLeaves
			: (ownLeaveDates || []).map((d) => ({
					date: d,
					type: "full_day" as LeaveType,
				}));

	const handleSelect = (newDate: Date | undefined) => {
		setSelectedDate(newDate);
		onDateChange?.(newDate);
		if (newDate && onDateClick) {
			onDateClick(newDate);
		}
	};

	// Helper to check if date matches any in list
	const dateMatches = (date: Date, leaveList: LeaveInfo[]) => {
		return leaveList.some(
			(l) =>
				l.date.getFullYear() === date.getFullYear() &&
				l.date.getMonth() === date.getMonth() &&
				l.date.getDate() === date.getDate(),
		);
	};

	// Helper to get leave types for a date
	const getLeaveTypesForDate = (date: Date, leaveList: LeaveInfo[]) => {
		return leaveList
			.filter(
				(l) =>
					l.date.getFullYear() === date.getFullYear() &&
					l.date.getMonth() === date.getMonth() &&
					l.date.getDate() === date.getDate(),
			)
			.map((l) => l.type);
	};

	// Modifier for dates that have leaves - compare by date string to avoid timezone issues
	const leaveModifier = {
		// Own leave - blue color
		owns_leave: (date: Date) => dateMatches(date, normalizedOwnLeaves),
		// Own full day leave
		owns_leave_full: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("full_day");
		},
		// Own half day morning leave
		owns_leave_half_morning: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("half_day_morning");
		},
		// Own half day afternoon leave
		owns_leave_half_afternoon: (date: Date) => {
			const types = getLeaveTypesForDate(date, normalizedOwnLeaves);
			return types.includes("half_day_afternoon");
		},
		// Others' leave (but not own) - orange color
		others_leave: (date: Date) => {
			const hasOthersLeave = dateMatches(date, normalizedLeaves);
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			return hasOthersLeave && !hasOwnLeave;
		},
		// Others' full day leave
		others_leave_full: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("full_day");
		},
		// Others' half day morning leave
		others_leave_half_morning: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("half_day_morning");
		},
		// Others' half day afternoon leave
		others_leave_half_afternoon: (date: Date) => {
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			if (hasOwnLeave) return false;
			const types = getLeaveTypesForDate(date, normalizedLeaves);
			return types.includes("half_day_afternoon");
		},
		// Both own and others - purple color
		both_leave: (date: Date) => {
			const hasOthersLeave = dateMatches(date, normalizedLeaves);
			const hasOwnLeave = dateMatches(date, normalizedOwnLeaves);
			return hasOthersLeave && hasOwnLeave;
		},
	};

	const modifiersClassNames = {
		owns_leave: "rdp-leave-own",
		owns_leave_full: "rdp-leave-own-full",
		owns_leave_half_morning: "rdp-leave-own-half-morning",
		owns_leave_half_afternoon: "rdp-leave-own-half-afternoon",
		others_leave: "rdp-leave-others",
		others_leave_full: "rdp-leave-others-full",
		others_leave_half_morning: "rdp-leave-others-half-morning",
		others_leave_half_afternoon: "rdp-leave-others-half-afternoon",
		both_leave: "rdp-leave-both",
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
