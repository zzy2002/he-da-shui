const object=(properties:Record<string,unknown>,required:string[]=[])=>({type:"object",properties,required,additionalProperties:false});
const amount={type:"integer",minimum:1,maximum:20000};
const timestamp={type:"string",description:"饮水发生时间，ISO 8601 且包含时区；默认现在。补记昨天必须显式给出昨天的时间。"};
export const UI_URI="ui://he-da-shui/hydration-v7.html";
export const tools=[
 {name:"hydration_read_week",title:"查看七日饮水",description:"读取北京时间今天及前六天自己的饮水记录、目标和本人代记的朋友每日总量；返回 today 日期，可用于解析“昨天”。未记录不代表没有喝水。",inputSchema:object({}),annotations:{readOnlyHint:true}},
 {name:"hydration_add",title:"记一笔饮水",description:"用户明确说喝了水后记录单次毫升数，自动累加。每次新饮水使用新的 requestId，网络重试复用原 ID。不要在提醒时自动创建记录。",inputSchema:object({amountMl:amount,requestId:{type:"string",description:"每次新饮水的唯一请求标识，建议 UUID"},occurredAt:timestamp},["amountMl","requestId"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_update",title:"修改饮水记录",description:"修改用户指定记录的数量或发生时间。",inputSchema:object({id:{type:"string"},amountMl:amount,occurredAt:timestamp},["id","amountMl"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_delete",title:"删除误记",description:"删除用户指定的误记饮水记录。",inputSchema:object({id:{type:"string"}},["id"]),annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true}},
 {name:"hydration_set_goal",title:"设置每日目标",description:"设置个人每日目标毫升数，用于所有七日杯子水位计算。",inputSchema:object({goalMl:amount},["goalMl"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_set_friend_day",title:"代记朋友的每日饮水",description:"用户明确报告朋友某一天的真实饮水总量时使用，如‘小王昨天喝了2200ml’。先用 read_week 的 today 按北京时间解析日期，将朋友名字、YYYY-MM-DD 日期和当天总毫升数传入。按朋友名字和日期覆盖更新，不逐次累加；不计入用户自己的饮水量。讨论功能、举例或假设时不要保存。",inputSchema:object({name:{type:"string",minLength:1,maxLength:40},date:{type:"string",pattern:"^[0-9]{4}-[0-9]{2}-[0-9]{2}$",description:"朋友饮水的北京时间日期，YYYY-MM-DD"},totalMl:{type:"integer",minimum:0,maximum:20000}},["name","date","totalMl"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_delete_friend_day",title:"删除朋友的误记",description:"删除用户指定的一笔代记朋友每日总量，只作用于当前用户自己的代记数据。先读取记录获取 ID。",inputSchema:object({id:{type:"string"}},["id"]),annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true}},
 {name:"hydration_open",title:"喝大水",description:"打开喝大水交互卡片：单次毫升选择、当天累计和七日水杯图。早晨提醒时先读取七日记录，再调用此工具打开卡片。",inputSchema:object({}),annotations:{readOnlyHint:true},_meta:{ui:{resourceUri:UI_URI},"openai/ui":{entrypoints:[{type:"thread"}]}}},
];
