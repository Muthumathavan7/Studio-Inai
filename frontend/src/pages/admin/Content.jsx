import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Save } from "lucide-react";

const groups = [
  {
    title: "Hero Section",
    fields: [
      ["hero_overline", "Overline (small label)"],
      ["hero_title", "Main headline", "textarea"],
      ["hero_subtitle", "Subtitle / disciplines"],
      ["hero_image", "Hero image URL"],
      ["hero_cta_label", "CTA button label"],
    ],
  },
  {
    title: "About Section",
    fields: [
      ["about_overline", "Overline"],
      ["about_title", "Title"],
      ["about_body", "Body text", "textarea"],
      ["about_image", "About image URL"],
    ],
  },
  {
    title: "Four Pillars",
    fields: [
      ["pillar_1_title", "Pillar 1 title"],
      ["pillar_1_body", "Pillar 1 body"],
      ["pillar_2_title", "Pillar 2 title"],
      ["pillar_2_body", "Pillar 2 body"],
      ["pillar_3_title", "Pillar 3 title"],
      ["pillar_3_body", "Pillar 3 body"],
      ["pillar_4_title", "Pillar 4 title"],
      ["pillar_4_body", "Pillar 4 body"],
    ],
  },
  {
    title: "Contact Details",
    fields: [
      ["contact_email", "Primary email"],
      ["contact_email_2", "Secondary email"],
      ["contact_phone", "Phone"],
      ["contact_phone_2", "Landline"],
      ["contact_whatsapp", "WhatsApp number (no +)"],
      ["contact_address", "Address", "textarea"],
      ["instagram", "Instagram URL"],
      ["facebook", "Facebook URL"],
      ["map_embed_url", "Google Map embed URL"],
    ],
  },
];

export default function AdminContent() {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { id, ...payload } = content;
      const r = await api.put("/content", payload);
      setContent(r.data);
      toast.success("Site content updated.");
    } catch (err) {
      toast.error("Could not save content.");
    } finally {
      setSaving(false);
    }
  };

  if (!content) return <div>Loading…</div>;

  return (
    <div data-testid="admin-content-page">
      <div className="flex justify-between items-center">
        <div>
          <div className="overline text-stone-500">Site Content</div>
          <h1 className="editorial-h2 text-4xl mt-2">Edit Pages</h1>
        </div>
        <button onClick={save} disabled={saving} data-testid="content-save" className="font-display text-sm px-6 py-3 bg-stone-900 text-stone-50 hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="mt-10 space-y-10">
        {groups.map((g) => (
          <div key={g.title} className="bg-white border border-stone-200 p-6 md:p-8" data-testid={`content-group-${g.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <h3 className="font-serif text-2xl mb-6">{g.title}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {g.fields.map(([key, label, type]) => (
                <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="overline text-stone-500">{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={content[key] || ""}
                      onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      data-testid={`content-field-${key}`}
                      className="mt-2 w-full bg-transparent border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900 resize-none"
                    />
                  ) : (
                    <input
                      value={content[key] || ""}
                      onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      data-testid={`content-field-${key}`}
                      className="mt-2 w-full bg-transparent border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
