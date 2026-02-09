import * as React from "react";
import { useState, useEffect } from "react";

import { NavLecturers } from "@/components/nav-lecturers";
import { DatePickerInline } from "@/components/date-picker";
import { LeaveManagementModal } from "@/components/LeaveManagementModal";
import {
	Sidebar,
	SidebarContent,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { getTeamMembers, getLeaves } from "@/lib/database";
import type { TeamMember, LeaveWithMember } from "@/types/database.types";

export function SidebarLeft({
	selectedPerson,
	onPersonSelect,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	selectedPerson: string | null;
	onPersonSelect: (person: string | null) => void;
}) {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [leaves, setLeaves] = useState<LeaveWithMember[]>([]);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [showLeaveModal, setShowLeaveModal] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	async function loadData() {
		try {
			const [members, leavesData] = await Promise.all([
				getTeamMembers(),
				getLeaves(),
			]);
			setTeamMembers(members);
			setLeaves(leavesData);
		} catch (error) {
			console.error("Error loading sidebar data:", error);
		}
	}

	// Convert leaves to Date objects for the calendar
	const leaveDates = leaves.map((leave) => new Date(leave.leave_date));

	// Map team members to the format expected by NavLecturers
	const lecturers = teamMembers.map((member) => ({
		name: member.name,
		emoji: member.emoji,
		firstName: member.first_name,
	}));

	const handleDateClick = (date: Date) => {
		setSelectedDate(date);
		setShowLeaveModal(true);
	};

	const handleLeaveModalClose = () => {
		setShowLeaveModal(false);
		setSelectedDate(undefined);
	};

	const handleLeaveSaved = () => {
		// Reload leaves after saving
		getLeaves().then(setLeaves);
	};

	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarContent className="flex flex-col gap-3 overflow-hidden">
				<div className="flex-shrink-0">
					<NavLecturers
						lecturers={lecturers}
						selectedPerson={selectedPerson}
						onPersonSelect={onPersonSelect}
					/>
				</div>

				<SidebarSeparator className="mx-0 flex-shrink-0" />

				<div className="px-2 pb-4 flex-shrink-0">
					<p className="text-xs text-slate-400 mb-2 px-1">
						Leave Calendar
					</p>
					<DatePickerInline
						leaveDates={leaveDates}
						onDateClick={handleDateClick}
						className="w-full"
					/>
				</div>
			</SidebarContent>
			<SidebarRail />

			{/* Leave Management Modal */}
			{showLeaveModal && selectedDate && (
				<LeaveManagementModal
					date={selectedDate}
					onClose={handleLeaveModalClose}
					onSave={handleLeaveSaved}
				/>
			)}
		</Sidebar>
	);
}
