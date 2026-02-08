import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { signIn } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const { error } = await signIn(email, password);

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else {
			navigate("/");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
			<div className="w-full max-w-md">
				<div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-slate-100 mb-2">
							Welcome to SyncTask
						</h1>
						<p className="text-slate-400">
							Sign in to manage your tasks
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
							<p className="text-red-400 text-sm text-center">
								{error}
							</p>
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									required
									className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="••••••••"
									required
									className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
						>
							{isLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<LogIn className="h-5 w-5" />
							)}
							{isLoading ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<p className="mt-6 text-center text-slate-500 text-sm">
						Contact your admin if you need access
					</p>
				</div>
			</div>
		</div>
	);
}
