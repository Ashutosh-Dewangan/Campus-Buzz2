"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">
        Something went wrong
      </h2>

      <button
        onClick={() => reset()}
        className="mt-4 rounded-xl bg-black px-5 py-2 text-white"
      >
        Try Again
      </button>
    </div>
  );
}