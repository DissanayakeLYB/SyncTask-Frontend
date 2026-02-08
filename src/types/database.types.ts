export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type UserRole = "admin" | "member";
export type TaskStatus = "todo" | "working" | "done";

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					email: string;
					full_name: string;
					emoji: string;
					role: UserRole;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					full_name: string;
					emoji?: string;
					role?: UserRole;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					full_name?: string;
					emoji?: string;
					role?: UserRole;
					created_at?: string;
					updated_at?: string;
				};
			};
			team_members: {
				Row: {
					id: string;
					name: string;
					first_name: string;
					emoji: string;
					user_id: string | null;
					is_active: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					first_name: string;
					emoji?: string;
					user_id?: string | null;
					is_active?: boolean;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					first_name?: string;
					emoji?: string;
					user_id?: string | null;
					is_active?: boolean;
					created_at?: string;
				};
			};
			tasks: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					status: TaskStatus;
					deadline: string | null;
					created_by: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					status?: TaskStatus;
					deadline?: string | null;
					created_by: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					status?: TaskStatus;
					deadline?: string | null;
					created_by?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			task_assignees: {
				Row: {
					task_id: string;
					team_member_id: string;
					created_at: string;
				};
				Insert: {
					task_id: string;
					team_member_id: string;
					created_at?: string;
				};
				Update: {
					task_id?: string;
					team_member_id?: string;
					created_at?: string;
				};
			};
			leaves: {
				Row: {
					id: string;
					team_member_id: string;
					leave_date: string;
					created_by: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					team_member_id: string;
					leave_date: string;
					created_by: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					team_member_id?: string;
					leave_date?: string;
					created_by?: string;
					created_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			user_role: UserRole;
			task_status: TaskStatus;
		};
	};
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskAssignee =
	Database["public"]["Tables"]["task_assignees"]["Row"];
export type Leave = Database["public"]["Tables"]["leaves"]["Row"];

// Extended types with relations
export type TaskWithAssignees = Task & {
	assignees: TeamMember[];
};

export type LeaveWithMember = Leave & {
	team_member: TeamMember;
};
