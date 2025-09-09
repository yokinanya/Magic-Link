import crypto from 'crypto';

// 生成CSRF令牌
export function generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// 验证CSRF令牌
export function validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) {
        return false;
    }
    
    // 使用恒定时间比较来防止时序攻击
    try {
        return crypto.timingSafeEqual(
            Buffer.from(token, 'hex'),
            Buffer.from(sessionToken, 'hex')
        );
    } catch (error) {
        return false;
    }
}

// 从请求中获取CSRF令牌
export function getCSRFTokenFromRequest(request: Request): string | null {
    // 优先从header获取
    const headerToken = request.headers.get('X-CSRF-Token');
    if (headerToken) {
        return headerToken;
    }
    
    // 尝试从表单数据获取
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        // 注意：这里需要在实际使用时解析表单数据
        return null;
    }
    
    return null;
}