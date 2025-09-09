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
});