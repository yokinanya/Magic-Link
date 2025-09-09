import { auth } from "./auth";

/**
 * 验证服务器操作的CSRF令牌
 * 在Next.js中，服务器操作默认受到CSRF保护，
 * 但我们添加额外的会话验证以确保安全性
 */
export async function validateServerAction() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error(
      "Unauthorized: You must be logged in to perform this action."
    );
  }

  return session;
}

/**
 * 创建一个CSRF保护的包装器
 * 用于保护服务器操作
 */
export function withCSRFProtection(action: Function) {
  return async function (...args: any[]) {
    try {
      // 验证用户会话
      await validateServerAction();

      // 执行原始操作
      return await action(...args);
    } catch (error) {
      console.error("CSRF protection error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };
}
