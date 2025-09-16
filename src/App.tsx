import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import KanbanBoard from "./components/KanbanBoard";

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-indigo-600">Kanban App</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-gray-700">{user.email}</p>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Sign in with Google
          </button>
        )}
      </header>

      <main className="p-6">
        {user ? <KanbanBoard /> : <p className="text-gray-600">Please sign in to view your tasks.</p>}
      </main>
    </div>
  );
}
