import { requireChatGPTUser } from "./chatgpt-auth";
import HydrationApp from "../components/hydration-app";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){
 const params=await searchParams;
 await requireChatGPTUser(params.view==="compact"?"/?view=compact":"/");
 return <HydrationApp embedded={params.view==="compact"}/>;
}
