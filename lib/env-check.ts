/**
 * 环境变量检查工具
 * 用于在应用启动时验证必要的环境变量是否已设置
 */

export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'AUTH_SECRET',
    'AUTH_GITHUB_ID',
    'AUTH_GITHUB_SECRET',
    'MONGODB_URI',
    'ALLOWED_SIGN_IN_EMAILS'
  ];

  const missingEnvVars: string[] = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missingEnvVars.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\n请检查 .env 文件并设置所有必要的环境变量。');
    return false;
  }

  console.log('✅ 所有必要的环境变量已设置');
  return true;
}

export function warnOptionalEnvironmentVariables() {
  const optionalEnvVars = [
    'AUTH_GOOGLE_ID',
    'AUTH_GOOGLE_SECRET',
    'AUTH_MICROSOFT_ENTRA_ID_ID',
    'AUTH_MICROSOFT_ENTRA_ID_SECRET',
    'AUTH_MICROSOFT_ENTRA_ID_ISSUER'
  ];

  const missingOptionalEnvVars: string[] = [];

  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingOptionalEnvVars.push(envVar);
    }
  });

  if (missingOptionalEnvVars.length > 0) {
    console.warn('⚠️ 以下可选环境变量未设置:');
    missingOptionalEnvVars.forEach(envVar => {
      console.warn(`   - ${envVar}`);
    });
    console.warn('这些是可选的，但如果需要相应的OAuth提供商，请设置它们。');
  }
}