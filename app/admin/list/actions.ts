"use server";

import { revalidatePath } from "next/cache";
import { validateServerAction } from "@/lib/csrf-protection";
import { createErrorResponse } from "@/lib/error-handler";
import clientPromise from "@/lib/mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "Muaca";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Links";

// 验证path是否合法，防止使用/api等系统路径
function validatePath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  // 检查是否以系统保留路径开头
  const reservedPaths = ["/api", "/_next", "/admin", "/favicon.ico"];
  for (const reservedPath of reservedPaths) {
    if (path.startsWith(reservedPath)) {
      return false;
    }
  }

  // 检查path格式
  const pathPattern = /^[a-zA-Z0-9_\-/.]+$/;
  return pathPattern.test(path);
}

export async function deleteLinkAction(path: string) {
  try {
    // 基本会话验证
    const session = await validateServerAction();

    // 验证path合法性
    if (!validatePath(path)) {
      return { error: "Invalid path format or reserved path." };
    }

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    await db.collection(MONGODB_COLLECTION).deleteOne({ path: path });
    revalidatePath("/admin/list");
  } catch (error) {
    console.error("Failed to delete link:", error);
    return createErrorResponse(error);
  }
}

export async function editLinkAction(path: string, newTo: string) {
  try {
    // 基本会话验证
    const session = await validateServerAction();

    // 验证path合法性
    if (!validatePath(path)) {
      return { error: "Invalid path format or reserved path." };
    }

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    await db
      .collection(MONGODB_COLLECTION)
      .updateOne({ path: path }, { $set: { to: newTo } });
    revalidatePath("/admin/list");
  } catch (error) {
    console.error("Failed to edit link:", error);
    return createErrorResponse(error);
  }
}
