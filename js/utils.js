/**
 * 工具函数模块
 * 提供数据加载、格式化、DOM 操作等通用功能
 */

// 数据缓存，避免重复请求
const 数据缓存 = new Map();

/**
 * 加载 JSON 数据（带缓存）
 * @param {string} 文件路径 - JSON 文件路径
 * @returns {Promise<any>} 解析后的数据
 */
export async function 加载JSON(文件路径) {
    // 命中缓存直接返回
    if (数据缓存.has(文件路径)) {
        return 数据缓存.get(文件路径);
    }

    try {
        const 响应 = await fetch(文件路径);
        if (!响应.ok) {
            throw new Error(`加载失败: ${响应.status} ${响应.statusText}`);
        }
        const 数据 = await 响应.json();
        数据缓存.set(文件路径, 数据);
        return 数据;
    } catch (错误) {
        console.error(`[数据加载] ${文件路径} 加载失败:`, 错误);
        throw 错误;
    }
}

/**
 * 加载站点配置
 * @returns {Promise<any>} 站点配置数据
 */
export async function 加载站点配置() {
    return 加载JSON('./data/site.json');
}

/**
 * 加载系统列表
 * @returns {Promise<Array>} 系统列表数组
 */
export async function 加载系统列表() {
    const 数据 = await 加载JSON('./data/systems.json');
    return 数据.systems || [];
}

/**
 * 加载功能列表
 * @returns {Promise<Array>} 功能列表数组
 */
export async function 加载功能列表() {
    const 数据 = await 加载JSON('./data/features.json');
    return 数据.features || [];
}

/**
 * 加载更新日志
 * @returns {Promise<Array>} 更新日志数组
 */
export async function 加载更新日志() {
    const 数据 = await 加载JSON('./data/changelogs.json');
    return 数据.changelogs || [];
}

/**
 * HTML 转义，防止 XSS
 * @param {string} 文本 - 原始文本
 * @returns {string} 转义后的文本
 */
export function HTML转义(文本) {
    const 转义映射 = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(文本).replace(/[&<>"']/g, 字符 => 转义映射[字符]);
}

/**
 * 格式化日期为中文格式
 * @param {string} 日期字符串 - ISO 日期格式
 * @returns {string} 中文日期格式
 */
export function 格式化日期(日期字符串) {
    if (!日期字符串) return '';
    const 日期 = new Date(日期字符串);
    return `${日期.getFullYear()}年${日期.getMonth() + 1}月${日期.getDate()}日`;
}

/**
 * 按排序字段升序排序
 * @param {Array} 列表 - 待排序列表
 * @param {string} 排序字段 - 排序字段名
 * @returns {Array} 排序后的新数组
 */
export function 按排序排序(列表, 排序字段 = 'sort') {
    return [...列表].sort((a, b) => (a[排序字段] || 0) - (b[排序字段] || 0));
}

/**
 * 按系统 ID 筛选
 * @param {Array} 列表 - 待筛选列表
 * @param {string} 系统ID - 系统 ID
 * @returns {Array} 筛选后的数组
 */
export function 按系统筛选(列表, 系统ID) {
    if (!系统ID || 系统ID === 'all') return 列表;
    return 列表.filter(项 => 项.systemId === 系统ID);
}

/**
 * 按字段分组
 * @param {Array} 列表 - 待分组列表
 * @param {string} 分组字段 - 分组字段名
 * @returns {Object} 分组后的对象
 */
export function 按字段分组(列表, 分组字段) {
    return 列表.reduce((分组, 项) => {
        const 键 = 项[分组字段] || '其他';
        if (!分组[键]) 分组[键] = [];
        分组[键].push(项);
        return 分组;
    }, {});
}

/**
 * 滚动到页面顶部（平滑）
 */
export function 滚动到顶部() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 获取当前路由信息
 * @returns {Object} 路由对象 { 路径, 参数 }
 */
export function 获取当前路由() {
    const 哈希 = window.location.hash.slice(1) || '/';
    const 片段 = 哈希.split('/').filter(Boolean);
    return {
        路径: 片段[0] || 'home',
        参数: 片段.slice(1)
    };
}
