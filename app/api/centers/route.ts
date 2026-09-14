import { database,ensureSeed } from '@/db/store';
import { statuses, type Center } from '@/lib/centers';
const strings=['name','type','street','neighborhood','address','phone','mobile','mapUrl','instagram','services','specialties','insurance','hours','doctors','notes','followupDate','planDate','interest','level','status'] as const;
function validate(input:unknown){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('اطلاعات ارسال‌شده معتبر نیست.');
 const x=input as Record<string,unknown>;const result:Record<string,unknown>={};
 for(const [k,v]of Object.entries(x)){
  if((strings as readonly string[]).includes(k)){if(typeof v!=='string'||v.length>(k==='notes'?12000:5000))throw new Error('متن واردشده بیش از حد طولانی یا نامعتبر است.');result[k]=v.trim();}
  else if(['visited','favorite'].includes(k)){if(typeof v!=='boolean')throw new Error('وضعیت نامعتبر است.');result[k]=v;}
  else if(k==='planOrder'){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>100000)throw new Error('ترتیب نامعتبر است.');result[k]=v;}
  else if(['lat','lng'].includes(k)){if(v!==null&&(typeof v!=='number'||!Number.isFinite(v)||v<(k==='lat'?-90:-180)||v>(k==='lat'?90:180)))throw new Error('مختصات نامعتبر است.');result[k]=v;}
  else throw new Error('فیلد غیرمجاز است.');
 }
 if('name'in result&&!result.name)throw new Error('نام مرکز را وارد کنید.');
 if(result.status&&!statuses[result.status as string])throw new Error('مرحله همکاری نامعتبر است.');
 for(const k of ['planDate','followupDate']){const v=result[k];if(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v as string)||Number.isNaN(Date.parse(v as string))||new Date(v as string).toISOString().slice(0,10)!==v))throw new Error('تاریخ معتبر انتخاب کنید.');}
 if(result.mapUrl&&!/^https?:\/\//i.test(result.mapUrl as string))throw new Error('لینک نقشه باید با https:// یا http:// شروع شود.');
 if('visited'in result)result.visitedAt=result.visited?new Date().toISOString():null;
 result.updatedAt=new Date().toISOString();return result;
}
function checkOrigin(r:Request){const origin=r.headers.get('origin');return !origin||origin===new URL(r.url).origin}
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function GET(){try{await ensureSeed();const rows=await database().prepare('SELECT data FROM centers ORDER BY id').all<{data:string}>();return json({centers:rows.results.map(r=>JSON.parse(r.data))})}catch(e){console.error('centers load failed',e);return json({error:'دریافت اطلاعات ممکن نشد. دوباره تلاش کنید.'},503)}}
export async function POST(r:Request){if(!checkOrigin(r))return json({error:'درخواست مجاز نیست.'},403);try{const input=validate(await r.json());if(!input.name||!input.street||!input.address)return json({error:'نام مرکز، خیابان و آدرس را وارد کنید.'},400);await ensureSeed();const center={id:crypto.randomUUID(),sourceRow:null,sourceId:'',name:'',type:'مطب',street:'',neighborhood:'',address:'',phone:'',mobile:'',mapUrl:'',instagram:'',services:'',specialties:'',insurance:'',hours:'',doctors:'',lat:null,lng:null,coordinateNote:'',streetNote:'',raw:{},visited:false,visitedAt:null,status:'new',favorite:false,notes:'',followupDate:'',planDate:'',planOrder:0,interest:'',level:'',updatedAt:'',...input} as Center;await database().prepare('INSERT INTO centers (id,data) VALUES (?,?)').bind(center.id,JSON.stringify(center)).run();return json({center},201)}catch(e){console.error('center create failed',e);return json({error:e instanceof Error&& !/D1|SQL|database/i.test(e.message)?e.message:'ثبت مرکز ممکن نشد؛ دوباره تلاش کنید.'},400)}}
export async function PATCH(r:Request){if(!checkOrigin(r))return json({error:'درخواست مجاز نیست.'},403);try{const body=await r.json() as {patches:{id:string;changes:unknown}[]};if(!Array.isArray(body.patches)||!body.patches.length||body.patches.length>150)throw new Error('درخواست تغییر نامعتبر است.');const updates=body.patches.map(p=>{if(typeof p.id!=='string'||!p.id||p.id.length>100)throw new Error('شناسه نامعتبر است.');return {id:p.id,changes:validate(p.changes)}});await ensureSeed();const db=database();const found=await db.batch(updates.map(p=>db.prepare('SELECT id FROM centers WHERE id = ?').bind(p.id)));if(found.some(r=>!r.results.length))return json({error:'مرکز پیدا نشد؛ فهرست را تازه کنید.'},404);await db.batch(updates.map(p=>db.prepare('UPDATE centers SET data = json_patch(data, json(?)) WHERE id = ?').bind(JSON.stringify(p.changes),p.id)));const rows=await db.batch(updates.map(p=>db.prepare('SELECT data FROM centers WHERE id = ?').bind(p.id)));return json({centers:rows.map(r=>JSON.parse((r.results[0] as {data:string}).data))})}catch(e){console.error('center update failed',e);return json({error:e instanceof Error&&!/D1|SQL|database/i.test(e.message)?e.message:'تغییرات ذخیره نشد؛ دوباره تلاش کنید.'},400)}}
