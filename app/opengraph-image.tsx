import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Yugma — ruang privat pasangan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

let iconSrc = "";
try {
  const iconBase64 = readFileSync(join(process.cwd(), "public", "Yugma-Icon.svg")).toString("base64");
  iconSrc = `data:image/svg+xml;base64,${iconBase64}`;
} catch {
  iconSrc = "";
}

async function loadGoogleFont(font: string, weight: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&display=swap`,
      { next: { revalidate: 86400 } },
    ).then((res) => res.text());

    const resource = css.match(/src:\s*url\(([^)]+)\)/);
    if (!resource?.[1]) return null;
    const url = resource[1].replace(/["']/g, "");
    return fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const playfairItalic = await loadGoogleFont("Playfair+Display", "400");
  const geistRegular = await loadGoogleFont("Inter", "400");
  const geistMedium = await loadGoogleFont("Inter", "500");
  const geistBold = await loadGoogleFont("Inter", "700");

  const fonts: any[] = [];
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
  if (geistBold) {
    fonts.push({
      name: "Geist",
      data: geistBold,
      style: "normal" as const,
      weight: 700 as const,
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
            background:
              "radial-gradient(circle, rgba(185,120,134,0.35) 0%, rgba(185,120,134,0.05) 70%)",
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
            background:
              "radial-gradient(circle, rgba(113,59,74,0.28) 0%, rgba(113,59,74,0.03) 70%)",
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

        {/* Dot pattern — top left */}
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

        {/* Dot pattern — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 60,
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

        {/* ============ MAIN CONTENT ============ */}

        {/* Logo besar di tengah */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            height: 260,
            borderRadius: 60,
            background: "rgba(255,255,255,0.85)",
            border: "2px solid rgba(113,59,74,0.12)",
            boxShadow:
              "0 20px 60px rgba(113,59,74,0.15), 0 4px 12px rgba(113,59,74,0.08)",
            marginBottom: 40,
          }}
        >
          <img
            src={iconSrc}
            alt=""
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Wordmark YUGMA */}
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "0.42em",
            color: "#2B1B22",
            marginBottom: 24,
            paddingLeft: "0.42em",
          }}
        >
          YUGMA
        </span>

        {/* Divider dengan heart */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 120,
              height: 1,
              background: "linear-gradient(90deg, transparent, #B97886)",
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#B97886",
              display: "flex",
              alignItems: "center",
            }}
          >
            ♡
          </div>
          <div
            style={{
              width: 120,
              height: 1,
              background: "linear-gradient(90deg, #B97886, transparent)",
            }}
          />
        </div>

        {/* Tagline */}
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: 28,
            fontWeight: 400,
            color: "#6F5E66",
            letterSpacing: "0.02em",
          }}
        >
          Dua pribadi, satu perjalanan.
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