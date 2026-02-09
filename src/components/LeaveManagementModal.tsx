import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
	getTeamMembers,
	getLeavesForDate,
	createLeave,
	deleteLeavesForMemberOnDate,
} from "@/lib/database";
import type { TeamMember, LeaveWithMember } from "@/types/database.types";

interface LeaveManagementModalProps {
	date: Date;
	onClose: () => void;
	onSave?: () => void;
}

export function LeaveManagementModal({
	date,
	onClose,
	onSave,
}: LeaveManagementModalProps) {
	const { user } = useAuth();
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [existingLeaves, setExistingLeaves] = useState<LeaveWithMember[]>([]);
	const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
		new Set(),
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dateString = format(date, "yyyy-MM-dd");

	useEffect(() => {
		async function loadData() {
			setIsLoading(true);
			try {
				const [members, leaves] = await Promise.all([
					getTeamMembers(),
					getLeavesForDate(dateString),
				]);
				setTeamMembers(members);
				setExistingLeaves(leaves);

				// Pre-select members who already have leave on this date
				const existingLeaveMembers = new Set(
					leaves.map((l) => l.team_member_id),
				);
				setSelectedMembers(existingLeaveMembers);
			} catch (err) {
				console.error("Error loading data:", err);
				setError("Failed to load data");
			} finally {
				setIsLoading(false);
			}
		}
		loadData();
	}, [dateString]);

	// Get the team member ID that belongs to the current user
	// Since team members are now derived from profiles, user.id === team_member.id
	const currentUserTeamMemberId = user?.id;

	// Get the team member object for current user
	const currentUserTeamMember = teamMembers.find(
		(member) => member.id === user?.id,
	);

	// Get leaves for other team members (not the current user)
	const othersOnLeave = existingLeaves.filter(
		(leave) => leave.team_member_id !== currentUserTeamMemberId,
	);

	// Check if a member can be edited by the current user (everyone can only edit their own)
	const canEditMember = (memberId: string) => {
		return memberId === currentUserTeamMemberId;
	};

	const toggleMember = (memberId: string) => {
		// Only allow toggling if user can edit this member
		if (!canEditMember(memberId)) return;

		setSelectedMembers((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(memberId)) {
				newSet.delete(memberId);
			} else {
				newSet.add(memberId);
			}
			return newSet;
		});
	};

	const handleSave = async () => {
		if (!user) return;

		setIsSaving(true);
		setError(null);

		try {
			const existingMemberIds = new Set(
				existingLeaves.map((l) => l.team_member_id),
			);

			// Members to add (selected but not existing) - only those the user can edit
			const membersToAdd = [...selectedMembers].filter(
				(id) => !existingMemberIds.has(id) && canEditMember(id),
			);

			// Members to remove (existing but not selected) - only those the user can edit
			const membersToRemove = [...existingMemberIds].filter(
				(id) => !selectedMembers.has(id) && canEditMember(id),
			);

			// Add new leaves
			for (const memberId of membersToAdd) {
				await createLeave(memberId, dateString, user.id);
			}

			// Remove unchecked leaves
			for (const memberId of membersToRemove) {
				await deleteLeavesForMemberOnDate(memberId, dateString);
			}

			onSave?.();
			onClose();
		} catch (err) {
			console.error("Error saving leaves:", err);
			setError("Failed to save leaves");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-slate-700">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-xl font-bold text-slate-100">
							Request Leave
						</h3>
						<p className="text-sm text-slate-400">
							{format(date, "EEEE, dd/MM/yyyy")}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 hover:bg-slate-700 rounded-md transition-colors"
					>
						<X className="h-5 w-5 text-slate-400" />
					</button>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{/* Content */}
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					</div>
				) : (
					/* All users can only toggle own leave, see others read-only */
					<div className="space-y-4">
						{/* Your Leave Section */}
						{currentUserTeamMember && (
							<div className="bg-slate-700/50 rounded-lg p-4">
								<p className="text-sm font-medium text-slate-300 mb-3">
									Your Leave Status
								</p>
								<label className="flex items-center gap-4 cursor-pointer">
									<div
										className={`relative w-12 h-6 rounded-full transition-colors ${
											selectedMembers.has(
												currentUserTeamMemberId!,
											)
												? "bg-blue-600"
												: "bg-slate-600"
										}`}
									>
										<div
											className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
												selectedMembers.has(
													currentUserTeamMemberId!,
												)
													? "translate-x-6"
													: ""
											}`}
										/>
									</div>
									<input
										type="checkbox"
										checked={selectedMembers.has(
											currentUserTeamMemberId!,
										)}
										onChange={() =>
											toggleMember(
												currentUserTeamMemberId!,
											)
										}
										className="sr-only"
									/>
									<div className="flex items-center gap-2">
										<span className="text-xl">
											{currentUserTeamMember.emoji}
										</span>
										<span className="text-slate-100">
											{selectedMembers.has(
												currentUserTeamMemberId!,
											)
												? "On Leave"
												: "Working"}
										</span>
									</div>
								</label>
							</div>
						)}

						{/* Others on Leave Section */}
						<div>
							<p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Others on Leave
							</p>
							{othersOnLeave.length > 0 ? (
								<div className="space-y-2">
									{othersOnLeave.map((leave) => (
										<div
											key={leave.id}
											className="flex items-center gap-3 p-2 rounded-md bg-slate-700/30"
										>
											<span className="text-xl">
												{leave.team_member.emoji}
											</span>
											<span className="text-slate-300">
												{leave.team_member.name}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-slate-500 italic p-2">
									No other team members on leave this day
								</p>
							)}
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-700">
					<button
						onClick={onClose}
						disabled={isSaving}
						className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition font-medium disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving || isLoading}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium flex items-center gap-2 disabled:opacity-50"
					>
						{isSaving && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
