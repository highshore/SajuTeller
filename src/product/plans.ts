export type PreviewPlan={id:string;studioId:string;serviceId:string;date:string;time:string;language:string;guests:number;createdAt:string};
const key='sajuteller-preview-plans-v1';
export function getPlans():PreviewPlan[]{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.filter(p=>p&&typeof p.id==='string'&&typeof p.studioId==='string'):[];}catch{return[];}}
export function savePlan(plan:PreviewPlan){localStorage.setItem(key,JSON.stringify([plan,...getPlans()].slice(0,30)));}
export function removePlan(id:string){localStorage.setItem(key,JSON.stringify(getPlans().filter(p=>p.id!==id)));}
export function seoulToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function safeReturn(path:string|null){return path?.startsWith('/')&&!path.startsWith('//')&&!path.includes('\\')?path:'/trips';}
