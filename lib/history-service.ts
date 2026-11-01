import { and, desc, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import { getDb } from "../db";
import { entries, settings } from "../db/schema";
import { InputError } from "./hydration";
import { bounds, cursorFor, historyRange, parseCursor, statisticsFrom } from "./history-model";
function conditions(userId:string,range:ReturnType<typeof historyRange>){const {from,until}=bounds(range);return and(eq(entries.userId,userId),isNull(entries.deletedAt),lt(entries.occurredAt,until),from?gte(entries.occurredAt,new Date(from+"T00:00:00+08:00").toISOString()):undefined);}
export async function readHistory(userId:string,args:Record<string,unknown>={}){
 const range=historyRange(args.range),limit=args.limit??50;
 if(typeof limit!=="number"||!Number.isInteger(limit)||limit<1||limit>100)throw new InputError("每页记录数需为 1–100");
 const cursor=parseCursor(args.cursor),base=conditions(userId,range),db=getDb();
 const [rows,total]=await Promise.all([
  db.select({id:entries.id,amountMl:entries.amountMl,occurredAt:entries.occurredAt}).from(entries).where(and(base,cursor?or(lt(entries.occurredAt,cursor[0]),and(eq(entries.occurredAt,cursor[0]),lt(entries.id,cursor[1]))):undefined)).orderBy(desc(entries.occurredAt),desc(entries.id)).limit(limit+1).all(),
  db.select({count:sql<number>`count(*)`}).from(entries).where(base).get(),
 ]);
 const items=rows.slice(0,limit);return {items,nextCursor:rows.length>limit?cursorFor(items[items.length-1]):null,totalCount:Number(total?.count??0),range,timezone:"Asia/Shanghai"};
}
export async function readStatistics(userId:string,args:Record<string,unknown>={}){
 const range=historyRange(args.range??"30d"),db=getDb(),date=sql<string>`date(${entries.occurredAt}, '+8 hours')`;
 const [rows,config]=await Promise.all([
  db.select({date,totalMl:sql<number>`sum(${entries.amountMl})`,count:sql<number>`count(*)`}).from(entries).where(conditions(userId,range)).groupBy(date).orderBy(date).all(),
  db.select().from(settings).where(eq(settings.userId,userId)).get(),
 ]);
 return statisticsFrom(rows,config?.goalMl??2000,range);
}
