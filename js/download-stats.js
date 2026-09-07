/**
 * 下载统计模块
 * 负责从 GitHub Releases API 获取真实下载次数，localStorage 缓存1小时，
 * 支持会话级本地点击增量+1，API 失败时优雅降级（不显示次数）
 */

const GITHUB_API地址 = 'https://api.github.com/repos/chengzi5566-wh/chengzi5566-wh.github.io/releases';
const 缓存键名 = 'download_stats_cache';
const 缓存有效期 = 60 * 60 * 1000; // 1小时

/**
 * 从 localStorage 读取缓存的下载统计
 * @returns {Object|null} 缓存对象 {assetName: count, timestamp}，无缓存或过期返回 null
 */
function 读取缓存() {
    try {
        const 原始数据 = localStorage.getItem(缓存键名);
        if (!原始数据) return null;
        const 缓存对象 = JSON.parse(原始数据);
        if (Date.now() - 缓存对象.timestamp > 缓存有效期) return null;
        return 缓存对象.数据;
    } catch {
        return null;
    }
}

/**
 * 写入下载统计到 localStorage 缓存
 * @param {Object} 数据 - {assetName: count} 映射
 */
function 写入缓存(数据) {
    try {
        localStorage.setItem(缓存键名, JSON.stringify({
            数据,
            timestamp: Date.now()
        }));
    } catch {
        // localStorage 写入失败时静默降级
    }
}

/**
 * 调用 GitHub API 获取所有 Release 的 asset 下载次数
 * @returns {Promise<Object|null>} {assetName: download_count} 映射，失败返回 null
 */
export async function 获取下载统计() {
    // 先读缓存
    const 缓存数据 = 读取缓存();
    if (缓存数据) return 缓存数据;

    try {
        const 响应 = await fetch(GITHUB_API地址, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!响应.ok) return null;

        const releases = await 响应.json();
        const 统计映射 = {};

        // 遍历所有 Release，提取每个 asset 的下载次数
        releases.forEach(release => {
            (release.assets || []).forEach(asset => {
                统计映射[asset.name] = asset.download_count || 0;
            });
        });

        写入缓存(统计映射);
        return 统计映射;
    } catch {
        return null;
    }
}

/**
 * 获取单个下载记录的基础次数（API真实值）
 * @param {string} 统计映射 - API 返回的统计映射
 * @param {Object} 下载记录 - 下载记录对象（需含 assetName）
 * @returns {number|null} 下载次数，无匹配返回 null
 */
export function 获取基础次数(统计映射, 下载记录) {
    if (!统计映射 || !下载记录.assetName) return null;
    return 统计映射[下载记录.assetName] !== undefined ? 统计映射[下载记录.assetName] : null;
}

/**
 * 获取系统汇总下载次数
 * @param {Object} 统计映射 - API 返回的统计映射
 * @param {Array} 下载列表 - 全部下载记录
 * @param {string} 系统ID - 系统 ID
 * @returns {number|null} 系统总下载次数，API 失败返回 null
 */
export function 获取系统总次数(统计映射, 下载列表, 系统ID) {
    if (!统计映射) return null;
    let 总次数 = 0;
    let 有匹配 = false;
    下载列表.filter(d => d.systemId === 系统ID).forEach(记录 => {
        const 次数 = 获取基础次数(统计映射, 记录);
        if (次数 !== null) {
            总次数 += 次数;
            有匹配 = true;
        }
    });
    return 有匹配 ? 总次数 : null;
}

/**
 * 本地会话增量 +1（点击下载时调用）
 * @param {string} 下载ID - 下载记录 ID
 */
export function 本地增量加一(下载ID) {
    try {
        const 键名 = `download_increment_${下载ID}`;
        const 当前值 = parseInt(localStorage.getItem(键名) || '0', 10);
        localStorage.setItem(键名, String(当前值 + 1));
    } catch {
        // localStorage 写入失败时静默降级
    }
}

/**
 * 获取本地会话增量次数
 * @param {string} 下载ID - 下载记录 ID
 * @returns {number} 增量次数
 */
export function 获取本地增量(下载ID) {
    try {
        return parseInt(localStorage.getItem(`download_increment_${下载ID}`) || '0', 10);
    } catch {
        return 0;
    }
}

/**
 * 获取最终显示次数（API真实值 + 本地增量）
 * @param {Object} 统计映射 - API 返回的统计映射
 * @param {Object} 下载记录 - 下载记录对象
 * @returns {number|null} 最终显示次数，API 失败返回 null
 */
export function 获取显示次数(统计映射, 下载记录) {
    const 基础次数 = 获取基础次数(统计映射, 下载记录);
    if (基础次数 === null) return null;
    return 基础次数 + 获取本地增量(下载记录.id);
}

/**
 * 初始化下载交互（事件委托）
 * 点击下载按钮时：本地增量+1、对应次数+1并弹跳动画、系统汇总+1
 */
export function 初始化下载交互() {
    // 避免重复绑定
    if (window.__下载交互已绑定) return;
    window.__下载交互已绑定 = true;

    document.addEventListener('click', (事件) => {
        const 链接 = 事件.target.closest('.download-link');
        if (!链接) return;

        const 下载ID = 链接.dataset.downloadId;
        const 系统ID = 链接.dataset.systemId;
        if (!下载ID) return;

        // 本地增量+1
        本地增量加一(下载ID);

        // 更新所有匹配该下载ID的次数显示
        document.querySelectorAll(`.download-count[data-download-id="${下载ID}"] .download-count-num`).forEach(元素 => {
            const 当前值 = parseInt(元素.textContent.replace(/\D/g, ''), 10) || 0;
            元素.textContent = 当前值 + 1;
            // 触发弹跳动画
            元素.classList.remove('animate-pop');
            void 元素.offsetWidth; // 强制重绘
            元素.classList.add('animate-pop');
        });

        // 更新系统汇总次数
        if (系统ID) {
            document.querySelectorAll(`.download-count-num[data-system-id="${系统ID}"]`).forEach(元素 => {
                const 当前值 = parseInt(元素.textContent.replace(/\D/g, ''), 10) || 0;
                元素.textContent = 当前值 + 1;
                元素.classList.remove('animate-pop');
                void 元素.offsetWidth;
                元素.classList.add('animate-pop');
            });
        }
    });
}
