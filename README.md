# 喝大水

私有云端 MCP App。每次记录 100 / 200 / 250 / 350 / 500 ml 或自定义数量，按北京时间累加；最近七天一天一只水杯，用水位表示当前每日目标的完成比例。默认目标 2000 ml，可修改。

## 使用

打开插件中的“喝大水”，或直接在聊天里说“刚喝了 250 毫升”。只有明确的记录操作会增加饮水量，早晨提醒不会自动创建记录。点击日期杯子可补记或查看、修改、删除单次记录。删除以 tombstone 保存，重复请求不会恢复已删记录。

UI 优先 inline，同时声明 fullscreen 并注册 thread entrypoint；实际展示位置由宿主选择。网页与 MCP UI 共用 React 组件和业务服务。数据只保存在 D1，iframe 不保存业务记录。所有读写按平台传入的用户身份过滤。

## 本地开发

需要 Node >=22.13。`npm run install:ci` 安装依赖；`npm run build:ui` 生成自包含 MCP UI；`npm test` 测试日期和统计；`npx tsc --noEmit` 检查类型。

`npm run db:generate` 生成新增迁移；生产构建使用 Sites 的 `build-site.mjs`（自动执行 prebuild）。构建后，按顺序对本地 D1 应用尚未执行的迁移：

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_organic_slayback.sql
npm run dev -- --host 127.0.0.1 --port 3187
```

开发预览使用 Sites 模板的本地模拟登录，不是云端身份验证。`npm start -- --port 3188` 启动不模拟登录的已构建 Worker，然后运行 `python3 tests/integration.py`，使用独立测试身份验证读写、隔离、幂等和 MCP。此测试脚本只允许 loopback 地址。

## MCP 接口

- `hydration_read_week({})`：读取今天及前六天，返回日期、毫升总量、单次记录、水位和统计。
- `hydration_add({amountMl,requestId,occurredAt?})`：新增一次饮水；新饮水必须用新 requestId，网络重试复用同一 ID；occurredAt 为包含时区的 ISO 时间，缺省为现在。
- `hydration_update({id,amountMl,occurredAt?})` / `hydration_delete({id})`：修改、删除当前用户的记录。
- `hydration_set_goal({goalMl})`：修改用于全部七日杯子图的当前目标。
- `hydration_open({})`：返回当前数据并打开 `ui://he-da-shui/hydration-v6.html`。

标准 JSON-RPC 入口 `/mcp` 支持 discover、initialize、tools/list、tools/call、resources/list、resources/read。数据工具返回 structuredContent，只有打开工具关联 UI 资源。网站 `/api/hydration` 使用相同业务服务。Sites 平台负责认证和私有访问边界；服务器代码不接受客户端提供的 userId。

## 每日提问

插件连接并验证可调用后，通过当前聊天的 Codex heartbeat 设置每天北京时间 09:00：读取昨天和近七日情况、打开卡片、提问“今天喝水了吗？记一笔。”。调度依赖 Codex 环境可用，云端服务本身不发送消息。未记录必须表述为“未记录”，不可推断为没喝水；没有用户明确输入时不得写入。首次次日真实触发需要在上线后观察。

## 发布

Site 身份见 `.openai/hosting.json`。通过 Sites 源码工作流提交、打包、私有发布；复用平台创建的 canonical plugin，不另建重复插件。Local D1 数据不会随源码发布到云端。部署归档、测试截图和最终验收信息保存于忽略的 `outputs/`。

## 两种布局

聊天中的 MCP App 使用紧凑布局：当日累计、记一笔、七日杯子图；完整网页可通过私有 Site 地址直接访问。完整网页默认展开目标设置和每日明细。两种布局复用 `HydrationApp`、饮水控件和业务服务。`/?view=compact` 可预览紧凑布局；默认 `/` 为完整布局。旧 v1/v2/v3/v4/v5 UI 资源地址仍可读取，新打开工具使用 v6 资源。紧凑布局关闭 prefersBorder（含兼容字段），移除应用白底圆角外壳和分区盒框，仅保留交互控件轮廓。宿主是否保留工具卡外壳由 Codex 决定。

紧凑卡片只保留主数据与操作：今日总量/目标、毫升数选择、自定义输入、记一笔、七日杯子与每日数值。隐藏重复标题、输入说明、百分比、日期范围、重复日期及底部统计；屏幕阅读器仍能读取毫升单位、完整日期和未记录状态。

嵌入卡片填满宿主提供的宽度，七日杯子图置顶，应用内不显示品牌或分区标题。初始化及 host-context-changed 通知中接收标准宿主主题变量，控件跟随宿主文字、背景、边框和深浅主题；水位保留低饱和蓝色。宿主未提供主题时使用系统深浅模式和透明背景。

嵌入卡片不再提供“明细与设置”入口，并移除图表与输入区之间的分隔横线。
