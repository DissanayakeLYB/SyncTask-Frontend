import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Loader2, Check } from "lucide-react";
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

	const toggleMember = (memberId: string) => {
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

			// Members to add (selected but not existing)
			const membersToAdd = [...selectedMembers].filter(
				(id) => !existingMemberIds.has(id),
			);

			// Members to remove (existing but not selected)
			const membersToRemove = [...existingMemberIds].filter(
				(id) => !selectedMembers.has(id),
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
							Manage Leave
						</h3>
						<p className="text-sm text-slate-400">
							{format(date, "EEEE, MMMM d, yyyy")}
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
					<div className="space-y-2 max-h-80 overflow-y-auto">
						<p className="text-sm text-slate-400 mb-3">
							Select team members who are on leave:
						</p>
						{teamMembers.map((member) => (
							<label
								key={member.id}
								className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-700 cursor-pointer transition-colors"
							>
								<div
									className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
										selectedMembers.has(member.id)
											? "bg-blue-600 border-blue-600"
											: "border-slate-500"
									}`}
								>
									{selectedMembers.has(member.id) && (
										<Check className="h-3 w-3 text-white" />
									)}
								</div>
								<input
									type="checkbox"
									checked={selectedMembers.has(member.id)}
									onChange={() => toggleMember(member.id)}
									className="sr-only"
								/>
								<span className="text-xl">{member.emoji}</span>
								<span className="text-slate-100">
									{member.name}
								</span>
							</label>
						))}
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
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
