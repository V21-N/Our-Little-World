"use client";

const CLIENT_MAX_SIZE_MB = 7.5;

function isHeic(file: File) {
  return /image\/hei[cf]|\.hei[cf]$/i.test(`${file.type} ${file.name}`);
}

export async function prepareImageUpload(file: File) {
  if (typeof window === "undefined") return file;

  let source: File = file;

  if (isHeic(file)) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    source = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  if (source.size <= CLIENT_MAX_SIZE_MB * 1024 * 1024) return source;

  const { default: imageCompression } = await import("browser-image-compression");
  return imageCompression(source, {
    maxSizeMB: CLIENT_MAX_SIZE_MB,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
  });
}
