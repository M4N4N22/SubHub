"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Plug,
  BadgeCheck,
  PlusCircle,
  Upload,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export default function CreatorSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  // --------- GROUPED & CLEANED HIERARCHY ---------
  const groupedLinks = [
    {
      section: "Overview",
      items: [
        { name: "Dashboard", href: "/creator/dashboard", icon: Home },
        { name: "Profile", href: "/creator/profile", icon: User },
        { name: "Integrations", href: "/creator/integrations", icon: Plug },
      ],
    },
    {
      section: "Content",
      items: [
        { name: "upload Content", href: "/creator/upload-content", icon: Upload },
        { name: "Content Library", href: "/creator/my-posts", icon: FileText },
      ],
    },
    {
      section: "Subscriptions", // NEW CATEGORY (Subscription Plans)
      items: [
        {
          name: "Subscription Plans",
          href: "/creator/plans",
          icon: TrendingUp,
        },
        {
          name: "Create Plan",
          href: "/creator/create",
          icon: PlusCircle,
        },
      ],
    },
    {
      section: "Membership NFTs",
      items: [
        {
          name: "NFT Tiers",
          href: "/creator/memberships/nft-tiers",
          icon: BadgeCheck,
        },
        {
          name: "Create Tier",
          href: "/creator/memberships/create",
          icon: PlusCircle,
        },
      ],
    },
    {
      section: "Monetization",
      items: [
        { name: "Earnings", href: "/creator/monetization", icon: DollarSign },
      ],
    },
    {
      section: "AI Tools",
      items: [{ name: "AI Assistant", href: "/creator/ai", icon: Sparkles }],
    },
    {
      section: "Settings",
      items: [{ name: "Settings", href: "/creator/settings", icon: Settings }],
    },
  ];

  // --------- SIDEBAR STRUCTURE ---------
  return (
    <aside
      className={cn(
        "bg-card flex flex-col transition-all duration-300 h-full rounded-3xl px-4 py-2 overflow-hidden shadow-md",

        collapsed ? "w-24" : "w-64"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 bg-primary absolute -top-4 -right-5 flex items-center justify-center shadow-xl 
          hover:bg-primary/90 text-primary-foreground transition rounded-full"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Navigation Sections */}
      <nav className="mt-6 space-y-6 overflow-y-auto">
        {groupedLinks.map((group) => (
          <div key={group.section}>
            {/* Section Title */}
            {!collapsed && (
              <div className="text-xs uppercase tracking-wider font-semibold text-foreground/50 mb-2 px-2">
                {group.section}
              </div>
            )}

            <div className="flex flex-col space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all font-medium group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/60 hover:bg-primary/90 hover:text-primary-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-all",
                        collapsed && "mx-auto"
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate text-sm">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
