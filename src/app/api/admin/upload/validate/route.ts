import { NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { valid: false, error: "imageUrl is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { valid: false, error: "Invalid URL format" },
        { status: 200 }
      );
    }

    // Try to fetch the image
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      
      if (!response.ok) {
        return NextResponse.json(
          { valid: false, error: `Failed to fetch image: ${response.statusText}` },
          { status: 200 }
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
        return NextResponse.json(
          {
            valid: false,
            error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          },
          { status: 200 }
        );
      }

      // If HEAD doesn't work, try GET with range
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (size > maxSize) {
          return NextResponse.json(
            { valid: false, error: "Image size exceeds 10MB limit" },
            { status: 200 }
          );
        }
      }

      return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        {
          valid: false,
          error: error.message || "Failed to validate image URL",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json(
      {
        valid: false,
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 200 }
    );
  }
}

