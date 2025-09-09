import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  // 启用CSRF保护
  useSecureCookies: process.env.NODE_ENV === 'production',
  // 确保CSRF令牌验证
  secret: process.env.AUTH_SECRET,
  // 添加生产环境配置
  trustHost: true,
  // 添加回调URL配置
  callbacks: {
    ...authConfig.callbacks,
    async redirect({ url, baseUrl }) {
      // 允许相对URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 允许同一域名下的URL
      else if (new URL(url).origin === baseUrl) return url;
      // 默认重定向到首页
      return baseUrl;
    },
  },
});