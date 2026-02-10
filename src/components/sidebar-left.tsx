import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { parseISO } from "date-fns";

import { NavLecturers } from "@/components/nav-lecturers";
import { DatePickerInline } from "@/components/date-picker";
import { LeaveManagementModal } from "@/components/LeaveManagementModal";
import {
	Sidebar,
	SidebarContent,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { getTeamMembers, getLeaves, subscribeToLeaves } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import type { TeamMember, LeaveWithMember } from "@/types/database.types";

export function SidebarLeft({
	selectedPerson,
	onPersonSelect,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	selectedPerson: string | null;
	onPersonSelect: (person: string | null) => void;
}) {
	const { user } = useAuth();
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [leaves, setLeaves] = useState<LeaveWithMember[]>([]);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [showLeaveModal, setShowLeaveModal] = useState(false);

	const loadData = useCallback(async () => {
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
	}, []);

	useEffect(() => {
		loadData();

		// Subscribe to real-time leave changes so all users see updates
		const subscription = subscribeToLeaves(() => {
			// Reload leaves when any change occurs
			loadData();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [loadData]);

	// Convert leaves to Date objects for the calendar
	// Separate own leaves from others' leaves
	const ownLeaveDates = leaves
		.filter((leave) => leave.team_member_id === user?.id)
		.map((leave) => parseISO(leave.leave_date));

	// Others' leaves (not including own)
	const othersLeaveDates = leaves
		.filter((leave) => leave.team_member_id !== user?.id)
		.map((leave) => parseISO(leave.leave_date));

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
		// Reload leaves after saving - the real-time subscription will also trigger
		loadData();
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
						leaveDates={othersLeaveDates}
						ownLeaveDates={ownLeaveDates}
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
