export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[80vh] items-center justify-center text-gray-400 flex-col gap-4">
      <div className="text-6xl">🚧</div>
      <h2 className="text-2xl font-semibold text-gray-700">{title} Page</h2>
      <p>This module will be connected to the backend soon.</p>
    </div>
  );
}