"use client";

export default function PrintButton({ sheetId }: { sheetId: string }) {
  return (
    <a
      href={`/print/${sheetId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
    >
      PDF nyomtatás
    </a>
  );
}
