"use client";

import Album02Icon from "virtual:icons/hugeicons/album-02";
import ArrowRight01Icon from "virtual:icons/hugeicons/arrow-right-01";
import DashboardSquare02Icon from "virtual:icons/hugeicons/dashboard-square-02";
import DocumentCode01Icon from "virtual:icons/hugeicons/document-code";
import HeadsetIcon from "virtual:icons/hugeicons/headset";
import Key01Icon from "virtual:icons/hugeicons/key-01";
import Setting07Icon from "virtual:icons/hugeicons/setting-07";

import { Link, useLocation } from "@tanstack/react-router";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useSettingsStore } from "#/store/settings.ts";
import { cn } from "#/utils/cn.ts";
import * as Divider from "./ui/divider.tsx";
import { UserButton } from "./user-button.tsx";
import { UsageWidget } from "./widgets/usage-widget.tsx";
import { WorkspaceSwitch } from "./workspace-switch.tsx";

type NavigationLink = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	to: string;
	disabled?: boolean;
};

export const navigationLinks: NavigationLink[] = [
	{ icon: DashboardSquare02Icon, label: "Overview", to: "/dashboard" },
	{ icon: DocumentCode01Icon, label: "Playground", to: "/playground" },
	{ icon: Album02Icon, label: "Screenshots", to: "/screenshots" },
	{ icon: Key01Icon, label: "API Keys", to: "/keys" },
];

function useCollapsedState({
	defaultCollapsed = false,
}: {
	defaultCollapsed?: boolean;
}) {
	const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
	const sidebarRef = React.useRef<HTMLDivElement>(null);

	useHotkeys(
		["ctrl+b", "meta+b"],
		() => setCollapsed((prev) => !prev),
		{ preventDefault: true },
		[collapsed],
	);

	React.useEffect(() => {
		if (!sidebarRef.current) return;

		const elementsToHide = sidebarRef.current.querySelectorAll(
			"[data-hide-collapsed]",
		);

		const listeners: { el: Element; listener: EventListener }[] = [];

		for (const el of elementsToHide) {
			const hideListener = () => {
				el.classList.add("hidden");
				el.classList.remove("transition", "duration-300");
			};

			const showListener = () => {
				el.classList.remove("transition", "duration-300");
			};

			if (collapsed) {
				el.classList.add("opacity-0", "transition", "duration-300");
				el.addEventListener("transitionend", hideListener, { once: true });
				listeners.push({ el, listener: hideListener });
			} else {
				el.classList.add("transition", "duration-300");
				el.classList.remove("hidden");
				setTimeout(() => {
					el.classList.remove("opacity-0");
				}, 1);
				el.addEventListener("transitionend", showListener, { once: true });
				listeners.push({ el, listener: showListener });
			}
		}
		return () => {
			for (const { el, listener } of listeners) {
				el.removeEventListener("transitionend", listener);
			}
		};
	}, [collapsed]);

	return { collapsed, sidebarRef };
}

export function SidebarHeader({ collapsed }: { collapsed?: boolean }) {
	return (
		<div
			className={cn("lg:p-3", {
				"lg:px-2": collapsed,
			})}
		>
			<WorkspaceSwitch
				className={cn("transition-all-default", {
					"w-16": collapsed,
				})}
			/>
		</div>
	);
}

function NavigationMenu({ collapsed }: { collapsed: boolean }) {
	const pathname = useLocation().pathname;

	return (
		<div className="space-y-2">
			<div
				className={cn(
					"p-1 text-(--text-soft-400) text-subheading-xs uppercase",
					{
						"-mx-2.5 w-14 px-0 text-center": collapsed,
					},
				)}
			>
				Main
			</div>
			<div className="space-y-1">
				{navigationLinks.map(({ icon: Icon, label, to, disabled }) => (
					<Link
						key={to}
						to={to}
						aria-current={pathname === to ? "page" : undefined}
						aria-disabled={disabled}
						className={cn(
							"group relative flex items-center gap-2 whitespace-nowrap rounded-8 py-2 text-(--text-sub-600) hover:bg-(--bg-weak-50)",
							"transition duration-200 ease-out",
							"aria-[current=page]:bg-(--bg-weak-50)",
							"aria-disabled:pointer-events-none aria-disabled:opacity-50",
							{
								"w-9 px-2": collapsed,
								"w-full px-3": !collapsed,
							},
						)}
					>
						<div
							className={cn(
								"-translate-y-1/2 absolute top-1/2 h-5 w-1 origin-left rounded-r-full bg-primary transition duration-200 ease-out",
								{
									"-left-[22px]": collapsed,
									"-left-5": !collapsed,
									"scale-100": pathname === to,
									"scale-0": pathname !== to,
								},
							)}
						/>
						<Icon
							className={cn(
								"size-5 shrink-0 text-(--text-sub-600) transition duration-200 ease-out",
								"group-aria-[current=page]:text-primary",
							)}
						/>

						<div
							className="flex w-[180px] shrink-0 items-center gap-2"
							data-hide-collapsed
						>
							<div className="flex-1 text-label-sm">{label}</div>
							{pathname === to && (
								<ArrowRight01Icon className="size-5 text-(--text-sub-600)" />
							)}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

function SettingsAndSupport({ collapsed }: { collapsed: boolean }) {
	const { setOpen } = useSettingsStore();
	const pathname = useLocation().pathname;

	const links = [
		{
			href: "mailto:support@screenshothis.com",
			icon: HeadsetIcon,
			label: "Support",
		},
	];

	return (
		<div className="space-y-2">
			<div
				className={cn(
					"p-1 text-(--text-soft-400) text-subheading-xs uppercase",
					{
						"-mx-2.5 w-14 px-0 text-center": collapsed,
					},
				)}
			>
				Others
			</div>
			<div className="space-y-1">
				<button
					type="button"
					onClick={setOpen}
					className={cn(
						"group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-left text-(--text-sub-600) hover:bg-(--bg-weak-50)",
						"transition duration-200 ease-out",
						{
							"w-9 px-2": collapsed,
							"w-full px-3": !collapsed,
						},
					)}
				>
					<Setting07Icon
						className={cn(
							"size-5 shrink-0 text-(--text-sub-600) transition duration-200 ease-out",
							"group-aria-[current=page]:text-primary",
						)}
					/>

					<div
						className="flex w-[180px] shrink-0 items-center gap-2"
						data-hide-collapsed
					>
						<div className="flex-1 text-label-sm">Settings</div>
					</div>
				</button>

				{links.map(({ icon: Icon, label, href }) => {
					const isActivePage = pathname.startsWith(href);

					return (
						<Link
							key={href}
							to={href}
							aria-current={isActivePage ? "page" : undefined}
							className={cn(
								"group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-(--text-sub-600) hover:bg-(--bg-weak-50)",
								"transition duration-200 ease-out",
								"aria-[current=page]:bg-(--bg-weak-50)",
								"aria-disabled:pointer-events-none aria-disabled:opacity-50",
								{
									"w-9 px-2": collapsed,
									"w-full px-3": !collapsed,
								},
							)}
						>
							<div
								className={cn(
									"-translate-y-1/2 absolute top-1/2 h-5 w-1 origin-left rounded-r-full bg-primary transition duration-200 ease-out",
									{
										"-left-[22px]": collapsed,
										"-left-5": !collapsed,
										"scale-100": isActivePage,
										"scale-0": !isActivePage,
									},
								)}
							/>
							<Icon
								className={cn(
									"size-5 shrink-0 text-(--text-sub-600) transition duration-200 ease-out",
									"group-aria-[current=page]:text-primary",
								)}
							/>

							<div
								className="flex w-[180px] shrink-0 items-center gap-2"
								data-hide-collapsed
							>
								<div className="flex-1 text-label-sm">{label}</div>
								{isActivePage && (
									<ArrowRight01Icon className="size-5 text-(--text-sub-600)" />
								)}
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

function UserProfile({ collapsed }: { collapsed: boolean }) {
	return (
		<div
			className={cn("p-3", {
				"px-2": collapsed,
			})}
		>
			<UserButton
				className={cn("transition-all-default", {
					"w-auto": collapsed,
				})}
			/>
		</div>
	);
}

function SidebarDivider({ collapsed }: { collapsed: boolean }) {
	return (
		<div className="px-5">
			<Divider.Root
				className={cn("transition-all-default", {
					"w-10": collapsed,
				})}
			/>
		</div>
	);
}

export default function Sidebar({
	defaultCollapsed = false,
}: {
	defaultCollapsed?: boolean;
}) {
	const { collapsed, sidebarRef } = useCollapsedState({ defaultCollapsed });

	return (
		<>
			<div
				className={cn(
					"fixed top-0 left-0 z-40 hidden h-full overflow-hidden border-(--stroke-soft-200) border-r bg-(--bg-white-0) transition-all-default duration-300 lg:block",
					{
						"w-20": collapsed,
						"w-[272px]": !collapsed,
						"[&_[data-hide-collapsed]]:hidden": !collapsed
							? false
							: defaultCollapsed,
					},
				)}
			>
				<div
					ref={sidebarRef}
					className="flex h-full w-[272px] min-w-[272px] flex-col overflow-auto"
				>
					<SidebarHeader collapsed={collapsed} />

					<SidebarDivider collapsed={collapsed} />

					<div
						className={cn("flex flex-1 flex-col gap-5 pt-5 pb-4", {
							"px-[22px]": collapsed,
							"px-5": !collapsed,
						})}
					>
						<NavigationMenu collapsed={collapsed} />
						<SettingsAndSupport collapsed={collapsed} />

						{!collapsed ? <UsageWidget className="mt-auto" /> : null}
					</div>

					<SidebarDivider collapsed={collapsed} />

					<UserProfile collapsed={collapsed} />
				</div>
			</div>

			{/* a necessary placeholder because of sidebar is fixed */}
			<div
				className={cn("shrink-0", {
					"w-[272px]": !collapsed,
					"w-20": collapsed,
				})}
			/>
		</>
	);
}
