# BUAA SSO Auto Login

## 简介

BUAA SSO Auto Login 是一个基于油猴脚本（Tampermonkey/Greasemonkey）的自动登录工具，专为北京航空航天大学（BUAA）统一身份认证系统设计。该脚本能够自动化登录过程，免去每次手动输入用户名和密码的繁琐操作。

## 功能特性

- 🚀 **自动登录**: 检测到登录页面时自动执行登录操作
- 🔒 **安全存储**: 使用 GM_setValue/GM_getValue 安全存储用户凭据
- 📱 **友好交互**: 首次使用时引导用户输入凭据
- ⚙️ **便捷管理**: 提供菜单命令方便设置和修改登录信息
- 🔄 **手动触发**: 支持手动执行登录操作
- ❌ **错误处理**: 完善的错误处理机制，登录失败时显示错误信息

## 安装步骤

### 1. 安装浏览器扩展

首先需要安装油猴脚本管理器：

- **Chrome**: 安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: 安装 [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) 或 [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Safari**: 安装 [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)
- **Edge**: 安装 [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. 安装脚本

#### 方法一：一键安装（推荐）

点击下方链接直接安装脚本：

**[📥 点击安装 BUAA SSO Auto Login](https://cdn.jsdelivr.net/gh/BUAASubnet/BUAA-SSOAutoLogin/main.user.js)**

> 点击链接后，Tampermonkey 会自动打开脚本安装页面，点击"安装"即可。

#### 方法二：手动安装

如果上述链接无法使用，可以手动安装：

1. 复制 `login.js` 文件中的所有内容
2. 打开 Tampermonkey 控制面板
3. 点击 "创建新脚本"
4. 删除默认内容，粘贴复制的脚本代码
5. 按 `Ctrl+S` 保存脚本

## 使用说明

### 首次使用

1. 访问 `https://sso.buaa.edu.cn/login` 页面
2. 脚本会自动检测到这是首次使用，弹出提示对话框
3. 依次输入您的统一认证账号和密码
4. 脚本会保存凭据并自动执行登录

### 日常使用

- 每次访问北航统一认证登录页面时，脚本会自动执行登录
- 登录成功后页面会自动刷新并跳转到目标页面

### 管理凭据

脚本提供了两个菜单命令，可通过点击浏览器地址栏右侧的 Tampermonkey 图标访问：

1. **设置/修改登录凭据**: 修改或更新保存的用户名和密码
2. **手动执行登录并刷新**: 手动触发登录过程

## 技术实现

### 主要组件

- **BuaaApi 类**: 封装了与北航 SSO 系统的交互逻辑
- **凭据管理**: 使用 GM_setValue/GM_getValue 进行本地存储
- **自动检测**: 基于 URL 匹配和页面元素检测

### 登录流程

1. 发送 GET 请求获取登录页面
2. 解析页面获取 execution token
3. 构造 POST 请求发送登录数据
4. 根据响应结果判断登录是否成功
5. 成功后刷新页面完成登录

### 权限要求

脚本需要以下权限：
- `GM_xmlhttpRequest`: 用于发送网络请求
- `GM_setValue/GM_getValue`: 用于存储用户凭据
- `GM_registerMenuCommand`: 用于注册菜单命令

## 安全性说明

- 用户凭据使用浏览器扩展的安全存储机制保存
- 脚本仅在 `*.buaa.edu.cn` 域名下运行
- 不会向第三方服务器发送任何用户信息
- 建议定期更改统一认证密码以确保账户安全

## 故障排除

### 常见问题

**Q: 脚本不工作怎么办？**
A: 检查 Tampermonkey 是否已启用该脚本，确保访问的是 `https://sso.buaa.edu.cn/login` 页面

**Q: 登录失败显示错误信息？**
A: 检查用户名和密码是否正确，可以通过菜单命令重新设置凭据

**Q: 如何查看脚本运行日志？**
A: 按 F12 打开开发者工具，在 Console 选项卡中查看相关日志信息

### 调试模式

如需调试，可以在浏览器控制台中查看详细的执行日志：
- 登录尝试信息
- Execution token 获取状态
- 网络请求响应状态
- 错误信息详情

## 版本信息

- **当前版本**: 1.0
- **作者**: MooreFoss
- **GitHub**: https://github.com/MooreFoss
- **兼容性**: 支持所有主流浏览器的油猴脚本扩展

## 许可证

本项目遵循 MIT 许可证，详情请参阅 LICENSE 文件。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 免责声明

本脚本仅供学习和研究使用，使用者应遵守学校相关规定。作者不对使用本脚本可能产生的任何问题承担责任。请确保您有权使用自动化工具访问相关系统。

---

**注意**: 请妥善保管您的登录凭据，不要在不安全的环境中使用此脚本。
