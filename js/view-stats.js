/**
 * 浏览统计模块
 * 使用不蒜子（busuanzi.ibruce.info）免费访问统计服务获取全站累计浏览次数（PV），
 * 动态加载不蒜子脚本自动填充统计数据，localStorage 缓存上次成功值作为降级，
 * API 失败时优雅降级（不显示次数）
 *
 * 注意：不蒜子按域名统计，本地开发（127.0.0.1）可能统计不到，
 * 部署到 GitHub Pages 后（chengzi5566-wh.github.io）即可正常统计。
 */

const 不蒜子脚本地址 = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
const 缓存键名 = 'site_views_cache';

/**
 * 读取缓存的上次成功值（降级用）
 * @returns {number|null} 缓存的浏览次数，无缓存返回 null
 */
function 读取缓存() {
    try {
        const 值 = localStorage.getItem(缓存键名);
        return 值 !== null ? parseInt(值, 10) : null;
    } catch {
        return null;
    }
}

/**
 * 写入缓存（降级用）
 * @param {number} 值 - 浏览次数
 */
function 写入缓存(值) {
    try {
        localStorage.setItem(缓存键名, String(值));
    } catch {
        // localStorage 写入失败时静默降级
    }
}

/**
 * 加载不蒜子脚本
 * @returns {Promise<boolean>} 加载成功返回 true，失败返回 false
 */
function 加载不蒜子脚本() {
    return new Promise((resolve) => {
        // 防止重复加载
        if (document.querySelector(`script[src="${不蒜子脚本地址}"]`)) {
            resolve(true);
            return;
        }

        const 脚本 = document.createElement('script');
        脚本.src = 不蒜子脚本地址;
        脚本.async = true;
        脚本.onload = () => resolve(true);
        脚本.onerror = () => resolve(false);
        document.head.appendChild(脚本);
    });
}

/**
 * 轮询等待不蒜子填充统计值
 * @param {number} 超时毫秒 - 最长等待时间
 * @returns {Promise<number|null>} 统计值，超时返回 null
 */
function 轮询统计值(超时毫秒 = 8000) {
    return new Promise((resolve) => {
        const 目标 = document.getElementById('busuanzi_value_site_pv');
        if (!目标) {
            resolve(null);
            return;
        }

        const 开始时间 = Date.now();
        const 间隔 = setInterval(() => {
            const 文本 = (目标.textContent || '').trim();
            if (/^\d+$/.test(文本)) {
                clearInterval(间隔);
                resolve(parseInt(文本, 10));
            } else if (Date.now() - 开始时间 > 超时毫秒) {
                clearInterval(间隔);
                resolve(null);
            }
        }, 300);
    });
}

/**
 * 初始化页脚浏览次数显示
 * 动态加载不蒜子脚本，自动获取全站 PV 并填充到 #site-views 元素
 */
export async function 初始化浏览次数() {
    const 容器 = document.getElementById('site-views');
    if (!容器) return;

    // 先设置不蒜子需要的标准 ID（隐藏在容器内）
    容器.innerHTML = `<i class="fa-solid fa-chart-bar mr-1"></i>已被访问 <span id="busuanzi_value_site_pv"></span> 次`;

    // 加载不蒜子脚本
    const 加载成功 = await 加载不蒜子脚本();
    if (!加载成功) {
        // 脚本加载失败，降级到缓存
        const 缓存值 = 读取缓存();
        if (缓存值 !== null) {
            容器.innerHTML = `<i class="fa-solid fa-chart-bar mr-1"></i>已被访问 ${缓存值.toLocaleString('zh-CN')} 次`;
            容器.classList.remove('hidden');
        }
        return;
    }

    // 轮询等待不蒜子填充值
    const 次数 = await 轮询统计值(8000);
    if (次数 !== null) {
        写入缓存(次数);
        容器.innerHTML = `<i class="fa-solid fa-chart-bar mr-1"></i>已被访问 ${次数.toLocaleString('zh-CN')} 次`;
        容器.classList.remove('hidden');
    }
    // 次数为 null 时保持隐藏（不显示）
}
