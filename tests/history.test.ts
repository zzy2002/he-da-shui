import test from "node:test";
import assert from "node:assert/strict";
import { bounds, cursorFor, parseCursor, statisticsFrom, historyRange, calendarDays } from "../lib/history-model.ts";
const now=new Date("2026-11-01T04:00:00Z");
test("history windows use Shanghai midnight; all has no lower bound",()=>{assert.equal(bounds("7d",now).from,"2026-10-26");assert.equal(bounds("30d",now).from,"2026-10-03");assert.equal(bounds("all",now).from,null);assert.equal(bounds("all",now).until,"2026-11-01T16:00:00.000Z");assert.throws(()=>historyRange("invalid"));});
test("cursor carries timestamp and ID for stable same-time pagination",()=>{const entry={id:"abc",amountMl:250,occurredAt:"2026-10-01T04:00:00.000Z"};assert.deepEqual(parseCursor(cursorFor(entry)),[entry.occurredAt,entry.id]);assert.equal(parseCursor(undefined),null);for(const cursor of ["garbage",btoa('["bad","id"]'),btoa('["2026-10-01T04:00:00.000Z",""]')])assert.throws(()=>parseCursor(cursor));});
test("statistics average only recorded days and recalculate achievement with current goal",()=>{const rows=[{date:"2026-09-01",totalMl:1000,count:2},{date:"2026-11-01",totalMl:2000,count:4}];const stats=statisticsFrom(rows,2000,"all",now);assert.equal(stats.fromDate,"2026-09-01");assert.equal(stats.totalMl,3000);assert.equal(stats.recordedDays,2);assert.equal(stats.entryCount,6);assert.equal(stats.averageRecordedMl,1500);assert.equal(stats.achievedDays,1);assert.equal(statisticsFrom(rows,1000,"all",now).achievedDays,2);const empty=statisticsFrom([],2000,"all",now);assert.equal(empty.averageRecordedMl,0);assert.equal(empty.fromDate,null);});

test("calendar shows7/30 days, all from first record, and keeps missing days unknown",()=>{
 const rows=[{date:"2026-10-01",totalMl:2500,count:1},{date:"2026-11-01",totalMl:800,count:2}];
 const seven=calendarDays(statisticsFrom([rows[1]],2000,"7d",now));assert.equal(seven.length,7);assert.equal(seven[0].date,"2026-10-26");assert.equal(seven[0].count,0);assert.equal(seven[6].fill,.4);
 const month=calendarDays(statisticsFrom([rows[1]],2000,"30d",now));assert.equal(month.length,30);assert.equal(month[0].date,"2026-10-03");
 const all=calendarDays(statisticsFrom(rows,2000,"all",now));assert.equal(all.length,32);assert.equal(all[0].fill,1);assert.equal(all[0].totalMl,2500);assert.equal(all[1].count,0);assert.equal(all[31].date,"2026-11-01");
 assert.equal(calendarDays(statisticsFrom([],2000,"all",now)).length,7);
});
