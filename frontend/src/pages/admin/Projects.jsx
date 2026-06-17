import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, X } from "lucide-react";

const CATEGORIES = ["Residential", "Commercial", "Institutional", "Interior", "Urban"];

const EMPTY = {
  title: "",
  category: "Residential",
  location: "",
  year: "",
  description: "",
  cover_image: "",
  images: [],
  featured: false,
  order: 0,
};

export default function AdminProjects() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/projects").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing.id) {
        const { id, ...payload } = editing;
        await api.put(`/projects/${id}`, payload);
        toast.success("Project updated.");
      } else {
        await api.post("/projects", editing);
        toast.success("Project created.");
      }
      setEditing(null);
      load();
    } catch {
      toast.error("Could not save project.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    load();
    toast.success("Deleted.");
  };

  return (
    <div data-testid="admin-projects-page">
      <div className="flex justify-between items-center">
        <div>
          <div className="overline text-stone-500">Portfolio</div>
          <h1 className="editorial-h2 text-4xl mt-2">Projects</h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="project-new" className="font-display text-sm px-6 py-3 bg-stone-900 text-stone-50 hover:bg-stone-700 flex items-center gap-2">
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {list.map((p, i) => (
          <div key={p.id} className="bg-white border border-stone-200" data-testid={`project-row-${i}`}>
            <div className="aspect-[4/3] bg-stone-200">
              {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="overline text-stone-500">{p.category}</div>
              <div className="font-serif text-xl mt-1">{p.title}</div>
              <div className="text-xs text-stone-500 mt-1">{p.location} · {p.year}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditing(p)} data-testid={`project-edit-${i}`} className="flex-1 font-display text-xs px-3 py-2 border border-stone-300 hover:border-stone-900 flex items-center justify-center gap-1">
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => remove(p.id)} data-testid={`project-delete-${i}`} className="font-display text-xs px-3 py-2 border border-stone-300 hover:border-red-500 hover:text-red-600 flex items-center justify-center">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 flex items-start justify-center overflow-y-auto p-6" onClick={() => setEditing(null)}>
          <div className="bg-white max-w-3xl w-full p-8" onClick={(e) => e.stopPropagation()} data-testid="project-form">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setEditing(null)} data-testid="project-form-close"><X size={20} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} testid="proj-title" />
              <div>
                <label className="overline text-stone-500">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  data-testid="proj-category"
                  className="mt-2 w-full border border-stone-200 px-3 py-2 font-sans text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Location" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} testid="proj-location" />
              <Input label="Year" value={editing.year} onChange={(v) => setEditing({ ...editing, year: v })} testid="proj-year" />
              <div className="md:col-span-2">
                <Input label="Cover image URL" value={editing.cover_image} onChange={(v) => setEditing({ ...editing, cover_image: v })} testid="proj-cover" />
              </div>
              <div className="md:col-span-2">
                <label className="overline text-stone-500">Description</label>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  data-testid="proj-description"
                  className="mt-2 w-full border border-stone-200 px-3 py-2 font-sans text-sm resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Gallery image URLs (comma separated)"
                  value={editing.images.join(", ")}
                  onChange={(v) => setEditing({ ...editing, images: v.split(",").map((s) => s.trim()).filter(Boolean) })}
                  testid="proj-gallery"
                />
              </div>
              <Input label="Order" type="number" value={editing.order} onChange={(v) => setEditing({ ...editing, order: parseInt(v) || 0 })} testid="proj-order" />
              <label className="flex items-center gap-2 mt-7">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  data-testid="proj-featured"
                />
                <span className="font-display text-sm">Featured on Home</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-8 border-t border-stone-200 pt-6">
              <button onClick={() => setEditing(null)} className="font-display text-sm px-5 py-2 border border-stone-300">Cancel</button>
              <button onClick={save} data-testid="proj-save" className="font-display text-sm px-5 py-2 bg-stone-900 text-stone-50">Save</button>
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900"
      />
    </div>
  );
}
