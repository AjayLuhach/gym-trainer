"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("trainer_username");
    if (stored) setUsername(stored);
    setLoading(false);
  }, []);

  function handleLogin() {
    const name = inputName.trim();
    if (!name) return;
    localStorage.setItem("trainer_username", name);
    setUsername(name);
  }

  function handleLogout() {
    localStorage.removeItem("trainer_username");
    setUsername(null);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-3xl font-bold text-orange-400">Kaam Chlra</h1>
          <p className="text-zinc-400 mt-2">Daily Workout Tracker</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none text-lg"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!inputName.trim()}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-semibold text-lg transition-colors"
          >
            Let&apos;s Go
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <p className="text-zinc-400">Welcome, <span className="text-orange-400">{username}</span></p>
      <button onClick={handleLogout} className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">
        Switch User
      </button>
    </div>
  );
}
