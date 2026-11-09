/* Pure game logic; also exposed as window.ShadowLogic for file:// compatibility. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ShadowLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SCHEMA_VERSION = 1;
  const SUBJECTS = ['Medicinal Chemistry','Pharmacotherapy','Physical Pharmacy','Pharmaceutics','Biotechnology','Pharmacology'];
  const FOCUS = [
    {title:'Single-Task Block',steps:'Choose one clear task; work on it for 25 minutes, then rest for 5. Silence notifications and write distractions down.',minutes:30},
    {title:'Distraction Log',steps:'Work on one task for 25 minutes. Note each distraction in one line, then return without judgment. Rest for 5 minutes.',minutes:30},
    {title:'Calm Breathing & Attention',steps:'Breathe naturally and gently for 2 minutes, then do two 15-minute single-task blocks with a 5-minute break. Skip breath focus if uncomfortable.',minutes:37},
    {title:'Memory Recall',steps:'Spend 10 minutes writing what you learned from memory, 10 minutes checking and correcting it, then rest for 5 minutes.',minutes:25},
    {title:'Progressive Block',steps:'Work on one small task for 30 minutes, then rest for 5. Note distractions rather than fighting them.',minutes:35},
    {title:'Two Short Blocks',steps:'Complete two 20-minute single-task blocks with a 5-minute break. Write down a visible outcome for each before starting.',minutes:45},
    {title:'Review & Set Up',steps:'Prepare your space for 5 minutes, work on one task for 25 minutes, then spend 5 minutes reviewing what helped or disrupted focus.',minutes:35},
    {title:'Steady Block',steps:'Complete one 35-minute single-task block, then rest for 5 minutes. Split it into shorter blocks if tired.',minutes:40},
    {title:'Breathing + Single Task',steps:'Gently notice your breathing for 3 minutes without holding your breath, then work on one clear task for 25 minutes and rest for 5.',minutes:33},
    {title:'Return-to-Focus Practice',steps:'Work on one task for 25 minutes. When attention drifts, label it (“thought” or “sound”) and gently return; then rest for 5 minutes.',minutes:30},
    {title:'Short Active Review',steps:'Recall key points for 15 minutes, check them against a source for 10 minutes, then rest for 5.',minutes:30},
    {title:'Second Progressive Block',steps:'Complete two 25-minute single-task blocks with a 5-minute break. Shorten the second block if quality drops.',minutes:55},
    {title:'Reduce Friction',steps:'Spend 5 minutes making the first step very small, work for 30 minutes, then note the next step and rest for 5.',minutes:40},
    {title:'Cycle Review',steps:'Work on one task for 20 minutes, rest for 5, then spend 10 minutes noting what helped this cycle and what to change next week.',minutes:35}
  ];
  const READING = ['Magic Across Cultures: a historical view that separates belief from evidence','Necromancy in Historical Literature: critical reading, cultural context, and portrayals of death','Comparative Mythology: similarities and differences without conflating cultures','The History of Chakra Ideas: origins and conceptual change','Philosophy of Mind: varied arguments about consciousness','Critical Evaluation of Extraordinary Claims: sources, evidence, and falsifiability','Fictional Worldbuilding: creating coherent magical rules for a story','Power and Responsibility: choose a literary or philosophical text and note questions','History of Rituals and Symbols: descriptive reading that respects religious context','Creation Myths: compare narratives without ranking cultures','Gothic Fiction and Dark Fantasy: analyze atmosphere, metaphor, and character','Scientific Method and Its Limits: read a reliable public source and assess its claims','Death in Literature: compare two historical or fictional texts','Design a safe fictional ritual for a story: symbolism, not real-world practice'];
  const DAILY_XP={study:35,recall:25,focus:15,reading:15,meditation:10,exercise:5,workout:15,sleep:5,nutrition:5,water:0,prayer:2,quran:3,brush:2};
  const RANKS=[
    {name:'E-Rank',xp:0,days:0},{name:'D-Rank',xp:2500,days:30},{name:'C-Rank',xp:9000,days:90},{name:'B-Rank',xp:22000,days:180},
    {name:'A-Rank',xp:50000,days:365},{name:'S-Rank',xp:150000,days:548},{name:'SS-Rank',xp:170000,days:730},
    {name:'SSS-Rank',xp:185000,days:850},{name:'Necromancer',xp:195000,days:1000},{name:'Shadow Monarch',xp:210000,days:1095}
  ];
  const pad=n=>String(n).padStart(2,'0');
  function localDate(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
  function validDate(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T00:00:00Z')) && new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
  function dateUTC(s){if(!validDate(s)) throw new Error('Invalid date'); return Date.parse(s+'T00:00:00Z');}
  function elapsedDays(start,today){return Math.max(0,Math.floor((dateUTC(today)-dateUTC(start))/86400000));}
  function addCalendarYears(date,years){const [y,m,d]=date.split('-').map(Number), ny=y+years, last=new Date(Date.UTC(ny,m,0)).getUTCDate();return `${ny}-${pad(m)}-${pad(Math.min(d,last))}`;}
  function anniversary(start,today){return today>=addCalendarYears(start,3);}
  function calendarDay(date){if(!validDate(date))throw new Error('Invalid date');return {day:Number(date.slice(-2)),calendar:'Gregorian'};}
  function dayPlan(start,date){const n=elapsedDays(start,date), a=calendarDay(date);return {elapsedDays:n,subjects:[SUBJECTS[n%6],SUBJECTS[(n+3)%6],SUBJECTS[(n+1)%6]].slice(0,2),focus:FOCUS[n%14],reading:READING[n%14],calendarDay:a.day,calendar:a.calendar,parity:a.day%2===0?'even':'odd',workout:a.day%2===0?'Gym':'Boxing & Jump Rope'};}
  function makeState(date=localDate()){return {schemaVersion:SCHEMA_VERSION,profile:{weight:93,height:173,age:null,gender:'',term:6,baseline:'Low',startDate:date,weightHistory:[{date,weight:93}]},days:{},claims:{}};}
  function normalizeState(s){if(!s||s.schemaVersion!==SCHEMA_VERSION||!s.profile||!validDate(s.profile.startDate)||!s.days||typeof s.days!=='object'||Array.isArray(s.days)||!s.claims||typeof s.claims!=='object'||Array.isArray(s.claims))throw new Error('Invalid backup structure or data version.');
    const p=s.profile;if(!(Number.isFinite(Number(p.weight))&&Number(p.weight)>=1&&Number(p.weight)<=500&&Number.isFinite(Number(p.height))&&Number(p.height)>=50&&Number(p.height)<=260))throw new Error('Invalid height or weight.');if(!(p.age===null||p.age===''||(Number.isInteger(Number(p.age))&&Number(p.age)>=1&&Number(p.age)<=120)))throw new Error('Invalid age.');if(p.gender!==''&&!['Female','Male','Other','Prefer not to say'].includes(p.gender))throw new Error('Invalid gender value.');if(!Array.isArray(p.weightHistory)||p.weightHistory.some(w=>!w||!validDate(w.date)||!Number.isFinite(Number(w.weight))||Number(w.weight)<1||Number(w.weight)>500))throw new Error('Invalid weight history.');
    for(const [date,d] of Object.entries(s.days)){if(!validDate(date)||!d||typeof d!=='object')throw new Error('Invalid day in backup.');if(d.water!==undefined&&(!Number.isInteger(d.water)||d.water<0||d.water>8))throw new Error('Invalid water amount.');if(d.sugar!==undefined&&d.sugar!==null&&!['yes','no','undecided'].includes(d.sugar))throw new Error('Invalid sugar response.');if(d.checks!==undefined&&(!d.checks||typeof d.checks!=='object'||Array.isArray(d.checks)||Object.values(d.checks).some(v=>!['done','recovery','none'].includes(v))))throw new Error('Invalid quest status.');if(d.calories!==undefined&&d.calories!==''&&(!Number.isFinite(Number(d.calories))||Number(d.calories)<0||Number(d.calories)>20000))throw new Error('Invalid calorie value.');}
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
  function claimWeekly(s,today){const w=weeklyStatus(s,today);if(w.claimed)throw new Error('This week’s reward has already been claimed.');if(!w.dungeonUnlocked&&!w.challengeUnlocked)throw new Error('No weekly challenge has been unlocked yet.');const xp=(w.dungeonUnlocked?250:0)+(w.challengeUnlocked?150:0);s.claims[w.key]={xp,date:today,kind:`weekly${w.dungeonUnlocked&&w.challengeUnlocked?'_both':w.dungeonUnlocked?'_dungeon':'_challenge'}`};return xp;}
  const HIDDEN=[{id:'first-double-study',title:'Two Shadows in One Day',description:'Complete both study blocks in one day.',xp:300,unlocked:s=>Object.values(s.days).some(d=>d.checks&&d.checks.study1==='done'&&d.checks.study2==='done')},{id:'reading-archive',title:'Deep Reading Archivist',description:'Log deep reading on five distinct days.',xp:450,unlocked:s=>Object.values(s.days).filter(d=>d.checks&&d.checks.reading==='done').length>=5},{id:'steady-focus',title:'Steady Focus',description:'Log focus training on fourteen distinct days.',xp:700,unlocked:s=>Object.values(s.days).filter(d=>d.checks&&d.checks.focus==='done').length>=14}];
  function hiddenStatus(s){return HIDDEN.map(m=>({...m,unlocked:m.unlocked(s),claimed:!!s.claims[`hidden:${m.id}`]}));}
  function claimHidden(s,id,today){const m=HIDDEN.find(x=>x.id===id);if(!m||!m.unlocked(s))throw new Error('This hidden mission has not been unlocked yet.');const key=`hidden:${id}`;if(s.claims[key])throw new Error('This mission’s reward has already been claimed.');s.claims[key]={xp:m.xp,date:today,kind:'hidden'};return m.xp;}
  return {SCHEMA_VERSION,SUBJECTS,FOCUS,READING,DAILY_XP,RANKS,localDate,validDate,elapsedDays,addCalendarYears,anniversary,calendarDay,dayPlan,makeState,normalizeState,dayData,taskStatus,dayXP,totalXP,progression,weekStart,weeklyStatus,completion,claimWeekly,HIDDEN,hiddenStatus,claimHidden};
});
