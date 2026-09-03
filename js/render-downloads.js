/**
 * 下载页面渲染模块
 * 负责下载中心页面的渲染，支持按系统筛选，展示最新版本和历史版本
 */

import { 加载下载列表, 加载系统列表, HTML转义, 格式化日期 } from './utils.js';

/**
 * 渲染单个下载卡片
 * @param {Object} 下载记录 - 下载记录对象
 * @param {Array} 系统列表 - 系统列表
 * @param {boolean} 是否最新 - 是否为最新版本
 * @returns {string} 卡片 HTML
 */
function 渲染下载卡片(下载记录, 系统列表, 是否最新 = false) {
    const 系统 = 系统列表.find(s => s.id === 下载记录.systemId);
    const 主题色 = 系统?.themeColor || '#18181B';
    const 下载类型标签 = 下载记录.downloadType === 'github' ? 'GitHub Releases' : '网盘下载';
    const 下载类型图标 = 下载记录.downloadType === 'github' ? 'fa-download' : 'fa-cloud-arrow-down';

    // 校验码区域（可选）
    const 校验码HTML = (下载记录.md5 || 下载记录.sha256) ? `
        <div class="mt-4 pt-4 border-t border-gray-100">
            <button class="text-xs text-gray-400 hover:text-amber-600 transition-colors flex items-center gap-1" onclick="this.nextElementSibling.classList.toggle('hidden')">
                <i class="fa-solid fa-shield-halved"></i> 查看文件校验码
                <i class="fa-solid fa-chevron-down text-xs"></i>
            </button>
            <div class="hidden mt-2 space-y-1">
                ${下载记录.md5 ? `<p class="text-xs text-gray-500 break-all">MD5: ${HTML转义(下载记录.md5)}</p>` : ''}
                ${下载记录.sha256 ? `<p class="text-xs text-gray-500 break-all">SHA256: ${HTML转义(下载记录.sha256)}</p>` : ''}
            </div>
        </div>
    ` : '';

    if (是否最新) {
        // 最新版本卡片（突出显示）
        return `
            <div class="download-item bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-amber-400/30 hover:border-amber-400/50 transition-all duration-300" data-system="${HTML转义(下载记录.systemId)}">
                <div class="flex items-center gap-2 mb-4">
                    <span class="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full">
                        <i class="fa-solid fa-star mr-1"></i>最新版本
                    </span>
                    <span class="text-xs text-gray-400">${HTML转义(下载类型标签)}</span>
                </div>

                <div class="flex items-start gap-4 mb-4">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0" style="background:${主题色}">
                        <i class="fa-solid ${HTML转义(系统?.icon || 'fa-cube')}"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-1">${HTML转义(下载记录.version)}</h3>
                        <p class="text-sm text-gray-500">${HTML转义(系统?.name || '')}</p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span class="flex items-center gap-1.5">
                        <i class="fa-solid fa-box text-gray-400"></i>${HTML转义(下载记录.fileSize)}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <i class="fa-solid fa-calendar text-gray-400"></i>${格式化日期(下载记录.releaseDate)}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <i class="fa-solid fa-desktop text-gray-400"></i>${HTML转义(下载记录.systemRequirements)}
                    </span>
                </div>

                <div class="bg-gray-50 rounded-lg p-3 mb-4">
                    <p class="text-sm text-gray-600"><span class="font-semibold text-gray-700">更新摘要：</span>${HTML转义(下载记录.changeSummary)}</p>
                </div>

                <div class="flex flex-wrap gap-3">
                    <a href="${HTML转义(下载记录.downloadUrl)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 hover:scale-105">
                        <i class="fa-solid ${下载类型图标}"></i>立即下载
                    </a>
                    ${下载记录.downloadType === 'disk' && 下载记录.extractCode ? `
                        <div class="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                            <span class="text-sm text-gray-500">提取码：</span>
                            <code class="text-sm font-mono font-bold text-gray-800">${HTML转义(下载记录.extractCode)}</code>
                        </div>
                    ` : ''}
                </div>

                ${校验码HTML}
            </div>
        `;
    }

    // 历史版本卡片（简洁）
    return `
        <div class="download-item bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300" data-system="${HTML转义(下载记录.systemId)}">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style="background:${主题色}">
                        <i class="fa-solid ${HTML转义(系统?.icon || 'fa-cube')} text-sm"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-gray-800">${HTML转义(下载记录.version)}</span>
                            <span class="text-xs text-gray-400">${HTML转义(下载记录.fileSize)}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-gray-400">
                            <span>${HTML转义(系统?.name || '')}</span>
                            <span>·</span>
                            <span>${格式化日期(下载记录.releaseDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400 hidden md:inline">${HTML转义(下载记录.systemRequirements)}</span>
                    ${下载记录.extractCode ? `<span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">码: ${HTML转义(下载记录.extractCode)}</span>` : ''}
                    <a href="${HTML转义(下载记录.downloadUrl)}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-amber-500 hover:text-white transition-colors">
                        <i class="fa-solid ${下载类型图标}"></i>下载
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * 渲染下载中心页
 * @returns {Promise<string>} 下载页 HTML
 */
export async function 渲染下载页() {
    const [下载列表, 系统列表] = await Promise.all([
        加载下载列表(),
        加载系统列表()
    ]);

    // 按日期倒序
    const 排序后列表 = [...下载列表].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    // 分类：最新版本 vs 历史版本
    const 最新版本列表 = 排序后列表.filter(d => d.isLatest);
    const 历史版本列表 = 排序后列表.filter(d => !d.isLatest);

    // 生成筛选按钮
    const 筛选按钮HTML = [
        `<button class="download-filter-btn active px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white" data-system="all">全部</button>`,
        ...系统列表.map(系统 => `
            <button class="download-filter-btn px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors" data-system="${HTML转义(系统.id)}">
                <i class="fa-solid ${HTML转义(系统.icon)} mr-1" style="color:${系统.themeColor}"></i>${HTML转义(系统.name)}
            </button>
        `)
    ].join('');

    // 渲染最新版本区域
    const 最新HTML = 最新版本列表.length ? `
        <div class="mb-10" data-section="latest">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-star text-amber-500"></i>最新版本
            </h2>
            <div class="space-y-6">
                ${最新版本列表.map(d => 渲染下载卡片(d, 系统列表, true)).join('')}
            </div>
        </div>
    ` : '';

    // 渲染历史版本区域
    const 历史HTML = 历史版本列表.length ? `
        <div data-section="history">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-gray-400"></i>历史版本
            </h2>
            <div class="space-y-3">
                ${历史版本列表.map(d => 渲染下载卡片(d, 系统列表, false)).join('')}
            </div>
        </div>
    ` : '';

    return `
        <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">下载中心</h1>
                <p class="text-gray-500">获取最新版本的软件安装包</p>
            </div>

            <!-- 筛选按钮 -->
            <div class="flex flex-wrap gap-2 mb-8">
                ${筛选按钮HTML}
            </div>

            <!-- 下载列表 -->
            <div id="download-list">
                ${最新HTML}
                ${历史HTML}
                ${!最新HTML && !历史HTML ? '<p class="text-gray-400 text-center py-8">暂无下载内容</p>' : ''}
            </div>
        </section>
    `;
}

/**
 * 渲染系统详情页的最新版本下载卡片
 * @param {string} 系统ID - 系统 ID
 * @returns {Promise<string>} 下载卡片 HTML（无下载记录时返回空字符串）
 */
export async function 渲染系统下载卡片(系统ID) {
    const [下载列表, 系统列表] = await Promise.all([
        加载下载列表(),
        加载系统列表()
    ]);

    // 找到该系统的最新版本
    const 系统下载列表 = 下载列表.filter(d => d.systemId === 系统ID);
    const 最新版本 = 系统下载列表.find(d => d.isLatest) || 系统下载列表[0];

    if (!最新版本) return '';

    const 系统 = 系统列表.find(s => s.id === 系统ID);
    const 主题色 = 系统?.themeColor || '#18181B';
    const 下载类型图标 = 最新版本.downloadType === 'github' ? 'fa-download' : 'fa-cloud-arrow-down';

    return `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200/50">
                <div class="flex items-center gap-2 mb-4">
                    <span class="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full">
                        <i class="fa-solid fa-star mr-1"></i>最新版本
                    </span>
                </div>

                <div class="flex items-start justify-between flex-wrap gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0" style="background:${主题色}">
                            <i class="fa-solid ${HTML转义(系统?.icon || 'fa-cube')}"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-1">${HTML转义(最新版本.version)} <span class="text-sm font-normal text-gray-400">(${HTML转义(最新版本.fileSize)})</span></h3>
                            <p class="text-sm text-gray-500 mb-1">发布于 ${格式化日期(最新版本.releaseDate)}</p>
                            <p class="text-sm text-gray-600">${HTML转义(最新版本.systemRequirements)}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        ${最新版本.extractCode ? `<span class="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-600">提取码: <code class="font-mono font-bold">${HTML转义(最新版本.extractCode)}</code></span>` : ''}
                        <a href="${HTML转义(最新版本.downloadUrl)}" target="_blank" rel="noopener"
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 hover:scale-105">
                            <i class="fa-solid ${下载类型图标}"></i>立即下载
                        </a>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-amber-200/50">
                    <p class="text-sm text-gray-600"><span class="font-semibold text-gray-700">更新摘要：</span>${HTML转义(最新版本.changeSummary)}</p>
                </div>

                <div class="mt-4 text-right">
                    <a href="#/downloads" class="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
                        查看全部下载版本 <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </section>
    `;
}
