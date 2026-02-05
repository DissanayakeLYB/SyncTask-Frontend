import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Missing Supabase environment variables. Please check your .env.local file.",
	);
}

// Using 'any' for Database type until Supabase project is set up
// and types are generated with: npx supabase gen types typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
