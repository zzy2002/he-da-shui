import { requireChatGPTUser } from "./chatgpt-auth";
import HydrationApp from "../components/hydration-app";
export const dynamic="force-dynamic";
export default async function Page(){await requireChatGPTUser("/");return <HydrationApp />;}
