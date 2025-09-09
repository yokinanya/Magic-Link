/**
 * 统一的错误处理机制
 * 在生产环境中隐藏敏感的错误信息，只显示通用的错误消息
 */

/**
 * 安全的错误消息映射
 * 将内部错误转换为用户友好的消息
 */
const ERROR_MESSAGES: Record<string, string> = {
    // 认证相关错误
    'Unauthorized': '请先登录以执行此操作',
    'Unauthorized: You must be logged in to create links.': '请先登录以创建链接',
    'Unauthorized: You must be logged in to delete links.': '请先登录以删除链接',
    'Unauthorized: You must be logged in to edit links.': '请先登录以编辑链接',
    'Unauthorized: You must be logged in to perform this action.': '请先登录以执行此操作',
    
    // 验证相关错误
    'Invalid URL format.': 'URL格式无效',
    'Invalid URL protocol. Only http and https are allowed.': '只支持HTTP和HTTPS协议',
    'Invalid URL hostname.': 'URL主机名无效',
    'Invalid URL contains potentially malicious characters.': 'URL包含潜在恶意字符',
    'URL is required.': 'URL是必填项',
    'Invalid custom path format.': '自定义路径格式无效',
    'Path already exists.': '路径已存在',
    'Invalid path format or reserved path.': '路径格式无效或为保留路径',
    
    // 数据库相关错误
    'Failed to create link. Please try again.': '创建链接失败，请重试',
    'Failed to delete link. Please try again.': '删除链接失败，请重试',
    'Failed to update link. Please try again.': '更新链接失败，请重试',
    'Link not found': '链接不存在',
    
    // 通用错误
    'An unexpected error occurred': '发生意外错误，请重试',
};

/**
 * 处理错误并返回用户友好的消息
 * @param error 原始错误对象或消息
 * @returns 用户友好的错误消息
 */
export function handleErrorMessage(error: unknown): string {
    // 开发环境：返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
    
    // 生产环境：返回通用错误消息
    if (error instanceof Error) {
        // 查找匹配的错误消息
        const errorMessage = error.message;
        if (ERROR_MESSAGES[errorMessage]) {
            return ERROR_MESSAGES[errorMessage];
        }
        
        // 检查是否包含敏感信息的关键词
        const sensitiveKeywords = [
            'database', 'mongodb', 'connection', 'auth', 'secret', 'token',
            'password', 'credential', 'key', 'uri', 'string'
        ];
        
        const lowerCaseMessage = errorMessage.toLowerCase();
        if (sensitiveKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
            return '操作失败，请重试';
        }
        
        // 如果不包含敏感信息，返回原始消息
        return errorMessage;
    }
    
    // 非Error类型的错误
    return typeof error === 'string' ? error : '发生未知错误';
}

/**
 * 创建安全的错误响应
 * @param error 原始错误
 * @returns 格式化的错误响应对象
 */
export function createErrorResponse(error: unknown): { error: string } {
    const message = handleErrorMessage(error);
    
    // 在开发环境中记录详细错误
    if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', error);
    } else {
        // 在生产环境中只记录错误类型，不记录敏感信息
        console.error('Error occurred:', error instanceof Error ? error.name : typeof error);
    }
    
    return { error: message };
}

/**
 * 验证错误是否为预期错误
 * @param error 错误对象
 * @returns 是否为预期错误
 */
export function isExpectedError(error: unknown): boolean {
    if (error instanceof Error) {
        return Object.keys(ERROR_MESSAGES).includes(error.message);
    }
    return false;
}