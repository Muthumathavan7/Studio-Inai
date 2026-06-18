import React, { useEffect, useState } from "react";
import api, { resolveImageUrl } from "@/lib/api";

export default function About() {
  const [content, setContent] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data));
    api.get("/team").then((r) => setTeam(r.data));
  }, []);

  if (!content) return <div className="min-h-screen" data-testid="about-loading" />;

  return (
    <div data-testid="about-page">
      {/* Header */}
      <section className="pt-40 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">{content.about_overline}</div>
          <h1 className="editorial-h1 text-5xl md:text-8xl mt-6 max-w-5xl">
            {content.about_title}
          </h1>
        </div>
      </section>

      {/* Story + Image */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-6">
            <div className="img-zoom aspect-[4/5] bg-stone-200">
              <img src={resolveImageUrl(content.about_image)} alt="Studio Inai" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-6 flex flex-col justify-center">
            <p className="font-sans text-base md:text-lg leading-relaxed text-stone-700">
              {content.about_body}
            </p>
            <p className="font-sans text-base md:text-lg leading-relaxed text-stone-700 mt-6">
              Our architectural and interior expertise is complemented by experience in master
              planning, feasibility, adaptive reuse, and strategic business case development —
              delivered through a process-led approach that resonates with conceptual rigour and
              material invention.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-12 border-t border-stone-200 pt-8">
              <div data-testid="stat-since">
                <div className="font-serif text-5xl">2014</div>
                <div className="overline text-stone-500 mt-2">Established</div>
              </div>
              <div data-testid="stat-projects">
                <div className="font-serif text-5xl">80+</div>
                <div className="overline text-stone-500 mt-2">Projects delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32 bg-stone-100" data-testid="team-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">The Team</div>
          <h2 className="editorial-h2 text-4xl md:text-6xl mt-4 max-w-3xl">
            Architects, planners and makers.
          </h2>
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 mt-20">
            {team.map((m, i) => (
              <div key={m.id} data-testid={`team-${i}`} className="grid grid-cols-12 gap-6">
                <div className="col-span-5">
                  <div className="img-zoom aspect-[3/4] bg-stone-300">
                    {m.image && <img src={resolveImageUrl(m.image)} alt={m.name} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div className="col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="overline text-stone-500">{m.title}</div>
                    <h3 className="font-serif text-2xl md:text-3xl mt-2">{m.name}</h3>
                    <p className="font-sans text-sm text-stone-600 leading-relaxed mt-4">{m.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
