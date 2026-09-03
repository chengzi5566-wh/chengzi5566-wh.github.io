/**
 * 通用组件模块
 * 提供导航栏、页脚、系统卡片等可复用 UI 组件
 */

import { 加载站点配置, HTML转义 } from './utils.js';

/**
 * 渲染导航栏
 * @param {Object} 站点配置 - 站点配置数据
 */
export function 渲染导航栏(站点配置) {
    const 导航元素 = document.getElementById('navbar');
    if (!导航元素) return;

    const 导航项HTML = (站点配置.navItems || []).map(项 => {
        return `<a href="${HTML转义(项.href)}" class="nav-link px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors">${HTML转义(项.label)}</a>`;
    }).join('');

    const 社交链接 = 站点配置.socialLinks || {};
    const 社交HTML = Object.entries(社交链接).map(([名称, 链接]) => {
        const 图标类 = 名称 === 'GitHub' ? 'fa-github' : 'fa-envelope';
        return `<a href="${HTML转义(链接)}" target="_blank" class="text-gray-500 hover:text-primary transition-colors" title="${HTML转义(名称)}"><i class="fa-brands ${图标类}"></i></a>`;
    }).join('');

    导航元素.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Logo -->
                <a href="#/" class="flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-primary transition-colors">
                    <span class="text-2xl">🍊</span>
                    <span>${HTML转义(站点配置.siteName)}</span>
                </a>

                <!-- 桌面导航 -->
                <div class="hidden md:flex items-center gap-1">
                    ${导航项HTML}
                </div>

                <!-- 社交链接 + 移动端菜单按钮 -->
                <div class="flex items-center gap-4">
                    <div class="hidden md:flex items-center gap-3 text-lg">
                        ${社交HTML}
                    </div>
                    <button id="mobile-menu-btn" class="md:hidden text-gray-600 hover:text-primary p-2">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- 移动端菜单 -->
            <div id="mobile-menu" class="hidden md:hidden pb-4">
                <div class="flex flex-col gap-2">
                    ${(站点配置.navItems || []).map(项 => `
                        <a href="${HTML转义(项.href)}" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">${HTML转义(项.label)}</a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // 绑定移动端菜单切换
    const 菜单按钮 = document.getElementById('mobile-menu-btn');
    const 移动菜单 = document.getElementById('mobile-menu');
    if (菜单按钮 && 移动菜单) {
        菜单按钮.addEventListener('click', () => {
            移动菜单.classList.toggle('hidden');
        });
    }
}

/**
 * 渲染页脚
 * @param {Object} 站点配置 - 站点配置数据
 */
export function 渲染页脚(站点配置) {
    const 页脚元素 = document.getElementById('footer');
    if (!页脚元素) return;

    const 社交链接 = 站点配置.socialLinks || {};
    const 社交HTML = Object.entries(社交链接).map(([名称, 链接]) => {
        const 图标类 = 名称 === 'GitHub' ? 'fa-github' : 'fa-envelope';
        return `<a href="${HTML转义(链接)}" target="_blank" class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-400/30 hover:text-amber-400 transition-all" title="${HTML转义(名称)}"><i class="fa-brands ${图标类}"></i></a>`;
    }).join('');

    页脚元素.innerHTML = `
        <!-- 页脚装饰光球 -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="光晕漂浮1 absolute -bottom-10 -right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div class="光晕漂浮2 absolute -top-10 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl"></div>
        </div>
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid md:grid-cols-3 gap-8 mb-8">
                <!-- 品牌区 -->
                <div>
                    <div class="flex items-center gap-2 text-lg font-bold text-white mb-3">
                        <span class="text-2xl">🍊</span>
                        <span>${HTML转义(站点配置.siteName)}</span>
                    </div>
                    <p class="text-gray-400 text-sm">${HTML转义(站点配置.siteSubtitle)}</p>
                </div>

                <!-- 导航区 -->
                <div>
                    <h4 class="text-white font-semibold mb-3">快速导航</h4>
                    <div class="flex flex-col gap-2">
                        ${(站点配置.navItems || []).map(项 => `
                            <a href="${HTML转义(项.href)}" class="text-gray-400 hover:text-amber-400 text-sm transition-colors">${HTML转义(项.label)}</a>
                        `).join('')}
                    </div>
                </div>

                <!-- 联系区 -->
                <div>
                    <h4 class="text-white font-semibold mb-3">联系方式</h4>
                    <div class="flex gap-3">
                        ${社交HTML}
                    </div>
                </div>
            </div>

            <div class="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
                ${HTML转义(站点配置.footerText)}
            </div>
        </div>
    `;
}

/**
 * 渲染系统卡片
 * @param {Object} 系统 - 系统数据对象
 * @returns {string} 卡片 HTML
 */
export function 渲染系统卡片(系统) {
    const 标签HTML = (系统.tags || []).map(标签 =>
        `<span class="px-2 py-0.5 text-xs rounded-full" style="background:${系统.themeColor}15;color:${系统.themeColor}">${HTML转义(标签)}</span>`
    ).join('');

    return `
        <a href="#/system/${HTML转义(系统.id)}" class="system-card group block bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-amber-500/10 border border-gray-100 hover:border-amber-400/50 overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div class="h-2" style="background:${系统.themeColor}"></div>
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl" style="background:${系统.themeColor}">
                        <i class="fa-solid ${HTML转义(系统.icon)}"></i>
                    </div>
                    <span class="text-xs text-gray-400">${HTML转义(系统.version)}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">${HTML转义(系统.name)}</h3>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${HTML转义(系统.subtitle)}</p>
                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${标签HTML}
                </div>
                <div class="flex items-center text-sm font-medium text-amber-600">
                    查看详情
                    <i class="fa-solid fa-arrow-right ml-1 transition-transform group-hover:translate-x-1"></i>
                </div>
            </div>
        </a>
    `;
}

/**
 * 渲染回到顶部按钮逻辑
 */
export function 初始化回到顶部按钮() {
    const 按钮 = document.getElementById('back-to-top');
    if (!按钮) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            按钮.classList.remove('opacity-0', 'invisible');
            按钮.classList.add('opacity-100', 'visible');
        } else {
            按钮.classList.add('opacity-0', 'invisible');
            按钮.classList.remove('opacity-100', 'visible');
        }
    });

    按钮.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * 初始化导航栏滚动效果
 */
export function 初始化导航栏效果() {
    const 导航 = document.getElementById('navbar');
    if (!导航) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            导航.classList.add('shadow-md');
        } else {
            导航.classList.remove('shadow-md');
        }
    });
}
