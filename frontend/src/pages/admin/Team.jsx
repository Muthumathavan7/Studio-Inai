import React, { useEffect, useState } from "react";
import api, { resolveImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const EMPTY = { name: "", title: "", bio: "", image: "", order: 0 };

export default function AdminTeam() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/team").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing.id) {
        const { id, ...payload } = editing;
        await api.put(`/team/${id}`, payload);
      } else {
        await api.post("/team", editing);
      }
      toast.success("Saved.");
      setEditing(null); load();
    } catch { toast.error("Could not save."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    await api.delete(`/team/${id}`); load();
  };

  return (
    <div data-testid="admin-team-page">
      <div className="flex justify-between items-center">
        <div><div className="overline text-stone-500">Team</div><h1 className="editorial-h2 text-4xl mt-2">Members</h1></div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="team-new" className="font-display text-sm px-6 py-3 bg-stone-900 text-stone-50 flex items-center gap-2"><Plus size={14} /> New Member</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {list.map((m, i) => (
          <div key={m.id} className="bg-white border border-stone-200 p-5 flex gap-5" data-testid={`team-row-${i}`}>
            <div className="w-28 h-32 bg-stone-200 shrink-0">
              {m.image && <img src={resolveImageUrl(m.image)} alt={m.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <div className="overline text-stone-500">{m.title}</div>
              <div className="font-serif text-xl mt-1">{m.name}</div>
              <p className="text-xs text-stone-500 mt-2 line-clamp-3">{m.bio}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(m)} data-testid={`team-edit-${i}`} className="font-display text-xs px-3 py-1.5 border border-stone-300 flex items-center gap-1"><Edit3 size={12}/>Edit</button>
                <button onClick={() => remove(m.id)} data-testid={`team-delete-${i}`} className="font-display text-xs px-3 py-1.5 border border-stone-300 hover:border-red-500 hover:text-red-600"><Trash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 flex items-start justify-center overflow-y-auto p-6" onClick={() => setEditing(null)}>
          <div className="bg-white max-w-xl w-full p-8" onClick={(e) => e.stopPropagation()} data-testid="team-form">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Member" : "New Member"}</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input label="Name" value={editing.name} onChange={(v) => setEditing({...editing, name: v})} testid="tm-name" />
              <Input label="Title / Role" value={editing.title} onChange={(v) => setEditing({...editing, title: v})} testid="tm-title" />
              <ImageUploader
                label="Photo"
                value={editing.image}
                onChange={(v) => setEditing({...editing, image: v})}
                testid="tm-image-uploader"
              />
              <div>
                <label className="overline text-stone-500">Bio</label>
                <textarea rows={5} value={editing.bio} onChange={(e) => setEditing({...editing, bio: e.target.value})} data-testid="tm-bio" className="mt-2 w-full border border-stone-200 px-3 py-2 text-sm resize-none" />
              </div>
              <Input label="Order" type="number" value={editing.order} onChange={(v) => setEditing({...editing, order: parseInt(v) || 0})} testid="tm-order" />
            </div>
            <div className="flex justify-end gap-3 mt-6 border-t border-stone-200 pt-6">
              <button onClick={() => setEditing(null)} className="font-display text-sm px-5 py-2 border border-stone-300">Cancel</button>
              <button onClick={save} data-testid="tm-save" className="font-display text-sm px-5 py-2 bg-stone-900 text-stone-50">Save</button>
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
