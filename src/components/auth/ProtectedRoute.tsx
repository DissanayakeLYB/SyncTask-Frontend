import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAdmin?: boolean;
}

export function ProtectedRoute({
	children,
	requireAdmin = false,
}: ProtectedRouteProps) {
	const { user, profile, isLoading, isAdmin } = useAuth();
	const location = useLocation();

	// Show loading spinner while checking auth
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
					<p className="text-slate-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Wait for profile to load
	if (!profile && user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
					<p className="text-slate-400">Loading profile...</p>
				</div>
			</div>
		);
	}

	// Check admin requirement
	if (requireAdmin && !isAdmin) {
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
						You don't have permission to access this page. Only
						administrators can view this content.
					</p>
					<a
						href="/"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
					>
						Go to Dashboard
					</a>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
