import { ImageResponse } from "next/og";

export const alt = "Yugma — ruang privat pasangan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const baseUrl =
  process.env.VERCEL_URL
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
    const binary = await fetch(resource[1]).then((res) => res.arrayBuffer());
    return binary;
  } catch {
    return null;
  }
}

export default async function Image() {
  const playfairBold = await loadGoogleFont("Playfair+Display", "700");
  const geistRegular = await loadGoogleFont("Geist", "400");
  const geistMedium = await loadGoogleFont("Geist", "500");

  const fonts = [];
  if (playfairBold) {
    fonts.push({ name: "Playfair Display", data: playfairBold, style: "normal" as const, weight: 700 as const });
  }
  if (geistRegular) {
    fonts.push({ name: "Geist", data: geistRegular, style: "normal" as const, weight: 400 as const });
  }
  if (geistMedium) {
    fonts.push({ name: "Geist", data: geistMedium, style: "normal" as const, weight: 500 as const });
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
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "rgba(185,120,134,0.18)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -100,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(113,59,74,0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #713B4A, #B97886)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <img
            src={`${baseUrl}/Yugma-Icon.svg`}
            alt=""
            width={56}
            height={56}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "0.28em",
              color: "#6B2D39",
            }}
          >
            YUGMA
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: "1.12",
              color: "#2B1B22",
              letterSpacing: "-0.02em",
            }}
          >
            Dua pribadi.
            <br />
            Satu ikatan. Satu perjalanan.
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontFamily: "Geist, sans-serif",
            fontSize: 24,
            fontWeight: 400,
            color: "#6F5E66",
            marginTop: 28,
          }}
        >
          A private space for two
        </span>

        {/* Footer */}
        <span
          style={{
            position: "absolute",
            bottom: 28,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontFamily: "Geist, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: "0.12em",
            color: "#806F76",
            textTransform: "uppercase",
          }}
        >
          Yugma · ruang privat pasangan
        </span>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    },
  );
}