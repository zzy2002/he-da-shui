import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import GuideDemo from "../../components/guide-demo";
export const metadata:Metadata={title:"喝大水 · 使用手册",description:"语音记一杯、点击加减、七日回顾。喝大水使用方法与动画体验。"};
export const dynamic="force-dynamic";
export default async function Guide(){
 await requireChatGPTUser("/guide");
 return <main className="guide-shell"><div className="guide-width">
  <nav className="guide-nav"><a className="guide-brand" href="/guide">喝大水<span>使用手册</span></a><a className="guide-open" href="/">打开我的记录 ↗</a></nav>
  <header className="guide-hero"><span className="guide-kicker">A LITTLE WATER, EVERY DAY</span><h1>说一句，记一杯。</h1><p>告诉我喝了多少，记录和七日水杯图就会一起更新。<br/>也可以用加减选好容量，轻点一次记下。</p></header>
  <nav className="guide-links" aria-label="手册目录"><a href="#say">在聊天里用</a><a href="#try">试一试</a><a href="#review">看懂七日图</a><a href="#manage">补记与修改</a><a href="#questions">常见问题</a></nav>
  <section className="guide-section" id="say"><div className="guide-heading"><span>01</span><h2>像聊天一样记水</h2></div><div className="guide-sayings">
   <article className="guide-saying"><h3>记一杯</h3><blockquote>“我刚喝了 150 毫升。”</blockquote><p>直接记入今天，展示更新后的卡片，不再多问一次确认。</p></article>
   <article className="guide-saying"><h3>看一眼</h3><blockquote>“展示喝大水。”</blockquote><p>打开最近七天和今天的累计量，只查看，不增加记录。</p></article>
   <article className="guide-saying"><h3>补一笔</h3><blockquote>“昨天中午喝了 350 ml，帮我补记。”</blockquote><p>按北京时间记到昨天，不混入今天的总量。</p></article>
  </div><p className="guide-aside">用当前可用的语音输入或系统听写，把话发在已连接“喝大水”的聊天里；打字也一样。这里只处理你发送的内容，不会自动监听麦克风。说清数量即可，例如“150 毫升”；只说“喝了一杯”时，我会先问杯子容量。</p></section>
  <section className="guide-section" id="try"><div className="guide-heading"><span>02</span><h2>点几下，体验一下</h2></div><GuideDemo/><div className="guide-steps">
   <article><h3>加减选量</h3><p>默认 250 ml，每次加减 50 ml，最低 50 ml、最高 20000 ml。加减只调整这次的量，不改变已经记录的总量。137 ml 这类精确数量，直接在聊天里说。</p></article>
   <article><h3>点一下就记</h3><p>点“喝了 250 ml”直接保存，没有第二次确认。保存时按钮会暂时停用；失败后保留选择，再点重试即可。</p></article>
   <article><h3>看见小小的反馈</h3><p>保存成功后水位上升；当天总量从未达标跨过目标时，播放达标动画。15 秒内点“撤销”可退回刚记的那一笔。</p></article>
  </div></section>
  <section className="guide-section" id="review"><div className="guide-heading"><span>03</span><h2>一天一杯，回看七天</h2></div><table className="guide-table"><thead><tr><th>看到的内容</th><th>它的意思</th></tr></thead><tbody>
   <tr><td>七只水杯</td><td>今天及前六天。每天按北京时间 00:00 开始累计。</td></tr><tr><td>杯子里的水位</td><td>当天累计 ÷ 当前每日目标。默认目标为 2000 ml；在完整网页或聊天里可修改。</td></tr><tr><td>满杯与实际数值</td><td>达到目标后水位封顶，超过目标的实际毫升数仍会显示。</td></tr><tr><td>灰杯与“—”</td><td>当天未记录，不表示当天没喝水。</td></tr><tr><td>点击某天</td><td>切换记录日期。卡片可补记近七天，展开的完整视图可分页查看全部日期和每笔明细。</td></tr>
  </tbody></table></section>
  <section className="guide-section" id="manage"><div className="guide-heading"><span>04</span><h2>记错了，也很好改</h2></div><div className="guide-sayings">
   <article className="guide-saying"><h3>撤销刚才的一笔</h3><blockquote>“刚才那笔记错了，删掉。”</blockquote><p>也可直接点成功提示里的“撤销”。有多笔可能匹配时，会先确认是哪笔。</p></article>
   <article className="guide-saying"><h3>修改数量</h3><blockquote>“刚才 250 ml 那笔，改成 150 ml。”</blockquote><p>也可展开卡片或打开网页首页，进入“全部历史”，在对应明细旁点“修改”或“删除”。</p></article>
   <article className="guide-saying"><h3>调整目标</h3><blockquote>“把我的每日目标改成 1800 ml。”</blockquote><p>七天水位统一按当前目标重算，已有饮水记录的实际数量不变。</p></article>
  </div><p className="guide-aside">卡片补记过去日期时默认中午 12:00；需要精确时间或更早日期，可在聊天里说清日期和时间。完整视图可直接修改任意历史记录的日期、时间与数量。</p></section>
  <section className="guide-section" id="views"><div className="guide-heading"><span>05</span><h2>一张卡片，两个使用层次</h2></div><div className="guide-steps"><article><h3>聊天里的嵌入卡片</h3><p>只做简易交互：七日杯子图、加减选量、直接记录、动画和撤销。</p></article><article><h3>展开后的历史与统计</h3><p>点宿主的展开按钮，或说“打开喝大水历史与统计”。完整视图包含概览、全部历史、设置；可切换近7天、近30天和全部，历史支持分页加载更早记录。</p></article><article><h3>统计怎么计算</h3><p>总量、记录天数、达标天数和每日趋势来自自己的实际记录。记录日均只除以有记录的天数；所有达标天数都使用当前目标重新计算。</p></article></div></section>
  <section className="guide-section" id="questions"><div className="guide-heading"><span>06</span><h2>可能还想知道</h2></div>
   <details className="guide-faq"><summary>语音说完，为什么没有立刻记录？</summary><p>先确认语音内容已经发送到聊天，且“喝大水”插件已连接。需要明确说“已经喝了”以及数量；“准备喝”“举个例子”不会写入记录。保存成功才会更新水杯。这里的演示按钮只模拟聊天结果，不会进行语音识别。</p></details>
   <details className="guide-faq"><summary>每次打开都会重新播放动画吗？</summary><p>普通查看不播放饮水成功动画。新增成功的结果会携带动画反馈，同一浏览会话会抑制同一笔结果的重复播放；刷新不重复记水。达标动画只针对这次饮水让今天的总量跨过当前目标，修改目标不会播放。</p></details>
   <details className="guide-faq"><summary>提醒会不会替我自动记一杯？</summary><p>不会。已配置的早晨提醒用于读取记录、展示和提问；只有你明确说喝了多少或点击记录，才增加饮水量。定时触发依赖 Codex 调度环境可用。</p></details>
   <details className="guide-faq"><summary>我的记录放在哪里？其他人能看到吗？</summary><p>记录云端保存，重新打开仍然存在，按登录账号隔离。这款 App 和本手册继续保持私有访问。体验区是独立的示例，不会改动你的个人记录。</p></details>
   <details className="guide-faq"><summary>不喜欢动画，可以关闭吗？</summary><p>跟随系统的“减少动态效果”设置：开启后保留成功和达标文字，关闭水位过渡、浮动和弹跳效果。</p></details>
  </section>
  <footer className="guide-footer"><span>喝大水 · 一杯一杯，照自己的节奏。</span><a href="/">回到我的饮水记录 ↗</a></footer>
 </div></main>;
}
