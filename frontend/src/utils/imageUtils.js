// imageUtils.js
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const getNormalizedImageName = (imageName) => {
  if (!imageName) return null;
  return imageName
    .toLowerCase()
    .trim()
    .replace(/^\s*-+/, "") // Remove leading dashes
    .replace(/\s+/g, "-") + ".jpg"; // Replace spaces with dashes and add .jpg
};

export const fetchImageUrl = async (imageName) => {
  const storage = getStorage();
  const normalizedImageName = getNormalizedImageName(imageName);
  if (!normalizedImageName) return "/images/placeholder.jpg";

  try {
    const imageRef = ref(storage, `Recipe_Pictures/${normalizedImageName}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.warn(`Image not found: ${normalizedImageName}, retrying...`);
  }

  try {
    const fallbackImageRef = ref(storage, `Recipe_Pictures/-${normalizedImageName}`);
    return await getDownloadURL(fallbackImageRef);
  } catch (retryError) {
    console.error("Image fetch failed:", retryError);
    return "/images/placeholder.jpg";
  }
};
