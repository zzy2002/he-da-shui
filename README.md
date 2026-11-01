# 喝大水

云端 MCP App，当前网站入口公开，个人数据按登录账号隔离。点击加减按 50 ml 调整单次容量，或在聊天里报任意整数毫升数，按北京时间累加；最近七天一天一只水杯，用水位表示当前每日目标的完成比例。默认目标 2000 ml，可修改。

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
- `hydration_open({})`：返回当前数据并打开 `ui://he-da-shui/hydration-v12.html`。

标准 JSON-RPC 入口 `/mcp` 支持 discover、initialize、tools/list、tools/call、resources/list、resources/read。数据工具返回 structuredContent，新增和打开工具关联 UI 资源。网站 `/api/hydration` 使用相同业务服务。Sites 平台负责认证和站点访问边界；服务器代码不接受客户端提供的 userId。

## 每日提问

插件连接并验证可调用后，通过当前聊天的 Codex heartbeat 设置每天北京时间 09:00：读取昨天和近七日情况、打开卡片、提问“今天喝水了吗？记一笔。”。调度依赖 Codex 环境可用，云端服务本身不发送消息。未记录必须表述为“未记录”，不可推断为没喝水；没有用户明确输入时不得写入。首次次日真实触发需要在上线后观察。

## 发布

Site 身份见 `.openai/hosting.json`。通过 Sites 源码工作流提交、打包、按当前访问范围发布；复用平台创建的 canonical plugin，不另建重复插件。Local D1 数据不会随源码发布到云端。部署归档、测试截图和最终验收信息保存于忽略的 `outputs/`。

## 两种布局

聊天中的 MCP App 使用紧凑布局：当日累计、记一笔、七日杯子图；完整网页可通过Site 地址直接访问。完整网页默认展开目标设置和每日明细。两种布局复用 `HydrationApp`、饮水控件和业务服务。`/?view=compact` 可预览紧凑布局；默认 `/` 为完整布局。旧 v1/v2/v3/v4/v5/v6/v7/v8/v9/v10/v11 UI 资源地址仍可读取，新打开工具使用 v12 资源。紧凑布局关闭 prefersBorder（含兼容字段），应用使用白底圆角和少量内边距，深色模式为深灰底；不加外边框、阴影或分区盒框。宿主是否保留工具卡外壳由 Codex 决定。

紧凑卡片只保留主数据与操作：今日总量/目标、加减选择容量、直接记录、七日杯子与每日数值。隐藏重复标题、输入说明、百分比、日期范围、重复日期及底部统计；屏幕阅读器仍能读取毫升单位、完整日期和未记录状态。

嵌入卡片填满宿主提供的宽度，七日杯子图置顶，应用内不显示品牌或分区标题。初始化及 host-context-changed 通知中接收标准宿主主题变量，控件跟随宿主文字、背景、边框和深浅主题；水位保留低饱和蓝色。宿主未提供主题时使用系统深浅模式，浅色白底、深色深灰底。

嵌入卡片不再提供“明细与设置”入口，并移除图表与输入区之间的分隔横线。

## 语音记录、动画与手册

`/guide` 为同一 Site 的使用手册，含语音与点击教程、七日图说明、补记/修改、FAQ，以及完全在浏览器内的示例体验区。演示不会写入 D1，语音演示按钮不调用麦克风。真实语音通过宿主已有语音输入或系统听写发送到聊天。

新增响应包含 `feedback`（eventId、entryId、date、amountMl、previousTotalMl、goalReached）。hydration_add 直接关联 UI；用户明确报告已喝数量时直接执行并展示结果，无额外确认。普通读取不返回 feedback；会话存储仅保存最近100个已播放事件标识以抑制重复动画，不保存饮水数据。客户端与语音结果共用水位上升、短暂增量提示、今日跨目标庆祝和15秒撤销。重试复用请求ID，修改目标不触发庆祝，历史补记不触发“今日达标”，超过目标后仍显示实际量。系统减少动态效果时停用运动，保留文字提示。

## 完整历史与统计

网站仍有两个页面：`/` 完整记录与统计、`/guide` 使用手册；`/?view=compact` 是简版预览。MCP 另提供 compact 和 details 两份资源：简版优先 inline；details 优先 fullscreen 并注册 thread 入口。同一 UI 会监听初始化与 host-context-changed 的 displayMode，在 inline 仅渲染快捷卡片，在 fullscreen 渲染概览/全部历史/设置。完整网页和展开面板共用 DetailsApp。实际面板位置由宿主决定。

- `hydration_open_details({})`：打开完整视图。只有此工具注册 thread 入口。
- `hydration_read_history({range?,limit?,cursor?})`：范围7d/30d/all，默认全部；每页默认50，最多100，按 occurredAt 与 id 倒序稳定分页，返回nextCursor。较早记录不受七日限制，可修改日期、时间、数量和删除。
- `hydration_read_statistics({range?})`：默认30d，完整界面默认all；按上海日期汇总总量、笔数、记录天数、达标天数、记录日均及每日柱图。未记录日不当作0，记录日均分母是有记录天数。历史达标按当前目标重算。
- 所有查询在服务端按用户过滤并排除删除记录；MCP 与网页共用业务逻辑。
- 完整面板由宿主管理视口与滚动，仅简版发送内容高度通知，避免长历史导致收起后空白。

本地验证含超过7天的历史、同一时间多笔记录的分页、跨上海午夜范围、目标重算、旧记录修改/删除、账号隔离、62条示例的加载更多、420px与深色面板、inline/fullscreen切换。真实云端饮水记录不作为测试夹具。

完整视图的杯子随范围展示：7d为7杯、30d为30杯、all从首条记录到今天每天一杯；空记录先展示最近7天。多日网格按7列换行，长跨度在图表内滚动；未记录日为灰杯，不推断为零饮水。点击旧日杯子可直接补记，图表与统计刷新。聊天简版始终7杯。
