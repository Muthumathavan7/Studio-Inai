import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { X } from "lucide-react";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects]
  );

  return (
    <div data-testid="portfolio-page">
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">Portfolio</div>
          <h1 className="editorial-h1 text-5xl md:text-8xl mt-6 max-w-5xl">A selection of recent work.</h1>
        </div>
      </section>

      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-2 md:gap-4 border-t border-stone-200 pt-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                data-testid={`filter-${c.toLowerCase()}`}
                className={`font-display text-sm tracking-wide px-4 py-2 border transition-all duration-300 ${
                  filter === c
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {visible.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                data-testid={`portfolio-card-${i}`}
                className="text-left group"
              >
                <div className="img-zoom aspect-[4/5] bg-stone-200">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="overline text-stone-500">{p.category}</div>
                    <h3 className="font-serif text-2xl mt-1.5 group-hover:text-stone-700 transition-colors">{p.title}</h3>
                    <div className="font-sans text-xs text-stone-500 mt-1">{p.location}</div>
                  </div>
                  <div className="font-display text-xs text-stone-500">{p.year}</div>
                </div>
              </button>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="text-center py-24 font-sans text-stone-500" data-testid="portfolio-empty">
              No projects in this category yet.
            </div>
          )}
        </div>
      </section>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/85 backdrop-blur-sm overflow-y-auto"
          onClick={() => setActive(null)}
          data-testid="portfolio-modal"
        >
          <div className="min-h-full flex items-start justify-center py-8 px-4">
            <div
              className="bg-stone-50 max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setActive(null)} data-testid="portfolio-modal-close" className="text-stone-500 hover:text-stone-900">
                  <X size={22} />
                </button>
              </div>
              <div className="aspect-[16/9] bg-stone-200">
                <img src={active.cover_image} alt={active.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12">
                <div className="overline text-stone-500">{active.category}</div>
                <h2 className="editorial-h2 text-3xl md:text-5xl mt-3">{active.title}</h2>
                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 font-display text-xs text-stone-500">
                  <span>{active.location}</span>
                  <span>{active.year}</span>
                </div>
                <p className="font-sans text-base text-stone-700 leading-relaxed mt-8 max-w-2xl">
                  {active.description}
                </p>
                {active.images?.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mt-10">
                    {active.images.map((src, i) => (
                      <div key={i} className="aspect-[4/3] bg-stone-200">
                        <img src={src} alt={`${active.title} ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
