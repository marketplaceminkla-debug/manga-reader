import type { CountryCode } from "@/lib/mangaType";

// Path bintang 5 sudut (lebar ~20, tinggi ~19, pusat ~ (12, 11.5))
const STAR =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function Star({
  cx,
  cy,
  size,
  rotate = 0,
  fill = "#ffde00",
}: {
  cx: number;
  cy: number;
  size: number;
  rotate?: number;
  fill?: string;
}) {
  const s = size / 20;
  return (
    <path
      d={STAR}
      fill={fill}
      transform={`translate(${cx} ${cy}) scale(${s}) rotate(${rotate}) translate(-12 -11.5)`}
    />
  );
}

/**
 * Bendera negara sebagai inline SVG (Jepang, Korea, China).
 * Dipakai untuk menandai tipe komik di library.
 */
export default function CountryFlag({
  code,
  className,
  title,
}: {
  code: CountryCode;
  className?: string;
  title?: string;
}) {
  const common = {
    viewBox: "0 0 30 20",
    className,
    role: "img" as const,
    "aria-label": title,
    preserveAspectRatio: "xMidYMid meet",
  };

  if (code === "jp") {
    return (
      <svg {...common}>
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="5.5" fill="#bc002d" />
        <rect width="30" height="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      </svg>
    );
  }

  if (code === "cn") {
    return (
      <svg {...common}>
        <rect width="30" height="20" fill="#de2910" />
        <Star cx={6} cy={6} size={7.5} />
        <Star cx={11.5} cy={2.3} size={2.6} rotate={20} />
        <Star cx={14.3} cy={4.8} size={2.6} rotate={45} />
        <Star cx={14.3} cy={8.6} size={2.6} rotate={70} />
        <Star cx={11.5} cy={11} size={2.6} rotate={20} />
      </svg>
    );
  }

  // Korea Selatan — taegeuk + (penyederhanaan) trigram di tiap sudut.
  return (
    <svg {...common}>
      <rect width="30" height="20" fill="#fff" />
      <g transform="rotate(-33.69 15 10)">
        {/* Taegeuk */}
        <circle cx="15" cy="10" r="5" fill="#003478" />
        <path
          d="M15 5 A5 5 0 0 1 15 15 A2.5 2.5 0 0 0 15 10 A2.5 2.5 0 0 1 15 5 Z"
          fill="#c60c30"
        />
        {/* Trigram (disederhanakan jadi 3 bilah per sudut) */}
        <g fill="#000">
          {/* kiri-atas ☰ */}
          <rect x="3.4" y="1.6" width="4.2" height="0.9" />
          <rect x="3.4" y="3.0" width="4.2" height="0.9" />
          <rect x="3.4" y="4.4" width="4.2" height="0.9" />
          {/* kanan-atas */}
          <rect x="22.4" y="1.6" width="4.2" height="0.9" />
          <rect x="22.4" y="3.0" width="4.2" height="0.9" />
          <rect x="22.4" y="4.4" width="4.2" height="0.9" />
          {/* kiri-bawah */}
          <rect x="3.4" y="14.7" width="4.2" height="0.9" />
          <rect x="3.4" y="16.1" width="4.2" height="0.9" />
          <rect x="3.4" y="17.5" width="4.2" height="0.9" />
          {/* kanan-bawah */}
          <rect x="22.4" y="14.7" width="4.2" height="0.9" />
          <rect x="22.4" y="16.1" width="4.2" height="0.9" />
          <rect x="22.4" y="17.5" width="4.2" height="0.9" />
        </g>
      </g>
      <rect width="30" height="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  );
}
