// Server component — renders a JSON-LD <script> tag inline in the document.
// No "use client" needed; no browser APIs used.
export default function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
