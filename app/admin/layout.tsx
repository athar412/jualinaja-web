import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { LayoutDashboard, CheckSquare, Users } from "lucide-react";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/moderation", icon: CheckSquare, label: "Moderasi Iklan" },
  { href: "/admin/users", icon: Users, label: "Data Pengguna" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Mobile nav - horizontal scrollable tabs */}
        <div className="md:hidden w-full mb-6 border-b border-border pb-3 flex gap-4 overflow-x-auto">
          {links.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground flex-shrink-0 whitespace-nowrap pb-1">
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Admin Panel</p>
            <nav className="flex flex-col gap-1">
              {links.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
