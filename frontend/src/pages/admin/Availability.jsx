import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminAvailability() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/availability").then((r) => {
      const a = { ...r.data };
      // Ensure all 7 weekdays present
      a.weekday_slots = a.weekday_slots || {};
      for (let i = 0; i < 7; i++) {
        if (!a.weekday_slots[String(i)]) a.weekday_slots[String(i)] = [];
      }
      setData(a);
    });
  }, []);

  const save = async () => {
    try {
      const { id, ...payload } = data;
      const r = await api.put("/admin/availability", payload);
      setData(r.data);
      toast.success("Availability updated.");
    } catch { toast.error("Could not save."); }
  };

  const updateDay = (idx, slots) => {
    setData({ ...data, weekday_slots: { ...data.weekday_slots, [idx]: slots } });
  };

  const addBlockedDate = () => {
    const d = window.prompt("Enter a date to block (YYYY-MM-DD)");
    if (!d) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return toast.error("Use YYYY-MM-DD");
    if (data.blocked_dates.includes(d)) return;
    setData({ ...data, blocked_dates: [...data.blocked_dates, d].sort() });
  };
  const removeBlocked = (d) => {
    setData({ ...data, blocked_dates: data.blocked_dates.filter((x) => x !== d) });
  };
  const updateServices = (val) => {
    setData({ ...data, services: val.split("\n").map((s) => s.trim()).filter(Boolean) });
  };

  if (!data) return <div>Loading…</div>;

  return (
    <div data-testid="admin-availability-page">
      <div className="flex justify-between items-center">
        <div>
          <div className="overline text-stone-500">Settings</div>
          <h1 className="editorial-h2 text-4xl mt-2">Availability</h1>
        </div>
        <button onClick={save} data-testid="avail-save" className="font-display text-sm px-6 py-3 bg-stone-900 text-stone-50 flex items-center gap-2"><Save size={14}/> Save</button>
      </div>

      <div className="bg-white border border-stone-200 p-6 md:p-8 mt-10">
        <h3 className="font-serif text-2xl">Weekly schedule</h3>
        <p className="text-sm text-stone-500 mt-1">Available 30-minute time slots per weekday (HH:MM, 24h).</p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className="border border-stone-200 p-4">
              <div className="font-display text-sm">{w}</div>
              <input
                value={data.weekday_slots[String(i)].join(", ")}
                onChange={(e) => updateDay(String(i), e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                data-testid={`avail-day-${i}`}
                placeholder="10:00, 11:00, 14:00…"
                className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-6 md:p-8 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-2xl">Blocked dates</h3>
          <button onClick={addBlockedDate} data-testid="avail-add-block" className="font-display text-xs border border-stone-300 px-3 py-1.5 flex items-center gap-1"><Plus size={12}/> Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {data.blocked_dates.length === 0 && <div className="text-sm text-stone-500">No blocked dates.</div>}
          {data.blocked_dates.map((d) => (
            <span key={d} className="font-display text-xs px-3 py-1.5 border border-stone-200 flex items-center gap-2" data-testid={`avail-blocked-${d}`}>
              {d} <button onClick={() => removeBlocked(d)}><X size={12}/></button>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-6 md:p-8 mt-6">
        <h3 className="font-serif text-2xl">Services offered for consultation</h3>
        <p className="text-sm text-stone-500 mt-1">One per line. Shown in the booking dropdown.</p>
        <textarea
          rows={6}
          value={data.services.join("\n")}
          onChange={(e) => updateServices(e.target.value)}
          data-testid="avail-services"
          className="mt-4 w-full border border-stone-200 px-3 py-2 text-sm resize-none"
        />
      </div>
    </div>
  );
}
