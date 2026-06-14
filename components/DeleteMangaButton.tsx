"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteMangaButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus "${title}" beserta semua chapter dan halamannya?`)) {
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("manga").delete().eq("id", id);
    setLoading(false);
    if (error) {
      alert("Gagal menghapus: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-mono border border-line px-3 py-2 hover:bg-stamp hover:border-stamp focus-ring disabled:opacity-50"
    >
      {loading ? "..." : "Hapus"}
    </button>
  );
}
