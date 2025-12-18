export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">This section is next.</p>
      </div>
    </div>
  );
}
