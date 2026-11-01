"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Check, CircleCheck } from "lucide-react";
import type { Snapshot, RecordFeedback } from "../lib/hydration";
import { shanghaiDate } from "../lib/hydration";

type Client = { read: () => Promise<Snapshot>; call:(tool:string,args:Record<string,unknown>)=>Promise<Snapshot>; subscribe?:(fn:(value:Snapshot)=>void)=>()=>void };
const webClient:Client={
  async read(){const response=await fetch("/api/hydration",{cache:"no-store"});const data=await response.json() as Snapshot & {error?:string};if(!response.ok)throw new Error(data.error??"读取失败");return data;},
  async call(tool,args){const response=await fetch("/api/hydration",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool,args})});const data=await response.json() as Snapshot & {error?:string};if(!response.ok)throw new Error(data.error??"记录失败");return data;},
};
const clock=(time:string)=>new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(time));
const weekday=(date:string)=>new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",weekday:"short"}).format(new Date(date+"T12:00:00+08:00"));
function localTime(){return clock(new Date().toISOString());}
export function Cup({fill=0,muted=false,large=false,fromFill}:{fill?:number;muted?:boolean;large?:boolean;fromFill?:number}){
 const id=useId().replace(/:/g,"");
 const [waterFill,setWaterFill]=useState(fromFill??fill);
 useEffect(()=>{let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setWaterFill(fill));});return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};},[fill]);
 const level=132-Math.min(waterFill,1)*100;
 return <svg className={large?"cup cup-large":"cup"} viewBox="0 0 120 160" fill="none" aria-hidden="true">
  <defs><clipPath id={"cup"+id}><path d="M23 26H97L89 133Q88 142 79 142H41Q32 142 31 133Z"/></clipPath><linearGradient id={"water"+id} x1="60" y1="40" x2="60" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor="var(--water-top, #81D8FF)"/><stop offset="1" stopColor="var(--water-bottom, #269AE8)"/></linearGradient></defs>
  <ellipse cx="60" cy="149" rx="32" ry="5" fill={muted?"var(--cup-shadow, #e5eaf0)":"var(--cup-shadow, #D1E9F9)"}/>
  <path d="M21 24H99L90 133Q89 144 79 144H41Q31 144 30 133Z" fill={muted?"var(--cup-empty, #f0f3f6)":"var(--cup-body, #F3FBFF)"}/>
  <g clipPath={"url(#cup"+id+")"}>{fill>0&&<g className="water-level" style={{transform:`translateY(${level}px)`}}><path d="M15 0Q38 -7 60 0T110 0V160H15Z" fill={`url(#water${id})`}/><path d="M15 0Q38 -7 60 0T110 0" stroke="var(--water-rim, #ABEAFF)" strokeWidth="3"/></g>}</g>
  <path d="M21 24H99L90 133Q89 144 79 144H41Q31 144 30 133Z" stroke="var(--cup-outline, #85BFD9)" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M31 34L37 118" stroke="var(--cup-shine, white)" strokeWidth="5" strokeLinecap="round" opacity=".7"/>
  <path d="M27 24H93" stroke="var(--cup-outline, #78B6D3)" strokeWidth="4" strokeLinecap="round"/>
 </svg>;
}
export default function HydrationApp({client=webClient,embedded=false}:{client?:Client;embedded?:boolean}){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [selectedDate,setSelectedDate]=useState(()=>shanghaiDate()),[amount,setAmount]=useState("250"),[time,setTime]=useState(localTime),[busy,setBusy]=useState(false);
 const [showSettings,setShowSettings]=useState(!embedded),[goal,setGoal]=useState("2000"),[editing,setEditing]=useState<string|null>(null),[editAmount,setEditAmount]=useState(""),[editTime,setEditTime]=useState(""),[confirmDelete,setConfirmDelete]=useState<string|null>(null);
 const [receipt,setReceipt]=useState<RecordFeedback|null>(null),[motion,setMotion]=useState<RecordFeedback|null>(null);
 const presented=useRef(new Set<string>());
 useEffect(()=>{
  const feedback=snapshot?.feedback;if(!feedback){setMotion(null);setReceipt(null);return;}if(presented.current.has(feedback.eventId))return;setNotice("");
  presented.current.add(feedback.eventId);
  try{const stored=JSON.parse(sessionStorage.getItem("water-played-effects")??"[]");const played:string[]=Array.isArray(stored)?stored.filter((value:unknown)=>typeof value==="string"):[];if(played.includes(feedback.eventId))return;sessionStorage.setItem("water-played-effects",JSON.stringify([...played.slice(-99),feedback.eventId]));}catch{}
  setMotion(feedback);setReceipt(feedback);setSelectedDate(feedback.date);
 },[snapshot?.feedback?.eventId]);
 useEffect(()=>{if(!motion)return;const timer=setTimeout(()=>setMotion(null),3200);return()=>clearTimeout(timer);},[motion?.eventId]);
 useEffect(()=>{if(!receipt)return;const timer=setTimeout(()=>setReceipt(null),15000);return()=>clearTimeout(timer);},[receipt?.eventId]);
 const pending=useRef<{id:string;amountMl:number;occurredAt:string;key:string}|null>(null),locked=useRef(false),chosen=useRef(false),customTime=useRef(false);
 const refresh=useCallback(async()=>{setError("");setLoading(true);try{const data=await client.read();setSnapshot(data);setGoal(String(data.goalMl));if(!chosen.current)setSelectedDate(data.today);}catch(e){setError(e instanceof Error?e.message:"读取失败");}finally{setLoading(false);}},[client]);
 useEffect(()=>{void refresh();return client.subscribe?.(data=>{setSnapshot(data);setGoal(String(data.goalMl));});},[client,refresh]);
 async function mutate(tool:string,args:Record<string,unknown>,success:string){
  if(locked.current)return false;locked.current=true;setBusy(true);setError("");setNotice("");
  try{const data=await client.call(tool,args);setSnapshot(data);setGoal(String(data.goalMl));setNotice(success);return true;}
  catch(e){setError(e instanceof Error?e.message:"操作失败，输入已保留，请重试");return false;}
  finally{locked.current=false;setBusy(false);}
 }
 function chooseDate(date:string){chosen.current=true;setSelectedDate(date);setTime(date===shanghaiDate()?localTime():"12:00");customTime.current=false;setEditing(null);setConfirmDelete(null);pending.current=null;setNotice("");}
 async function add(){
  const value=Number(amount);if(!Number.isInteger(value)||value<1||value>20000){setError("请输入 1–20000 的整数毫升数");return;}
  if(!time){setError("请选择饮水时间");return;}
  const target=chosen.current?selectedDate:shanghaiDate();
  const useNow=target===shanghaiDate()&&!customTime.current;
  const key=`${target}:${useNow?"now":time}`;
  if(!pending.current||pending.current.amountMl!==value||pending.current.key!==key)pending.current={id:crypto.randomUUID(),amountMl:value,key,occurredAt:useNow?new Date().toISOString():new Date(`${target}T${time}:00+08:00`).toISOString()};
  const request=pending.current;
  if(await mutate("hydration_add",{amountMl:value,occurredAt:request.occurredAt,requestId:request.id},"")){pending.current=null;setSelectedDate(target);if(target===shanghaiDate()){setTime(localTime());customTime.current=false;}}
 }
 function stepAmount(delta:number){setAmount(value=>String(Math.max(50,Math.min(20000,Number(value)+delta))));pending.current=null;}
 async function undoRecord(){if(!receipt)return;if(await mutate("hydration_delete",{id:receipt.entryId},"已撤销这笔记录")){setReceipt(null);setMotion(null);}}
 const amountPicker=<div className="amount-stepper" role="group" aria-label="选择本次饮水量"><button type="button" aria-label="减少 50 毫升" disabled={busy||Number(amount)<=50} onClick={()=>stepAmount(-50)}><Minus size={16}/></button><output aria-live="polite">{amount}<small> ml</small></output><button type="button" aria-label="增加 50 毫升" disabled={busy||Number(amount)>=20000} onClick={()=>stepAmount(50)}><Plus size={16}/></button></div>;
 const recordButton=<button className="primary record-button" type="submit" disabled={busy||!snapshot}>{busy?<span className="loader"/>:<Check size={15}/>}<span>{busy?"保存中…":`喝了 ${amount} ml`}</span></button>;
 const today=snapshot?.days.at(-1),day=snapshot?.days.find(d=>d.date===selectedDate),displayToday=selectedDate===(snapshot?.today??shanghaiDate());
 const weekView=(<section className="week-card card" aria-label="最近七天饮水情况">{!embedded&&<div className="section-title"><div>{!embedded&&<span className="eyebrow muted">YOUR LITTLE WATER GARDEN</span>}<h2>{embedded?"最近七天":"最近七天，一天一杯。"}</h2></div>{!embedded&&<span className="date-range">{snapshot?.days[0].date.slice(5).replace("-",".")} — {snapshot?.today.slice(5).replace("-",".")}</span>}</div>}<div className="week-grid">{snapshot?.days.map(d=><button className={`day-cup ${motion?.date===d.date?"record-pulse":""} ${motion?.date===d.date&&motion.goalReached?"goal-pulse":""} ${selectedDate===d.date?"active":""} ${d.count?"":"unrecorded"}`} key={d.date} onClick={()=>chooseDate(d.date)} aria-pressed={selectedDate===d.date} aria-label={`${d.date} ${d.count?d.totalMl+"毫升":"未记录"}${d.achieved?"，已达标":""}`}><span className="day-name">{d.date===snapshot.today?"今天":weekday(d.date)}</span><Cup key={motion?.date===d.date?motion.eventId:d.date} fill={d.fill} fromFill={motion?.date===d.date?Math.min(motion.previousTotalMl/(snapshot?.goalMl??2000),1):undefined} muted={!d.count}/>{motion?.date===d.date&&<span className="water-added" aria-hidden="true">+{motion.amountMl} ml</span>}<strong>{d.count?<>{d.totalMl}<small> ml</small></>:<span className="no-record">{embedded?"—":"未记录"}</span>}</strong>{!embedded&&<span className="day-date">{d.date.slice(5).replace("-",".")}{d.achieved&&<span className="achieved-dot"> ✓</span>}</span>}</button>)}</div>{!embedded&&<div className="week-summary"><span>有记录 <strong>{snapshot?.recordedDays??0}</strong><span className="summary-unit"> / 7 天</span></span><span>达标 <strong>{snapshot?.achievedDays??0}</strong><span className="summary-unit"> 天</span></span>{!embedded&&<span className="legend"><i/> 水越满，离目标越近</span>}</div>}</section>);
 return <main className={`hydration-shell ${embedded?"embedded":""} ${motion?.goalReached?"goal-celebrating":""}`}>
  {!embedded&&<header className="topbar"><a className="brand" href="/" aria-label="喝大水首页"><span className="brand-icon"><svg width="20" height="24" viewBox="0 0 24 28" fill="none"><path d="M12 2S3 12 3 18a9 9 0 0 0 18 0C21 12 12 2 12 2Z" fill="currentColor"/><path d="M7 18a5 5 0 0 0 5 5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg></span><span>喝大水{!embedded&&<span className="brand-en">WATER, EVERY DAY</span>}</span></a><button className="icon-button" onClick={()=>setShowSettings(!showSettings)} aria-label="设置每日目标" aria-expanded={showSettings}><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--surface)"/><circle cx="15" cy="17" r="3" fill="var(--surface)"/></svg></button></header>}
  {!embedded&&showSettings&&<section className="settings card"><div><h2>你的每日目标</h2><p>按自己的节奏来，随时可以调整。</p></div><form onSubmit={async e=>{e.preventDefault();if(await mutate("hydration_set_goal",{goalMl:Number(goal)},"每日目标已更新"))setShowSettings(false);}}><label className="input-unit"><input aria-label="每日目标毫升数" type="number" min="1" max="20000" step="1" value={goal} onChange={e=>setGoal(e.target.value)} required/><span>ml / 天</span></label><button className="primary small" disabled={busy}>保存</button></form></section>}
  {!embedded&&<section className="intro"><div className="eyebrow"><span className="live-dot"/> 一口一口，慢慢来</div><h1>今天，也要好好喝水。</h1><p>记下每一杯，让小习惯慢慢发生。</p></section>}
  {error&&<div className="alert" role="alert"><span>{error}</span><button disabled={busy} onClick={()=>snapshot?setError(""):void refresh()}>{snapshot?"知道了":"重新加载"}</button></div>}
  {notice&&<div className="notice" role="status">✓ {notice}</div>}
  {!snapshot?<div className="card loading" role="status">{loading?<><span className="loader"/>正在倒一杯水…</>:"暂时未能加载你的记录，请点击上方重新加载。"}</div>:<>
  {embedded&&<>{weekView}</>}
  {embedded?<form className="compact-record-row" onSubmit={e=>{e.preventDefault();void add();}}><section className="compact-today" aria-label="所选日期饮水进度"><div><span>{displayToday?"今天":selectedDate.slice(5).replace("-","/")}</span><strong>{day?.totalMl??0}<small> / {snapshot.goalMl} ml</small></strong></div></section><div className="compact-record-actions">{amountPicker}{recordButton}</div>{!displayToday&&<button type="button" className="text-button return-today" onClick={()=>chooseDate(snapshot.today)}>回到今天</button>}</form>:<section className="today-card card"><div className="today-copy"><div className="eyebrow muted">今日饮水 · {(snapshot?.today??shanghaiDate()).slice(5).replace("-"," / ")}</div><div className="amount-total"><strong>{today?.totalMl??0}</strong><span>ml</span></div><p className="goal-copy">每日目标 <b>{snapshot?.goalMl??2000} ml</b><span className="percent">{Math.round((today?.totalMl??0)/(snapshot?.goalMl??2000)*100)}%</span></p><div className="progress-track"><div style={{width:`${(today?.fill??0)*100}%`}}/></div><p className="encouragement">{!today?.count?"新的一天，从一口水开始。":today.achieved?"今天的目标达成啦，继续保持你的节奏。":`再喝 ${Math.max(0,(snapshot?.goalMl??2000)-today.totalMl)} ml，就到今天的目标了。`}</p></div><div className="hero-cup"><span className="cup-halo"/><Cup fill={today?.fill??0} large/><span className="hero-caption">{today?.achieved?"今日达标 ✓":"给自己补点水"}</span></div></section>}
  {!embedded&&<section className="log-card card"><div className="section-title"><h2>{displayToday?"记一杯":`补记 ${selectedDate.slice(5).replace("-","月")}日`}</h2>{!displayToday&&<button className="text-button" onClick={()=>chooseDate(snapshot.today)}>回到今天</button>}</div><form className="web-record-row" onSubmit={e=>{e.preventDefault();void add();}}>{amountPicker}<label className="field-label">北京时间<input aria-label="饮水时间" className="time-input" type="time" value={time} disabled={busy} onChange={e=>{setTime(e.target.value);customTime.current=true;pending.current=null;}} required/></label>{recordButton}</form></section>}
  {receipt&&<div className={`record-receipt ${receipt.goalReached?"receipt-goal":""}`} role="status">{receipt.goalReached?<CircleCheck size={18}/>:<Check size={16}/>}<span>{receipt.goalReached?"今日达标":"已记录"}<small> +{receipt.amountMl} ml</small></span><button type="button" disabled={busy} onClick={()=>void undoRecord()}>撤销</button></div>}

  {!embedded&&<>{weekView}</>}
  {!embedded&&<section className="history-card card"><div className="section-title"><h2>{displayToday?"今天":selectedDate.slice(5).replace("-","月")+"日"}的小记录 <span className="count-pill">{day?.count??0} 笔</span></h2><button className="text-button" disabled={busy||loading} onClick={()=>void refresh()}>{loading?"刷新中…":"刷新 ↻"}</button></div>{!day?.count?<div className="empty-history"><span>◌</span><p>这里还没有记录</p><small>喝完一杯，就来记下它吧。</small></div>:<ul className="entry-list">{day.entries.map(entry=><li key={entry.id}>{editing===entry.id?<form className="edit-row" onSubmit={async e=>{e.preventDefault();if(await mutate("hydration_update",{id:entry.id,amountMl:Number(editAmount),occurredAt:new Date(`${selectedDate}T${editTime}:00+08:00`).toISOString()},"记录已修改"))setEditing(null);}}><input aria-label="修改毫升数" type="number" min="1" max="20000" value={editAmount} onChange={e=>setEditAmount(e.target.value)} required/><span>ml</span><input aria-label="修改时间" type="time" value={editTime} onChange={e=>setEditTime(e.target.value)} required/><button className="text-button" disabled={busy}>保存</button><button type="button" className="text-button muted" disabled={busy} onClick={()=>setEditing(null)}>取消</button></form>:<><span className="entry-drop">♧</span><span className="entry-clock">{clock(entry.occurredAt)}</span><strong>{entry.amountMl}<small> ml</small></strong><div className="entry-actions">{confirmDelete===entry.id?<><span className="delete-question">删除这笔？</span><button className="text-button danger" disabled={busy} onClick={async()=>{if(await mutate("hydration_delete",{id:entry.id},"误记已删除"))setConfirmDelete(null);}}>删除</button><button className="text-button muted" disabled={busy} onClick={()=>setConfirmDelete(null)}>取消</button></>:<><button className="text-button" disabled={busy} aria-label={`修改 ${clock(entry.occurredAt)} 的记录`} onClick={()=>{setEditing(entry.id);setEditAmount(String(entry.amountMl));setEditTime(clock(entry.occurredAt));}}>修改</button><button className="text-button muted" disabled={busy} aria-label={`删除 ${clock(entry.occurredAt)} 的记录`} onClick={()=>setConfirmDelete(entry.id)}>删除</button></>}</div></>}</li>)}</ul>}</section>}
  </>}
  {!embedded&&<footer><span className="footer-drop">◦</span> 每一口，都算数。<span>所有时间按北京时间 · 记录仅自己可见 · <a href="/guide">使用手册</a></span></footer>}
 </main>;
}
