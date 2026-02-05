import { supabase } from "./supabase";
import type {
	Profile,
	TeamMember,
	Task,
	TaskWithAssignees,
	Leave,
	LeaveWithMember,
	TaskStatus,
} from "@/types/database.types";

// ============================================
// Profile Operations
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Error fetching profile:", error);
		return null;
	}
	return data;
}

export async function updateProfile(
	userId: string,
	updates: Partial<Pick<Profile, "full_name" | "emoji">>,
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.update(updates)
		.eq("id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating profile:", error);
		return null;
	}
	return data;
}

export async function updateUserRole(
	userId: string,
	role: "admin" | "member",
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.update({ role })
		.eq("id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating user role:", error);
		return null;
	}
	return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error fetching profiles:", error);
		return [];
	}
	return data || [];
}

// ============================================
// Team Member Operations
// ============================================

export async function getTeamMembers(): Promise<TeamMember[]> {
	const { data, error } = await supabase
		.from("team_members")
		.select("*")
		.eq("is_active", true)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching team members:", error);
		return [];
	}
	return data || [];
}

export async function createTeamMember(
	member: Pick<TeamMember, "name" | "first_name" | "emoji">,
): Promise<TeamMember | null> {
	const { data, error } = await supabase
		.from("team_members")
		.insert(member)
		.select()
		.single();

	if (error) {
		console.error("Error creating team member:", error);
		return null;
	}
	return data;
}

export async function updateTeamMember(
	memberId: string,
	updates: Partial<
		Pick<
			TeamMember,
			"name" | "first_name" | "emoji" | "is_active" | "user_id"
		>
	>,
): Promise<TeamMember | null> {
	const { data, error } = await supabase
		.from("team_members")
		.update(updates)
		.eq("id", memberId)
		.select()
		.single();

	if (error) {
		console.error("Error updating team member:", error);
		return null;
	}
	return data;
}

export async function deleteTeamMember(memberId: string): Promise<boolean> {
	const { error } = await supabase
		.from("team_members")
		.delete()
		.eq("id", memberId);

	if (error) {
		console.error("Error deleting team member:", error);
		return false;
	}
	return true;
}

// ============================================
// Task Operations
// ============================================

export async function getTasks(): Promise<TaskWithAssignees[]> {
	const { data: tasks, error: tasksError } = await supabase
		.from("tasks")
		.select("*")
		.order("created_at", { ascending: false });

	if (tasksError) {
		console.error("Error fetching tasks:", tasksError);
		return [];
	}

	if (!tasks || tasks.length === 0) {
		return [];
	}

	// Fetch assignees for all tasks
	const { data: assignees, error: assigneesError } = await supabase
		.from("task_assignees")
		.select(
			`
      task_id,
      team_member:team_members(*)
    `,
		)
		.in(
			"task_id",
			tasks.map((t) => t.id),
		);

	if (assigneesError) {
		console.error("Error fetching assignees:", assigneesError);
		// Return tasks without assignees
		return tasks.map((task) => ({ ...task, assignees: [] }));
	}

	// Map assignees to tasks
	const assigneeMap = new Map<string, TeamMember[]>();
	for (const entry of assignees || []) {
		const taskId = entry.task_id;
		const member = entry.team_member as unknown as TeamMember;
		if (member) {
			if (!assigneeMap.has(taskId)) {
				assigneeMap.set(taskId, []);
			}
			assigneeMap.get(taskId)!.push(member);
		}
	}

	return tasks.map((task) => ({
		...task,
		assignees: assigneeMap.get(task.id) || [],
	}));
}

export async function getTasksByPerson(
	firstName: string,
): Promise<TaskWithAssignees[]> {
	const allTasks = await getTasks();
	return allTasks.filter((task) =>
		task.assignees.some((a) => a.first_name === firstName),
	);
}

export async function createTask(
	task: {
		title: string;
		description?: string;
		status?: TaskStatus;
		deadline?: string;
		created_by: string;
	},
	assigneeIds: string[],
): Promise<TaskWithAssignees | null> {
	// Create the task
	const { data: newTask, error: taskError } = await supabase
		.from("tasks")
		.insert({
			title: task.title,
			description: task.description,
			status: task.status || "todo",
			deadline: task.deadline,
			created_by: task.created_by,
		})
		.select()
		.single();

	if (taskError) {
		console.error("Error creating task:", taskError);
		return null;
	}

	// Add assignees if provided
	if (assigneeIds.length > 0) {
		const assigneeRecords = assigneeIds.map((memberId) => ({
			task_id: newTask.id,
			team_member_id: memberId,
		}));

		const { error: assigneeError } = await supabase
			.from("task_assignees")
			.insert(assigneeRecords);

		if (assigneeError) {
			console.error("Error adding assignees:", assigneeError);
		}
	}

	// Fetch the complete task with assignees
	const { data: teamMembers } = await supabase
		.from("team_members")
		.select("*")
		.in("id", assigneeIds);

	return {
		...newTask,
		assignees: teamMembers || [],
	};
}

export async function updateTaskStatus(
	taskId: string,
	status: TaskStatus,
): Promise<Task | null> {
	const { data, error } = await supabase
		.from("tasks")
		.update({ status })
		.eq("id", taskId)
		.select()
		.single();

	if (error) {
		console.error("Error updating task status:", error);
		return null;
	}
	return data;
}

export async function updateTask(
	taskId: string,
	updates: Partial<
		Pick<Task, "title" | "description" | "status" | "deadline">
	>,
): Promise<Task | null> {
	const { data, error } = await supabase
		.from("tasks")
		.update(updates)
		.eq("id", taskId)
		.select()
		.single();

	if (error) {
		console.error("Error updating task:", error);
		return null;
	}
	return data;
}

export async function updateTaskAssignees(
	taskId: string,
	assigneeIds: string[],
): Promise<boolean> {
	// Remove all current assignees
	const { error: deleteError } = await supabase
		.from("task_assignees")
		.delete()
		.eq("task_id", taskId);

	if (deleteError) {
		console.error("Error removing assignees:", deleteError);
		return false;
	}

	// Add new assignees
	if (assigneeIds.length > 0) {
		const assigneeRecords = assigneeIds.map((memberId) => ({
			task_id: taskId,
			team_member_id: memberId,
		}));

		const { error: insertError } = await supabase
			.from("task_assignees")
			.insert(assigneeRecords);

		if (insertError) {
			console.error("Error inserting assignees:", insertError);
			return false;
		}
	}

	return true;
}

export async function deleteTask(taskId: string): Promise<boolean> {
	const { error } = await supabase.from("tasks").delete().eq("id", taskId);

	if (error) {
		console.error("Error deleting task:", error);
		return false;
	}
	return true;
}

// ============================================
// Leave Operations
// ============================================

export async function getLeaves(): Promise<LeaveWithMember[]> {
	const { data, error } = await supabase
		.from("leaves")
		.select(
			`
      *,
      team_member:team_members(*)
    `,
		)
		.order("leave_date", { ascending: true });

	if (error) {
		console.error("Error fetching leaves:", error);
		return [];
	}

	return (data || []).map((leave) => ({
		...leave,
		team_member: leave.team_member as unknown as TeamMember,
	}));
}

export async function getLeavesForDate(
	date: string,
): Promise<LeaveWithMember[]> {
	const { data, error } = await supabase
		.from("leaves")
		.select(
			`
      *,
      team_member:team_members(*)
    `,
		)
		.eq("leave_date", date);

	if (error) {
		console.error("Error fetching leaves for date:", error);
		return [];
	}

	return (data || []).map((leave) => ({
		...leave,
		team_member: leave.team_member as unknown as TeamMember,
	}));
}

export async function createLeave(
	teamMemberId: string,
	leaveDate: string,
	createdBy: string,
): Promise<Leave | null> {
	const { data, error } = await supabase
		.from("leaves")
		.insert({
			team_member_id: teamMemberId,
			leave_date: leaveDate,
			created_by: createdBy,
		})
		.select()
		.single();

	if (error) {
		// Handle duplicate leave gracefully
		if (error.code === "23505") {
			console.log("Leave already exists for this date");
			return null;
		}
		console.error("Error creating leave:", error);
		return null;
	}
	return data;
}

export async function deleteLeave(leaveId: string): Promise<boolean> {
	const { error } = await supabase.from("leaves").delete().eq("id", leaveId);

	if (error) {
		console.error("Error deleting leave:", error);
		return false;
	}
	return true;
}

export async function deleteLeavesForMemberOnDate(
	teamMemberId: string,
	leaveDate: string,
): Promise<boolean> {
	const { error } = await supabase
		.from("leaves")
		.delete()
		.eq("team_member_id", teamMemberId)
		.eq("leave_date", leaveDate);

	if (error) {
		console.error("Error deleting leave:", error);
		return false;
	}
	return true;
}

// ============================================
// Real-time Subscriptions
// ============================================

export function subscribeToTasks(
	callback: (payload: {
		eventType: string;
		new: Task | null;
		old: Task | null;
	}) => void,
) {
	return supabase
		.channel("tasks_changes")
		.on(
			"postgres_changes",
			{ event: "*", schema: "public", table: "tasks" },
			(payload) => {
				callback({
					eventType: payload.eventType,
					new: payload.new as Task | null,
					old: payload.old as Task | null,
				});
			},
		)
		.subscribe();
}

export function subscribeToLeaves(
	callback: (payload: {
		eventType: string;
		new: Leave | null;
		old: Leave | null;
	}) => void,
) {
	return supabase
		.channel("leaves_changes")
		.on(
			"postgres_changes",
			{ event: "*", schema: "public", table: "leaves" },
			(payload) => {
				callback({
					eventType: payload.eventType,
					new: payload.new as Leave | null,
					old: payload.old as Leave | null,
				});
			},
		)
		.subscribe();
}
