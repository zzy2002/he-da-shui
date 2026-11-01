"use client";
import { useState } from "react";
import HydrationApp from "./hydration-app";
import DetailsApp from "./details-app";
import { dateShift, shanghaiDate, summarize, validAmount, validTime, type Entry, type Snapshot } from "../lib/hydration";
import { bounds, cursorFor, historyRange, parseCursor, statisticsFrom } from "../lib/history-model";
function makeDemo(){
 const today=shanghaiDate(),listeners=new Set<(data:Snapshot)=>void>(),requests=new Map<string,Snapshot>();
 const seed=()=>[0,1,2,4,5,7,9,11,14,16,20].map((offset,index)=>({id:`demo-${offset}`,amountMl:[800,1800,2000,1500,1000,2200,900,1600,2100,1200,1800][index],occurredAt:new Date(dateShift(today,-offset)+"T00:00:00+08:00").toISOString()}));
 let records:Entry[]=seed(),goalMl=2000;
 const read=async()=>summarize(records,goalMl);
 const publish=(data:Snapshot)=>{for(const notify of listeners)notify(data);return data;};
 const filtered=(args:Record<string,unknown>)=>{const range=historyRange(args.range),{from}=bounds(range);return {range,items:records.filter(entry=>!from||shanghaiDate(new Date(entry.occurredAt))>=from).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)||b.id.localeCompare(a.id))};};
 const client={read,subscribe:(fn:(data:Snapshot)=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},async query<T>(tool:string,args:Record<string,unknown>):Promise<T>{
  if(tool==="hydration_read_week")return await read() as T;
  const {range,items}=filtered(args);
  if(tool==="hydration_read_history"){
   const cursor=parseCursor(args.cursor),after=cursor?items.filter(entry=>entry.occurredAt<cursor[0]||(entry.occurredAt===cursor[0]&&entry.id<cursor[1])):items,limit=Number(args.limit??50),page=after.slice(0,limit);
   return {items:page,nextCursor:after.length>limit?cursorFor(page[page.length-1]):null,totalCount:items.length,range,timezone:"Asia/Shanghai"} as T;
  }
  if(tool==="hydration_read_statistics"){
   const groups=new Map<string,{date:string;totalMl:number;count:number}>();for(const entry of items){const date=shanghaiDate(new Date(entry.occurredAt)),day=groups.get(date)??{date,totalMl:0,count:0};day.totalMl+=entry.amountMl;day.count++;groups.set(date,day);}
   return statisticsFrom([...groups.values()].sort((a,b)=>a.date.localeCompare(b.date)),goalMl,range) as T;
  }
  throw new Error("演示中暂不支持此操作");
 },async call(tool:string,args:Record<string,unknown>):Promise<Snapshot>{
  await new Promise(resolve=>setTimeout(resolve,180));
  if(tool==="hydration_add"){
   const eventId=String(args.requestId);if(requests.has(eventId))return requests.get(eventId)!;
   const amountMl=validAmount(args.amountMl),occurredAt=validTime(args.occurredAt),date=shanghaiDate(new Date(occurredAt));
   const previousTotalMl=records.filter(entry=>shanghaiDate(new Date(entry.occurredAt))===date).reduce((sum,entry)=>sum+entry.amountMl,0),entryId=crypto.randomUUID();
   records=[...records,{id:entryId,amountMl,occurredAt}];
   const data={...await read(),feedback:{eventId,entryId,date,amountMl,previousTotalMl,goalReached:date===today&&previousTotalMl<goalMl&&previousTotalMl+amountMl>=goalMl}};
   requests.set(eventId,data);return publish(data);
  }
  if(tool==="hydration_delete")records=records.filter(entry=>entry.id!==args.id);
  else if(tool==="hydration_update")records=records.map(entry=>entry.id===args.id?{...entry,amountMl:validAmount(args.amountMl),occurredAt:args.occurredAt===undefined?entry.occurredAt:validTime(args.occurredAt)}:entry);
  else if(tool==="hydration_set_goal")goalMl=validAmount(args.goalMl,"每日目标");
  else throw new Error("演示中暂不支持此操作");
  return publish(await read());
 }};
 return {client,async reset(){records=seed();goalMl=2000;requests.clear();publish(await read());}};
}
export default function GuideDemo(){
 const [demo]=useState(makeDemo),[surface,setSurface]=useState<"inline"|"full">("inline"),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function play(goal=false){if(busy)return;setBusy(true);setError("");try{if(goal)await demo.reset();await demo.client.call("hydration_add",{amountMl:goal?1200:150,requestId:crypto.randomUUID()});}catch{setError("演示未完成，请重试。");}finally{setBusy(false);}}
 return <div className="guide-demo"><div className="guide-demo-top"><span>示例数据 · 所有操作只影响本页演示</span><div className="guide-demo-modes" role="group" aria-label="选择演示界面"><button aria-pressed={surface==="inline"} onClick={()=>setSurface("inline")}>聊天卡片</button><button aria-pressed={surface==="full"} onClick={()=>setSurface("full")}>完整视图</button></div></div><div className="guide-demo-buttons guide-demo-controls"><button disabled={busy} onClick={()=>void play()}>模拟说“喝了 150 ml”</button><button disabled={busy} onClick={()=>void play(true)}>体验达标动画</button><button disabled={busy} onClick={()=>void demo.reset()}>重置示例</button></div>{error&&<p className="guide-demo-error" role="alert">{error}</p>}{surface==="inline"?<HydrationApp client={demo.client} embedded/>:<div className="guide-full-demo"><DetailsApp client={demo.client}/></div>}</div>;
}
