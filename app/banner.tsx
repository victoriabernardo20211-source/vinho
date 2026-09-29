export default function Banner() {
  return (
    <section
      className="banner"
      aria-label="Quiz premiado: concorra a um combo especial"
    >
      <svg
        viewBox="0 0 600 220"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Ilustração de fachada de loja de vinhos com a chamada do quiz"
      >
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d61027" />
            <stop offset="1" stopColor="#a30b1e" />
          </linearGradient>
          <linearGradient id="glass" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2b0509" />
            <stop offset="1" stopColor="#5c0a13" />
          </linearGradient>
          <radialGradient id="medal" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#ffe27a" />
            <stop offset="1" stopColor="#c98b16" />
          </radialGradient>
        </defs>

        <rect width="600" height="220" rx="14" fill="url(#bg)" />

        <g opacity="0.95">
          <rect x="14" y="40" width="220" height="160" rx="6" fill="#f0e6d8" />
          <rect x="30" y="60" width="90" height="120" fill="#e6d9c4" />
          <rect x="130" y="60" width="90" height="120" fill="#ead9bd" />
          <rect x="30" y="150" width="190" height="30" fill="#d61027" />
          <text
            x="125"
            y="171"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            fontSize="16"
            fill="#fff"
          >
            10 anos, 10 vinhos.
          </text>
          <g transform="translate(150 70)">
            <path d="M0 0 h34 v20 a17 17 0 0 1 -34 0 z" fill="#d61027" />
            <rect x="15" y="22" width="4" height="26" fill="#d61027" />
            <rect x="6" y="48" width="22" height="4" fill="#d61027" />
          </g>
        </g>

        <g transform="translate(258 44)">
          <ellipse cx="52" cy="30" rx="26" ry="28" fill="#f0c9a4" />
          <path d="M20 60 h64 l14 100 h-92 z" fill="#ffffff" />
          <path d="M42 62 l10 8 l10 -8 l-4 20 h-12 z" fill="#2b0509" />
          <circle cx="52" cy="72" r="3.5" fill="#d61027" />
          <circle cx="52" cy="86" r="3.5" fill="#d61027" />
          <path d="M40 58 l12 6 l12 -6 l-4 14 l-16 0 z" fill="#7a0b17" />
          <rect x="34" y="66" width="4" height="92" fill="#2b0509" />
          <rect x="66" y="66" width="4" height="92" fill="#2b0509" />
          <g transform="translate(-8 90)">
            <path d="M0 0 h26 v14 a13 13 0 0 1 -26 0 z" fill="url(#glass)" />
            <rect x="11" y="14" width="4" height="22" fill="#f0e6d8" />
            <rect x="4" y="36" width="18" height="4" fill="#f0e6d8" />
          </g>
        </g>

        <g transform="translate(378 46)">
          <circle
            cx="26"
            cy="26"
            r="26"
            fill="url(#medal)"
            stroke="#7a5610"
            strokeWidth="2"
          />
          <path
            d="M26 12 l4 8 l9 1 l-6.5 6 l1.5 9 l-8 -4.5 l-8 4.5 l1.5 -9 l-6.5 -6 l9 -1 z"
            fill="#7a5610"
          />
          <path
            d="M12 46 l6 22 l8 -10 l8 10 l6 -22"
            fill="#d61027"
            stroke="#7a0b17"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>

        <g fontFamily="Inter, sans-serif" fill="#ffffff">
          <text x="450" y="80" fontWeight="500" fontSize="18">
            Quiz premiado:
          </text>
          <text x="450" y="112" fontWeight="800" fontSize="24">
            Concorra a
          </text>
          <text x="450" y="140" fontWeight="800" fontSize="24">
            um Combo
          </text>
          <text x="450" y="168" fontWeight="800" fontSize="24">
            Especial.
          </text>
          <g transform="translate(450 184)">
            <circle
              cx="8"
              cy="8"
              r="7"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path
              d="M8 4 v5 l3 2"
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <text
              x="22"
              y="12"
              fontWeight="600"
              fontSize="10"
              letterSpacing="1.5"
            >
              POR TEMPO LIMITADO
            </text>
          </g>
        </g>
      </svg>
    </section>
  );
}
