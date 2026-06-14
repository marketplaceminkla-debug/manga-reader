// MangaFinn Logo — manga page with bookmark + star
// Dipakai di navbar, loading screen, dll.

interface LogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export default function MangaFinnLogo({ size = 36, animated = false, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MangaFinn logo"
    >
      {/* Background rounded rect — dark panel */}
      <rect width="36" height="36" rx="8" fill="#1E2D3D" />

      {/* Manga page body */}
      <rect x="8" y="6" width="16" height="22" rx="2" fill="#F8FAFC" />

      {/* Page lines */}
      <line x1="11" y1="12" x2="21" y2="12" stroke="#1E2D3D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="15.5" x2="21" y2="15.5" stroke="#1E2D3D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="19" x2="17" y2="19" stroke="#1E2D3D" strokeWidth="1.5" strokeLinecap="round" />

      {/* Purple bookmark ribbon */}
      <path d="M20 6 L26 6 L26 18 L23 15.5 L20 18 Z" fill="#7C3AED" />

      {/* Star on bookmark */}
      <path
        d="M23 9.5 L23.5 11 L25 11 L23.8 11.9 L24.3 13.4 L23 12.5 L21.7 13.4 L22.2 11.9 L21 11 L22.5 11 Z"
        fill="#F59E0B"
      />

      {/* Pink accent dot bottom-right */}
      <circle cx="26" cy="27" r="4" fill="#FB7185" />
      <path d="M24.5 27 L25.5 28 L27.5 26" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
