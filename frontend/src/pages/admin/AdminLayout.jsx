import React from "react";
import { NavLink, Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard, FileText, Briefcase, Users, Wrench,
  Mail, Calendar, Settings, LogOut, ExternalLink,
} from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/content", label: "Site Content", icon: FileText },
  { to: "/admin/projects", label: "Portfolio", icon: Briefcase },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/availability", label: "Availability", icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans text-stone-500">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen flex bg-stone-100" data-testid="admin-layout">
      <aside className="w-64 bg-stone-900 text-stone-100 flex flex-col p-5 sticky top-0 h-screen" data-testid="admin-sidebar">
        <div className="px-2 mb-8">
          <Logo dark />
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`admin-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-display transition-colors ${
                  isActive ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-800 pt-4 space-y-2 text-xs font-display">
          <Link to="/" target="_blank" className="flex items-center gap-2 text-stone-400 hover:text-stone-50 px-3 py-2" data-testid="admin-view-site">
            <ExternalLink size={14} /> View Site
          </Link>
          <button onClick={logout} data-testid="admin-logout" className="w-full flex items-center gap-2 text-stone-400 hover:text-stone-50 px-3 py-2">
            <LogOut size={14} /> Sign out
          </button>
          <div className="text-stone-600 px-3 pt-2">{user.email}</div>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  );
}
