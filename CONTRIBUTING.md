# 参与开发

欢迎提交 Issue 描述问题、复现步骤和预期行为。请使用示例数据，隐藏个人记录、账号标识和凭证。

## 开发流程

1. Fork 仓库并克隆，建立功能分支（推荐 `codex/功能名`）。
2. 参考 README 安装依赖、初始化本地 D1 并启动开发服务。
3. 完成修改后执行：

   ```sh
   npm run check:public
   npm test
   npm run typecheck
   npm run build
   ```

4. 提交 PR，说明问题、改动和已验证的结果。界面变化附示例数据截图。

涉及认证或数据隔离的问题，请使用 [安全报告说明](SECURITY.md)，不要在公开 Issue 中贴出个人数据。

## 持续维护

GitHub 保存版本历史，每次 push 和 PR 自动运行公开源码检查、单元测试、类型检查与构建。Actions 不连接生产 D1，不保存站点发布凭证，也不自动部署网站。工作流使用 GitHub 官方的 [Node.js CI 方式](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)。

原仓库维护者完成一次修改后，审阅并提交，再运行 `npm run sync:github`。该命令只推送已提交的 `main`，检查仓库地址和工作区状态；若 GitHub 出现本地没有的提交会停止，需先正常合并。它不会自动添加文件、强推或定时收集本机文件。

Fork 贡献者直接向自己的远端推送分支并创建 PR。`sync:github` 是原仓库维护命令，不用来发布 Fork。

网站有单独的 Sites 发布流程。`.openai/hosting.json` 的 `project_id` 是现有站点标识，不是密钥；Fork 后若发布自己的站点，需要创建自己的 Site 并替换标识，不要复用原站点作为发布目标。部署至其他平台时，必须实现可信的身份认证与 D1 绑定；禁止直接信任公网客户端伪造的身份头。
