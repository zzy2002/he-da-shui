export const TIMEZONE = "Asia/Shanghai";
export type Entry = { id: string; amountMl: number; occurredAt: string };
export type Day = { date: string; totalMl: number; count: number; fill: number; achieved: boolean; entries: Entry[] };
export type FriendDay = { id: string; name: string; date: string; totalMl: number };
export type Snapshot = { today: string; goalMl: number; days: Day[]; recordedDays: number; achievedDays: number; timezone: string; friendDays?: FriendDay[] };
export class InputError extends Error { status: number; constructor(message: string, status = 400) { super(message); this.status = status; } }
export function shanghaiDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function dateShift(date: string, offset: number): string {
  return new Date(Date.parse(date + "T12:00:00+08:00") + offset * 86400000).toISOString().slice(0,10);
}
export function validAmount(value: unknown, name = "本次饮水量"): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 20000) throw new InputError(name + "请输入 1–20000 的整数毫升数");
  return value;
}
export function validTime(value: unknown, now = new Date()): string {
  if (value === undefined) return now.toISOString();
  if (typeof value !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) throw new InputError("时间需要包含时区");
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) throw new InputError("时间无效");
  if (d.getTime() > now.getTime() + 60000) throw new InputError("不能记录未来的饮水");
  return d.toISOString();
}
export function validId(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 200) throw new InputError("缺少有效的记录标识");
  return value;
}
export function summarize(entries: Entry[], goalMl: number, now = new Date()): Snapshot {
  const today = shanghaiDate(now);
  const days = Array.from({length:7}, (_, i) => {
    const date = dateShift(today, i-6);
    const daily = entries.filter(e => shanghaiDate(new Date(e.occurredAt)) === date).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));
    const totalMl = daily.reduce((sum,e)=>sum+e.amountMl,0);
    return {date, totalMl, count:daily.length, fill:Math.min(totalMl/goalMl,1), achieved:totalMl>=goalMl, entries:daily};
  });
  return { today, goalMl, days, recordedDays:days.filter(d=>d.count>0).length, achievedDays:days.filter(d=>d.achieved).length, timezone:TIMEZONE };
}

export function validFriendName(value: unknown): {name:string;key:string} {
 if(typeof value!=="string")throw new InputError("请输入朋友的名字");
 const name=value.normalize("NFKC").trim().replace(/\s+/g," ");
 if(!name||name.length>40)throw new InputError("朋友名字需要 1–40 个字符");
 return {name,key:name.toLowerCase()};
}
export function validFriendDate(value: unknown, now=new Date()): string {
 if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new InputError("日期请使用 YYYY-MM-DD");
 const parsed=new Date(value+"T12:00:00+08:00");
 if(!Number.isFinite(parsed.getTime())||shanghaiDate(parsed)!==value)throw new InputError("日期无效");
 if(value>shanghaiDate(now))throw new InputError("不能记录未来的饮水");
 return value;
}
export function validDailyTotal(value:unknown):number {
 if(typeof value!=="number"||!Number.isInteger(value)||value<0||value>20000)throw new InputError("每日总量请输入 0–20000 的整数毫升数");
 return value;
}
export function friendComparison(snapshot: Snapshot | null, selectedDate: string) {
 if(!snapshot?.friendDays?.length)return null;
 const report=snapshot.friendDays.find(f=>f.date===selectedDate)??snapshot.friendDays[0];
 const mine=snapshot.days.find(d=>d.date===report.date);
 const mineMl=mine?.count?mine.totalMl:null;
 const label=report.date===snapshot.today?"今天":report.date===dateShift(snapshot.today,-1)?"昨天":report.date.slice(5).replace("-","/");
 const difference=mineMl===null?null:mineMl-report.totalMl;
 return {report,label,mineMl,difference};
}
