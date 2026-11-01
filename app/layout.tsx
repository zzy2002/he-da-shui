import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"喝大水 · 一口一口，慢慢来",description:"记下每一杯水，看看最近七天的自己。",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
