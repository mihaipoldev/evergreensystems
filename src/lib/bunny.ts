/**
 * Bunny CDN Storage Library
 * Server-only module for interacting with Bunny CDN storage
 */

/**
 * Validates that all required Bunny CDN environment variables are set
 * This is called lazily when functions are invoked, not at module load time
 */
function validateBunnyEnv() {
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
  const BUNNY_PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL;

  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_PULL_ZONE_URL) {
    throw new Error(
      "Missing required Bunny CDN environment variables. Please set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, and BUNNY_PULL_ZONE_URL."
    );
  }
}

function getBunnyConfig() {
  validateBunnyEnv();
  return {
    BUNNY_STORAGE_ZONE: process.env.BUNNY_STORAGE_ZONE!,
    BUNNY_STORAGE_PASSWORD: process.env.BUNNY_STORAGE_PASSWORD!,
    BUNNY_PULL_ZONE_URL: process.env.BUNNY_PULL_ZONE_URL!,
    BUNNY_STORAGE_HOSTNAME:
      process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com",
  };
}

/**
 * Uploads a file to Bunny CDN storage
 * @param fileBuffer - The file buffer to upload
 * @param path - The path where the file should be stored (e.g., "artists/temp/image_123.jpg")
 * @returns The CDN URL of the uploaded file
 */
export async function uploadToBunny(
  fileBuffer: Buffer,
  path: string
): Promise<string> {
  const config = getBunnyConfig();
  const url = `https://${config.BUNNY_STORAGE_HOSTNAME}/${config.BUNNY_STORAGE_ZONE}/${path}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: config.BUNNY_STORAGE_PASSWORD,
      "Content-Type": "application/octet-stream",
    } as HeadersInit,
    body: fileBuffer as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to upload to Bunny CDN: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  // Construct and return the CDN URL
  let pullZoneUrl = config.BUNNY_PULL_ZONE_URL.replace(/\/$/, ""); // Remove trailing slash
  // Ensure the URL has a protocol
  if (!pullZoneUrl.startsWith("http://") && !pullZoneUrl.startsWith("https://")) {
    pullZoneUrl = `https://${pullZoneUrl}`;
  }
  const cdnUrl = `${pullZoneUrl}/${path}`;
  return cdnUrl;
}

/**
 * Deletes a file from Bunny CDN storage
 * @param path - The path of the file to delete (e.g., "artists/temp/image_123.jpg")
 */
export async function deleteFromBunny(path: string): Promise<void> {
  const config = getBunnyConfig();
  const url = `https://${config.BUNNY_STORAGE_HOSTNAME}/${config.BUNNY_STORAGE_ZONE}/${path}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: config.BUNNY_STORAGE_PASSWORD,
    } as HeadersInit,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete from Bunny CDN: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}

/**
 * Moves a file to the trash folder
 * @param filePath - The path of the file to move to trash
 * @returns The new CDN URL of the file in trash
 */
export async function moveToTrash(filePath: string): Promise<string> {
  const trashPath = `trash/${filePath}`;
  return moveImageBetweenFolders(filePath, trashPath);
}

/**
 * Moves a file between folders in Bunny CDN storage
 * @param imageUrl - The current CDN URL of the image
 * @param newFolderPath - The new folder path (e.g., "artists/123/image.jpg")
 * @returns The new CDN URL of the moved file
 */
export async function moveImageBetweenFolders(
  imageUrl: string,
  newFolderPath: string
): Promise<string> {
  const config = getBunnyConfig();
  // Extract the file path from the CDN URL
  let pullZoneUrl = config.BUNNY_PULL_ZONE_URL.replace(/\/$/, ""); // Remove trailing slash
  // Ensure the URL has a protocol for matching
  if (!pullZoneUrl.startsWith("http://") && !pullZoneUrl.startsWith("https://")) {
    pullZoneUrl = `https://${pullZoneUrl}`;
  }
  // Try to match with or without protocol
  let filePath = imageUrl.replace(pullZoneUrl + "/", "");
  if (filePath === imageUrl) {
    // If no match, try without protocol
    const pullZoneUrlNoProtocol = config.BUNNY_PULL_ZONE_URL.replace(/\/$/, "").replace(/^https?:\/\//, "");
    filePath = imageUrl.replace(`https://${pullZoneUrlNoProtocol}/`, "").replace(`http://${pullZoneUrlNoProtocol}/`, "");
  }

  // Download the file from the current location
  // Ensure imageUrl has a protocol for fetching
  let fetchUrl = imageUrl;
  if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://")) {
    fetchUrl = `https://${fetchUrl}`;
  }
  const downloadResponse = await fetch(fetchUrl);
  if (!downloadResponse.ok) {
    throw new Error(
      `Failed to download file from ${fetchUrl}: ${downloadResponse.status} ${downloadResponse.statusText}`
    );
  }

  const fileBuffer = Buffer.from(await downloadResponse.arrayBuffer());

  // Upload to the new location
  const newUrl = await uploadToBunny(fileBuffer, newFolderPath);

  // Delete the old file
  try {
    await deleteFromBunny(filePath);
  } catch (error) {
    // Log error but don't fail the move operation
    console.error(`Failed to delete old file ${filePath}:`, error);
  }

  // Ensure the returned URL has a protocol
  let finalUrl = newUrl;
  if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
    finalUrl = `https://${finalUrl}`;
  }
  return finalUrl;
}
