import React from "react";

type LandingProps = {
  memberName?: string;
  onOpenBoard: () => void;
};

export default function Landing({ memberName = "Teammate", onOpenBoard }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      <div className="absolute inset-0 -z-10 opacity-25">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent" />
      </div>

      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <span className="text-indigo-300 font-bold">SS</span>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-indigo-300">Stakelock</div>
            <div className="text-xs text-indigo-200/80">SurakshaSetu Collaboration</div>
          </div>
        </div>
        <button
          onClick={onOpenBoard}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition shadow-lg shadow-indigo-800/30"
        >
          Open Board
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-24">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300">{memberName}</span>
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Thanks for collaborating on Stakelock’s <span className="text-indigo-300 font-medium">SurakshaSetu Mobile App</span>. Let’s plan, track, and ship features with clarity. [19][22]
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={onOpenBoard}
              className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 transition font-medium shadow-lg shadow-indigo-900/40"
            >
              Open Kanban
            </button>
            <a
              href="#highlights"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition"
            >
              Highlights
            </a>
          </div>
        </section>

        <section id="highlights" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Secure Workflows", desc: "Built around safety-first processes for SurakshaSetu deliveries." },
            { title: "Real‑time Sync", desc: "Live updates via Supabase so everyone stays aligned." },
            { title: "Focus & Velocity", desc: "Simple, beautiful workflows that make progress enjoyable." },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-6 bg-white/5 backdrop-blur border border-white/10 hover:border-indigo-400/40 transition"
            >
              <div className="text-indigo-300 font-semibold">{card.title}</div>
              <p className="mt-2 text-slate-300">{card.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
