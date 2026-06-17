import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { MapPin, Phone, Mail, Instagram, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [content, setContent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data));
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setDone(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Thank you. We'll be in touch shortly.");
    } catch (err) {
      toast.error("Could not send. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!content) return <div className="min-h-screen" />;

  return (
    <div data-testid="contact-page">
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">Contact</div>
          <h1 className="editorial-h1 text-5xl md:text-8xl mt-6 max-w-5xl">Let's begin a conversation.</h1>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 md:gap-16">
          {/* Form */}
          <div className="md:col-span-7">
            {done ? (
              <div className="border border-stone-200 p-10 bg-white" data-testid="contact-success">
                <CheckCircle2 className="text-stone-900" size={32} />
                <h3 className="font-serif text-3xl mt-5">Message received.</h3>
                <p className="font-sans text-stone-600 mt-3 leading-relaxed">
                  We typically respond within 1–2 business days. For urgent matters, please reach us by phone or WhatsApp.
                </p>
                <button
                  onClick={() => setDone(false)}
                  className="mt-6 font-display text-sm border-b border-stone-900 pb-1"
                  data-testid="contact-send-another"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6" data-testid="contact-form">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Name" value={form.name} onChange={update("name")} required testid="contact-name" />
                  <Field label="Email" type="email" value={form.email} onChange={update("email")} required testid="contact-email" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Phone" value={form.phone} onChange={update("phone")} testid="contact-phone" />
                  <Field label="Subject" value={form.subject} onChange={update("subject")} testid="contact-subject" />
                </div>
                <div>
                  <label className="overline text-stone-500">Message</label>
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    rows={6}
                    required
                    data-testid="contact-message"
                    className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans text-base py-2 focus:border-stone-900 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="contact-submit"
                  className="font-display text-sm tracking-wide px-8 py-3.5 bg-stone-900 text-stone-50 hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send Enquiry"}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-5 space-y-8" data-testid="contact-info">
            <InfoBlock icon={<MapPin size={18} />} label="Studio">
              {content.contact_address}
            </InfoBlock>
            <InfoBlock icon={<Phone size={18} />} label="Phone">
              <a href={`tel:${content.contact_phone}`} className="hover:underline">{content.contact_phone}</a><br/>
              <a href={`tel:${content.contact_phone_2}`} className="hover:underline text-stone-500 text-sm">{content.contact_phone_2}</a>
            </InfoBlock>
            <InfoBlock icon={<Mail size={18} />} label="Email">
              <a href={`mailto:${content.contact_email}`} className="hover:underline">{content.contact_email}</a><br/>
              <a href={`mailto:${content.contact_email_2}`} className="hover:underline text-stone-500 text-sm">{content.contact_email_2}</a>
            </InfoBlock>
            <InfoBlock icon={<MessageCircle size={18} />} label="WhatsApp">
              <a
                href={`https://wa.me/91${content.contact_whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
                data-testid="contact-whatsapp-link"
              >
                +91 {content.contact_whatsapp}
              </a>
            </InfoBlock>
            {content.instagram && (
              <InfoBlock icon={<Instagram size={18} />} label="Instagram">
                <a href={content.instagram} target="_blank" rel="noreferrer" className="hover:underline">@studioinai</a>
              </InfoBlock>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-24" data-testid="contact-map">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="aspect-[16/7] bg-stone-200 border border-stone-200">
            <iframe
              title="Studio Inai location"
              src={content.map_embed_url}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, testid }) {
  return (
    <div>
      <label className="overline text-stone-500">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={testid}
        className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans text-base py-2 focus:border-stone-900 transition-colors"
      />
    </div>
  );
}

function InfoBlock({ icon, label, children }) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <div className="flex items-center gap-3 text-stone-500 mb-2">
        {icon}
        <span className="overline">{label}</span>
      </div>
      <div className="font-sans text-base text-stone-800 leading-relaxed">{children}</div>
    </div>
  );
}
