import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Mail, Trash2, Check } from "lucide-react";

export default function AdminMessages() {
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);

  const load = () => api.get("/admin/messages").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/admin/messages/${id}/read`);
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await api.delete(`/admin/messages/${id}`);
    setActive(null);
    load();
    toast.success("Deleted.");
  };

  return (
    <div data-testid="admin-messages-page">
      <div className="overline text-stone-500">Inbox</div>
      <h1 className="editorial-h2 text-4xl mt-2">Enquiries</h1>

      <div className="grid lg:grid-cols-12 gap-6 mt-10">
        <div className="lg:col-span-5 bg-white border border-stone-200 divide-y divide-stone-200 max-h-[70vh] overflow-y-auto">
          {list.length === 0 && <div className="p-8 text-sm text-stone-500">No enquiries yet.</div>}
          {list.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { setActive(m); if (!m.read) markRead(m.id); }}
              data-testid={`msg-row-${i}`}
              className={`w-full text-left p-4 hover:bg-stone-50 ${active?.id === m.id ? "bg-stone-100" : ""}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-display text-sm">{m.name}</div>
                {!m.read && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
              </div>
              <div className="text-xs text-stone-500 mt-1">{m.email}</div>
              <div className="text-xs text-stone-500 mt-0.5">{m.subject || "—"}</div>
              <div className="text-sm text-stone-700 mt-1 line-clamp-2">{m.message}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-7">
          {active ? (
            <div className="bg-white border border-stone-200 p-8" data-testid="msg-detail">
              <div className="flex justify-between items-start">
                <div>
                  <div className="overline text-stone-500">{new Date(active.created_at).toLocaleString()}</div>
                  <h3 className="font-serif text-3xl mt-2">{active.name}</h3>
                  <div className="text-sm text-stone-600 mt-1">
                    <a href={`mailto:${active.email}`} className="hover:underline">{active.email}</a>
                    {active.phone && <span> · {active.phone}</span>}
                  </div>
                </div>
                <button onClick={() => remove(active.id)} data-testid="msg-delete" className="text-stone-500 hover:text-red-600 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
              {active.subject && <div className="mt-6 font-display text-sm">Re: {active.subject}</div>}
              <p className="mt-4 font-sans text-base text-stone-700 leading-relaxed whitespace-pre-line">{active.message}</p>
              <a
                href={`mailto:${active.email}?subject=Re:%20${encodeURIComponent(active.subject || "Your enquiry")}`}
                className="mt-8 inline-flex font-display text-sm px-5 py-2.5 bg-stone-900 text-stone-50 items-center gap-2"
                data-testid="msg-reply"
              >
                <Mail size={14} /> Reply by Email
              </a>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-10 text-center text-stone-500 text-sm">Select a message to read.</div>
          )}
        </div>
      </div>
    </div>
  );
}
