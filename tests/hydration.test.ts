import test from "node:test";
import assert from "node:assert/strict";
import { summarize, shanghaiDate, dateShift, validAmount, validTime } from "../lib/hydration.ts";
const now=new Date("2026-11-01T04:00:00Z");
const entry=(id:string,amountMl:number,occurredAt="2026-11-01T02:00:00Z")=>({id,amountMl,occurredAt});
test("250 + 500 = 750; over target remains actual amount",()=>{
 const snapshot=summarize([entry("a",250),entry("b",500)],2000,now);
 assert.equal(snapshot.days[6].totalMl,750);assert.equal(snapshot.days[6].fill,.375);assert.equal(snapshot.recordedDays,1);assert.equal(snapshot.achievedDays,0);
 const high=summarize([entry("c",2500)],2000,now);assert.equal(high.days[6].totalMl,2500);assert.equal(high.days[6].fill,1);assert.equal(high.achievedDays,1);
});
test("Shanghai midnight groups records correctly",()=>{
 assert.equal(shanghaiDate(new Date("2026-10-31T15:59:59Z")),"2026-10-31");
 assert.equal(shanghaiDate(new Date("2026-10-31T16:00:00Z")),"2026-11-01");
 const data=summarize([entry("a",250,"2026-10-31T15:59:59Z"),entry("b",500,"2026-10-31T16:00:00Z")],2000,now);
 assert.equal(data.days[5].totalMl,250);assert.equal(data.days[6].totalMl,500);
});
test("seven days include today, exclude older data, and preserve unknown days",()=>{
 const data=summarize([entry("old",300,"2026-10-25T02:00:00Z"),entry("edge",250,"2026-10-25T16:00:00Z")],2000,now);
 assert.equal(data.days.length,7);assert.equal(data.days[0].date,"2026-10-26");assert.equal(data.days[0].totalMl,250);
 assert.equal(data.days[6].count,0);assert.equal(data.recordedDays,1);assert.equal(dateShift("2026-11-01",-1),"2026-10-31");
});
test("changed target recalculates all days",()=>{assert.equal(summarize([entry("a",1000)],1000,now).achievedDays,1);});
test("invalid quantities and future or ambiguous dates are rejected",()=>{
 for(const value of [0,-1,0.5,"250",Infinity,20001])assert.throws(()=>validAmount(value));
 assert.equal(validAmount(250),250);assert.throws(()=>validTime("2026-11-01T12:00:00",now));
 assert.throws(()=>validTime("2026-11-02T00:00:00Z",now));assert.equal(validTime("2026-10-31T20:00:00+08:00",now),"2026-10-31T12:00:00.000Z");
});
