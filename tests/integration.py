"""Exercise the built Worker locally with simulated platform identities; never runs on a hosted Site."""
import json,uuid,urllib.request,urllib.error,urllib.parse,datetime
base='http://127.0.0.1:3188'
assert urllib.parse.urlparse(base).hostname in ('127.0.0.1','localhost')
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
a,b='verify-'+str(uuid.uuid4()),'verify-'+str(uuid.uuid4())
def request(path='/api/hydration',body=None,user=a,origin=None):
 headers={'Content-Type':'application/json'}
 if user:headers.update({'oai-authenticated-user-id':user,'oai-authenticated-user-email':'test@sites.test'})
 if origin:headers['Origin']=origin
 req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
 try:r=opener.open(req)
 except urllib.error.HTTPError as e:r=e
 return r.code,json.load(r)
def action(tool,args,user=a):return request(body={'tool':tool,'args':args},user=user)
assert request(user=None)[0]==401
first={'amountMl':250,'requestId':str(uuid.uuid4())}
assert action('hydration_add',first)[1]['days'][-1]['totalMl']==250
assert action('hydration_add',first)[1]['days'][-1]['count']==1
assert action('hydration_add',{**first,'amountMl':300})[0]==409
status,s=action('hydration_add',{'amountMl':500,'requestId':str(uuid.uuid4())});assert s['days'][-1]['totalMl']==750
ids=[e['id'] for e in s['days'][-1]['entries']]
assert request(user=b)[1]['recordedDays']==0
assert action('hydration_update',{'id':ids[0],'amountMl':900},user=b)[0]==404
assert action('hydration_delete',{'id':ids[0]},user=b)[0]==200
assert request()[1]['days'][-1]['totalMl']==750
assert action('hydration_update',{'id':ids[0],'amountMl':400})[1]['days'][-1]['totalMl']==900
assert action('hydration_delete',{'id':ids[1]})[1]['days'][-1]['totalMl']==400
assert action('hydration_delete',{'id':ids[1]})[1]['days'][-1]['totalMl']==400
assert action('hydration_set_goal',{'goalMl':300})[1]['days'][-1]['fill']==1
assert action('hydration_set_goal',{'goalMl':2000})[1]['days'][-1]['fill']==.2
now=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8)))
yesterday=(now-datetime.timedelta(days=1)).replace(hour=12,minute=0,second=0,microsecond=0).isoformat()
assert action('hydration_add',{'amountMl':350,'requestId':str(uuid.uuid4()),'occurredAt':yesterday})[1]['days'][-2]['totalMl']==350
assert action('hydration_add',{'amountMl':0,'requestId':str(uuid.uuid4())})[0]==400
assert request(body={'tool':'hydration_set_goal','args':{'goalMl':1000}},origin='https://example.invalid')[0]==403
for method in ['server/discover','tools/list']:
 status,reply=request('/mcp',{'jsonrpc':'2.0','id':1,'method':method});assert status==200 and 'result' in reply
status,reply=request('/mcp',{'jsonrpc':'2.0','id':2,'method':'tools/call','params':{'name':'hydration_read_week','arguments':{}}});assert reply['result']['structuredContent']['days'][-1]['totalMl']==400
status,reply=request('/mcp',{'jsonrpc':'2.0','id':3,'method':'resources/read','params':{'uri':'ui://he-da-shui/hydration-v1.html'}})
resource=reply['result']['contents'][0];assert resource['_meta']['openai/ui']['preferredDisplayMode']=='inline' and 'postMessage' in resource['text']
print('PASS: auth, 250+500, retry deduplication, request conflict, user isolation, edit/delete, goal, backfill, validation, origin, MCP tools/resource')
