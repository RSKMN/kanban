import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import KanbanBoard from "./components/KanbanBoard";

export default function App() {
  const [user, setUser] = useState(null as any);

  useEffect(() => {
    // get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="p-4">
      {!user ? (
        <div className="flex flex-col items-center gap-4">
          <p>Please sign in to view your tasks.</p>
          <button
            onClick={signInWithGoogle}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={signOut}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Sign out
            </button>
          </div>
          <KanbanBoard />
        </div>
      )}
    </div>
  );
}
