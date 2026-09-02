export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-2xl bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}