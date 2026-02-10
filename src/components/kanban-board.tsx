import { useState, useEffect, useCallback } from "react";
import { Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "@/components/date-picker";
import {
	getTasks,
	getTeamMembers,
	getLeaves,
	createTask as createTaskDb,
	updateTaskStatus as updateTaskStatusDb,
	deleteTask as deleteTaskDb,
	subscribeToTasks,
} from "@/lib/database";
import type {
	TaskWithAssignees,
	TeamMember,
	LeaveWithMember,
	TaskStatus,
} from "@/types/database.types";

type singleTaskLevel = TaskStatus;

interface ModalState {
	isOpen: boolean;
	type: "delete" | "move" | null;
	task: TaskWithAssignees | null;
	newLevel?: singleTaskLevel;
}

export default function KanbanBoard({
	selectedPerson,
}: {
	selectedPerson: string | null;
}) {
	const { user, isAdmin } = useAuth();
	const [tasks, setTasks] = useState<TaskWithAssignees[]>([]);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [leaves, setLeaves] = useState<LeaveWithMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [taskInput, setTaskInput] = useState("");
	const [deadlineInput, setDeadlineInput] = useState("");
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [modalState, setModalState] = useState<ModalState>({
		isOpen: false,
		type: null,
		task: null,
	});

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [tasksData, membersData, leavesData] = await Promise.all([
				getTasks(),
				getTeamMembers(),
				getLeaves(),
			]);
			setTasks(tasksData);
			setTeamMembers(membersData);
			setLeaves(leavesData);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Subscribe to real-time task updates
	useEffect(() => {
		const subscription = subscribeToTasks(() => {
			// Reload tasks when changes occur
			getTasks().then(setTasks);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	function toggleMember(memberId: string) {
		setSelectedMemberIds((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId],
		);
	}

	async function addTask() {
		if (!taskInput) {
			alert("Please enter a task description.");
			return;
		}
		if (!deadlineInput) {
			alert("Please set a deadline for this task.");
			return;
		}
		if (selectedMemberIds.length === 0) {
			alert("Please assign at least one person to this task.");
			return;
		}
		if (!user) {
			alert("You must be logged in to create tasks.");
			return;
		}
		try {
			const newTask = await createTaskDb(
				{
					title: taskInput,
					status: "todo",
					deadline: deadlineInput || undefined,
					created_by: user.id,
				},
				selectedMemberIds,
			);

			if (newTask) {
				setTasks((prev) => [newTask, ...prev]);
			}
			setTaskInput("");
			setDeadlineInput("");
			setSelectedMemberIds([]);
		} catch (err) {
			console.error("Failed to create task:", err);
			alert("Failed to create task.");
		}
	}

	function openDeleteModal(task: TaskWithAssignees) {
		setModalState({
			isOpen: true,
			type: "delete",
			task,
		});
	}

	function openMoveModal(task: TaskWithAssignees, newLevel: singleTaskLevel) {
		setModalState({
			isOpen: true,
			type: "move",
			task,
			newLevel,
		});
	}

	function closeModal() {
		setModalState({
			isOpen: false,
			type: null,
			task: null,
		});
	}

	async function confirmDelete() {
		if (modalState.task) {
			try {
				const success = await deleteTaskDb(modalState.task.id);
				if (success) {
					setTasks((prev) =>
						prev.filter((task) => task.id !== modalState.task!.id),
					);
				} else {
					alert("Failed to delete task.");
				}
			} catch (err) {
				console.error("Failed to delete task:", err);
				alert("Failed to delete task.");
			}
		}
		closeModal();
	}

	async function confirmMove() {
		if (modalState.task && modalState.newLevel) {
			try {
				const updated = await updateTaskStatusDb(
					modalState.task.id,
					modalState.newLevel,
				);
				if (updated) {
					setTasks((prev) =>
						prev.map((task) =>
							task.id === modalState.task!.id
								? { ...task, status: modalState.newLevel! }
								: task,
						),
					);
				} else {
					alert("Failed to update task.");
				}
			} catch (err) {
				console.error("Failed to move task:", err);
				alert("Failed to update task.");
			}
		}
		closeModal();
	}

	function handleConfirm() {
		if (modalState.type === "delete") {
			confirmDelete();
		} else if (modalState.type === "move") {
			confirmMove();
		}
	}

	function getNextLevel(
		currentLevel: singleTaskLevel,
	): singleTaskLevel | null {
		if (currentLevel === "todo") return "working";
		if (currentLevel === "working") return "done";
		return null;
	}

	function getPreviousLevel(
		currentLevel: singleTaskLevel,
	): singleTaskLevel | null {
		if (currentLevel === "done") return "working";
		if (currentLevel === "working") return "todo";
		return null;
	}

	const getFilteredTasks = () => {
		if (!selectedPerson) {
			return tasks;
		}
		return tasks.filter((task) =>
			task.assignees.some((a) => a.first_name === selectedPerson),
		);
	};

	// Check if a person is on leave today
	const getPersonLeaveInfo = (memberFirstName: string) => {
		return leaves.filter(
			(leave) => leave.team_member.first_name === memberFirstName,
		);
	};

	const formatDeadline = (deadline: string | null): string => {
		if (!deadline) return "Not specified";
		try {
			const date = new Date(deadline);
			const day = date.getDate().toString().padStart(2, "0");
			const month = (date.getMonth() + 1).toString().padStart(2, "0");
			const year = date.getFullYear();
			return `${day}/${month}/${year}`;
		} catch {
			return "Not specified";
		}
	};

	const renderTasks = (level: TaskStatus) => {
		const filteredTasks = getFilteredTasks();
		return filteredTasks
			.filter((task) => task.status === level)
			.map((task) => {
				const nextLevel = getNextLevel(task.status);
				const prevLevel = getPreviousLevel(task.status);

				return (
					<div
						key={task.id}
						className="border border-slate-600 p-3 my-2 rounded-md bg-slate-800 shadow-sm mx-2"
					>
						<div className="flex justify-between items-center mb-2">
							<h4 className="font-semibold">{task.title}</h4>
							{isAdmin && (
								<div className="flex gap-2">
									<button
										onClick={() => openDeleteModal(task)}
										className="cursor-pointer text-red-500 hover:text-red-700 transition"
										title="Delete task"
									>
										<Trash2 size={16} strokeWidth={2} />
									</button>
								</div>
							)}
						</div>
						<p className="text-sm text-slate-300 mb-2">
							Deadline: {formatDeadline(task.deadline)}
						</p>
						{task.assignees.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-3">
								{task.assignees.map((assignee) => (
									<span
										key={assignee.id}
										className="text-xs bg-slate-700 border border-slate-600 px-2 py-1 rounded-md text-slate-300"
									>
										{assignee.emoji} {assignee.first_name}
									</span>
								))}
							</div>
						)}
						<div className="flex gap-2 justify-between">
							{prevLevel && (
								<button
									onClick={() =>
										openMoveModal(task, prevLevel)
									}
									className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition text-slate-200"
									title={`Move to ${prevLevel}`}
								>
									<ChevronLeft size={14} />
									{prevLevel}
								</button>
							)}
							{nextLevel && (
								<button
									onClick={() =>
										openMoveModal(task, nextLevel)
									}
									className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition ml-auto text-slate-200"
									title={`Move to ${nextLevel}`}
								>
									{nextLevel}
									<ChevronRight size={14} />
								</button>
							)}
						</div>
					</div>
				);
			});
	};

	return (
		<section className="bg-slate-950 min-h-screen">
			{isLoading && (
				<div className="flex justify-center items-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
				</div>
			)}
			<div className="flex flex-col gap-4 mb-8 px-8 pt-4">
				{isAdmin && (
					<div className="flex flex-col gap-3 mb-4">
						<div className="flex flex-col md:flex-row gap-4">
							<input
								type="text"
								placeholder="Enter the task..."
								value={taskInput}
								onChange={(e) => setTaskInput(e.target.value)}
								className="border border-slate-600 bg-slate-800 text-white placeholder-slate-400 p-2 w-full rounded-md focus:outline-none focus:border-blue-500"
							/>
							<DatePicker
								date={deadlineInput ? parseISO(deadlineInput) : undefined}
								onDateChange={(date) =>
									setDeadlineInput(date ? format(date, "yyyy-MM-dd") : "")
								}
								placeholder="Select deadline"
								className="w-[180px]"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{teamMembers.map((member) => {
								const active = selectedMemberIds.includes(
									member.id,
								);
								const memberLeaves = getPersonLeaveInfo(
									member.first_name,
								);
								const hasUpcomingLeave =
									memberLeaves.length > 0;
								return (
									<button
										key={member.id}
										type="button"
										onClick={() => toggleMember(member.id)}
										className={`px-3 py-1 text-sm rounded-full border transition flex items-center gap-1 ${
											active
												? "bg-blue-600 border-blue-500 text-white"
												: "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
										}`}
										title={
											hasUpcomingLeave
												? `${member.first_name} - On leave`
												: `Tag ${member.first_name}`
										}
									>
										{member.emoji} {member.first_name}
									</button>
								);
							})}
						</div>
						<div>
							<input
								type="button"
								className="py-2 px-4 rounded-lg font-semibold text-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition"
								value="Add Task"
								onClick={addTask}
							/>
						</div>
					</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-evenly">
					<div className="rounded-b-xl">
						<div className="p-4 bg-red-600 rounded-xl text-white">
							<h3 className="font-bold text-2xl">Todo</h3>
							<p>
								{
									getFilteredTasks().filter(
										(t) => t.status === "todo",
									).length
								}{" "}
								task(s)
							</p>
						</div>
						<div id="todo">{renderTasks("todo")}</div>
					</div>
					<div className="rounded-b-xl">
						<div className="p-4 bg-yellow-600 rounded-xl text-white">
							<h3 className="font-bold text-2xl">Working</h3>
							<p>
								{
									getFilteredTasks().filter(
										(t) => t.status === "working",
									).length
								}{" "}
								task(s)
							</p>
						</div>
						<div id="working">{renderTasks("working")}</div>
					</div>
					<div className="rounded-b-xl">
						<div className="p-4 bg-green-600 rounded-xl text-white">
							<h3 className="font-bold text-2xl">Done</h3>
							<p>
								{
									getFilteredTasks().filter(
										(t) => t.status === "done",
									).length
								}{" "}
								task(s)
							</p>
						</div>
						<div id="done">{renderTasks("done")}</div>
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			{modalState.isOpen && (
				<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-slate-700">
						{modalState.type === "delete" && (
							<>
								<h3 className="text-xl font-bold mb-4 text-red-500">
									Confirm Delete
								</h3>
								<p className="mb-6 text-slate-300">
									Are you sure you want to delete the task "
									{modalState.task?.title}"?
								</p>
							</>
						)}
						{modalState.type === "move" && (
							<>
								<h3 className="text-xl font-bold mb-4 text-blue-400">
									Confirm Move
								</h3>
								<p className="mb-6 text-slate-300">
									Are you sure you want to move "
									{modalState.task?.title}" to{" "}
									<span className="font-semibold">
										{modalState.newLevel}
									</span>
									?
								</p>
							</>
						)}
						<div className="flex gap-3 justify-end">
							<button
								onClick={closeModal}
								className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirm}
								className={`px-4 py-2 rounded-md text-white transition ${
									modalState.type === "delete"
										? "bg-red-500 hover:bg-red-600"
										: "bg-blue-500 hover:bg-blue-600"
								}`}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
