import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/database";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";

interface AuthContextType {
	user: User | null;
	profile: Profile | null;
	session: Session | null;
	isLoading: boolean;
	isAdmin: boolean;
	isMember: boolean;
	signIn: (
		email: string,
		password: string,
	) => Promise<{ error: Error | null }>;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshProfile = useCallback(async () => {
		if (!user) {
			setProfile(null);
			return;
		}

		const userProfile = await getProfile(user.id);
		setProfile(userProfile);
	}, [user]);

	// Initialize auth state
	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Fetch profile when user changes
	useEffect(() => {
		let mounted = true;

		async function loadProfile() {
			if (user) {
				const userProfile = await getProfile(user.id);
				if (mounted) {
					setProfile(userProfile);
				}
			} else {
				if (mounted) {
					setProfile(null);
				}
			}
		}

		loadProfile();

		return () => {
			mounted = false;
		};
	}, [user]);

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error: error as Error | null };
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setUser(null);
		setProfile(null);
		setSession(null);
	};

	const isAdmin = profile?.role === "admin";
	const isMember = profile?.role === "member";

	const value: AuthContextType = {
		user,
		profile,
		session,
		isLoading,
		isAdmin,
		isMember,
		signIn,
		signOut,
		refreshProfile,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
