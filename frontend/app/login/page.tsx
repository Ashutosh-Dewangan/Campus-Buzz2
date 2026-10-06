"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCurrentUser, useCurrentUser, DEMO_PERSONAS } from "@/lib/session";
import { UserRole } from "@/types";
import { AlertCircleIcon } from "@/components/ui/Icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getSafeRedirectTarget(target: string | null): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return "/buzz";
  }

  try {
    const baseUrl = new URL("https://campusbuzz.invalid");
    const url = new URL(target, baseUrl);
    return url.origin === baseUrl.origin && url.pathname !== "/login"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/buzz";
  } catch {
    return "/buzz";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirectTarget(searchParams.get("redirect"));
  const currentUser = useCurrentUser();

  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (currentUser) {
      router.replace(redirectTarget);
    }
  }, [currentUser, redirectTarget, router]);

  function handleDemoLogin(role: UserRole) {
    const persona = DEMO_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona, `mock-demo-token-${role.toLowerCase()}`);
      router.push(redirectTarget);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedRoll = rollNumber.trim();
    const trimmedEmail = email.trim();

    // Roll number validation
    if (!trimmedRoll) {
      setError("Roll number is required.");
      return;
    }

    if (trimmedRoll.length < 2) {
      setError("Please enter a valid campus roll number (at least 2 characters).");
      return;
    }

    // Institute email validation
    if (!trimmedEmail) {
      setError("Institute email is required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid institute email address format (e.g. student@nitkkr.ac.in).");
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
          rollNumber: trimmedRoll,
          instituteEmail: trimmedEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid roll number or institute email. Please check your credentials.");
        } else if (response.status === 400 && data?.errors && Array.isArray(data.errors)) {
          const validationMsg = data.errors
            .map((e: { message?: string }) => e.message)
            .filter(Boolean)
            .join(". ");
          setError(validationMsg || "Invalid credentials provided.");
        } else {
          setError(data?.message || data?.error || `Login failed (${response.status})`);
        }
        return;
      }

      if (!data?.token || !data?.user) {
        setError("Invalid response received from authentication server.");
        return;
      }

      setCurrentUser(
        {
          id: data.user.id,
          name: data.user.name,
          rollNumber: data.user.rollNumber,
          email: data.user.instituteEmail,
          role: data.user.role,
          memberships: data.user.memberships ?? [],
        },
        data.token,
      );

      router.push(redirectTarget);
    } catch {
      setError("Unable to reach the authentication server. Please verify the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
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
            disabled={isLoading}
            onChange={(e) => {
              setRollNumber(e.target.value);
              if (error) setError("");
            }}
            className="comic-input w-full px-4 py-2.5 text-xs text-[var(--fg)] outline-none disabled:opacity-50"
            placeholder="e.g. 23CS1004 or STUDENT001"
            autoComplete="username"
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
            disabled={isLoading}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className="comic-input w-full px-4 py-2.5 text-xs text-[var(--fg)] outline-none disabled:opacity-50"
            placeholder="e.g. student@nitkkr.ac.in or student@campusbuzz.test"
            autoComplete="email"
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
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--neon-yellow)]">
            Demo Feature: Quick Persona Switcher
          </p>
          <span className="tag-pill tag-lost text-[8px] px-1 py-0 leading-tight">Local Preview</span>
        </div>
        <p className="text-[10px] text-[var(--fg-muted)] mb-3 leading-tight font-readable">
          Simulates client-side role views for development. Does not bypass backend API authorization.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin("STUDENT")}
            className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            Student
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin("CLUB")}
            className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            Coding Club
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin("COMMITTEE")}
            className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            Committee
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin("ADMIN")}
            className="comic-btn-outline text-[10px] py-1.5 px-2 text-center font-bold cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="comic-page flex items-center justify-center py-10">
      <Suspense fallback={<div className="comic-card w-full max-w-md p-8 animate-pulse h-96" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
