import { useState, useEffect } from "react";
import { ArrowLeft, Shield, ShieldCheck, Loader2, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProfiles, updateUserRole } from "@/lib/database";
import type { Profile } from "@/types/database.types";

export function UserManagement() {
	const { isAdmin, user } = useAuth();
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	useEffect(() => {
		loadProfiles();
	}, []);

	async function loadProfiles() {
		setIsLoading(true);
		try {
			const allProfiles = await getAllProfiles();
			setProfiles(allProfiles);
		} catch (err) {
			console.error("Error loading profiles:", err);
			setError("Failed to load users");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleToggleRole(profile: Profile) {
		if (profile.id === user?.id) {
			setError("You cannot change your own role");
			return;
		}

		setUpdatingId(profile.id);
		setError(null);

		const newRole = profile.role === "admin" ? "member" : "admin";

		try {
			const updated = await updateUserRole(profile.id, newRole);
			if (updated) {
				setProfiles((prev) =>
					prev.map((p) => (p.id === profile.id ? updated : p)),
				);
			} else {
				setError("Failed to update user role");
			}
		} catch (err) {
			console.error("Error updating role:", err);
			setError("Failed to update user role");
		} finally {
			setUpdatingId(null);
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
						Only administrators can manage users.
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
						<div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
							<UserCog className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-100">
								User Management
							</h1>
							<p className="text-slate-400 text-sm">
								Manage user roles and permissions
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

				{/* Users List */}
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
										User
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
										Email
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
										Role
									</th>
									<th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{profiles.map((profile) => (
									<tr
										key={profile.id}
										className="border-b border-slate-700 last:border-b-0"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<span className="text-xl">
													{profile.emoji}
												</span>
												<span className="text-slate-100">
													{profile.full_name}
												</span>
												{profile.id === user?.id && (
													<span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
														You
													</span>
												)}
											</div>
										</td>
										<td className="px-4 py-3 text-slate-300">
											{profile.email}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												{profile.role === "admin" ? (
													<ShieldCheck className="h-4 w-4 text-purple-400" />
												) : (
													<Shield className="h-4 w-4 text-slate-400" />
												)}
												<span
													className={`text-sm capitalize ${
														profile.role === "admin"
															? "text-purple-400"
															: "text-slate-400"
													}`}
												>
													{profile.role}
												</span>
											</div>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2 justify-end">
												{profile.id !== user?.id && (
													<button
														onClick={() =>
															handleToggleRole(
																profile,
															)
														}
														disabled={
															updatingId ===
															profile.id
														}
														className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
															profile.role ===
															"admin"
																? "bg-slate-700 hover:bg-slate-600 text-slate-300"
																: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-400"
														}`}
													>
														{updatingId ===
														profile.id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : profile.role ===
														  "admin" ? (
															"Remove Admin"
														) : (
															"Make Admin"
														)}
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
								{profiles.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-slate-400"
										>
											No users found.
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
