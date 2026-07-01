"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSheetButton({ sheetId }: { sheetId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sheets/${sheetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Törlés sikertelen. Kérlek próbáld újra.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
        >
          {deleting ? "..." : "Igen, törlés"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Mégse
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border"
      title="Munkalap törlése"
    >
      ✕
    </button>
  );
}
