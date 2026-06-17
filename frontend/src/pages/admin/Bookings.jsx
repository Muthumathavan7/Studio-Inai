import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon } from "lucide-react";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export default function AdminBookings() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(null);

  const load = () => {
    const url = filter ? `/admin/bookings?status=${filter}` : "/admin/bookings";
    api.get(url).then((r) => setList(r.data));
  };
  useEffect(() => { load(); /* eslint-disable-line */ }, [filter]);

  const update = async (id, patch) => {
    try {
      const r = await api.put(`/admin/bookings/${id}`, patch);
      setActive(r.data);
      load();
      toast.success("Updated.");
    } catch { toast.error("Could not update."); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    await api.delete(`/admin/bookings/${id}`); setActive(null); load();
  };

  return (
    <div data-testid="admin-bookings-page">
      <div className="overline text-stone-500">Schedule</div>
      <h1 className="editorial-h2 text-4xl mt-2">Bookings</h1>

      <div className="flex flex-wrap gap-2 mt-6">
        <button onClick={() => setFilter("")} data-testid="bookings-filter-all" className={`font-display text-xs px-3 py-1.5 border ${filter === "" ? "bg-stone-900 text-stone-50 border-stone-900" : "border-stone-300"}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`bookings-filter-${s}`} className={`font-display text-xs px-3 py-1.5 border capitalize ${filter === s ? "bg-stone-900 text-stone-50 border-stone-900" : "border-stone-300"}`}>{s}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-7 bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left">
              <tr>
                <th className="p-3 font-display text-xs text-stone-500 uppercase tracking-wider">Date</th>
                <th className="p-3 font-display text-xs text-stone-500 uppercase tracking-wider">Time</th>
                <th className="p-3 font-display text-xs text-stone-500 uppercase tracking-wider">Name</th>
                <th className="p-3 font-display text-xs text-stone-500 uppercase tracking-wider">Service</th>
                <th className="p-3 font-display text-xs text-stone-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-stone-500">No bookings.</td></tr>}
              {list.map((b, i) => (
                <tr key={b.id} onClick={() => setActive(b)} data-testid={`booking-row-${i}`} className={`border-t border-stone-100 cursor-pointer hover:bg-stone-50 ${active?.id === b.id ? "bg-stone-100" : ""}`}>
                  <td className="p-3">{b.date}</td>
                  <td className="p-3">{b.time}</td>
                  <td className="p-3"><div className="font-display">{b.name}</div><div className="text-xs text-stone-500">{b.email}</div></td>
                  <td className="p-3 text-xs">{b.service}</td>
                  <td className="p-3"><StatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-5">
          {active ? (
            <div className="bg-white border border-stone-200 p-6" data-testid="booking-detail">
              <div className="flex justify-between items-start">
                <div>
                  <div className="overline text-stone-500">{active.date} · {active.time}</div>
                  <h3 className="font-serif text-2xl mt-2">{active.name}</h3>
                </div>
                <button onClick={() => remove(active.id)} data-testid="booking-delete" className="text-stone-500 hover:text-red-600 p-2"><Trash2 size={16}/></button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Email" value={<a href={`mailto:${active.email}`} className="hover:underline">{active.email}</a>} />
                {active.phone && <Row label="Phone" value={active.phone} />}
                {active.company && <Row label="Company" value={active.company} />}
                <Row label="Service" value={active.service} />
                <Row label="Duration" value={`${active.duration_minutes} min`} />
                {active.notes && <Row label="Notes" value={<span className="whitespace-pre-line">{active.notes}</span>} />}
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <label className="overline text-stone-500">Status</label>
                  <select value={active.status} onChange={(e) => update(active.id, { status: e.target.value })} data-testid="booking-status" className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="overline text-stone-500 flex items-center gap-1"><LinkIcon size={12} /> Meeting Link (Google Meet / Zoom)</label>
                  <input
                    value={active.meeting_link || ""}
                    onChange={(e) => setActive({ ...active, meeting_link: e.target.value })}
                    onBlur={() => update(active.id, { meeting_link: active.meeting_link })}
                    data-testid="booking-meet-link"
                    placeholder="https://meet.google.com/..."
                    className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="overline text-stone-500">Admin notes</label>
                  <textarea
                    rows={3}
                    value={active.admin_notes || ""}
                    onChange={(e) => setActive({ ...active, admin_notes: e.target.value })}
                    onBlur={() => update(active.id, { admin_notes: active.admin_notes })}
                    data-testid="booking-admin-notes"
                    className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm resize-none"
                  />
                </div>
                <a
                  href={`mailto:${active.email}?subject=${encodeURIComponent("Your Studio Inai consultation on " + active.date)}&body=${encodeURIComponent("Hello " + active.name + ",\n\nYour consultation has been confirmed for " + active.date + " at " + active.time + ".\n\nMeeting link: " + (active.meeting_link || "[paste link here]") + "\n\n— Studio Inai")}`}
                  className="block text-center font-display text-sm px-5 py-2.5 bg-stone-900 text-stone-50"
                  data-testid="booking-email-client"
                >
                  Email Client
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-8 text-center text-stone-500 text-sm">Select a booking.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="overline text-stone-500 col-span-1">{label}</div>
      <div className="col-span-2 text-stone-800">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-stone-200 text-stone-700",
    completed: "bg-blue-100 text-blue-800",
  };
  return <span className={`text-xs font-display uppercase tracking-wider px-2 py-1 ${colors[status] || ""}`}>{status}</span>;
}
