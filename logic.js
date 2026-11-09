/* Pure game logic; also exposed as window.ShadowLogic for file:// compatibility. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ShadowLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SCHEMA_VERSION = 1;
  const SUBJECTS = ['شیمی دارویی','دارودرمانی','فیزیکال','فارماسیوتیکس','بیوتکنولوژی','فارماکولوژی'];
  const FOCUS = [
    {title:'بلوک تک‌کاری',steps:'یک کار روشن انتخاب کن؛ ۲۵ دقیقه فقط همان کار، ۵ دقیقه استراحت. اعلان‌ها را خاموش و مزاحمت‌ها را روی کاغذ ثبت کن.',minutes:30},
    {title:'ثبت حواس‌پرتی',steps:'۲۵ دقیقه تک‌کاری؛ هر بار حواس‌پرتی را فقط یک خط یادداشت کن و بدون سرزنش به کار برگرد. سپس ۵ دقیقه استراحت.',minutes:30},
    {title:'تنفس آرام و توجه',steps:'۲ دقیقه تنفس طبیعی و آرام؛ سپس دو بلوک ۱۵ دقیقه‌ای تک‌کاری با ۵ دقیقه استراحت. اگر تمرکز بر تنفس ناراحت‌کننده بود، آن را حذف کن.',minutes:37},
    {title:'بازیابی از حافظه',steps:'۱۰ دقیقه بدون نگاه به منبع هرچه از یک موضوع آموخته‌ای بنویس؛ ۱۰ دقیقه بررسی و اصلاح؛ ۵ دقیقه استراحت.',minutes:25},
    {title:'بلوک افزایشی',steps:'۳۰ دقیقه تک‌کاری روی یک کار کوچک؛ ۵ دقیقه استراحت. مزاحمت‌ها را یادداشت کن، نه اینکه با آن‌ها بجنگی.',minutes:35},
    {title:'دو بلوک کوتاه',steps:'دو نوبت ۲۰ دقیقه‌ای تک‌کاری با ۵ دقیقه فاصله؛ پیش از شروع، نتیجهٔ قابل‌مشاهدهٔ هر بلوک را بنویس.',minutes:45},
    {title:'مرور و تنظیم محیط',steps:'۵ دقیقه محیط را آماده کن؛ ۲۵ دقیقه تک‌کاری؛ ۵ دقیقه مرور اینکه چه چیزی تمرکز را بهتر یا مختل کرد.',minutes:35},
    {title:'بلوک پایدار',steps:'یک بلوک ۳۵ دقیقه‌ای تک‌کاری و سپس ۵ دقیقه استراحت. اگر خسته‌ای، آن را به دو بلوک کوتاه‌تر تقسیم کن.',minutes:40},
    {title:'تنفس + تک‌کاری',steps:'۳ دقیقه توجه آرام به دم‌وبازدم (بدون حبس نفس) و سپس ۲۵ دقیقه یک کار مشخص؛ بعد ۵ دقیقه استراحت.',minutes:33},
    {title:'تمرین بازگشت توجه',steps:'۲۵ دقیقه تک‌کاری. هر بار توجه رفت، آن را نام‌گذاری کن («فکر/صدا») و آرام به کار برگرد؛ ۵ دقیقه استراحت.',minutes:30},
    {title:'مرور فعال کوتاه',steps:'۱۵ دقیقه از حافظه نکته‌ها را بازگو کن، ۱۰ دقیقه با منبع بررسی کن و ۵ دقیقه استراحت کن.',minutes:30},
    {title:'بلوک افزایشی دوم',steps:'دو بلوک ۲۵ دقیقه‌ای تک‌کاری با ۵ دقیقه استراحت؛ اگر کیفیت افت کرد، بلوک دوم را کوتاه کن.',minutes:55},
    {title:'کاهش اصطکاک',steps:'۵ دقیقه اولین قدم را خیلی کوچک کن؛ ۳۰ دقیقه تک‌کاری؛ ۵ دقیقه یادداشت قدم بعدی و استراحت.',minutes:40},
    {title:'مرور چرخه',steps:'۲۰ دقیقه تک‌کاری؛ ۵ دقیقه استراحت؛ ۱۰ دقیقه ثبت اینکه کدام راهبرد این چرخه مفید بود و هفتهٔ بعد چه چیزی را تغییر می‌دهی.',minutes:35}
  ];
  const READING = ['تاریخ جادو در فرهنگ‌ها؛ با نگاه تاریخی و تفکیک باور از شواهد','نکرومنسی در ادبیات تاریخی؛ خوانش انتقادی، زمینهٔ فرهنگی و بازنمایی مرگ','اسطوره‌های تطبیقی؛ شباهت‌ها و تفاوت‌ها بدون یکی‌گرفتن فرهنگ‌ها','تاریخ ایده‌های چاکرا؛ بررسی خاستگاه‌ها و دگرگونی‌های مفهومی','فلسفهٔ ذهن؛ استدلال‌های گوناگون دربارهٔ آگاهی','ارزیابی انتقادی ادعاهای خارق‌العاده؛ منبع، شاهد و امکان ابطال','جهان‌سازی داستانی؛ ساخت قواعد جادویی منسجم برای یک داستان','اخلاق قدرت و مسئولیت؛ انتخاب متن ادبی یا فلسفی و یادداشت پرسش‌ها','تاریخ آیین‌ها و نمادها؛ خواندن توصیفی و احترام به زمینهٔ دینی','اسطوره‌های آفرینش؛ مقایسهٔ روایت‌ها بدون رتبه‌بندی فرهنگ‌ها','داستان گوتیک و فانتزی تاریک؛ تحلیل فضا، استعاره و شخصیت','روش علمی و مرز دانسته‌ها؛ خواندن یک متن عمومی معتبر و نقد ادعاها','مفهوم مرگ در ادبیات؛ مقایسهٔ دو متن تاریخی یا داستانی','طراحی یک آیین خیالی امن برای داستان؛ نمادپردازی، نه اجرای واقعی'];
  const DAILY_XP={study:35,recall:25,focus:15,reading:15,meditation:10,exercise:5,workout:15,sleep:5,nutrition:5,water:0,prayer:2,quran:3,brush:2};
  const RANKS=[
    {name:'E',xp:0,days:0},{name:'D',xp:2500,days:30},{name:'C',xp:9000,days:90},{name:'B',xp:22000,days:180},
    {name:'A',xp:50000,days:365},{name:'S',xp:150000,days:548},{name:'SS',xp:170000,days:730},
    {name:'SSS',xp:185000,days:850},{name:'نکرومنسر',xp:195000,days:1000},{name:'فرمانروای سایه‌ها',xp:210000,days:1095}
  ];
  const pad=n=>String(n).padStart(2,'0');
  function localDate(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
  function validDate(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T00:00:00Z')) && new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
  function dateUTC(s){if(!validDate(s)) throw new Error('تاریخ نامعتبر'); return Date.parse(s+'T00:00:00Z');}
  function elapsedDays(start,today){return Math.max(0,Math.floor((dateUTC(today)-dateUTC(start))/86400000));}
  function addCalendarYears(date,years){const [y,m,d]=date.split('-').map(Number), ny=y+years, last=new Date(Date.UTC(ny,m,0)).getUTCDate();return `${ny}-${pad(m)}-${pad(Math.min(d,last))}`;}
  function anniversary(start,today){return today>=addCalendarYears(start,3);}
  function jalaliDay(date){
    try {const parts=new Intl.DateTimeFormat('en-US-u-ca-persian',{day:'numeric',timeZone:'UTC'}).formatToParts(new Date(dateUTC(date)));const v=Number(parts.find(p=>p.type==='day').value);if(v>=1&&v<=31)return {day:v,calendar:'هجری شمسی'};} catch(e){}
    return {day:Number(date.slice(-2)),calendar:'میلادی (جایگزین؛ تقویم شمسی در این مرورگر در دسترس نیست)'};
  }
  function dayPlan(start,date){const n=elapsedDays(start,date), a=jalaliDay(date);return {elapsedDays:n,subjects:[SUBJECTS[n%6],SUBJECTS[(n+3)%6],SUBJECTS[(n+1)%6]].slice(0,2),focus:FOCUS[n%14],reading:READING[n%14],jalaliDay:a.day,calendar:a.calendar,parity:a.day%2===0?'even':'odd',workout:a.day%2===0?'باشگاه':'بوکس و طناب‌زدن'};}
  function makeState(date=localDate()){return {schemaVersion:SCHEMA_VERSION,profile:{weight:93,height:173,age:null,gender:'',term:6,baseline:'کم',startDate:date,weightHistory:[{date,weight:93}]},days:{},claims:{}};}
  function normalizeState(s){if(!s||s.schemaVersion!==SCHEMA_VERSION||!s.profile||!validDate(s.profile.startDate)||!s.days||typeof s.days!=='object'||Array.isArray(s.days)||!s.claims||typeof s.claims!=='object'||Array.isArray(s.claims))throw new Error('ساختار پشتیبان یا نسخهٔ داده نامعتبر است.');
    const p=s.profile;if(!(Number.isFinite(Number(p.weight))&&Number(p.weight)>=1&&Number(p.weight)<=500&&Number.isFinite(Number(p.height))&&Number(p.height)>=50&&Number(p.height)<=260))throw new Error('قد یا وزن نامعتبر است.');if(!(p.age===null||p.age===''||(Number.isInteger(Number(p.age))&&Number(p.age)>=1&&Number(p.age)<=120)))throw new Error('سن نامعتبر است.');if(p.gender!==''&&!['زن','مرد','دیگر','ترجیح می‌دهم نگویم'].includes(p.gender))throw new Error('مقدار جنسیت نامعتبر است.');if(!Array.isArray(p.weightHistory)||p.weightHistory.some(w=>!w||!validDate(w.date)||!Number.isFinite(Number(w.weight))||Number(w.weight)<1||Number(w.weight)>500))throw new Error('تاریخچهٔ وزن نامعتبر است.');
    for(const [date,d] of Object.entries(s.days)){if(!validDate(date)||!d||typeof d!=='object')throw new Error('روز نامعتبر در پشتیبان.');if(d.water!==undefined&&(!Number.isInteger(d.water)||d.water<0||d.water>8))throw new Error('مقدار آب نامعتبر است.');if(d.sugar!==undefined&&d.sugar!==null&&!['yes','no','undecided'].includes(d.sugar))throw new Error('پاسخ قند نامعتبر است.');if(d.checks!==undefined&&(!d.checks||typeof d.checks!=='object'||Array.isArray(d.checks)||Object.values(d.checks).some(v=>!['done','recovery','none'].includes(v))))throw new Error('وضعیت مأموریت نامعتبر است.');if(d.calories!==undefined&&d.calories!==''&&(!Number.isFinite(Number(d.calories))||Number(d.calories)<0||Number(d.calories)>20000))throw new Error('عدد کالری نامعتبر است.');}
    return s;
  }
  function dayData(s,date){return s.days[date]||(s.days[date]={checks:{},water:0,sugar:null,calories:'',weight:null});}
  function taskStatus(s,date,id){const d=s.days[date];return d&&d.checks&&d.checks[id]||'none';}
  function dayXP(s,date){const d=s.days[date];if(!d||!d.checks)return 0;const c=d.checks;let xp=0;
    for(const id of ['study1','study2'])if(c[id]==='done')xp+=DAILY_XP.study;
    for(const id of ['recall','focus','reading','meditation','sleep','nutrition','quran','brush','prayerMorning','prayerNoon','prayerNight'])if(c[id]==='done')xp+=({recall:25,focus:15,reading:15,meditation:10,sleep:5,nutrition:5,quran:3,brush:2,prayerMorning:2,prayerNoon:2,prayerNight:2}[id]||0);
    for(const id of ['pushups','situps','plank'])if(c[id]==='done')xp+=5;else if(c[id]==='recovery')xp+=2;
    if(c.workout==='done')xp+=15;else if(c.workout==='recovery')xp+=6;
    return xp;
  }
  function totalXP(s){return Object.keys(s.days).reduce((n,d)=>n+dayXP(s,d),0)+Object.values(s.claims).reduce((n,v)=>n+(Number(v.xp)||0),0);}
  function progression(s,today){const xp=totalXP(s),days=elapsedDays(s.profile.startDate,today),eligible=RANKS.filter((r,i)=>xp>=r.xp&&days>=r.days&&(i!==RANKS.length-1||anniversary(s.profile.startDate,today))),current=eligible[eligible.length-1],idx=RANKS.indexOf(current),next=RANKS[idx+1]||null;return {xp,days,current,next,rankIndex:idx,progress:next?Math.min(100,Math.max(0,Math.min((xp-current.xp)/(next.xp-current.xp),(days-current.days)/(next.days-current.days))*100)):100};}
  function weekStart(date){const x=new Date(dateUTC(date)),day=(x.getUTCDay()+1)%7;x.setUTCDate(x.getUTCDate()-day);return x.toISOString().slice(0,10);}
  function weeklyStatus(s,today){const start=weekStart(today),dates=Object.keys(s.days).filter(d=>d>=start&&d<=today);const studyDays=dates.filter(d=>['study1','study2'].some(id=>taskStatus(s,d,id)==='done')).length;const focusDays=dates.filter(d=>taskStatus(s,d,'focus')==='done').length;const key=`week:${start}`;return {start,studyDays,focusDays,key,dungeonUnlocked:studyDays>=5,challengeUnlocked:focusDays>=3,claimed:!!s.claims[key],xp:250};}
  function completion(s,date){const ids=['study1','study2','recall','focus','reading','meditation','pushups','situps','plank','workout','sleep','nutrition','water','brush','quran','prayerMorning','prayerNoon','prayerNight'];const d=s.days[date]||{};let done=0;for(const id of ids){if(id==='water'){if((d.water||0)>=8)done++;}else if(taskStatus(s,date,id)==='done'||taskStatus(s,date,id)==='recovery')done++;}return {done,total:ids.length,percent:Math.round(done/ids.length*100)};}
  function claimWeekly(s,today){const w=weeklyStatus(s,today);if(w.claimed)throw new Error('پاداش این هفته قبلاً دریافت شده است.');if(!w.dungeonUnlocked&&!w.challengeUnlocked)throw new Error('هنوز هیچ چالش هفتگی باز نشده است.');const xp=(w.dungeonUnlocked?250:0)+(w.challengeUnlocked?150:0);s.claims[w.key]={xp,date:today,kind:`weekly${w.dungeonUnlocked&&w.challengeUnlocked?'_both':w.dungeonUnlocked?'_dungeon':'_challenge'}`};return xp;}
  const HIDDEN=[{id:'first-double-study',title:'دو سایه در یک روز',description:'هر دو بلوک مطالعه را در یک روز تکمیل کن.',xp:300,unlocked:s=>Object.values(s.days).some(d=>d.checks&&d.checks.study1==='done'&&d.checks.study2==='done')},{id:'reading-archive',title:'بایگانِ ژرف‌خوانی',description:'در پنج روز متمایز، خواندن عمیق را ثبت کن.',xp:450,unlocked:s=>Object.values(s.days).filter(d=>d.checks&&d.checks.reading==='done').length>=5},{id:'steady-focus',title:'بازگشتِ پیوسته',description:'تمرین تمرکز را در چهارده روز متمایز ثبت کن.',xp:700,unlocked:s=>Object.values(s.days).filter(d=>d.checks&&d.checks.focus==='done').length>=14}];
  function hiddenStatus(s){return HIDDEN.map(m=>({...m,unlocked:m.unlocked(s),claimed:!!s.claims[`hidden:${m.id}`]}));}
  function claimHidden(s,id,today){const m=HIDDEN.find(x=>x.id===id);if(!m||!m.unlocked(s))throw new Error('این مأموریت مخفی هنوز باز نشده است.');const key=`hidden:${id}`;if(s.claims[key])throw new Error('پاداش این مأموریت قبلاً دریافت شده است.');s.claims[key]={xp:m.xp,date:today,kind:'hidden'};return m.xp;}
  return {SCHEMA_VERSION,SUBJECTS,FOCUS,READING,DAILY_XP,RANKS,localDate,validDate,elapsedDays,addCalendarYears,anniversary,jalaliDay,dayPlan,makeState,normalizeState,dayData,taskStatus,dayXP,totalXP,progression,weekStart,weeklyStatus,completion,claimWeekly,HIDDEN,hiddenStatus,claimHidden};
});
