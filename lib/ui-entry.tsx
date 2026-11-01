import { createRoot } from "react-dom/client";
import HydrationApp from "../components/hydration-app";
import type { Snapshot } from "./hydration";
// Standard MCP Apps JSON-RPC bridge; business data never lives in iframe storage.
let nextId=1;
const requests=new Map<number,{resolve:(value:any)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
const subscribers=new Set<(value:Snapshot)=>void>();
let initial:Snapshot|undefined;
let hostOrigin:string|undefined;
const post=(value:unknown)=>window.parent.postMessage(value,hostOrigin??"*");
function rpc(method:string,params:unknown){
 return new Promise<any>((resolve,reject)=>{const id=nextId++;const timer=setTimeout(()=>{requests.delete(id);reject(new Error("连接超时，请重试"));},20000);requests.set(id,{resolve,reject,timer});post({jsonrpc:"2.0",id,method,params});});
}
function snapshot(value:unknown):value is Snapshot{return !!value&&typeof value==="object"&&Array.isArray((value as Snapshot).days)&&typeof(value as Snapshot).goalMl==="number";}
window.addEventListener("message",event=>{
 if(event.source!==window.parent||!event.data||event.data.jsonrpc!=="2.0")return;
 if(hostOrigin&&event.origin!==hostOrigin)return;
 const message=event.data;
 if(message.id!==undefined&&requests.has(message.id)){
  // A matching initialization response pins the parent origin for this instance.
  if(event.origin!=="null")hostOrigin??=event.origin;const request=requests.get(message.id)!;clearTimeout(request.timer);requests.delete(message.id);
  if(message.error)request.reject(new Error(message.error.message??"操作失败"));else request.resolve(message.result);return;
 }
 if(message.method==="ui/notifications/tool-result"&&snapshot(message.params?.structuredContent)){initial=message.params.structuredContent;for(const fn of subscribers)fn(initial!);}
 if(message.method==="ui/resource-teardown"&&message.id!==undefined)post({jsonrpc:"2.0",id:message.id,result:{}});
});
const ready=rpc("ui/initialize",{protocolVersion:"2026-01-26",appInfo:{name:"喝大水",version:"1.0.0"},appCapabilities:{availableDisplayModes:["inline","fullscreen"]}}).then(()=>{post({jsonrpc:"2.0",method:"ui/notifications/initialized"});});
// Retain the rejection for read()/call() while avoiding an unhandled rejection.
ready.catch(()=>{});
async function call(tool:string,args:Record<string,unknown>={}){
 await ready;const result=await rpc("tools/call",{name:tool,arguments:args});
 if(result?.isError)throw new Error(result.content?.find((c:any)=>c.type==="text")?.text??"保存失败，请重试");
 if(!snapshot(result?.structuredContent))throw new Error("服务返回的数据不完整，请重试");
 initial=result.structuredContent;return initial!;
}
const client={openFull:async()=>{await ready;await rpc("ui/open-link",{url:"https://he-da-shui-daily.zzybread.chatgpt.site"});},read:async()=>{await ready;return initial??await call("hydration_read_week");},call,subscribe:(fn:(value:Snapshot)=>void)=>{subscribers.add(fn);return()=>{subscribers.delete(fn);};}};
createRoot(document.getElementById("root")!).render(<HydrationApp client={client} embedded/>);
let previousHeight=0;
new ResizeObserver(()=>{const height=document.documentElement.scrollHeight;if(height!==previousHeight){previousHeight=height;void ready.then(()=>post({jsonrpc:"2.0",method:"ui/notifications/size-changed",params:{height}})).catch(()=>{});}}).observe(document.getElementById("root")!);
