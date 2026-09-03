/**
 * 更新日志页面渲染模块
 * 负责版本更新日志页的渲染，支持按系统筛选
 */

import { 加载更新日志, 加载系统列表, HTML转义, 格式化日期 } from './utils.js';

/**
 * 渲染更新日志页
 * @returns {Promise<string>} 更新日志页 HTML
 */
export async function 渲染更新日志页() {
    const [更新日志, 系统列表] = await Promise.all([
        加载更新日志(),
        加载系统列表()
    ]);

    // 按日期倒序
    const 排序后日志 = [...更新日志].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 生成筛选按钮
    const 筛选按钮HTML = [
        `<button class="changelog-filter-btn active px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white" data-system="all">全部</button>`,
        ...系统列表.map(系统 => `
            <button class="changelog-filter-btn px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors" data-system="${HTML转义(系统.id)}">
                <i class="fa-solid ${HTML转义(系统.icon)} mr-1" style="color:${系统.themeColor}"></i>${HTML转义(系统.name)}
            </button>
        `)
    ].join('');

    // 渲染日志卡片
    const 日志HTML = 排序后日志.map(日志 => {
        const 系统 = 系统列表.find(s => s.id === 日志.systemId);
        const 主题色 = 系统?.themeColor || '#18181B';

        return `
            <div class="changelog-item bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-system="${HTML转义(日志.systemId)}">
                <div class="flex items-center gap-3 mb-4 flex-wrap">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" style="background:${主题色}">
                        <i class="fa-solid fa-code-branch"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold text-gray-800 text-lg">${HTML转义(日志.version)}</span>
                            <span class="px-2 py-0.5 text-xs rounded-full" style="background:${主题色}15;color:${主题色}">${HTML转义(日志.type)}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-gray-400">
                            <span>${HTML转义(日志.systemName)}</span>
                            <span>·</span>
                            <span>${格式化日期(日志.date)}</span>
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    ${日志.added && 日志.added.length ? `
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">+</span>
                                <span class="text-sm font-semibold text-gray-700">新增功能</span>
                            </div>
                            <ul class="space-y-1.5 pl-7">
                                ${日志.added.map(i => `<li class="text-sm text-gray-600">${HTML转义(i)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${日志.improved && 日志.improved.length ? `
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">↑</span>
                                <span class="text-sm font-semibold text-gray-700">优化改进</span>
                            </div>
                            <ul class="space-y-1.5 pl-7">
                                ${日志.improved.map(i => `<li class="text-sm text-gray-600">${HTML转义(i)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${日志.fixed && 日志.fixed.length ? `
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">✓</span>
                                <span class="text-sm font-semibold text-gray-700">问题修复</span>
                            </div>
                            <ul class="space-y-1.5 pl-7">
                                ${日志.fixed.map(i => `<li class="text-sm text-gray-600">${HTML转义(i)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `
        <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">更新日志</h1>
                <p class="text-gray-500">持续迭代，记录每一次进步</p>
            </div>

            <!-- 筛选按钮 -->
            <div class="flex flex-wrap gap-2 mb-8">
                ${筛选按钮HTML}
            </div>

            <!-- 日志列表 -->
            <div id="changelog-list" class="space-y-6">
                ${日志HTML || '<p class="text-gray-400 text-center py-8">暂无更新日志</p>'}
            </div>
        </section>
    `;
}
