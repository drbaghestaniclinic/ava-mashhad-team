export type Center = {
 id:string;sourceRow:number|null;sourceId:string;name:string;type:string;street:string;neighborhood:string;address:string;phone:string;mobile:string;mapUrl:string;instagram:string;services:string;specialties:string;insurance:string;hours:string;doctors:string;
 lat:number|null;lng:number|null;coordinateNote:string;streetNote:string;raw:Record<string,string>;visited:boolean;visitedAt:string|null;status:string;favorite:boolean;notes:string;followupDate:string;planDate:string;planOrder:number;interest:string;level:string;updatedAt:string;
};
export const statuses:Record<string,string>={new:'شروع نشده',first:'جلسه اول',followup:'جلسه تکمیلی',signed:'قرارداد امضا شد',paused:'فعلاً متوقف'};
export const normalize=(s:string)=>s.toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[أإآ]/g,'ا').replace(/[‌\s]/g,'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
export function distance(a:Pick<Center,'lat'|'lng'>,b:Pick<Center,'lat'|'lng'>){if(a.lat==null||a.lng==null||b.lat==null||b.lng==null)return Infinity;const rad=Math.PI/180;const x=Math.sin((b.lat-a.lat)*rad/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lng-a.lng)*rad/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export const fa=(n:number)=>n.toLocaleString('fa-IR');
export function dateLabel(s:string){if(!s)return 'تعیین نشده';const d=new Date(s.length===10?s+'T12:00:00':s);return Number.isNaN(d.valueOf())?s:d.toLocaleDateString('fa-IR',{month:'long',day:'numeric',year:'numeric'})}
export function mapLink(c:Center){if(/^https?:\/\//i.test(c.mapUrl))return c.mapUrl;if(c.lat!=null&&c.lng!=null)return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('مشهد '+c.address+' '+c.name)}`}
export function matches(c:Center,q:string){const hay=normalize([c.name,c.street,c.neighborhood,c.address,c.type,c.services,c.specialties,c.doctors,c.phone,c.mobile,c.insurance,...Object.values(c.raw||{})].join(' '));return q.split(/\s+/).filter(Boolean).every(t=>hay.includes(normalize(t)))}
