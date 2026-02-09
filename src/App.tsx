import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { SidebarLeft } from "@/components/sidebar-left";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import KanbanBoard from "./components/kanban-board";
import { LogOut, Users, UserCog, Settings, Key } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage, ProtectedRoute } from "@/components/auth";
import { TeamManagement, UserManagement } from "@/components/admin";
import { supabase } from "@/lib/supabase";

// Dashboard layout component
function DashboardLayout() {
	const { profile, signOut, isAdmin } = useAuth();
	const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
	const [showUserModal, setShowUserModal] = useState(false);
	const [showPasswordChange, setShowPasswordChange] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const handleLogout = async () => {
		setShowUserModal(false);
		await signOut();
	};

	const handlePasswordChange = async () => {
		setPasswordError("");
		setPasswordSuccess(false);

		if (newPassword.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		setIsChangingPassword(true);
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});
			if (error) throw error;

			setPasswordSuccess(true);
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => {
				setShowPasswordChange(false);
				setPasswordSuccess(false);
			}, 2000);
		} catch (error) {
			setPasswordError(
				error instanceof Error
					? error.message
					: "Failed to change password",
			);
		} finally {
			setIsChangingPassword(false);
		}
	};

	const closeModal = () => {
		setShowUserModal(false);
		setShowPasswordChange(false);
		setNewPassword("");
		setConfirmPassword("");
		setPasswordError("");
		setPasswordSuccess(false);
	};

	return (
		<SidebarProvider>
			<SidebarLeft
				selectedPerson={selectedPerson}
				onPersonSelect={setSelectedPerson}
			/>
			<SidebarInset>
				<header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b border-slate-700">
					<div className="flex flex-1 items-center gap-2 px-3">
						<SidebarTrigger />
					</div>
					<div className="flex items-center gap-2 px-4">
						<button
							onClick={() => setShowUserModal(true)}
							className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-colors cursor-pointer"
							title="User Profile"
						>
							{profile?.emoji || "😊"}
						</button>
					</div>
				</header>
				<KanbanBoard selectedPerson={selectedPerson} />
			</SidebarInset>

			{/* User Profile Modal */}
			{showUserModal && (
				<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-slate-700">
						<div className="flex items-center gap-4 mb-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-3xl">
								{profile?.emoji || "😊"}
							</div>
							<div>
								<h3 className="text-xl font-bold text-slate-100">
									{profile?.full_name || "User"}
								</h3>
								<p className="text-sm text-slate-300">
									{profile?.email}
								</p>
								<p className="text-xs text-slate-400 mt-1 capitalize">
									{profile?.role || "member"}
								</p>
							</div>
						</div>

						{/* Password Change Section */}
						{showPasswordChange ? (
							<div className="border-t border-slate-700 pt-4 mb-4">
								<p className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
									<Key className="h-3 w-3" />
									Change Password
								</p>
								<div className="space-y-3">
									<input
										type="password"
										placeholder="New password"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<input
										type="password"
										placeholder="Confirm password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									{passwordError && (
										<p className="text-red-400 text-sm">
											{passwordError}
										</p>
									)}
									{passwordSuccess && (
										<p className="text-green-400 text-sm">
											Password changed successfully!
										</p>
									)}
									<div className="flex gap-2">
										<button
											onClick={() =>
												setShowPasswordChange(false)
											}
											className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition text-sm"
										>
											Cancel
										</button>
										<button
											onClick={handlePasswordChange}
											disabled={isChangingPassword}
											className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm disabled:opacity-50"
										>
											{isChangingPassword
												? "Saving..."
												: "Save"}
										</button>
									</div>
								</div>
							</div>
						) : (
							<div className="border-t border-slate-700 pt-4 mb-4">
								<button
									onClick={() => setShowPasswordChange(true)}
									className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition text-sm"
								>
									<Key className="h-4 w-4" />
									Change Password
								</button>
							</div>
						)}

						{/* Admin Links */}
						{isAdmin && (
							<div className="border-t border-slate-700 pt-4 mb-4">
								<p className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
									<Settings className="h-3 w-3" />
									Admin
								</p>
								<div className="flex gap-2">
									<Link
										to="/admin/team"
										onClick={closeModal}
										className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition text-sm"
									>
										<Users className="h-4 w-4" />
										Team
									</Link>
									<Link
										to="/admin/users"
										onClick={closeModal}
										className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition text-sm"
									>
										<UserCog className="h-4 w-4" />
										Users
									</Link>
								</div>
							</div>
						)}

						<div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-700">
							<button
								onClick={closeModal}
								className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition font-medium"
							>
								Close
							</button>
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition font-medium flex items-center gap-2"
							>
								<LogOut size={16} />
								Log out
							</button>
						</div>
					</div>
				</div>
			)}
		</SidebarProvider>
	);
}

export function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/team"
					element={
						<ProtectedRoute requireAdmin>
							<TeamManagement />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/users"
					element={
						<ProtectedRoute requireAdmin>
							<UserManagement />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</AuthProvider>
	);
}
