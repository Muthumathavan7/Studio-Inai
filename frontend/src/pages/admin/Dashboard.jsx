import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Mail, Calendar, Briefcase, Users, Wrench, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/bookings").then((r) => setRecentBookings(r.data.slice(0, 5)));
    api.get("/admin/messages").then((r) => setRecentMessages(r.data.slice(0, 5)));
  }, []);

  const tiles = [
    { label: "Messages", value: stats?.messages, sub: `${stats?.messages_unread ?? 0} unread`, icon: Mail, to: "/admin/messages", testid: "stat-messages" },
    { label: "Bookings", value: stats?.bookings, sub: `${stats?.bookings_pending ?? 0} pending`, icon: Calendar, to: "/admin/bookings", testid: "stat-bookings" },
    { label: "Projects", value: stats?.projects, sub: "Portfolio", icon: Briefcase, to: "/admin/projects", testid: "stat-projects" },
    { label: "Team", value: stats?.team, sub: "Members", icon: Users, to: "/admin/team", testid: "stat-team" },
    { label: "Services", value: stats?.services, sub: "Offerings", icon: Wrench, to: "/admin/services", testid: "stat-services" },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="overline text-stone-500">Dashboard</div>
      <h1 className="editorial-h2 text-4xl mt-2">Studio Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
        {tiles.map((t) => (
          <Link to={t.to} key={t.label} data-testid={t.testid} className="bg-white border border-stone-200 p-5 hover:border-stone-900 transition-colors">
            <div className="flex justify-between items-start">
              <t.icon size={18} className="text-stone-500" />
              <span className="overline text-stone-500">{t.label}</span>
            </div>
            <div className="font-serif text-5xl mt-6">{t.value ?? "—"}</div>
            <div className="font-sans text-xs text-stone-500 mt-2">{t.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        <div className="bg-white border border-stone-200 p-6">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif text-2xl">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-display border-b border-stone-900 pb-0.5">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-stone-200">
            {recentBookings.length === 0 && <div className="py-6 text-sm text-stone-500">No bookings yet.</div>}
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-display text-sm">{b.name} · {b.service}</div>
                  <div className="text-xs text-stone-500">{b.date} at {b.time}</div>
                </div>
                <span className={`text-xs font-display uppercase tracking-wider px-2 py-1 ${b.status === "pending" ? "bg-amber-100 text-amber-800" : b.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-6">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif text-2xl">Recent Messages</h3>
            <Link to="/admin/messages" className="text-xs font-display border-b border-stone-900 pb-0.5">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-stone-200">
            {recentMessages.length === 0 && <div className="py-6 text-sm text-stone-500">No messages yet.</div>}
            {recentMessages.map((m) => (
              <div key={m.id} className="py-3">
                <div className="flex justify-between">
                  <div className="font-display text-sm">{m.name}</div>
                  {!m.read && <AlertCircle size={14} className="text-amber-600" />}
                </div>
                <div className="text-xs text-stone-500">{m.email}</div>
                <div className="text-sm text-stone-700 mt-1 line-clamp-2">{m.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
