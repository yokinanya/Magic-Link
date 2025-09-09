"use server";

import { revalidatePath } from "next/cache";
import { validateServerAction } from "@/lib/csrf-protection";
import { createErrorResponse } from "@/lib/error-handler";
import clientPromise from "@/lib/mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "Muaca";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Links";
const LINK_LEN = process.env.LINK_LEN ? parseInt(process.env.LINK_LEN) : 10;

export async function createLink(path: string | null, longUrl: string) {
  const session = await validateServerAction();

  if (!longUrl) {
    return { error: "URL is required." };
  }

  // 使用URL对象进行完整验证
  try {
    const url = new URL(longUrl);

    // 确保协议是http或https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        error: "Invalid URL protocol. Only http and https are allowed.",
      };
    }

    // 检查URL是否包含有效的域名
    if (!url.hostname || url.hostname.length === 0) {
      return { error: "Invalid URL hostname." };
    }

    // 检查是否有潜在的恶意字符
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

    let finalPath = path;

    if (finalPath && !finalPath.startsWith("/")) {
      finalPath = "/" + finalPath;
    }

    const pattern = /^[a-zA-Z0-9_\-/.]*$/;
    if (finalPath && !pattern.test(finalPath)) {
      return { error: "Invalid custom path format." };
    }

    if (finalPath) {
      const existing = await collection.findOne({ path: finalPath });
      if (existing) {
        return { error: "Path already exists." };
      }
    } else {
      let isUnique = false;
      while (!isUnique) {
        const random = Math.random()
          .toString(36)
          .substring(2, 2 + LINK_LEN);
        const randomPath = "/" + random;
        const existing = await collection.findOne({ path: randomPath });
        if (!existing) {
          finalPath = randomPath;
          isUnique = true;
        }
      }
    }

    const newLink = {
      creater: session.user!.email,
      path: finalPath,
      to: longUrl,
      createdAt: new Date(),
    };

    await collection.insertOne(newLink);
    revalidatePath("/admin/list");

    return { url: `${process.env.NEXTAUTH_URL}${finalPath}`, to: longUrl };
  } catch (error) {
    console.error("Database error in createLink:", error);
    return createErrorResponse(error);
  }
}
