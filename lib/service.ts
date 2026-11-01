import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { entries, settings, friendDays } from "../db/schema";
import { dateShift, InputError, shanghaiDate, summarize, validAmount, validId, validTime, validFriendName, validFriendDate, validDailyTotal } from "./hydration";
export async function readWeek(userId: string) {
  const db = getDb();
  const [config, records, friends] = await Promise.all([
    db.select().from(settings).where(eq(settings.userId,userId)).get(),
    db.select().from(entries).where(and(eq(entries.userId,userId),isNull(entries.deletedAt),gte(entries.occurredAt,new Date(dateShift(shanghaiDate(),-6)+"T00:00:00+08:00").toISOString()))).all(),
    db.select({id:friendDays.id,name:friendDays.name,date:friendDays.date,totalMl:friendDays.totalMl}).from(friendDays).where(and(eq(friendDays.userId,userId),isNull(friendDays.deletedAt),gte(friendDays.date,dateShift(shanghaiDate(),-6)))).orderBy(desc(friendDays.updatedAt),desc(friendDays.date),friendDays.id).all(),
  ]);
  return {...summarize(records,config?.goalMl ?? 2000),friendDays:friends};
}
export async function act(userId: string, tool: string, args: Record<string,unknown> = {}) {
  const db=getDb();
  if (tool === "hydration_read_week" || tool === "hydration_open") return readWeek(userId);
  if (tool === "hydration_add") {
    const requestId=validId(args.requestId), amountMl=validAmount(args.amountMl), occurredAt=validTime(args.occurredAt);
    await db.insert(entries).values({id:crypto.randomUUID(),userId,requestId,amountMl,occurredAt,createdAt:new Date().toISOString()}).onConflictDoNothing({target:[entries.userId,entries.requestId]}).run();
    const existing=await db.select().from(entries).where(and(eq(entries.userId,userId),eq(entries.requestId,requestId))).get();
    if (!existing || existing.amountMl !== amountMl || (args.occurredAt !== undefined && existing.occurredAt !== occurredAt)) throw new InputError("同一请求已用于不同的记录，请刷新后重试",409);
  } else if (tool === "hydration_update") {
    const id=validId(args.id), amountMl=validAmount(args.amountMl);
    const result=await db.update(entries).set({amountMl,...(args.occurredAt===undefined?{}:{occurredAt:validTime(args.occurredAt)})}).where(and(eq(entries.id,id),eq(entries.userId,userId),isNull(entries.deletedAt))).returning({id:entries.id}).all();
    if (!result.length) throw new InputError("记录不存在或已删除",404);
  } else if (tool === "hydration_delete") {
    await db.update(entries).set({deletedAt:new Date().toISOString()}).where(and(eq(entries.id,validId(args.id)),eq(entries.userId,userId),isNull(entries.deletedAt))).run();
  } else if (tool === "hydration_set_goal") {
    const goalMl=validAmount(args.goalMl,"每日目标");
    await db.insert(settings).values({userId,goalMl}).onConflictDoUpdate({target:settings.userId,set:{goalMl}}).run();
  } else if (tool === "hydration_set_friend_day") {
    const {name,key}=validFriendName(args.name), date=validFriendDate(args.date), totalMl=validDailyTotal(args.totalMl), updatedAt=new Date().toISOString();
    await db.insert(friendDays).values({id:crypto.randomUUID(),userId,friendKey:key,name,date,totalMl,updatedAt}).onConflictDoUpdate({target:[friendDays.userId,friendDays.friendKey,friendDays.date],set:{name,totalMl,updatedAt,deletedAt:null}}).run();
  } else if (tool === "hydration_delete_friend_day") {
    await db.update(friendDays).set({deletedAt:new Date().toISOString()}).where(and(eq(friendDays.id,validId(args.id)),eq(friendDays.userId,userId),isNull(friendDays.deletedAt))).run();
  } else throw new InputError("未知操作",404);
  return readWeek(userId);
}
