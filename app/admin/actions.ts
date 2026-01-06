"use server";

import { revalidatePath } from "next/cache";
import { validateServerAction } from "@/lib/csrf-protection";
import { createErrorResponse } from "@/lib/error-handler";
import clientPromise from "@/lib/mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "Muaca";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Links";
const LINK_LEN = process.env.LINK_LEN ? parseInt(process.env.LINK_LEN) : 10;

// Helper function to validate path
function validatePath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  // Check reserved paths
  const reservedPaths = ["/api", "/_next", "/admin", "/favicon.ico"];
  for (const reservedPath of reservedPaths) {
    if (path.startsWith(reservedPath)) {
      return false;
    }
  }

  // Check path format
  const pathPattern = /^[a-zA-Z0-9_\-/.]+$/;
  return pathPattern.test(path);
}

// Generate random string
function randomString(len: number) {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const maxPos = chars.length;
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

export async function createLink(path: string | null, longUrl: string) {
  const session = await validateServerAction();

  if (!longUrl) {
    return { error: "URL is required." };
  }

  // Basic URL validation
  try {
    const url = new URL(longUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        error: "Invalid URL protocol. Only http and https are allowed.",
      };
    }
    if (!url.hostname || url.hostname.length === 0) {
      return { error: "Invalid URL hostname." };
    }
    if (
        longUrl.includes("<") ||
        longUrl.includes(">") ||
        longUrl.includes('"') ||
        longUrl.includes("'")
      ) {
        return {
          error: "Invalid URL contains potentially malicious characters.",
        };
      }
  } catch (error) {
    return createErrorResponse(error);
  }

  try {
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);

    let newPath = path;

    if (newPath) {
      // Validate provided path
      if (!newPath.startsWith("/")) {
        newPath = "/" + newPath;
      }
      
      if (!validatePath(newPath)) {
        return { error: "Invalid path format or reserved path." };
      }

      // Check if path exists
      const existing = await collection.findOne({ path: newPath });
      if (existing) {
        return { error: "Path already exists." };
      }
    } else {
      // Generate random path
      do {
        newPath = "/" + randomString(LINK_LEN);
        const existing = await collection.findOne({ path: newPath });
        if (!existing) break;
      } while (true);
    }

    await collection.insertOne({
      path: newPath,
      to: longUrl,
      creater: session.user?.name || session.user?.email || "Unknown",
      created_at: new Date(),
    });

    const appUrl = process.env.App_Url || "http://localhost:3000";
    const fullUrl = `${appUrl}${newPath}`;

    revalidatePath("/admin");
    return { url: fullUrl, to: longUrl };
  } catch (error) {
    console.error("Failed to create link:", error);
    return createErrorResponse(error);
  }
}

export async function deleteLinkAction(path: string) {
  try {
    const session = await validateServerAction();

    if (!validatePath(path)) {
      return { error: "Invalid path format or reserved path." };
    }

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    await db.collection(MONGODB_COLLECTION).deleteOne({ path: path });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to delete link:", error);
    return createErrorResponse(error);
  }
}

export async function editLinkAction(path: string, newTo: string) {
  try {
    const session = await validateServerAction();

    if (!validatePath(path)) {
      return { error: "Invalid path format or reserved path." };
    }

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    await db
      .collection(MONGODB_COLLECTION)
      .updateOne({ path: path }, { $set: { to: newTo } });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to edit link:", error);
    return createErrorResponse(error);
  }
}
