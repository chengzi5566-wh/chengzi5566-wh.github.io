/**
 * 系统页面渲染模块
 * 负责首页、产品矩阵页、系统详情页的渲染
 */

import { 加载站点配置, 加载系统列表, 加载功能列表, 加载更新日志, HTML转义, 格式化日期, 按系统筛选, 按排序排序, 按字段分组 } from './utils.js';
import { 渲染系统卡片 } from './components.js';
import { 渲染系统下载卡片 } from './render-downloads.js';

/**
 * 渲染首页
 * @returns {Promise<string>} 首页 HTML
 */
export async function 渲染首页() {
    const [站点配置, 系统列表, 更新日志] = await Promise.all([
        加载站点配置(),
        加载系统列表(),
        加载更新日志()
    ]);

    const 最新日志 = [...更新日志].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

    const 系统卡片HTML = 系统列表.map(系统 => 渲染系统卡片(系统)).join('');

    const 优势HTML = (站点配置.advantages || []).map((优势, 索引) => {
        const 渐变列表 = [
            'bg-gradient-to-br from-amber-400 to-amber-600 text-white',
            'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
            'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
            'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
        ];
        const 图标渐变 = 渐变列表[索引 % 渐变列表.length];
        return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-400/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-lg ${图标渐变} flex items-center justify-center text-xl mb-4 shadow-sm">
                <i class="fa-solid ${HTML转义(优势.icon)}"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">${HTML转义(优势.title)}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">${HTML转义(优势.description)}</p>
        </div>
    `;
    }).join('');

    const 日志HTML = 最新日志.map(日志 => {
        const 系统 = 系统列表.find(s => s.id === 日志.systemId);
        const 主题色 = 系统?.themeColor || '#18181B';
        return `
            <div class="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                <div class="flex-shrink-0 w-2 h-2 rounded-full mt-2" style="background:${主题色}"></div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-sm font-semibold text-gray-800">${HTML转义(日志.systemName)} ${HTML转义(日志.version)}</span>
                        <span class="text-xs text-gray-400">${格式化日期(日志.date)}</span>
                    </div>
                    <p class="text-sm text-gray-500 line-clamp-2">${HTML转义(日志.added[0] || '')}</p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <!-- Hero 区域 -->
        <section id="hero-section" class="relative overflow-hidden hero-动态背景 text-white">
            <!-- 网格纹理层 -->
            <div class="absolute inset-0 网格纹理"></div>
            <!-- 彩色光晕装饰层（缓慢漂浮） -->
            <div class="absolute inset-0 overflow-hidden">
                <div class="光晕漂浮1 absolute -top-20 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div class="光晕漂浮2 absolute top-20 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"></div>
                <div class="光晕漂浮3 absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
            <!-- 鼠标跟随光晕 -->
            <div id="鼠标光晕" class="鼠标光晕 opacity-0"></div>
            <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                <div class="max-w-3xl">
                    <h1 class="标题微光 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">
                        ${HTML转义(站点配置.hero.title)}
                    </h1>
                    <p class="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                        ${HTML转义(站点配置.hero.subtitle)}
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <a href="${HTML转义(站点配置.hero.ctaPrimary.href)}" class="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 hover:scale-105">
                            <i class="fa-solid fa-rocket mr-2"></i>${HTML转义(站点配置.hero.ctaPrimary.text)}
                        </a>
                        <a href="${HTML转义(站点配置.hero.ctaSecondary.href)}" class="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 hover:scale-105">
                            ${HTML转义(站点配置.hero.ctaSecondary.text)}<i class="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- 系统矩阵 -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-3">产品矩阵</h2>
                <p class="text-gray-500">两套系统，覆盖教学与办公两大场景</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6 md:gap-8">
                ${系统卡片HTML}
            </div>
        </section>

        <!-- 核心优势 -->
        <section class="bg-white py-16 md:py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-800 mb-3">核心优势</h2>
                    <p class="text-gray-500">为什么选择这些系统</p>
                </div>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${优势HTML}
                </div>
            </div>
        </section>

        <!-- 最新动态 -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div class="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-3">持续迭代更新</h2>
                    <p class="text-gray-500 mb-6">系统在持续开发中，功能不断完善</p>
                    <a href="#/changelog" class="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                        查看全部更新日志
                        <i class="fa-solid fa-arrow-right ml-2"></i>
                    </a>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    ${日志HTML || '<p class="text-gray-400 text-center py-8">暂无更新日志</p>'}
                </div>
            </div>
        </section>

        <!-- 行动号召 -->
        <section class="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-gray-900 to-zinc-800 py-16">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
            <div class="relative max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold text-white mb-4">了解更多产品详情</h2>
                <p class="text-gray-400 mb-8">探索每套系统的完整功能列表与更新历程</p>
                <a href="#/products" class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25">
                    浏览全部产品
                    <i class="fa-solid fa-arrow-right ml-2"></i>
                </a>
            </div>
        </section>
    `;
}

/**
 * 渲染产品矩阵页
 * @returns {Promise<string>} 产品矩阵页 HTML
 */
export async function 渲染产品矩阵页() {
    const 系统列表 = await 加载系统列表();

    const 系统卡片HTML = 系统列表.map(系统 => 渲染系统卡片(系统)).join('');

    return `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="mb-10">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">产品矩阵</h1>
                <p class="text-gray-500">两套系统，覆盖教学与办公两大场景</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6 md:gap-8">
                ${系统卡片HTML}
            </div>
        </section>
    `;
}

/**
 * 渲染系统详情页
 * @param {string} 系统ID - 系统 ID
 * @returns {Promise<string>} 系统详情页 HTML
 */
export async function 渲染系统详情页(系统ID) {
    const [系统列表, 功能列表, 更新日志, 下载卡片HTML] = await Promise.all([
        加载系统列表(),
        加载功能列表(),
        加载更新日志(),
        渲染系统下载卡片(系统ID)
    ]);

    const 系统 = 系统列表.find(s => s.id === 系统ID);
    if (!系统) {
        return `
            <section class="max-w-7xl mx-auto px-4 py-20 text-center">
                <i class="fa-solid fa-circle-exclamation text-5xl text-gray-300 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-700 mb-2">系统不存在</h1>
                <p class="text-gray-500 mb-6">未找到该系统的相关信息</p>
                <a href="#/products" class="text-amber-600 font-semibold hover:underline">返回产品矩阵</a>
            </section>
        `;
    }

    const 系统功能 = 按系统筛选(功能列表, 系统ID);
    const 功能分组 = 按字段分组(系统功能, 'group');
    const 系统日志 = 按系统筛选(更新日志, 系统ID);

    // 渲染技术栈标签
    const 技术栈HTML = (系统.techStack || []).map(技术 =>
        `<span class="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/10">${HTML转义(技术)}</span>`
    ).join('');

    // 渲染核心指标
    const 指标HTML = (系统.keyMetrics || []).map(指标 => `
        <div class="text-center">
            <div class="text-2xl md:text-3xl font-bold text-white">${HTML转义(指标.value)}</div>
            <div class="text-xs text-gray-400 mt-1">${HTML转义(指标.label)}</div>
        </div>
    `).join('');

    // 渲染系统亮点
    const 亮点HTML = (系统.highlights || []).map(亮点 => `
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3" style="background:${系统.themeColor}">
                <i class="fa-solid ${HTML转义(亮点.icon)}"></i>
            </div>
            <h3 class="font-bold text-gray-800 mb-1">${HTML转义(亮点.title)}</h3>
            <p class="text-sm text-gray-500">${HTML转义(亮点.description)}</p>
        </div>
    `).join('');

    // 渲染应用场景
    const 场景HTML = (系统.useCases || []).map(场景 => `
        <li class="flex items-start gap-3">
            <i class="fa-solid fa-check-circle mt-1 flex-shrink-0" style="color:${系统.themeColor}"></i>
            <span class="text-gray-600">${HTML转义(场景)}</span>
        </li>
    `).join('');

    // 渲染功能分组
    const 功能HTML = Object.entries(功能分组).map(([分组, 功能]) => {
        const 排序后功能 = 按排序排序(功能);
        const 功能卡片HTML = 排序后功能.map(f => `
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm" style="background:${系统.themeColor}">
                        <i class="fa-solid ${HTML转义(f.icon)}"></i>
                    </div>
                    <h4 class="font-bold text-gray-800">${HTML转义(f.name)}</h4>
                    ${f.isHighlight ? '<span class="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-600">亮点</span>' : ''}
                </div>
                <p class="text-sm text-gray-500 mb-3">${HTML转义(f.description)}</p>
                ${f.highlights ? `<ul class="space-y-1">${f.highlights.map(h => `<li class="text-xs text-gray-400 flex items-center gap-2"><i class="fa-solid fa-minus text-gray-300"></i>${HTML转义(h)}</li>`).join('')}</ul>` : ''}
            </div>
        `).join('');
        return `
            <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="w-1 h-5 rounded" style="background:${系统.themeColor}"></span>
                    ${HTML转义(分组)}
                </h3>
                <div class="grid sm:grid-cols-2 gap-4">
                    ${功能卡片HTML}
                </div>
            </div>
        `;
    }).join('');

    // 渲染版本日志时间轴
    const 日志HTML = 系统日志.map(日志 => `
        <div class="relative pl-8 pb-8 border-l-2 border-gray-200 last:pb-0">
            <div class="absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-[9px] flex items-center justify-center" style="background:${系统.themeColor}">
                <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300">
                <div class="flex items-center gap-2 flex-wrap mb-3">
                    <span class="font-bold text-gray-800">${HTML转义(日志.version)}</span>
                    <span class="text-xs text-gray-400">${格式化日期(日志.date)}</span>
                    <span class="px-2 py-0.5 text-xs rounded-full" style="background:${系统.themeColor}15;color:${系统.themeColor}">${HTML转义(日志.type)}</span>
                </div>
                ${日志.added.length ? `<div class="mb-2"><span class="text-xs font-semibold text-green-600">新增</span><ul class="mt-1 space-y-1">${日志.added.map(i => `<li class="text-sm text-gray-600 flex items-start gap-2"><span class="text-green-500">+</span>${HTML转义(i)}</li>`).join('')}</ul></div>` : ''}
                ${日志.improved.length ? `<div class="mb-2"><span class="text-xs font-semibold text-amber-600">优化</span><ul class="mt-1 space-y-1">${日志.improved.map(i => `<li class="text-sm text-gray-600 flex items-start gap-2"><span class="text-amber-500">↑</span>${HTML转义(i)}</li>`).join('')}</ul></div>` : ''}
                ${日志.fixed.length ? `<div><span class="text-xs font-semibold text-orange-600">修复</span><ul class="mt-1 space-y-1">${日志.fixed.map(i => `<li class="text-sm text-gray-600 flex items-start gap-2"><span class="text-orange-500">✓</span>${HTML转义(i)}</li>`).join('')}</ul></div>` : ''}
            </div>
        </div>
    `).join('');

    return `
        <!-- 系统头部 -->
        <section id="system-hero-section" class="relative overflow-hidden hero-动态背景 text-white">
            <!-- 网格纹理层 -->
            <div class="absolute inset-0 网格纹理"></div>
            <!-- 系统主题色光晕装饰层（缓慢漂浮） -->
            <div class="absolute inset-0 overflow-hidden">
                <div class="光晕漂浮1 absolute -top-10 -right-10 w-96 h-96 rounded-full blur-3xl" style="background:${系统.themeColor};opacity:0.2"></div>
                <div class="光晕漂浮2 absolute top-1/2 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div class="光晕漂浮3 absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl"></div>
            </div>
            <!-- 鼠标跟随光晕 -->
            <div id="system-鼠标光晕" class="鼠标光晕 opacity-0"></div>
            <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="flex items-center gap-2 text-white/70 text-sm mb-4">
                    <a href="#/products" class="hover:text-amber-400 transition-colors">产品矩阵</a>
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                    <span>${HTML转义(系统.name)}</span>
                </div>
                <div class="flex items-start gap-5 mb-6">
                    <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                        <i class="fa-solid ${HTML转义(系统.icon)}"></i>
                    </div>
                    <div>
                        <h1 class="标题微光 text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">${HTML转义(系统.name)}</h1>
                        <p class="text-gray-300 text-lg">${HTML转义(系统.subtitle)}</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${技术栈HTML}
                </div>
                <div class="flex gap-8">
                    ${指标HTML}
                </div>
            </div>
        </section>

        <!-- 系统简介 -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">系统简介</h2>
                    <p class="text-gray-600 leading-relaxed mb-6">${HTML转义(系统.description)}</p>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">核心亮点</h3>
                    <div class="grid sm:grid-cols-2 gap-4">
                        ${亮点HTML}
                    </div>
                </div>
                <div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
                        <h3 class="font-bold text-gray-800 mb-4">应用场景</h3>
                        <ul class="space-y-3">
                            ${场景HTML}
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- 功能模块 -->
        <section class="bg-gray-50 py-12 md:py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">功能模块</h2>
                <div class="space-y-10">
                    ${功能HTML}
                </div>
            </div>
        </section>

        <!-- 版本历程 -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">版本历程</h2>
            <div class="max-w-3xl mx-auto">
                ${日志HTML || '<p class="text-gray-400 text-center py-8">暂无版本日志</p>'}
            </div>
        </section>

        <!-- 最新版本下载 -->
        ${下载卡片HTML}
    `;
}
