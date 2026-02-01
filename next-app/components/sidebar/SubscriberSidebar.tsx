"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  CreditCard,
  ShieldCheck,
  Activity,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export default function SubscriberSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Explore Access",
      href: "/access",
      icon: Compass,
    },
    {
      name: "My Access",
      href: "/my-access",
      icon: ShieldCheck,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
    {
      name: "Activity",
      href: "/activity",
      icon: Activity,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Docs",
      href: "https://github.com/M4N4N22/SubHub",
      icon: HelpCircle,
      external: true,
    },
  ];

  return (
    <aside className={cn("bg-card flex flex-col transition-all duration-300 h-full rounded-3xl px-4 py-2 overflow-hidden shadow-md", collapsed ? "w-24" : "w-64")} > {/* Collapse Button */} <button onClick={toggleSidebar} className="w-10 h-10 bg-primary absolute -top-2 -right-5 flex items-center justify-center hover:bg-primary/90 text-primary-foreground transition rounded-full shadow-md" > {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} </button>

      {/* Navigation */}
      <nav className="space-y-2 mt-8">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 p-3 rounded-3xl text-sm transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  collapsed && "mx-auto"
                )}
              />

              {!collapsed && (
                <span className="truncate transition-opacity duration-200">
                  {link.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Primary CTA */}
      <div className="mt-auto pt-6">
        <Link
          href="/create"
          className={cn(
            "flex items-center justify-center gap-2 rounded-3xl p-4 text-sm font-medium bg-linear-to-b from-primary to-foreground text-primary-foreground hover:opacity-90 transition-all shadow-md",
            collapsed &&
            "w-12 h-12 p-0 mx-auto rounded-full text-[0px]"
          )}
        >
          <Plus className="w-5 h-5" />
          {!collapsed && "Create Payment-Gated Access"}
        </Link>
      </div>
    </aside>
  );
}
