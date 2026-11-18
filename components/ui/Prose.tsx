/** Minimal, safe renderer for blog text: blank line = paragraph, "## " = heading. */
export default function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 leading-relaxed text-slate-700">
      {text.split(/\n{2,}/).map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="pt-4 text-2xl font-semibold text-brand">{block.slice(3)}</h2>
        ) : (
          <p key={i} className="whitespace-pre-line">{block}</p>
        )
      )}
    </div>
  );
}
