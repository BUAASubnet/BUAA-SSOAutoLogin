// ==UserScript==
// @name         BUAA SSO Auto Login
// @name:zh-CN   北航统一认证自动登录
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Prompts for credentials if not found, then posts login data and reloads the page.
// @description:zh-CN 当进入sso界面时自动触发登录。
// @author       MooreFoss https://github.com/MooreFoss
// @match        *://sso.buaa.edu.cn/login*
// @connect      buaa.edu.cn
// @connect      *.buaa.edu.cn
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(async function () {
    'use strict';

    /**
     * A simplified API class for BUAA SSO.
     */
    class BuaaApi {
        constructor(username = null, password = null) {
            this.username = username;
            this.password = password;
            this.headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            };
        }

        /**
         * A promisified wrapper for GM_xmlhttpRequest.
         * @param {object} options - Options for GM_xmlhttpRequest.
         * @returns {Promise<object>} - Resolves with the response object.
         */
        _request(options) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    ...options,
                    onload: resolve,
                    onerror: (err) => reject(new Error('Network Error: ' + err.statusText)),
                    ontimeout: () => reject(new Error('Request Timeout')),
                });
            });
        }

        /**
         * Logs into the BUAA SSO system and then reloads the page.
         */
        async login(url, username = null, password = null) {
            username = username || this.username;
            password = password || this.password;

            if (!username || !password) {
                throw new Error("需要用户名和密码。");
            }

            console.log('正在尝试登录...');

            // 1. 获取登录页面以拿到 'execution' token
            const getResponse = await this._request({
                method: 'GET',
                url: url,
                headers: this.headers,
            });

            const loginHtml = getResponse.responseText;
            const loginUrl = getResponse.finalUrl;

            if (!loginHtml.includes('input name="execution"')) {
                console.log('似乎已经登录或未找到登录表单。');
                return;
            }

            const executionMatch = loginHtml.match(/<input name="execution" value="([^"]+)"/);
            if (!executionMatch) {
                throw new Error('无法在登录页面上找到 execution token。');
            }
            const execution = executionMatch[1];
            console.log('找到 Execution token:', execution.substring(0, 40) + '...'); // 缩短显示

            // 2. 构造并发送 POST 登录请求
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('submit', '登录');
            formData.append('type', 'username_password');
            formData.append('execution', execution);
            formData.append('_eventId', 'submit');

            const postResponse = await this._request({
                method: 'POST',
                url: loginUrl,
                headers: { ...this.headers, "Content-Type": "application/x-www-form-urlencoded" },
                data: formData.toString(),
            });

            // 3. 检查POST响应，如果成功 (200)，则刷新页面
            if (postResponse.status === 200) {
                console.log('登录POST请求成功，即将刷新页面...');
                window.location.reload();
            } else {
                // 如果登录失败，服务器通常会返回200并在页面内显示错误信息
                const finalErrorMatch = postResponse.responseText.match(/<div class="tip-text">([^<]+)<\/div>/);
                if (finalErrorMatch) {
                    throw new Error(`登录失败: ${finalErrorMatch[1]}`);
                } else {
                    throw new Error(`登录失败，状态码: ${postResponse.status}。期望的状态码是 200。`);
                }
            }
        }
    }

    // --- 主执行逻辑 ---

    // 1. 设置用户菜单命令
    GM_registerMenuCommand("设置/修改登录凭据", async () => {
        const user = prompt("请输入你的统一认证账号:", await GM_getValue("buaa_username", ""));
        if (user === null) return; // 用户取消
        const pass = prompt("请输入你的统一认证密码:");
        if (pass === null) return; // 用户取消

        if (user && pass) {
            await GM_setValue("buaa_username", user);
            await GM_setValue("buaa_password", pass);
            alert("凭据已保存。");
        } else if (!pass) {
            alert("密码不能为空，凭据未保存。")
        }
    });

    GM_registerMenuCommand("手动执行登录并刷新", async () => {
        try {
            const user = await GM_getValue("buaa_username");
            const pass = await GM_getValue("buaa_password");
            if (!user || !pass) {
                alert("请先通过菜单设置登录凭据。");
                return;
            }
            const api = new BuaaApi(user, pass);
            await api.login(window.location.href);
            // 如果成功，页面会自动刷新。如果失败，会抛出异常。
        } catch (e) {
            alert("登录操作失败: " + e.message);
            console.error(e);
        }
    });

    // 2. 在登录页面自动执行登录
    if (window.location.href.startsWith("https://sso.buaa.edu.cn/login")) {
        // 确保页面上存在用户名输入框，避免在已登录的提示页重复执行
        if (document.querySelector('input[name="username"]')) {
            console.log('检测到登录页面，准备自动登录...');
            let user = await GM_getValue("buaa_username");
            let pass = await GM_getValue("buaa_password");

            // *** 新增逻辑：如果未找到凭据，则提示用户输入 ***
            if (!user || !pass) {
                console.log('未找到已保存的凭据，将提示用户输入。');
                alert("北航统一认证自动登录脚本：\n首次使用或未配置凭据，请在接下来的对话框中输入。");
                const promptedUser = prompt("请输入你的统一认证账号:", "");
                const promptedPass = promptedUser ? prompt("请输入你的统一认证密码:") : null;

                if (promptedUser && promptedPass) {
                    await GM_setValue("buaa_username", promptedUser);
                    await GM_setValue("buaa_password", promptedPass);
                    alert("凭据已保存，现在将尝试自动登录。");
                    // 更新变量以用于本次登录
                    user = promptedUser;
                    pass = promptedPass;
                } else {
                    console.log('用户取消输入凭据，跳过自动登录。');
                }
            }

            // 如果现在有凭据了（无论是之前存的还是刚刚输入的），则执行登录
            if (user && pass) {
                const api = new BuaaApi(user, pass);
                try {
                    await api.login(window.location.href);
                } catch (e) {
                    console.error('自动登录失败:', e.message);
                    // 在页面上显示一个提示，避免无限循环登录失败
                    let errorDiv = document.getElementById('gm_login_error');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.id = 'gm_login_error';
                        errorDiv.style.color = 'red';
                        errorDiv.style.textAlign = 'center';
                        errorDiv.style.padding = '10px';
                        errorDiv.style.fontWeight = 'bold';
                        const form = document.querySelector('.form-signin');
                        if (form) {
                            form.parentNode.insertBefore(errorDiv, form);
                        }
                    }
                    errorDiv.textContent = '油猴脚本自动登录失败: ' + e.message;
                }
            }
        }
    }
})();