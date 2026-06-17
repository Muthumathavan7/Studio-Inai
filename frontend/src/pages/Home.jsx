import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function Home() {
  const [content, setContent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data));
    api.get("/projects?featured=true").then((r) => setProjects(r.data));
    api.get("/services").then((r) => setServices(r.data));
  }, []);

  if (!content) return <div className="min-h-screen" data-testid="home-loading" />;

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden bg-stone-900" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src={content.hero_image}
            alt="Studio Inai architecture"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-stone-900/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28 pt-32 w-full">
          <div className="overline text-amber-100/90 reveal reveal-1" data-testid="hero-overline">{content.hero_overline}</div>
          <h1
            className="editorial-h1 text-stone-50 text-5xl sm:text-6xl md:text-8xl mt-6 max-w-5xl reveal reveal-2"
            data-testid="hero-title"
          >
            {content.hero_title}
          </h1>
          <div className="mt-10 flex flex-col md:flex-row md:items-center gap-6 reveal reveal-3">
            <div className="overline text-stone-200" data-testid="hero-subtitle">
              {content.hero_subtitle}
            </div>
            <Link
              to="/schedule"
              data-testid="hero-cta-book"
              className="inline-flex items-center gap-2 font-display text-sm tracking-wide px-7 py-3.5 bg-stone-50 text-stone-900 hover:bg-amber-50 border border-stone-50 transition-all duration-500"
            >
              {content.hero_cta_label}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 md:py-32" data-testid="intro-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="overline text-stone-500">{content.about_overline}</div>
            <h2 className="editorial-h2 text-4xl md:text-6xl mt-6">{content.about_title}</h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex flex-col justify-end">
            <p className="font-sans text-base md:text-lg text-stone-700 leading-relaxed">
              {content.about_body}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-display text-sm text-stone-900 group"
              data-testid="intro-cta-about"
            >
              <span className="border-b border-stone-900 pb-1">More about Studio Inai</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 md:py-32 bg-stone-100" data-testid="philosophy-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">Our Approach</div>
          <h2 className="editorial-h2 text-4xl md:text-6xl mt-4 max-w-3xl">
            Four pillars that shape every project.
          </h2>
          <div className="grid md:grid-cols-4 gap-10 md:gap-14 mt-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} data-testid={`pillar-${i}`}>
                <div className="font-serif text-5xl text-stone-300">0{i}</div>
                <div className="font-display text-lg tracking-wide mt-4 text-stone-900">
                  {content[`pillar_${i}_title`]}
                </div>
                <p className="mt-3 font-sans text-sm text-stone-600 leading-relaxed">
                  {content[`pillar_${i}_body`]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="py-24 md:py-32" data-testid="work-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              <div className="overline text-stone-500">Selected Work</div>
              <h2 className="editorial-h2 text-4xl md:text-6xl mt-4">Projects of substance.</h2>
            </div>
            <Link
              to="/portfolio"
              className="font-display text-sm border-b border-stone-900 pb-1 hover:text-stone-700"
              data-testid="work-cta-all"
            >
              View All Projects →
            </Link>
          </div>

          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            {projects.slice(0, 3).map((p, idx) => (
              <Link
                to="/portfolio"
                key={p.id}
                data-testid={`featured-project-${idx}`}
                className={`group ${
                  idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5 md:mt-32" : "md:col-span-8 md:col-start-3"
                }`}
              >
                <div className="img-zoom aspect-[4/5] bg-stone-200">
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="overline text-stone-500">{p.category}</div>
                    <h3 className="font-serif text-2xl md:text-3xl mt-1.5">{p.title}</h3>
                  </div>
                  <div className="font-display text-xs text-stone-500">{p.year}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES STRIP */}
      <section className="py-24 md:py-32 bg-stone-900 text-stone-100" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-400">Capability</div>
          <h2 className="editorial-h2 text-stone-50 text-4xl md:text-6xl mt-4 max-w-3xl">
            From feasibility to finely detailed delivery.
          </h2>
          <div className="grid md:grid-cols-3 gap-y-12 gap-x-12 mt-20">
            {services.map((s, i) => (
              <div key={s.id} className="border-t border-stone-800 pt-6" data-testid={`service-${i}`}>
                <div className="font-display text-xs text-stone-500">{String(i + 1).padStart(2, "0")}</div>
                <div className="font-serif text-2xl mt-3 text-stone-50">{s.title}</div>
                <p className="font-sans text-sm text-stone-400 leading-relaxed mt-3">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-7">
            <div className="overline text-stone-500">Start a conversation</div>
            <h2 className="editorial-h2 text-4xl md:text-6xl mt-4">
              Let's design a place that matters.
            </h2>
          </div>
          <div className="md:col-span-5 flex flex-col md:items-end gap-4">
            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 font-display text-sm tracking-wide px-7 py-3.5 bg-stone-900 text-stone-50 hover:bg-stone-700 transition-all duration-500"
              data-testid="cta-schedule"
            >
              Book a Consultation <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 font-display text-sm tracking-wide px-7 py-3.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-50 transition-all duration-500"
              data-testid="cta-contact"
            >
              Send an Enquiry <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
