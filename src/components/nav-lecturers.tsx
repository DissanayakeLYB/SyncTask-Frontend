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
									title={item.name}
									className={`mb-1 gap-2 cursor-pointer text-xs ${
										isActive ? "bg-accent" : ""
									}`}
									onClick={() => handleClick(item)}
								>
									<span className="text-lg">
										{item.emoji}
									</span>
									<span className="text-xs">{item.name}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
