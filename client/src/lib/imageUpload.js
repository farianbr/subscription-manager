/**
 * Upload an image to ImgBB and return the URL
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadImageToImgBB = async (file) => {
  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.");
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("Image must be less than 5MB");
  }

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("ImgBB API key is not configured");
  }

  // Create form data
  const formData = new FormData();
  formData.append("image", file);

  try {
    // Upload to ImgBB
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success && data.data?.url) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error(error.message || "Failed to upload image");
  }
};
