import { API_BASE } from "./apiBase";

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** Read a File as a base64 string (without the `data:...;base64,` prefix). */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Failed to read the image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image via the server proxy (which forwards to ImgBB with a
 * server-side key) and return the hosted URL.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadImageToImgBB = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }
  if (!VALID_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be less than 5MB");
  }

  const base64 = await fileToBase64(file);

  const response = await fetch(`${API_BASE}/api/upload/image`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, type: file.type }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Failed to upload image");
  }
  return data.url;
};
