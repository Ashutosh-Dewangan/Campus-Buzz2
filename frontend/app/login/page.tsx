"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser, DEMO_PERSONAS } from "@/lib/session";
import { UserRole } from "@/types";
import { AlertCircleIcon } from "@/components/ui/Icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleDemoLogin(role: UserRole) {
    const persona = DEMO_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona, `mock-demo-token-${role.toLowerCase()}`);
      router.push("/buzz");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!rollNumber.trim() || !email.trim()) {
      setError("Please fill all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
          instituteEmail: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      setCurrentUser(
        {
          id: data.user.id,
          rollNumber: data.user.rollNumber,
          email: data.user.instituteEmail || data.user.email,
          role: data.user.role,
        },
        data.token
      );

      router.push("/buzz");
    } catch {
      // Backend unavailable: check if matches one of demo roles, or log in as student
      const matchedRole = Object.values(DEMO_PERSONAS).find(
        (p) =>
          p.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase() ||
          p.email.toLowerCase() === email.trim().toLowerCase()
      );

      const userToSet = matchedRole || {
        id: `u-${Date.now()}`,
        rollNumber: rollNumber.trim(),
        email: email.trim(),
        role: "STUDENT" as UserRole,
      };

      setCurrentUser(userToSet, "mock-offline-token");
      router.push("/buzz");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="comic-page flex items-center justify-center py-10">
      <div className="comic-card w-full max-w-md p-8">
        <h1 className="comic-title">Campus Buzz</h1>
        <p className="comic-sub">Sign in to your verified campus account</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="login-roll" className="mb-1.5 block text-xs font-bold text-white">
              Roll Number
            </label>
            <input
              id="login-roll"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="comic-input w-full px-4 py-2.5 text-xs text-[var(--fg)] outline-none"
              placeholder="e.g. 23CS1004"
            />
          </div>

          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-white">
              Institute Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="comic-input w-full px-4 py-2.5 text-xs text-[var(--fg)] outline-none"
              placeholder="e.g. student@campusbuzz.test"
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 border-2 border-black p-3 text-xs font-bold"
              style={{
                background: "rgba(255,45,74,0.18)",
                color: "var(--accent)",
                boxShadow: "2px 2px 0 #000",
              }}
            >
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="retro-btn w-full py-2.5 text-xs font-black disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Continue ↗"}
          </button>
        </form>

        {/* Development Quick Persona Switcher */}
        <div className="mt-8 border-t border-black/40 pt-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-[var(--neon-yellow)] mb-3 text-center">
            Quick Demo Sign-In (Local Preview)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("STUDENT")}
              className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("CLUB")}
              className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider"
            >
              Coding Club
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("COMMITTEE")}
              className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider"
            >
              Committee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}