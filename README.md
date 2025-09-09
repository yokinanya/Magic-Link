## ✨ Magic Link

<img width="1080" alt="login page" src="https://github.com/lilac-milena/Magic-Link/assets/143427814/636fd64f-ea89-469f-8948-b3dd0e75670e">

---

> 🌐 该页面有 [**简体中文版本**](https://blog.muna.uk/archives/shortUrl-vercel.html)

基于 Next.js 和 MongoDB 的短链接服务，支持多种 OAuth 提供商认证和管理后台。
您可以使用 Vercel、Netlify 或其他 Serverless 部署该项目。

## 🎉 功能特性

- 🔐 **多提供商认证**: 支持 GitHub、Google 和 Microsoft Entra ID OAuth 认证
  - 根据环境变量自动显示可用的登录选项
  - GitHub 认证为默认必需选项
  - Google 和 Microsoft Entra ID 为可选选项，仅在配置相应环境变量后显示
- 🔗 **短链接生成**: 自动生成随机短链接或支持自定义路径
- 📝 **管理后台**:
  - 创建短链接
  - 查看所有链接列表
  - 编辑链接目标地址
  - 删除链接
- 🛡️ **安全措施**:
  - 邮箱白名单限制访问
  - CSRF 防护
  - NoSQL 注入防护
  - XSS 攻击防护
  - 路径验证（防止系统路径冲突）
- ⚡ **高性能**:
  - MongoDB 连接池优化
  - 服务端渲染
  - 优化的数据库连接配置

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB 数据库
- OAuth 应用（至少一个：GitHub、Google 或 Microsoft Entra ID）

### 安装依赖

```bash
npm install
```

### 环境变量

创建 `.env.local` 文件并添加以下环境变量：

```env
# MongoDB 连接
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=Muaca  # 可选，默认为 Muaca
MONGODB_COLLECTION=Links  # 可选，默认为 Links

# NextAuth.js 配置
AUTH_SECRET=your_nextauth_secret

# GitHub OAuth（必需）
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Google OAuth（可选）
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Microsoft Entra ID OAuth（可选）
AUTH_MICROSOFT_ENTRA_ID_ID=your_azure_ad_client_id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your_azure_ad_client_secret
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/your_tenant_id/v2.0

# 安全配置
ALLOWED_SIGN_IN_EMAILS=user@example.com,*@company.com
LINK_LEN=10  # 可选，随机链接长度，默认为 10
```

### 运行开发服务器

```bash
npm run dev
```

在 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 🔧 配置说明

### OAuth 提供商设置

#### GitHub OAuth
1. 在 GitHub 上创建 OAuth 应用
2. 设置回调 URL 为: `https://yourdomain.com/api/auth/callback/github`
3. 获取 Client ID 和 Client Secret 并填入环境变量

#### Google OAuth（可选）
1. 在 Google Cloud Console 创建凭据
2. 设置回调 URL 为: `https://yourdomain.com/api/auth/callback/google`
3. 获取 Client ID 和 Client Secret 并填入环境变量

#### Microsoft Entra ID OAuth（可选）
1. 在 Azure Active Directory 注册应用
2. 设置回调 URL 为: `https://yourdomain.com/api/auth/callback/microsoft-entra-id`
3. 获取 Client ID、Client Secret 和 Issuer URL 并填入环境变量

### 邮箱白名单

使用 `ALLOWED_SIGN_IN_EMAILS` 环境变量限制访问权限：
- 支持特定邮箱: `user@example.com`
- 支持整个域名: `*@example.com`
- 多个规则用逗号分隔

### 自定义链接配置

- `LINK_LEN`: 设置随机生成的短链接长度（默认为 10）
- `MONGODB_DB`: 自定义数据库名称（默认为 Muaca）
- `MONGODB_COLLECTION`: 自定义集合名称（默认为 Links）

## 📄 许可证

[MIT](LICENSE)
