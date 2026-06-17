import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, X } from "lucide-react";

const EMPTY = { title: "", description: "", icon: "Compass", order: 0 };

export default function AdminServices() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/services").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing.id) {
        const { id, ...payload } = editing;
        await api.put(`/services/${id}`, payload);
      } else {
        await api.post("/services", editing);
      }
      toast.success("Saved.");
      setEditing(null); load();
    } catch { toast.error("Could not save."); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/services/${id}`); load();
  };

  return (
    <div data-testid="admin-services-page">
      <div className="flex justify-between items-center">
        <div><div className="overline text-stone-500">Services</div><h1 className="editorial-h2 text-4xl mt-2">Capabilities</h1></div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="svc-new" className="font-display text-sm px-6 py-3 bg-stone-900 text-stone-50 flex items-center gap-2"><Plus size={14}/> New Service</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {list.map((s, i) => (
          <div key={s.id} className="bg-white border border-stone-200 p-5" data-testid={`svc-row-${i}`}>
            <div className="overline text-stone-500">{s.icon}</div>
            <div className="font-serif text-2xl mt-2">{s.title}</div>
            <p className="text-sm text-stone-600 mt-2">{s.description}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(s)} data-testid={`svc-edit-${i}`} className="font-display text-xs px-3 py-1.5 border border-stone-300 flex items-center gap-1"><Edit3 size={12}/>Edit</button>
              <button onClick={() => remove(s.id)} data-testid={`svc-delete-${i}`} className="font-display text-xs px-3 py-1.5 border border-stone-300 hover:border-red-500 hover:text-red-600"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 flex items-start justify-center overflow-y-auto p-6" onClick={() => setEditing(null)}>
          <div className="bg-white max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Service" : "New Service"}</h2>
              <button onClick={() => setEditing(null)}><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <Input label="Title" value={editing.title} onChange={(v) => setEditing({...editing, title: v})} testid="svc-title" />
              <div>
                <label className="overline text-stone-500">Description</label>
                <textarea rows={4} value={editing.description} onChange={(e) => setEditing({...editing, description: e.target.value})} data-testid="svc-desc" className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm resize-none" />
              </div>
              <Input label="Lucide Icon name (e.g. Compass, Building2)" value={editing.icon} onChange={(v) => setEditing({...editing, icon: v})} testid="svc-icon" />
              <Input label="Order" type="number" value={editing.order} onChange={(v) => setEditing({...editing, order: parseInt(v) || 0})} testid="svc-order" />
            </div>
            <div className="flex justify-end gap-3 mt-6 border-t border-stone-200 pt-6">
              <button onClick={() => setEditing(null)} className="font-display text-sm px-5 py-2 border border-stone-300">Cancel</button>
              <button onClick={save} data-testid="svc-save" className="font-display text-sm px-5 py-2 bg-stone-900 text-stone-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", testid }) {
  return (
    <div>
      <label className="overline text-stone-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm focus:border-stone-900" />
    </div>
  );
}
