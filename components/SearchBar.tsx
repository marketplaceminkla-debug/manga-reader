"use client";

export default function SearchBar({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/" className="flex gap-2">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari judul manga..."
        className="flex-1 px-4 py-3 text-sm rounded-xl focus-ring placeholder:text-muted outline-none transition-all duration-200"
        style={{
          background: "#0F1923",
          border: "1px solid #1E2D3D",
          color: "#F8FAFC",
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "#7C3AED";
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "#1E2D3D";
        }}
      />
      <button
        type="submit"
        className="px-5 py-3 text-sm font-mono font-bold uppercase rounded-xl transition-all duration-200 focus-ring hover:opacity-90 hover:scale-[0.98] active:scale-95"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
          color: "#F8FAFC",
          boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
        }}
      >
        Cari
      </button>
    </form>
  );
}
