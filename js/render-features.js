/**
 * 功能页面渲染模块
 * 负责功能一览页的渲染，支持按系统筛选
 */

import { 加载功能列表, 加载系统列表, HTML转义, 按排序排序, 按字段分组 } from './utils.js';

/**
 * 渲染功能一览页
 * @returns {Promise<string>} 功能页 HTML
 */
export async function 渲染功能页() {
    const [功能列表, 系统列表] = await Promise.all([
        加载功能列表(),
        加载系统列表()
    ]);

    // 按系统分组
    const 系统分组 = 按字段分组(功能列表, 'systemId');

    // 生成筛选按钮
    const 筛选按钮HTML = [
        `<button class="filter-btn active px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white" data-system="all">全部系统</button>`,
        ...系统列表.map(系统 => `
            <button class="filter-btn px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors" data-system="${HTML转义(系统.id)}">
                <i class="fa-solid ${HTML转义(系统.icon)} mr-1" style="color:${系统.themeColor}"></i>${HTML转义(系统.name)}
            </button>
        `)
    ].join('');

    // 渲染每个系统的功能
    const 功能区HTML = 系统列表.map(系统 => {
        const 系统功能 = 按排序排序(系统分组[系统.id] || []);
        const 分组功能 = 按字段分组(系统功能, 'group');

        const 系统功能HTML = Object.entries(分组功能).map(([分组, 功能]) => `
            <div class="mb-8">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="w-1 h-5 rounded" style="background:${系统.themeColor}"></span>
                    ${HTML转义(分组)}
                </h3>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${功能.map(f => `
                        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" style="background:${系统.themeColor}">
                                    <i class="fa-solid ${HTML转义(f.icon)}"></i>
                                </div>
                                <h4 class="font-bold text-gray-800">${HTML转义(f.name)}</h4>
                            </div>
                            <p class="text-sm text-gray-500 mb-3">${HTML转义(f.description)}</p>
                            ${f.highlights && f.highlights.length ? `<ul class="space-y-1">${f.highlights.map(h => `<li class="text-xs text-gray-400 flex items-center gap-2"><i class="fa-solid fa-check text-green-400 text-[10px]"></i>${HTML转义(h)}</li>`).join('')}</ul>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        return `
            <div class="feature-section mb-12" data-system="${HTML转义(系统.id)}">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" style="background:${系统.themeColor}">
                        <i class="fa-solid ${HTML转义(系统.icon)}"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">${HTML转义(系统.name)}</h2>
                        <p class="text-sm text-gray-500">${HTML转义(系统.subtitle)}</p>
                    </div>
                </div>
                ${系统功能HTML}
            </div>
        `;
    }).join('');

    return `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">功能一览</h1>
                <p class="text-gray-500">全面了解两套系统的功能模块</p>
            </div>

            <!-- 筛选按钮 -->
            <div class="flex flex-wrap gap-2 mb-10">
                ${筛选按钮HTML}
            </div>

            <!-- 功能区域 -->
            <div id="feature-sections">
                ${功能区HTML}
            </div>
        </section>
    `;
}
