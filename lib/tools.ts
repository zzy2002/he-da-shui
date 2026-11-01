const object=(properties:Record<string,unknown>,required:string[]=[])=>({type:"object",properties,required,additionalProperties:false});
const amount={type:"integer",minimum:1,maximum:20000};
const timestamp={type:"string",description:"饮水发生时间，ISO 8601 且包含时区；默认现在。补记昨天必须显式给出昨天的时间。"};
export const UI_URI="ui://he-da-shui/hydration-v10.html";
export const tools=[
 {name:"hydration_read_week",title:"查看七日饮水",description:"读取北京时间今天及前六天自己的饮水记录和目标；返回 today 日期，可用于解析“昨天”。未记录不代表没有喝水。",inputSchema:object({}),annotations:{readOnlyHint:true}},
 {name:"hydration_add",title:"记一笔饮水",description:"用户通过语音或文字明确说已经喝了水并提供数量时，直接记录，不再询问确认；不要把示例、计划或问题写成记录。成功会自动展示带水位及达标动画的卡片，不必再调用 hydration_open。每次新饮水使用新的 requestId，网络重试复用原 ID。不要在提醒时自动创建记录。",inputSchema:object({amountMl:amount,requestId:{type:"string",description:"每次新饮水的唯一请求标识，建议 UUID"},occurredAt:timestamp},["amountMl","requestId"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true},_meta:{ui:{resourceUri:UI_URI},"openai/ui":{entrypoints:[{type:"thread"}]}}},
 {name:"hydration_update",title:"修改饮水记录",description:"修改用户指定记录的数量或发生时间。",inputSchema:object({id:{type:"string"},amountMl:amount,occurredAt:timestamp},["id","amountMl"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_delete",title:"删除误记",description:"删除用户指定的误记饮水记录。",inputSchema:object({id:{type:"string"}},["id"]),annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true}},
 {name:"hydration_set_goal",title:"设置每日目标",description:"设置个人每日目标毫升数，用于所有七日杯子水位计算。",inputSchema:object({goalMl:amount},["goalMl"]),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}},
 {name:"hydration_open",title:"喝大水",description:"打开喝大水交互卡片：单次毫升选择、当天累计、七日水杯图。早晨提醒时先读取七日记录，再调用此工具打开卡片。",inputSchema:object({}),annotations:{readOnlyHint:true},_meta:{ui:{resourceUri:UI_URI},"openai/ui":{entrypoints:[{type:"thread"}]}}},
];
