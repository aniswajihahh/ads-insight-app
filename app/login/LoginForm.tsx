"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "magic" | "password";
type AuthMode = "signin" | "signup";

export default function LoginForm({
  next,
  defaultAuthMode = "signin",
}: {
  next: string;
  defaultAuthMode?: AuthMode;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("magic");
  const [authMode, setAuthMode] = useState<AuthMode>(defaultAuthMode);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const supabase = createClient();

    let error;
    if (authMode === "signin") {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } else {
      ({ error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl() },
      }));
    }

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      router.push(next);
      router.refresh();
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We sent a sign-in link to <strong>{email}</strong>. Click it to continue.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm text-indigo-600 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Ads Insight
          </Link>
          <p className="text-gray-500 text-sm mt-1">
            {authMode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {mode === "magic" ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {status === "loading" ? "Sending…" : "Send magic link"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("password"); setErrorMsg(""); setStatus("idle"); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
            >
              Use password instead →
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {status === "loading" ? "…" : authMode === "signin" ? "Sign in" : "Create account"}
            </button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => setAuthMode((m) => (m === "signin" ? "signup" : "signin"))}
                className="text-gray-500 hover:text-gray-800"
              >
                {authMode === "signin" ? "Need an account?" : "Already have one?"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("magic"); setErrorMsg(""); setStatus("idle"); }}
                className="text-indigo-600 hover:underline"
              >
                ← Magic link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
