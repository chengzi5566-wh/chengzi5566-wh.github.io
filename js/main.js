/**
 * 主入口模块
 * 负责应用初始化、路由调度、页面渲染
 */

import { 加载站点配置, 获取当前路由, 滚动到顶部 } from './utils.js';
import { 渲染导航栏, 渲染页脚, 初始化回到顶部按钮, 初始化导航栏效果 } from './components.js';
import { 渲染首页, 渲染产品矩阵页, 渲染系统详情页 } from './render-systems.js';
import { 渲染功能页 } from './render-features.js';
import { 渲染更新日志页 } from './render-changelogs.js';
import { 渲染下载页, 渲染系统下载卡片 } from './render-downloads.js';

/**
 * 渲染关于页
 * @param {Object} 站点配置 - 站点配置
 * @returns {string} 关于页 HTML
 */
function 渲染关于页(站点配置) {
    return `
        <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">关于</h1>
                <p class="text-gray-500">了解开发者与项目故事</p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                        🍊
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">${站点配置.author}</h2>
                        <p class="text-gray-500 text-sm">独立开发者</p>
                    </div>
                </div>
                <p class="text-gray-600 leading-relaxed mb-4">
                    你好！我是 ${站点配置.author}，一名热爱用代码解决实际问题的独立开发者。
                    我专注于开发面向教师和办公人员的实用软件系统，希望通过技术让教学和办公更高效。
                </p>
                <p class="text-gray-600 leading-relaxed">
                    目前已开发两套系统：面向中小学教师的智能办公平台，和面向管理人员的办公协作平台。
                    所有系统均在持续迭代中，如果你有任何建议或合作意向，欢迎联系我。
                </p>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">技术栈偏好</h3>
                <div class="flex flex-wrap gap-2">
                    ${['Python', 'FastAPI', 'Flask', 'Vue 3', 'Element Plus', 'Tailwind CSS', 'SQLite', 'DeepSeek API'].map(技术 => `
                        <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">${技术}</span>
                    `).join('')}
                </div>
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4">联系方式</h3>
                <div class="flex flex-wrap gap-4">
                    ${Object.entries(站点配置.socialLinks || {}).map(([名称, 链接]) => {
                        const 图标类 = 名称 === 'GitHub' ? 'fa-github' : 'fa-envelope';
                        return `
                            <a href="${链接}" target="_blank" class="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors text-gray-600 hover:text-amber-600">
                                <i class="fa-brands ${图标类}"></i>
                                <span>${名称}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        </section>
    `;
}

/**
 * 渲染 404 页面
 * @returns {string} 404 页面 HTML
 */
function 渲染404页() {
    return `
        <section class="max-w-4xl mx-auto px-4 py-20 text-center">
            <div class="text-8xl font-bold text-gray-200 mb-4">404</div>
            <h1 class="text-2xl font-bold text-gray-700 mb-2">页面未找到</h1>
            <p class="text-gray-500 mb-6">抱歉，您访问的页面不存在</p>
            <a href="#/" class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                <i class="fa-solid fa-home mr-2"></i>返回首页
            </a>
        </section>
    `;
}

/**
 * 绑定页面事件委托（处理动态渲染的筛选按钮等）
 */
function 绑定页面事件委托() {
    const 页面容器 = document.getElementById('page-container');
    if (!页面容器) return;

    页面容器.addEventListener('click', (事件) => {
        const 目标 = 事件.target.closest('.filter-btn, .changelog-filter-btn, .download-filter-btn');
        if (!目标) return;

        const 按钮元素 = 目标;
        const 按钮系统ID = 按钮元素.dataset.system;

        // 判断是功能页筛选还是日志页筛选
        if (按钮元素.classList.contains('filter-btn')) {
            // 功能页筛选
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            按钮元素.classList.add('active', 'bg-primary', 'text-white');
            按钮元素.classList.remove('bg-white', 'text-gray-600');

            document.querySelectorAll('.feature-section').forEach(区 => {
                if (按钮系统ID === 'all' || 区.dataset.system === 按钮系统ID) {
                    区.classList.remove('hidden');
                } else {
                    区.classList.add('hidden');
                }
            });
        } else if (按钮元素.classList.contains('changelog-filter-btn')) {
            // 日志页筛选
            document.querySelectorAll('.changelog-filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            按钮元素.classList.add('active', 'bg-primary', 'text-white');
            按钮元素.classList.remove('bg-white', 'text-gray-600');

            document.querySelectorAll('.changelog-item').forEach(项 => {
                if (按钮系统ID === 'all' || 项.dataset.system === 按钮系统ID) {
                    项.classList.remove('hidden');
                } else {
                    项.classList.add('hidden');
                }
            });
        } else if (按钮元素.classList.contains('download-filter-btn')) {
            // 下载页筛选
            document.querySelectorAll('.download-filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            按钮元素.classList.add('active', 'bg-primary', 'text-white');
            按钮元素.classList.remove('bg-white', 'text-gray-600');

            document.querySelectorAll('.download-item').forEach(项 => {
                if (按钮系统ID === 'all' || 项.dataset.system === 按钮系统ID) {
                    项.classList.remove('hidden');
                } else {
                    项.classList.add('hidden');
                }
            });

            // 检查筛选后是否有可见项，控制分区标题显示（使用 data 属性精确选择器）
            const 最新区 = document.querySelector('[data-section="latest"]');
            const 历史区 = document.querySelector('[data-section="history"]');
            if (最新区 && 最新区.querySelector('.download-item')) {
                最新区.style.display = '';
            } else if (最新区) {
                最新区.style.display = 'none';
            }
            if (历史区 && 历史区.querySelector('.download-item')) {
                历史区.style.display = '';
            } else if (历史区) {
                历史区.style.display = 'none';
            }
        }
    });
}

/**
 * 初始化 Hero 区鼠标交互效果
 * 鼠标移动时光晕跟随 + 视差效果
 * @param {string} 区域ID - Hero 区域元素 ID
 * @param {string} 光晕ID - 鼠标光晕元素 ID
 */
function 初始化Hero交互(区域ID = 'hero-section', 光晕ID = '鼠标光晕') {
    const Hero区域 = document.getElementById(区域ID);
    const 鼠标光晕 = document.getElementById(光晕ID);
    if (!Hero区域 || !鼠标光晕) return;

    // 视差元素（装饰光晕层）
    const 装饰层 = Hero区域.querySelector('.absolute.inset-0.overflow-hidden');

    let 动画帧ID = null;
    let 目标X = 0, 目标Y = 0;
    let 当前X = 0, 当前Y = 0;

    Hero区域.addEventListener('mousemove', (事件) => {
        const 矩形 = Hero区域.getBoundingClientRect();
        目标X = 事件.clientX - 矩形.left;
        目标Y = 事件.clientY - 矩形.top;

        // 显示光晕
        鼠标光晕.classList.remove('opacity-0');
        鼠标光晕.classList.add('opacity-100');

        // 平滑动画
        if (动画帧ID) cancelAnimationFrame(动画帧ID);

        const 动画 = () => {
            当前X += (目标X - 当前X) * 0.1;
            当前Y += (目标Y - 当前Y) * 0.1;

            鼠标光晕.style.left = 当前X + 'px';
            鼠标光晕.style.top = 当前Y + 'px';

            // 视差效果：装饰层轻微反向移动
            if (装饰层) {
                const 中心X = 矩形.width / 2;
                const 中心Y = 矩形.height / 2;
                const 偏移X = (当前X - 中心X) / 中心X * 15;
                const 偏移Y = (当前Y - 中心Y) / 中心Y * 15;
                装饰层.style.transform = `translate(${偏移X}px, ${偏移Y}px)`;
            }

            if (Math.abs(目标X - 当前X) > 0.5 || Math.abs(目标Y - 当前Y) > 0.5) {
                动画帧ID = requestAnimationFrame(动画);
            }
        };
        动画帧ID = requestAnimationFrame(动画);
    });

    // 鼠标离开隐藏光晕
    Hero区域.addEventListener('mouseleave', () => {
        鼠标光晕.classList.add('opacity-0');
        鼠标光晕.classList.remove('opacity-100');
    });
}

/**
 * 根据路由渲染对应页面
 */
async function 路由渲染() {
    const 路由 = 获取当前路由();
    const 页面容器 = document.getElementById('page-container');
    if (!页面容器) return;

    // 显示加载状态
    页面容器.innerHTML = `
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-gray-400">加载中...</p>
            </div>
        </div>
    `;

    try {
        let HTML内容 = '';

        switch (路由.路径) {
            case 'home':
                HTML内容 = await 渲染首页();
                break;
            case 'products':
                HTML内容 = await 渲染产品矩阵页();
                break;
            case 'system':
                HTML内容 = await 渲染系统详情页(路由.参数[0]);
                break;
            case 'features':
                HTML内容 = await 渲染功能页();
                break;
            case 'changelog':
                HTML内容 = await 渲染更新日志页();
                break;
            case 'downloads':
                HTML内容 = await 渲染下载页();
                break;
            case 'about':
                const 站点配置 = await 加载站点配置();
                HTML内容 = 渲染关于页(站点配置);
                break;
            default:
                HTML内容 = 渲染404页();
        }

        页面容器.innerHTML = HTML内容;
        滚动到顶部();

        // 初始化 Hero 区鼠标交互效果（首页 + 系统详情页）
        if (路由.路径 === 'home') {
            初始化Hero交互('hero-section', '鼠标光晕');
        } else if (路由.路径 === 'system') {
            初始化Hero交互('system-hero-section', 'system-鼠标光晕');
        }
    } catch (错误) {
        console.error('[路由渲染] 渲染失败:', 错误);
        页面容器.innerHTML = `
            <section class="max-w-4xl mx-auto px-4 py-20 text-center">
                <i class="fa-solid fa-triangle-exclamation text-5xl text-red-300 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-700 mb-2">加载失败</h1>
                <p class="text-gray-500 mb-6">页面加载出错，请刷新重试</p>
                <a href="#/" class="text-amber-600 font-semibold hover:underline">返回首页</a>
            </section>
        `;
    }
}

/**
 * 应用初始化
 */
async function 初始化应用() {
    try {
        // 加载站点配置
        const 站点配置 = await 加载站点配置();

        // 渲染导航栏和页脚
        渲染导航栏(站点配置);
        渲染页脚(站点配置);

        // 初始化交互效果
        初始化回到顶部按钮();
        初始化导航栏效果();

        // 绑定页面事件委托（处理动态渲染的筛选按钮等）
        绑定页面事件委托();

        // 绑定路由变化事件
        window.addEventListener('hashchange', 路由渲染);

        // 首次渲染
        await 路由渲染();
    } catch (错误) {
        console.error('[应用初始化] 失败:', 错误);
        document.getElementById('page-container').innerHTML = `
            <section class="max-w-4xl mx-auto px-4 py-20 text-center">
                <i class="fa-solid fa-triangle-exclamation text-5xl text-red-300 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-700 mb-2">网站初始化失败</h1>
                <p class="text-gray-500">请检查 data/site.json 文件是否存在</p>
            </section>
        `;
    }
}

// DOM 就绪后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', 初始化应用);
} else {
    初始化应用();
}
