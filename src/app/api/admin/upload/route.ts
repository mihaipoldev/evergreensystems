import { uploadToBunny } from "@/lib/bunny";
import { NextResponse } from "next/server";

// Route segment config for handling large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large video uploads

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
  "video/ogg",
  "video/x-matroska", // .mkv
];

export async function POST(request: Request) {
  try {
    // Parse FormData - Next.js handles this automatically for multipart/form-data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error: any) {
      console.error("FormData parsing error:", error);
      const contentType = request.headers.get("content-type");
      return NextResponse.json(
        { 
          error: `Failed to parse FormData. Content-Type: ${contentType || "not set"}. Error: ${error?.message || "Unknown error"}` 
        },
        { status: 400 }
      );
    }

    const folderPath = formData.get("folderPath") as string;
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const mediaUrl = formData.get("mediaUrl") as string | null;

    if (!folderPath) {
      return NextResponse.json(
        { error: "folderPath is required" },
        { status: 400 }
      );
    }

    let fileBuffer: Buffer;
    let originalFilename: string;
    let extension: string;
    let isVideo = false;

    if (file) {
      // Determine if it's an image or video
      const isImageType = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideoType = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImageType && !isVideoType) {
        return NextResponse.json(
          {
            error: `Invalid file type. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      isVideo = isVideoType;

      // Validate file size based on type
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / 1024 / 1024;
        const maxSizeGB = maxSize / 1024 / 1024 / 1024;
        const sizeLabel = isVideo ? `${maxSizeGB}GB` : `${maxSizeMB}MB`;
        return NextResponse.json(
          { error: `File size exceeds maximum of ${sizeLabel}` },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      originalFilename = file.name;
      extension = originalFilename.split(".").pop() || (isVideo ? "mp4" : "jpg");
    } else if (imageUrl || mediaUrl) {
      const url = imageUrl || mediaUrl;
      // Download media from URL
      const response = await fetch(url!);
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to download media from URL: ${response.statusText}` },
          { status: 400 }
        );
      }

      const contentType = response.headers.get("content-type");
      const isImageType = contentType && ALLOWED_IMAGE_TYPES.includes(contentType);
      const isVideoType = contentType && ALLOWED_VIDEO_TYPES.includes(contentType);

      if (!isImageType && !isVideoType) {
        return NextResponse.json(
          {
            error: `Invalid media type from URL. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      isVideo = !!isVideoType;

      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Validate size based on type
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (fileBuffer.length > maxSize) {
        const maxSizeMB = maxSize / 1024 / 1024;
        const maxSizeGB = maxSize / 1024 / 1024 / 1024;
        const sizeLabel = isVideo ? `${maxSizeGB}GB` : `${maxSizeMB}MB`;
        return NextResponse.json(
          { error: `File size exceeds maximum of ${sizeLabel}` },
          { status: 400 }
        );
      }

      // Extract extension from URL or content type
      const urlPath = new URL(url!).pathname;
      const urlExtension = urlPath.split(".").pop();
      if (urlExtension && urlExtension.length <= 5) {
        extension = urlExtension;
        // Also check extension to determine if it's a video
        const videoExtensions = ["mp4", "mov", "avi", "webm", "ogg", "mkv"];
        if (videoExtensions.includes(extension.toLowerCase())) {
          isVideo = true;
        }
      } else {
        // Fallback to extension from content type
        extension = contentType?.split("/")[1] || (isVideo ? "mp4" : "jpg");
      }
      originalFilename = `${isVideo ? "video" : "image"}_${Date.now()}.${extension}`;
    } else {
      return NextResponse.json(
        { error: "Either 'file', 'imageUrl', or 'mediaUrl' must be provided" },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const prefix = isVideo ? "video" : "image";
    const filename = `${prefix}_${timestamp}.${extension}`;
    const uploadPath = `${folderPath}/${filename}`.replace(/\/+/g, "/"); // Remove duplicate slashes

    // Upload to Bunny
    const cdnUrl = await uploadToBunny(fileBuffer, uploadPath);

    return NextResponse.json({ url: cdnUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
