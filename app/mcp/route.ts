import { getChatGPTUser } from "../chatgpt-auth";
import { act } from "../../lib/service";
import { InputError } from "../../lib/hydration";
import { tools, UI_URI } from "../../lib/tools";
import { uiHtml } from "../../lib/ui-bundle";
export const dynamic="force-dynamic";
export async function POST(request:Request){
  let body: {id?:string|number;method?:string;params?:{uri?:string;name?:string;arguments?:Record<string,unknown>}};
  try { body=await request.json() as typeof body; if(!body||typeof body!=="object"||typeof body.method!=="string")throw new Error("Invalid request"); } catch { return Response.json({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}},{status:400}); }
  const reply=(value:unknown)=>Response.json({jsonrpc:"2.0",id:body.id??null,result:{resultType:"complete",...(value as Record<string,unknown>)}},{headers:{"Cache-Control":"no-store"}});
  const fail=(code:number,message:string,status=200)=>Response.json({jsonrpc:"2.0",id:body.id??null,error:{code,message}},{status});
  if(body.method?.startsWith("notifications/")) return new Response(null,{status:202});
  if(body.method==="server/discover") return reply({supportedVersions:["2026-07-28","2025-11-25"],capabilities:{tools:{},resources:{},extensions:{}},_meta:{"io.modelcontextprotocol/serverInfo":{name:"he-da-shui",version:"1.0.0"}}});
  if(body.method==="initialize") return reply({protocolVersion:"2025-11-25",capabilities:{tools:{},resources:{}},serverInfo:{name:"he-da-shui",version:"1.0.0"}});
  if(body.method==="ping") return reply({});
  if(body.method==="tools/list") return reply({tools,ttlMs:60000,cacheScope:"private"});
  if(body.method==="resources/list") return reply({ttlMs:60000,cacheScope:"private",resources:[{uri:UI_URI,name:"喝大水",mimeType:"text/html;profile=mcp-app"}]});
  if(body.method==="resources/read"){
    if(body.params?.uri!==UI_URI) return fail(-32602,"Unknown resource");
    return reply({ttlMs:60000,cacheScope:"private",contents:[{uri:UI_URI,mimeType:"text/html;profile=mcp-app",text:uiHtml,_meta:{ui:{prefersBorder:true},"openai/ui":{availableDisplayModes:["inline","fullscreen"],preferredDisplayMode:"inline"}}}]});
  }
  if(body.method==="tools/call"){
    const user=await getChatGPTUser();if(!user)return fail(-32001,"需要登录才能读取或记录饮水",401);
    try { const data=await act(user.userId,body.params?.name??"",body.params?.arguments??{});return reply({structuredContent:data,content:[{type:"text",text:JSON.stringify(data)}]}); }
    catch(e){return reply({isError:true,content:[{type:"text",text:e instanceof InputError?e.message:"饮水服务暂时不可用，请稍后重试"}]});}
  }
  return fail(-32601,"Method not found");
}
export async function GET(){return Response.json({name:"喝大水",version:"1.0.0",transport:"streamable-http",endpoint:"/mcp"});}
