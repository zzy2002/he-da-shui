import { getChatGPTUser } from "../../chatgpt-auth";
import { act, readWeek } from "../../../lib/service";
import { InputError } from "../../../lib/hydration";
export const dynamic="force-dynamic";
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(){
  const user=await getChatGPTUser(); if(!user) return json({error:"请先登录后记录饮水"},401);
  try{return json(await readWeek(user.userId));}catch{return json({error:"暂时无法读取，请稍后重试"},500);}
}
export async function POST(request:Request){
  const user=await getChatGPTUser(); if(!user) return json({error:"请先登录后记录饮水"},401);
  const origin=request.headers.get("origin");
  if(origin && origin!==new URL(request.url).origin) return json({error:"请求来源无效"},403);
  try{const body=await request.json() as {tool?:unknown;args?:unknown};if(!body||typeof body.tool!=="string"||!body.args||typeof body.args!=="object"||Array.isArray(body.args))throw new InputError("请求参数无效");return json(await act(user.userId,body.tool,body.args as Record<string,unknown>));}
  catch(e){return json({error:e instanceof InputError?e.message:"操作失败，请稍后重试"},e instanceof InputError?e.status:500);}
}
