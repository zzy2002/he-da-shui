import type { Metadata } from "next";
import GuideDemo from "../../components/guide-demo";
export const metadata:Metadata={title:"喝大水 · 产品介绍与使用指南",description:"把饮水记录留在对话里。了解使用场景，体验聊天卡片、完整历史、统计和设置，找到每个界面的入口。",alternates:{canonical:"https://he-da-shui-daily.zzybread.chatgpt.site/guide"},openGraph:{title:"喝大水 · 说一句，记一杯",description:"一个在对话里快速记录、展开后回顾历史的饮水小工具。无需登录即可体验示例。",url:"https://he-da-shui-daily.zzybread.chatgpt.site/guide",type:"website"}};
export default function Guide(){
 return <main className="guide-shell"><div className="guide-width">
  <nav className="guide-nav"><a className="guide-brand" href="/guide">喝大水<span>产品介绍与使用指南</span></a><a className="guide-open" href="/">进入个人记录 ↗</a></nav>
  <header className="guide-hero showcase-hero"><span className="guide-kicker">CODEX · MCP APPS</span><h1>喝完一杯，<br/>说一句就记下。</h1><p>把饮水记录留在正在进行的对话里。<br/>在聊天中快速记一笔，需要回顾时，再展开查看完整历史与统计。</p><div className="showcase-hero-actions"><a className="showcase-primary" href="#try">先体验一下</a><a className="showcase-secondary" href="/">使用我的记录 ↗</a></div><span className="showcase-access">介绍与示例无需登录 · 个人记录需要登录</span></header>
  <nav className="guide-links" aria-label="作品页目录"><a href="#scenes">使用场景</a><a href="#try">交互体验</a><a href="#views">界面在哪里</a><a href="#say">聊天怎么用</a><a href="#review">看懂水杯</a><a href="#manage">修改与补记</a><a href="#questions">常见问题</a></nav>
  <section className="guide-section" id="scenes"><div className="guide-heading"><span>01</span><h2>适合这些日常时刻</h2></div><div className="guide-sayings">
   <article className="guide-saying"><h3>工作间隙，刚喝完水</h3><blockquote>不必离开当前聊天。</blockquote><p>用语音输入或打字说“刚喝了 150 毫升”，记完就继续手头的事。也能在卡片里加减选量、点一下记录。</p></article>
   <article className="guide-saying"><h3>想知道今天记了多少</h3><blockquote>一眼看见累计和水位。</blockquote><p>聊天卡片展示今天的总量和七日杯子图。保存后水位上升，跨过每日目标时给一个小小的达标反馈。</p></article>
   <article className="guide-saying"><h3>回顾最近的记录</h3><blockquote>展开后，再慢慢看。</blockquote><p>按近 7 天、近 30 天或全部回看每天的杯子，查看每次饮水的时间、修改误记，也能调整自己的每日目标。</p></article>
  </div></section>
  <section className="guide-section" id="try"><div className="guide-heading"><span>02</span><h2>不用登录，先试一遍</h2></div><p className="showcase-section-intro">下面是可操作的产品示例。切换“聊天卡片”和“完整视图”，体验记录、动画、历史、统计与设置。</p><GuideDemo/><div className="guide-steps">
   <article><h3>试一次记录</h3><p>用加减调整容量，再点“喝了 N ml”。加减只改变本次数量，点记录才会累计。也可点“模拟说喝了 150 ml”体验聊天结果。</p></article>
   <article><h3>试一次达标与撤销</h3><p>点“体验达标动画”，看水杯注水和达标反馈。保存后 15 秒内可点“撤销”；“重置示例”会恢复初始演示数据。</p></article>
   <article><h3>试一次回顾</h3><p>切换“完整视图”，选择“近 30 天”看到更多杯子，进入“全部历史”修改示例记录，或去“设置”调整演示目标。</p></article>
  </div></section>
  <section className="guide-section" id="views"><div className="guide-heading"><span>03</span><h2>每个界面在哪里，怎么用</h2></div><p className="showcase-section-intro">实际使用有两个层次：聊天中做简易交互，展开后做完整回顾。完整网页首页与展开面板共用同一套界面。</p><div className="guide-pages">
   <article className="guide-page"><span className="guide-page-place">位置 · Codex 聊天消息里</span><h3>聊天卡片</h3><p className="guide-page-path">在已连接插件的聊天中说“展示喝大水”；报告喝水数量后，也会展示记录结果。</p><ol><li>看今天累计量和七日水杯图。</li><li>用加减选容量，点“喝了 N ml”直接记录。</li><li>记录后看动画；误记可及时点“撤销”。</li></ol><a href="#say">查看聊天示例 ↓</a></article>
   <article className="guide-page"><span className="guide-page-place">位置 · 卡片展开后，或网页首页</span><h3>完整视图 · 概览</h3><p className="guide-page-path">点聊天卡片外层的展开按钮；也可以点本页的“进入个人记录”，登录后到达网页首页。</p><ol><li>选近 7 天、近 30 天或全部，杯子数量随日期范围增加。</li><li>看总量、记录天数、达标天数、记录日均和每日趋势。</li><li>点某天的杯子可切换到那天，进行补记。</li></ol><a href="/">打开完整网页 ↗</a></article>
   <article className="guide-page"><span className="guide-page-place">位置 · 完整视图顶部“全部历史”</span><h3>完整视图 · 全部历史</h3><p className="guide-page-path">先展开卡片或进入网页首页，再点顶部“全部历史”标签。范围选“全部”可回看所有日期。</p><ol><li>每笔记录显示日期、北京时间和毫升数。</li><li>点铅笔修改日期、时间或数量；点垃圾桶删除误记。</li><li>记录较多时，点底部“加载更早记录”继续查看。</li></ol><a href="#manage">查看修改与补记 ↓</a></article>
   <article className="guide-page"><span className="guide-page-place">位置 · 完整视图顶部“设置”</span><h3>完整视图 · 设置</h3><p className="guide-page-path">进入完整视图后点“设置”，修改每日目标，再点“保存”。默认目标为 2000 ml。</p><ol><li>目标用于计算杯子水位和达标天数。</li><li>修改目标会重算历史展示，不改变已记录的实际毫升数。</li><li>也可以在已连接插件的聊天中直接说清新的目标。</li></ol><a href="#manage">查看目标调整示例 ↓</a></article>
  </div><div className="guide-page-note"><strong>你现在看的，就是作品介绍页。</strong><p>本页 <code>/guide</code> 用来对外分享、了解场景和学习操作；网页首页 <code>/</code> 用来管理自己的真实记录。示例区与个人记录完全分开。</p></div></section>
  <section className="guide-section" id="say"><div className="guide-heading"><span>04</span><h2>在聊天里，可以这样说</h2></div><div className="guide-sayings">
   <article className="guide-saying"><h3>记一杯</h3><blockquote>“我刚喝了 150 毫升。”</blockquote><p>直接记入今天，展示更新后的卡片，不再多问一次确认。</p></article>
   <article className="guide-saying"><h3>看一眼</h3><blockquote>“展示喝大水。”</blockquote><p>打开最近七天和今天的累计量。只查看，不增加记录。</p></article>
   <article className="guide-saying"><h3>补一笔</h3><blockquote>“昨天中午喝了 350 ml，帮我补记。”</blockquote><p>按北京时间记到昨天，不混入今天的总量。</p></article>
  </div><p className="guide-aside">聊天方式需要先连接“喝大水”插件。本页不会自动安装插件；暂时没有连接入口时，可以先通过网页记录。语音使用当前可用的语音输入或系统听写，需要把内容发送到聊天，不会自动监听麦克风。只说“喝了一杯”时，需要先明确杯子容量。</p></section>
  <section className="guide-section" id="review"><div className="guide-heading"><span>05</span><h2>看懂每天的一只杯子</h2></div><table className="guide-table"><thead><tr><th>看到的内容</th><th>它的意思</th></tr></thead><tbody>
   <tr><td>聊天卡片的 7 只杯子</td><td>今天及前六天，每天按北京时间 00:00 开始累计。</td></tr><tr><td>完整视图的更多杯子</td><td>近 7 天为 7 杯，近 30 天为 30 杯；“全部”从首次记录到今天，每天一杯。长时间范围可以在杯子区滚动查看。</td></tr><tr><td>杯子里的水位</td><td>当天累计 ÷ 当前每日目标。达到目标后满杯，超过目标仍显示实际毫升数。</td></tr><tr><td>灰杯与“—”</td><td>当天未记录，不表示当天没喝水。</td></tr><tr><td>记录日均与达标天数</td><td>日均只按有记录天数计算；所有达标天数都按当前每日目标重算。</td></tr>
  </tbody></table></section>
  <section className="guide-section" id="manage"><div className="guide-heading"><span>06</span><h2>记错了，或忘记了</h2></div><div className="guide-sayings">
   <article className="guide-saying"><h3>撤销刚才的一笔</h3><blockquote>“刚才那笔记错了，删掉。”</blockquote><p>也可点记录成功提示里的“撤销”。有多笔可能匹配时，会先确认是哪笔。</p></article>
   <article className="guide-saying"><h3>修改数量</h3><blockquote>“刚才 250 ml 那笔，改成 150 ml。”</blockquote><p>或者进入完整视图 → 全部历史，在对应记录旁点铅笔，修改后保存。</p></article>
   <article className="guide-saying"><h3>调整目标</h3><blockquote>“把我的每日目标改成 1800 ml。”</blockquote><p>或者进入完整视图 → 设置。水位和达标统计随目标更新，实际数量保持不变。</p></article>
  </div><p className="guide-aside">点击加减时每次调整 50 ml，范围为 50–20000 ml；137 ml 这样的精确数量可在聊天里报量。点过去日期的杯子补记时默认中午 12:00；需要精确时间或更早日期，可在聊天里说明，或在完整历史中修改日期和时间。</p></section>
  <section className="guide-section" id="questions"><div className="guide-heading"><span>07</span><h2>第一次使用，可能想知道</h2></div>
   <details className="guide-faq"><summary>这里的体验会改动我的真实记录吗？</summary><p>不会。本页体验区使用浏览器内的独立示例数据，包括模拟记录、历史修改和目标调整。刷新即可恢复示例。进入网页首页并登录后，操作的才是自己云端保存的个人记录。</p></details>
   <details className="guide-faq"><summary>作品介绍和真实记录分别要不要登录？</summary><p>本作品介绍页与示例体验无需登录。进入个人记录时需要登录自己的 ChatGPT 账号；个人记录按账号隔离。网页入口公开，不会把你的饮水明细展示给其他访客。</p></details>
   <details className="guide-faq"><summary>语音说完，为什么没有立刻记录？</summary><p>先确认内容已发送到已连接插件的聊天。要明确说明已经喝了多少；“准备喝”或“举个例子”不会写入。演示按钮只模拟记录结果，不进行语音识别。跨账号的插件安装和连接仍需在对应账号中完成。</p></details>
   <details className="guide-faq"><summary>每天早上可以提醒吗？</summary><p>可以在支持调度的 Codex 环境中为自己的聊天设置早晨提醒。提醒只读取、展示和询问，不会替你自动记一杯。使用本网页不会自动创建定时任务。</p></details>
   <details className="guide-faq"><summary>动画会不会每次打开都播放？</summary><p>普通查看不播放新增反馈。记录成功后播放水位变化，今天的总量跨过目标时播放达标动画；修改目标不会播放庆祝。系统开启“减少动态效果”后，保留文字提示，停用浮动和弹跳效果。</p></details>
  </section>
  <footer className="guide-footer"><span>喝大水 · 用 Codex 构建的 MCP App</span><a href="https://github.com/zzy2002/he-da-shui" target="_blank" rel="noreferrer">GitHub 开源代码 ↗</a><a href="/">进入我的真实记录 ↗</a></footer>
 </div></main>;
}
