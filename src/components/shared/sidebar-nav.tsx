"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, MessageSquare, Calendar, Bell, Settings, Users, Stethoscope } from "lucide-react"

const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/patients", label: "Patients", icon: Users },
    { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
]

export function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col h-full">
            <div className="flex-grow p-4 space-y-2">
                {links.map((link) => (
                    <Button
                        key={link.href}
                        asChild
                        variant={pathname.startsWith(link.href) && (link.href !== "/dashboard" || pathname === "/dashboard") ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Link href={link.href}>
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                        </Link>
                    </Button>
                ))}
            </div>
            <div className="p-4 border-t border-border">
                 <Button
                    asChild
                    variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </div>
        </nav>
    )
}
