import { createHash } from "crypto";
import { ApiError } from "./api";

/** Signed upload straight to Cloudinary's REST API (no SDK needed). Returns the secure URL. */
export async function uploadImage(file: File, folder = "celestia-estates") {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new ApiError(500, "Image storage is not configured");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", key);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new ApiError(502, "Image upload failed");
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
