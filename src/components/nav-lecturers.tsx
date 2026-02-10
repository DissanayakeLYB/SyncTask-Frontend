"use client";

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavLecturers({
	lecturers,
	selectedPerson,
	onPersonSelect,
}: {
	lecturers: {
		name: string;
		emoji: string;
		firstName?: string; // Optional - uses first word of name if not provided
		isOnLeaveToday?: boolean; // Whether the person is on leave today
	}[];
	selectedPerson: string | null;
	onPersonSelect: (person: string | null) => void;
}) {
	const getFirstName = (lecturer: { name: string; firstName?: string }) => {
		return lecturer.firstName || lecturer.name.split(" ")[0];
	};

	const handleClick = (lecturer: { name: string; firstName?: string }) => {
		const firstName = getFirstName(lecturer);
		// Toggle selection: if already selected, deselect; otherwise select
		if (selectedPerson === firstName) {
			onPersonSelect(null);
		} else {
			onPersonSelect(firstName);
		}
	};

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden py-2">
			<SidebarMenu>
				{lecturers.map((item) => {
					const firstName = getFirstName(item);
					const isActive = selectedPerson === firstName;
					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild>
								<a
									title={
										item.isOnLeaveToday
											? `${item.name} (On Leave Today)`
											: item.name
									}
									className={`mb-1 gap-2 cursor-pointer text-xs rounded-md transition-colors ${
										isActive
											? "bg-accent"
											: item.isOnLeaveToday
												? "bg-orange-500/30 text-orange-200"
												: ""
									}`}
									onClick={() => handleClick(item)}
								>
									<span className="text-lg">
										{item.emoji}
									</span>
									<span className="text-xs">{item.name}</span>
									{item.isOnLeaveToday && (
										<span className="ml-auto text-[10px] bg-orange-500/50 px-1.5 py-0.5 rounded text-orange-100">
											Leave
										</span>
									)}
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
