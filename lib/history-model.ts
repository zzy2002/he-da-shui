import { dateShift, InputError, shanghaiDate, type Entry, type Day } from "./hydration.ts";
export type Range="7d"|"30d"|"all";
export type DailyTotal={date:string;totalMl:number;count:number;achieved:boolean};
export type HistoryPage={items:Entry[];nextCursor:string|null;totalCount:number;range:Range;timezone:string};
export type Statistics={range:Range;fromDate:string|null;toDate:string;goalMl:number;totalMl:number;entryCount:number;recordedDays:number;achievedDays:number;averageRecordedMl:number;days:DailyTotal[];timezone:string};
export function historyRange(value:unknown):Range{if(value===undefined)return "all";if(value!=="7d"&&value!=="30d"&&value!=="all")throw new InputError("统计范围无效");return value;}
export function bounds(range:Range,now=new Date()){const today=shanghaiDate(now);return {today,from:range==="all"?null:dateShift(today,range==="7d"?-6:-29),until:new Date(dateShift(today,1)+"T00:00:00+08:00").toISOString()};}
export function cursorFor(entry:Entry){return btoa(JSON.stringify([entry.occurredAt,entry.id]));}
export function parseCursor(value:unknown):[string,string]|null{if(value===undefined)return null;try{if(typeof value!=="string"||value.length>800)throw 0;const pair=JSON.parse(atob(value));if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=="string"||new Date(pair[0]).toISOString()!==pair[0]||typeof pair[1]!=="string"||!pair[1]||pair[1].length>200)throw 0;return pair as [string,string];}catch{throw new InputError("历史分页标识无效，请刷新重试");}}
export function statisticsFrom(rows:{date:string;totalMl:number;count:number}[],goalMl:number,range:Range,now=new Date()):Statistics{
 const {today,from}=bounds(range,now),days=rows.map(day=>({...day,totalMl:Number(day.totalMl),count:Number(day.count),achieved:Number(day.totalMl)>=goalMl}));
 const totalMl=days.reduce((sum,day)=>sum+day.totalMl,0);
 return {range,fromDate:from??days[0]?.date??null,toDate:today,goalMl,totalMl,entryCount:days.reduce((sum,day)=>sum+day.count,0),recordedDays:days.length,achievedDays:days.filter(day=>day.achieved).length,averageRecordedMl:days.length?Math.round(totalMl/days.length):0,days,timezone:"Asia/Shanghai"};
}

/** One cup per calendar day, including days with no records. */
export function calendarDays(stats:Statistics):Day[]{
 const start=stats.fromDate??dateShift(stats.toDate,-6);
 const count=Math.max(0,Math.round((Date.parse(stats.toDate+"T12:00:00+08:00")-Date.parse(start+"T12:00:00+08:00"))/86400000)+1);
 const recorded=new Map(stats.days.map(day=>[day.date,day]));
 return Array.from({length:count},(_,index)=>{const date=dateShift(start,index),day=recorded.get(date),totalMl=day?.totalMl??0;return {date,totalMl,count:day?.count??0,fill:Math.min(totalMl/stats.goalMl,1),achieved:!!day&&totalMl>=stats.goalMl,entries:[]};});
}
