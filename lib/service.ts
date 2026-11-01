import { readHistory, readStatistics } from "./history-service";
import { and, eq, gte, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { entries, settings } from "../db/schema";
import { dateShift, InputError, shanghaiDate, summarize, validAmount, validId, validTime } from "./hydration";
export async function readWeek(userId: string) {
  const db = getDb();
  const [config, records] = await Promise.all([
    db.select().from(settings).where(eq(settings.userId,userId)).get(),
    db.select().from(entries).where(and(eq(entries.userId,userId),isNull(entries.deletedAt),gte(entries.occurredAt,new Date(dateShift(shanghaiDate(),-6)+"T00:00:00+08:00").toISOString()))).all(),
  ]);
  return summarize(records,config?.goalMl ?? 2000);
}
export async function act(userId: string, tool: string, args: Record<string,unknown> = {}) {
  if(tool==="hydration_read_history")return readHistory(userId,args);
  if(tool==="hydration_read_statistics")return readStatistics(userId,args);
  const db=getDb();
  if (tool === "hydration_read_week" || tool === "hydration_open" || tool === "hydration_open_details") return readWeek(userId);
  if (tool === "hydration_add") {
    const requestId=validId(args.requestId), amountMl=validAmount(args.amountMl), occurredAt=validTime(args.occurredAt);
    await db.insert(entries).values({id:crypto.randomUUID(),userId,requestId,amountMl,occurredAt,createdAt:new Date().toISOString()}).onConflictDoNothing({target:[entries.userId,entries.requestId]}).run();
    const existing=await db.select().from(entries).where(and(eq(entries.userId,userId),eq(entries.requestId,requestId))).get();
    if (!existing || existing.amountMl !== amountMl || (args.occurredAt !== undefined && existing.occurredAt !== occurredAt)) throw new InputError("同一请求已用于不同的记录，请刷新后重试",409);
    const data=await readWeek(userId), date=shanghaiDate(new Date(existing.occurredAt));
    const day=data.days.find(day=>day.date===date);
    if(!existing.deletedAt&&day){
      const previousTotalMl=Math.max(0,day.totalMl-amountMl);
      return {...data,feedback:{eventId:requestId,entryId:existing.id,date,amountMl,previousTotalMl,goalReached:date===data.today&&previousTotalMl<data.goalMl&&day.totalMl>=data.goalMl}};
    }
    return data;
  } else if (tool === "hydration_update") {
    const id=validId(args.id), amountMl=validAmount(args.amountMl);
    const result=await db.update(entries).set({amountMl,...(args.occurredAt===undefined?{}:{occurredAt:validTime(args.occurredAt)})}).where(and(eq(entries.id,id),eq(entries.userId,userId),isNull(entries.deletedAt))).returning({id:entries.id}).all();
    if (!result.length) throw new InputError("记录不存在或已删除",404);
  } else if (tool === "hydration_delete") {
    await db.update(entries).set({deletedAt:new Date().toISOString()}).where(and(eq(entries.id,validId(args.id)),eq(entries.userId,userId),isNull(entries.deletedAt))).run();
  } else if (tool === "hydration_set_goal") {
    const goalMl=validAmount(args.goalMl,"每日目标");
    await db.insert(settings).values({userId,goalMl}).onConflictDoUpdate({target:settings.userId,set:{goalMl}}).run();
  } else throw new InputError("未知操作",404);
  return readWeek(userId);
}
