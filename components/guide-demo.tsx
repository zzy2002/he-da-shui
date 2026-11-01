"use client";
import { useState } from "react";
import HydrationApp from "./hydration-app";
import { shanghaiDate, summarize, type Entry, type Snapshot } from "../lib/hydration";

function makeDemo(){
 const today=shanghaiDate();
 let records:Entry[]=[{id:"demo-start",amountMl:800,occurredAt:today+"T08:00:00+08:00"}];
 const listeners=new Set<(data:Snapshot)=>void>(),requests=new Map<string,Snapshot>();
 const read=async()=>summarize(records,2000);
 const publish=(data:Snapshot)=>{for(const notify of listeners)notify(data);return data;};
 const client={read,subscribe:(fn:(data:Snapshot)=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},async call(tool:string,args:Record<string,unknown>):Promise<Snapshot>{
  await new Promise(resolve=>setTimeout(resolve,180));
  if(tool==="hydration_add"){
   const eventId=String(args.requestId);if(requests.has(eventId))return requests.get(eventId)!;
   const amountMl=Number(args.amountMl),date=shanghaiDate(new Date(String(args.occurredAt??new Date().toISOString())));
   const before=await read(),previousTotalMl=before.days.find(day=>day.date===date)?.totalMl??0,entryId=crypto.randomUUID();
   records=[...records,{id:entryId,amountMl,occurredAt:String(args.occurredAt??new Date().toISOString())}];
   const data={...await read(),feedback:{eventId,entryId,date,amountMl,previousTotalMl,goalReached:date===today&&previousTotalMl<2000&&previousTotalMl+amountMl>=2000}};
   requests.set(eventId,data);return publish(data);
  }
  if(tool==="hydration_delete")records=records.filter(entry=>entry.id!==args.id);
  return publish(await read());
 }};
 return {client,async reset(){records=[{id:"demo-start",amountMl:800,occurredAt:today+"T08:00:00+08:00"}];requests.clear();publish(await read());}};
}
export default function GuideDemo(){
 const [demo]=useState(makeDemo),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function play(goal=false){if(busy)return;setBusy(true);setError("");try{if(goal)await demo.reset();await demo.client.call("hydration_add",{amountMl:goal?1200:150,requestId:crypto.randomUUID()});}catch{setError("演示未完成，请重试。");}finally{setBusy(false);}}
 return <div className="guide-demo"><div className="guide-demo-top"><span>体验区 · 示例数据，不计入个人记录</span><div className="guide-demo-buttons"><button disabled={busy} onClick={()=>void play()}>模拟说“喝了 150 ml”</button><button disabled={busy} onClick={()=>void play(true)}>体验达标动画</button><button disabled={busy} onClick={()=>void demo.reset()}>重置示例</button></div></div>{error&&<p className="guide-demo-error" role="alert">{error}</p>}<HydrationApp client={demo.client} embedded/></div>;
}
