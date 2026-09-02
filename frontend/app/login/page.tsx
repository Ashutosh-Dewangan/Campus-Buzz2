"use client";

import { useState } from "react";

export default function LoginPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!rollNumber || !email) {
      alert("Please fill all fields.");
      return;
    }

    alert("Verification code sent.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">
          Campus Buzz
        </h1>

        <p className="mt-2 text-gray-500">
          Sign in to your campus account
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Roll Number
            </label>

            <input
              value={rollNumber}
              onChange={(e) =>
                setRollNumber(e.target.value)
              }
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Institute Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black py-3 font-semibold text-white"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}