import test from "node:test";
import assert from "node:assert/strict";
import { friendComparison, summarize, validFriendName, validFriendDate, validDailyTotal } from "../lib/hydration.ts";
const now=new Date("2026-11-01T04:00:00Z");
test("friend names normalize and dates reject impossible/future days",()=>{
 assert.deepEqual(validFriendName("  Ａlice  "),{name:"Alice",key:"alice"});
 assert.throws(()=>validFriendName("   "));assert.throws(()=>validFriendName("小".repeat(41)));
 assert.equal(validFriendDate("2026-10-31",now),"2026-10-31");
 for(const date of ["2026-02-30","2026-11-02","昨天"])assert.throws(()=>validFriendDate(date,now));
 assert.equal(validDailyTotal(0),0);assert.equal(validDailyTotal(2200),2200);assert.throws(()=>validDailyTotal(-1));
});
test("friend comparisons use the same day and never treat missing personal data as zero",()=>{
 const data=summarize([{id:"mine",amountMl:1800,occurredAt:"2026-10-31T04:00:00Z"}],2000,now);
 data.friendDays=[{id:"friend",name:"小王",date:"2026-10-31",totalMl:2200}];
 const result=friendComparison(data,"2026-11-01");assert.equal(result?.label,"昨天");assert.equal(result?.difference,-400);
 data.friendDays[0].totalMl=1500;assert.equal(friendComparison(data,"2026-11-01")?.difference,300);
 data.friendDays[0].totalMl=1800;assert.equal(friendComparison(data,"2026-11-01")?.difference,0);
 data.friendDays[0].date="2026-11-01";assert.equal(friendComparison(data,"2026-11-01")?.difference,null);
 assert.equal(friendComparison(summarize([],2000,now),"2026-11-01"),null);
});
