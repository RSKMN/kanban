/* src/App.tsx */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import KanbanBoard from "./components/KanbanBoard";
import Callback from "./auth/Callback";
import "./index.css";

type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
};

type Page = "landing" | "board" | "callback";

const getBaseUrl = () => {
  let url =
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_VERCEL_URL ||
    "http://localhost:5173";
  if (!url.startsWith("http")) url = `https://${url}`;
  return url.replace(/\/+$/, "");
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>(() =>
    window.location.pathname.startsWith("/auth/callback")
      ? "callback"
      : "landing"
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as User) ?? null);
      if (session?.user && page === "landing") setPage("board");
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser((session?.user as User) ?? null);
        if (session?.user) setPage("board");
        else setPage("landing");
      }
    );
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const redirectTo = `${getBaseUrl()}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPage("landing");
  }

  const displayName = useMemo(() => {
    const meta = user?.user_metadata || {};
    return meta.full_name || meta.name || meta.user_name || user?.email || "Member";
  }, [user]);

  if (page === "callback") {
    return <Callback />;
  }

  if (!user) {
    // Landing page
    return (
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-black" />
        <div className="animated-blur" />

        <header className="max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 grid place-items-center text-indigo-300 font-bold">
              SS
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              SurakshaSetu • Stakelock
            </h1>
          </div>
          <button
            onClick={signInWithGoogle}
            className="btn-primary"
            aria-label="Sign in with Google"
          >
            Sign in with Google
          </button>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <p className="text-sm tracking-widest uppercase text-indigo-300/80">
                Welcome, Collaborator
              </p>
              <h2 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight text-white">
                Thank you for teaming up on{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                  SurakshaSetu
                </span>{" "}
                Mobile App
              </h2>
              <p className="mt-5 text-slate-300/90 md:text-lg">
                Plan, prioritize, and deliver with a delightful Kanban
                experience—purpose-built for civic safety and real-time
                collaboration. [Flow & hero composition inspired patterns] [11]
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={signInWithGoogle} className="btn-glass">
                  Start Collaborating
                </button>
                <a
                  href="#features"
                  className="btn-ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-10 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Tasks Organized", value: "Kanban Flow" },
                  { label: "Real‑time Sync", value: "Supabase" },
                  { label: "UX Aesthetic", value: "Glassmorphism" },
                ].map((k, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-4 text-slate-200 border border-white/10"
                  >
                    <p className="text-sm text-slate-300/80">{k.label}</p>
                    <p className="text-lg font-semibold">{k.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="glass-card p-4 md:p-6 border border-white/10">
                <img
                  src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png"
                  alt="App preview"
                  className="w-full drop-shadow-2xl"
                />
                <p className="text-slate-300/90 text-sm mt-3">
                  Modern hero block layout adapted for Tailwind landing patterns. [11]
                </p>
              </div>
            </div>
          </div>

          <div id="features" className="mt-20 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Drag & Drop",
                desc: "Move tasks seamlessly across stages with intuitive DnD.",
              },
              {
                title: "Focus & Clarity",
                desc: "Glass panels with subtle blur keep context crystal-clear.",
              },
              {
                title: "Quick Capture",
                desc: "Add new tasks with a delightful, accessible modal.",
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                <p className="text-slate-300/90">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 pb-10 text-slate-400">
          Built with Vite + React + Tailwind + Supabase. Visual ideas informed by Tailwind hero sections and glassmorphism patterns. [11][9]
        </footer>
      </main>
    );
  }

  // Authenticated: Kanban workspace
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-black" />
      <div className="animated-blur" />
      <header className="max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 grid place-items-center text-indigo-300 font-bold">
            SS
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              SurakshaSetu Board
            </h1>
            <p className="text-xs text-slate-300/80">
              Welcome, {displayName}. Plan safely, ship confidently. [11]
            </p>
          </div>
        </div>
        <button onClick={signOut} className="btn-ghost">
          Sign out
        </button>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <KanbanBoard />
      </section>
    </main>
  );
}
