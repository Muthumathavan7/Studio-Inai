import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import api from "@/lib/api";

export default function Footer() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <Logo dark size="lg" />
          <p className="mt-6 max-w-sm text-stone-400 leading-relaxed font-sans text-sm">
            A placemaking design practice combining architecture, spatial and experiential design
            to create places that enhance lives.
          </p>
        </div>

        <div className="md:col-span-3">
          <div className="overline text-stone-500 mb-4">Navigate</div>
          <ul className="space-y-3 font-display text-sm">
            <li><Link to="/" className="hover:text-stone-50 transition-colors" data-testid="footer-link-home">Home</Link></li>
            <li><Link to="/about" className="hover:text-stone-50 transition-colors" data-testid="footer-link-about">About</Link></li>
            <li><Link to="/portfolio" className="hover:text-stone-50 transition-colors" data-testid="footer-link-portfolio">Portfolio</Link></li>
            <li><Link to="/schedule" className="hover:text-stone-50 transition-colors" data-testid="footer-link-schedule">Schedule</Link></li>
            <li><Link to="/contact" className="hover:text-stone-50 transition-colors" data-testid="footer-link-contact">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="overline text-stone-500 mb-4">Studio</div>
          {content && (
            <ul className="space-y-3 font-sans text-sm text-stone-400">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{content.contact_address}</span></li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0" /><span>{content.contact_phone}</span></li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0" /><span>{content.contact_email}</span></li>
            </ul>
          )}
          <div className="flex gap-4 mt-6">
            {content?.instagram && (
              <a href={content.instagram} target="_blank" rel="noreferrer" className="hover:text-stone-50" data-testid="footer-instagram"><Instagram size={18} /></a>
            )}
            {content?.facebook && (
              <a href={content.facebook} target="_blank" rel="noreferrer" className="hover:text-stone-50" data-testid="footer-facebook"><Facebook size={18} /></a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-stone-500 font-sans">
          <div>© {new Date().getFullYear()} Studio Inai. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/admin/login" className="hover:text-stone-300" data-testid="footer-admin-link">Admin</Link>
            <span>Established 2014 · Chennai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
