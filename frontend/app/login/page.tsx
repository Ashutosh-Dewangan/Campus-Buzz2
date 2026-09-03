"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!rollNumber.trim() || !email.trim()) {
      setError("Please fill all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rollNumber: rollNumber.trim(),
            instituteEmail: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Login failed"
        );
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Campus Buzz
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to your campus account
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label htmlFor="login-roll" className="mb-2 block text-sm font-medium text-gray-700">
              Roll Number
            </label>

            <input
              id="login-roll"
              value={rollNumber}
              onChange={(e) =>
                setRollNumber(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              placeholder="STUDENT001"
            />
          </div>

          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-gray-700">
              Institute Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              placeholder="student@campusbuzz.test"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}