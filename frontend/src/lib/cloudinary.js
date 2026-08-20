import { API_BASE } from "./api/client";

export function isCloudinaryConfigured() {
  return true;
}

export async function uploadToCloudinary(file, folder = "krishi-mitra") {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const headers = {};
  try {
    const raw = localStorage.getItem("krishi-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (e) {}

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers,
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message || "Image upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}

export async function uploadManyToCloudinary(files, folder) {
  return Promise.all(files.map((file) => uploadToCloudinary(file, folder)));
}
