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
import type {
	TeamMember,
	LeaveWithMember,
	LeaveType,
} from "@/types/database.types";

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
	const [selectedLeaveType, setSelectedLeaveType] = useState<
		LeaveType | "none"
	>("none");
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

				// Pre-select the current user's leave type if they have one
				const currentUserLeave = leaves.find(
					(l) => l.team_member_id === user?.id,
				);
				if (currentUserLeave) {
					setSelectedLeaveType(currentUserLeave.leave_type);
				} else {
					setSelectedLeaveType("none");
				}
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

	// Get the current user's existing leave
	const currentUserLeave = existingLeaves.find(
		(l) => l.team_member_id === currentUserTeamMemberId,
	);

	const handleSave = async () => {
		if (!user || !currentUserTeamMemberId) return;

		setIsSaving(true);
		setError(null);

		try {
			// Delete existing leave if any
			if (currentUserLeave) {
				await deleteLeavesForMemberOnDate(
					currentUserTeamMemberId,
					dateString,
				);
			}

			// Create new leave if a type is selected
			if (selectedLeaveType !== "none") {
				await createLeave(
					currentUserTeamMemberId,
					dateString,
					user.id,
					selectedLeaveType,
				);
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
								<div className="space-y-2">
									<label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-600/50 transition-colors">
										<input
											type="radio"
											name="leaveType"
											value="none"
											checked={selectedLeaveType === "none"}
											onChange={() => setSelectedLeaveType("none")}
											className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500 focus:ring-2"
										/>
										<span className="text-xl">
											{currentUserTeamMember.emoji}
										</span>
										<span className="text-slate-100">Working</span>
									</label>
									<label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-600/50 transition-colors">
										<input
											type="radio"
											name="leaveType"
											value="full_day"
											checked={selectedLeaveType === "full_day"}
											onChange={() => setSelectedLeaveType("full_day")}
											className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500 focus:ring-2"
										/>
										<span className="text-slate-100">Full Day Leave</span>
									</label>
									<label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-600/50 transition-colors">
										<input
											type="radio"
											name="leaveType"
											value="half_day_morning"
											checked={selectedLeaveType === "half_day_morning"}
											onChange={() =>
												setSelectedLeaveType("half_day_morning")
											}
											className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500 focus:ring-2"
										/>
										<span className="text-slate-100">
											Half Day - Morning Leave
										</span>
									</label>
									<label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-600/50 transition-colors">
										<input
											type="radio"
											name="leaveType"
											value="half_day_afternoon"
											checked={selectedLeaveType === "half_day_afternoon"}
											onChange={() =>
												setSelectedLeaveType("half_day_afternoon")
											}
											className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500 focus:ring-2"
										/>
										<span className="text-slate-100">
											Half Day - Afternoon Leave
										</span>
									</label>
								</div>
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
									{othersOnLeave.map((leave) => {
										const leaveTypeLabel =
											leave.leave_type === "full_day"
												? "Full Day"
												: leave.leave_type === "half_day_morning"
													? "Half Day - Morning"
													: "Half Day - Afternoon";
										return (
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
												<span className="text-xs text-slate-400 ml-auto">
													{leaveTypeLabel}
												</span>
											</div>
										);
									})}
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
