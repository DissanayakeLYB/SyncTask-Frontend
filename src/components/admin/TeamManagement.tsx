import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Plus,
	Trash2,
	Edit2,
	Loader2,
	Save,
	X,
	Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
	getTeamMembers,
	createTeamMember,
	updateTeamMember,
	deleteTeamMember,
} from "@/lib/database";
import type { TeamMember } from "@/types/database.types";

export function TeamManagement() {
	const { isAdmin } = useAuth();
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Add form state
	const [showAddForm, setShowAddForm] = useState(false);
	const [newName, setNewName] = useState("");
	const [newFirstName, setNewFirstName] = useState("");
	const [newEmoji, setNewEmoji] = useState("👤");
	const [isAdding, setIsAdding] = useState(false);

	// Edit state
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editFirstName, setEditFirstName] = useState("");
	const [editEmoji, setEditEmoji] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// Delete state
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		loadTeamMembers();
	}, []);

	async function loadTeamMembers() {
		setIsLoading(true);
		try {
			const members = await getTeamMembers();
			setTeamMembers(members);
		} catch (err) {
			console.error("Error loading team members:", err);
			setError("Failed to load team members");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleAdd() {
		if (!newName.trim() || !newFirstName.trim()) {
			setError("Name and first name are required");
			return;
		}

		setIsAdding(true);
		setError(null);

		try {
			const member = await createTeamMember({
				name: newName.trim(),
				first_name: newFirstName.trim(),
				emoji: newEmoji,
			});

			if (member) {
				setTeamMembers((prev) => [...prev, member]);
				setNewName("");
				setNewFirstName("");
				setNewEmoji("👤");
				setShowAddForm(false);
			} else {
				setError("Failed to add team member");
			}
		} catch (err) {
			console.error("Error adding team member:", err);
			setError("Failed to add team member");
		} finally {
			setIsAdding(false);
		}
	}

	function startEdit(member: TeamMember) {
		setEditingId(member.id);
		setEditName(member.name);
		setEditFirstName(member.first_name);
		setEditEmoji(member.emoji);
	}

	function cancelEdit() {
		setEditingId(null);
		setEditName("");
		setEditFirstName("");
		setEditEmoji("");
	}

	async function handleSaveEdit() {
		if (!editingId || !editName.trim() || !editFirstName.trim()) {
			setError("Name and first name are required");
			return;
		}

		setIsSaving(true);
		setError(null);

		try {
			const updated = await updateTeamMember(editingId, {
				name: editName.trim(),
				first_name: editFirstName.trim(),
				emoji: editEmoji,
			});

			if (updated) {
				setTeamMembers((prev) =>
					prev.map((m) => (m.id === editingId ? updated : m)),
				);
				cancelEdit();
			} else {
				setError("Failed to update team member");
			}
		} catch (err) {
			console.error("Error updating team member:", err);
			setError("Failed to update team member");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(memberId: string) {
		setDeletingId(memberId);
		setError(null);

		try {
			const success = await deleteTeamMember(memberId);
			if (success) {
				setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
			} else {
				setError("Failed to delete team member");
			}
		} catch (err) {
			console.error("Error deleting team member:", err);
			setError("Failed to delete team member");
		} finally {
			setDeletingId(null);
		}
	}

	if (!isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900">
				<div className="text-center max-w-md mx-auto px-4">
					<div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
						<span className="text-3xl">🚫</span>
					</div>
					<h2 className="text-2xl font-bold text-slate-100 mb-2">
						Access Denied
					</h2>
					<p className="text-slate-400 mb-6">
						Only administrators can manage team members.
					</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 p-6">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Link
						to="/"
						className="p-2 hover:bg-slate-800 rounded-md transition-colors"
					>
						<ArrowLeft className="h-5 w-5 text-slate-400" />
					</Link>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
							<Users className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-100">
								Team Management
							</h1>
							<p className="text-slate-400 text-sm">
								Add, edit, or remove team members
							</p>
						</div>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{/* Add Button / Form */}
				<div className="mb-6">
					{showAddForm ? (
						<div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
							<h3 className="text-lg font-semibold text-slate-100 mb-4">
								Add Team Member
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
								<input
									type="text"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Full Name"
									className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="text"
									value={newFirstName}
									onChange={(e) =>
										setNewFirstName(e.target.value)
									}
									placeholder="First Name (for tagging)"
									className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="text"
									value={newEmoji}
									onChange={(e) =>
										setNewEmoji(e.target.value)
									}
									placeholder="Emoji"
									className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="flex gap-3 justify-end">
								<button
									onClick={() => setShowAddForm(false)}
									className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition font-medium"
								>
									Cancel
								</button>
								<button
									onClick={handleAdd}
									disabled={isAdding}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium flex items-center gap-2 disabled:opacity-50"
								>
									{isAdding ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Plus className="h-4 w-4" />
									)}
									Add Member
								</button>
							</div>
						</div>
					) : (
						<button
							onClick={() => setShowAddForm(true)}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium"
						>
							<Plus className="h-4 w-4" />
							Add Team Member
						</button>
					)}
				</div>

				{/* Team Members List */}
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					</div>
				) : (
					<div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b border-slate-700">
									<th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
										Member
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
										First Name
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
										Status
									</th>
									<th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{teamMembers.map((member) => (
									<tr
										key={member.id}
										className="border-b border-slate-700 last:border-b-0"
									>
										{editingId === member.id ? (
											<>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<input
															type="text"
															value={editEmoji}
															onChange={(e) =>
																setEditEmoji(
																	e.target
																		.value,
																)
															}
															className="w-12 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-center"
														/>
														<input
															type="text"
															value={editName}
															onChange={(e) =>
																setEditName(
																	e.target
																		.value,
																)
															}
															className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
														/>
													</div>
												</td>
												<td className="px-4 py-3">
													<input
														type="text"
														value={editFirstName}
														onChange={(e) =>
															setEditFirstName(
																e.target.value,
															)
														}
														className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
													/>
												</td>
												<td className="px-4 py-3">
													<span className="text-green-400 text-sm">
														Active
													</span>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2 justify-end">
														<button
															onClick={cancelEdit}
															disabled={isSaving}
															className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
														>
															<X className="h-4 w-4 text-slate-400" />
														</button>
														<button
															onClick={
																handleSaveEdit
															}
															disabled={isSaving}
															className="p-1.5 hover:bg-green-600/20 rounded-md transition-colors"
														>
															{isSaving ? (
																<Loader2 className="h-4 w-4 animate-spin text-green-400" />
															) : (
																<Save className="h-4 w-4 text-green-400" />
															)}
														</button>
													</div>
												</td>
											</>
										) : (
											<>
												<td className="px-4 py-3">
													<div className="flex items-center gap-3">
														<span className="text-xl">
															{member.emoji}
														</span>
														<span className="text-slate-100">
															{member.name}
														</span>
													</div>
												</td>
												<td className="px-4 py-3 text-slate-300">
													{member.first_name}
												</td>
												<td className="px-4 py-3">
													<span
														className={`text-sm ${
															member.is_active
																? "text-green-400"
																: "text-slate-500"
														}`}
													>
														{member.is_active
															? "Active"
															: "Inactive"}
													</span>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2 justify-end">
														<button
															onClick={() =>
																startEdit(
																	member,
																)
															}
															className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
														>
															<Edit2 className="h-4 w-4 text-slate-400" />
														</button>
														<button
															onClick={() =>
																handleDelete(
																	member.id,
																)
															}
															disabled={
																deletingId ===
																member.id
															}
															className="p-1.5 hover:bg-red-600/20 rounded-md transition-colors"
														>
															{deletingId ===
															member.id ? (
																<Loader2 className="h-4 w-4 animate-spin text-red-400" />
															) : (
																<Trash2 className="h-4 w-4 text-red-400" />
															)}
														</button>
													</div>
												</td>
											</>
										)}
									</tr>
								))}
								{teamMembers.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-slate-400"
										>
											No team members yet. Add one to get
											started.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
