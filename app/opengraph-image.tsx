import { ImageResponse } from "next/og";

export const alt = "Yugma — ruang privat pasangan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://our-little-world-blond.vercel.app";

async function loadGoogleFont(font: string, weight: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&display=swap`,
      { next: { revalidate: 86400 } },
    ).then((res) => res.text());

    const resource = css.match(/src: url\((.+?)\) format\('woff2'\)/);
    if (!resource?.[1]) return null;
    return fetch(resource[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const playfairBold = await loadGoogleFont("Playfair+Display", "700");
  const playfairItalic = await loadGoogleFont("Playfair+Display", "400");
  const geistRegular = await loadGoogleFont("Geist", "400");
  const geistMedium = await loadGoogleFont("Geist", "500");

  const fonts: any[] = [];
  if (playfairBold) {
    fonts.push({
      name: "Playfair Display",
      data: playfairBold,
      style: "normal" as const,
      weight: 700 as const,
    });
  }
  if (playfairItalic) {
    fonts.push({
      name: "Playfair Display",
      data: playfairItalic,
      style: "italic" as const,
      weight: 400 as const,
    });
  }
  if (geistRegular) {
    fonts.push({
      name: "Geist",
      data: geistRegular,
      style: "normal" as const,
      weight: 400 as const,
    });
  }
  if (geistMedium) {
    fonts.push({
      name: "Geist",
      data: geistMedium,
      style: "normal" as const,
      weight: 500 as const,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6F1",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ============ BACKGROUND DECORATION ============ */}

        {/* Gradient top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #713B4A 0%, #B97886 50%, #713B4A 100%)",
          }}
        />

        {/* Big soft blob — top right */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(185,120,134,0.35) 0%, rgba(185,120,134,0.05) 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Big soft blob — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(113,59,74,0.28) 0%, rgba(113,59,74,0.03) 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Small accent blob — mid right */}
        <div
          style={{
            position: "absolute",
            top: 280,
            right: 80,
            width: 180,
            height: 180,
            borderRadius: 9999,
            background: "rgba(185,120,134,0.15)",
            filter: "blur(40px)",
          }}
        />

        {/* Subtle dot pattern — top left */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            display: "flex",
            flexWrap: "wrap",
            width: 120,
            gap: 16,
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: 9999,
                background: "#713B4A",
              }}
            />
          ))}
        </div>

        {/* ============ LOGO + WORDMARK ============ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
            padding: "12px 28px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(113,59,74,0.12)",
            boxShadow: "0 4px 20px rgba(113,59,74,0.06)",
          }}
        >
          <img
            src={`${baseUrl}/Yugma-Icon.svg`}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "0.32em",
              color: "#6B2D39",
            }}
          >
            YUGMA
          </span>
        </div>

        {/* ============ MAIN HEADLINE ============ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 100px",
            textAlign: "center",
          }}
        >
          {/* Italic accent line */}
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: 32,
              fontWeight: 400,
              color: "#B97886",
              marginBottom: 16,
              letterSpacing: "0.02em",
            }}
          >
            Dua pribadi.
          </span>

          {/* Main serif headline */}
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: "1.05",
              color: "#2B1B22",
              letterSpacing: "-0.025em",
            }}
          >
            Satu ikatan.
          </span>

          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: "1.05",
              color: "#713B4A",
              letterSpacing: "-0.025em",
              marginTop: 4,
            }}
          >
            Satu perjalanan.
          </span>
        </div>

        {/* ============ DIVIDER + TAGLINE ============ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 40,
          }}
        >
          {/* Left line */}
          <div
            style={{
              width: 80,
              height: 1,
              background: "linear-gradient(90deg, transparent, #B97886)",
            }}
          />
          {/* Heart icon */}
          <div
            style={{
              fontSize: 20,
              color: "#B97886",
              display: "flex",
              alignItems: "center",
            }}
          >
            ♡
          </div>
          {/* Right line */}
          <div
            style={{
              width: 80,
              height: 1,
              background: "linear-gradient(90deg, #B97886, transparent)",
            }}
          />
        </div>

        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: 22,
            fontWeight: 400,
            color: "#6F5E66",
            marginTop: 20,
            letterSpacing: "0.04em",
          }}
        >
          A private space for two
        </span>

        {/* ============ FOOTER ============ */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: "#B97886",
            }}
          />
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: "#806F76",
              textTransform: "uppercase",
            }}
          >
            our-little-world-blond.vercel.app
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: "#B97886",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    },
  );
}