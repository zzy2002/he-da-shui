import { requireChatGPTUser } from "./chatgpt-auth";
import DetailsApp from "../components/details-app";
import HydrationApp from "../components/hydration-app";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){
 const params=await searchParams;
 await requireChatGPTUser(params.view==="compact"?"/?view=compact":"/");
 return params.view==="compact"?<HydrationApp embedded/>:<DetailsApp/>;
}
