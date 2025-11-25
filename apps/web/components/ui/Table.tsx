export function Table({
  headers,
  children
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            {headers.map(h => (
              <th
                key={h}
                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {children}
        </tbody>
      </table>
    </div>
  );
}
