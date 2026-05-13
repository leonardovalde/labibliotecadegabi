import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Downloads an image from a URL and uploads it to Cloudinary.
 * Returns the permanent Cloudinary URL, or the original URL if it fails.
 */
export async function uploadCover(sourceUrl: string, bookId: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      public_id: `book-covers/${bookId}`,
      overwrite: true,
      fetch_format: 'auto',
      quality: 'auto',
    });
    return result.secure_url;
  } catch (e) {
    console.error('[cloudinary] upload failed:', e);
    return sourceUrl; // fallback to original
  }
}
