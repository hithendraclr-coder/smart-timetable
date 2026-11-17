const $=id=>document.getElementById(id),KEY='smart-timetable-v1';let tasks=JSON.parse(localStorage.getItem(KEY)||'[]'),filter='all',active=null,seen=new Set(),alarmLoop=null,alarmTimeout=null;
const today=()=>new Date().toLocaleDateString('en-CA');
const save=()=>localStorage.setItem(KEY,JSON.stringify(tasks));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timeLabel=t=>{let [h,m]=t.split(':').map(Number),d=new Date();d.setHours(h,m);return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})};
function render(){let now=new Date(),completed=tasks.filter(t=>t.completed===today()).length,p=tasks.length?Math.round(completed/tasks.length*100):0;$('clock').textContent=now.toLocaleTimeString();$('date').textContent=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'});$('greeting').textContent=now.getHours()<12?'Good morning. Make today count.':now.getHours()<17?'Good afternoon. Keep going.':'Good evening. Finish strong.';$('total').textContent=tasks.length;$('done').textContent=completed;$('percent').textContent=p+'%';$('ringtext').textContent=p+'%';$('ring').style.background=`conic-gradient(var(--accent) ${p*3.6}deg,#293650 0)`;let next=tasks.filter(t=>t.completed!==today()&&t.time>=now.toTimeString().slice(0,5)).sort((a,b)=>a.time.localeCompare(b.time))[0];$('next').textContent=next?next.title:'Nothing planned';let arr=[...tasks].sort((a,b)=>a.time.localeCompare(b.time)).filter(t=>filter==='all'||(filter==='done'?t.completed===today():t.completed!==today()));$('list').innerHTML=arr.map(t=>`<div class="task"><div class="tasktime">${timeLabel(t.time)}</div><div><div class="tasktitle">${esc(t.title)}</div><div class="taskdetails">${esc(t.details||'No extra instructions')}</div><span class="badge ${t.completed===today()?'done':''}">${t.completed===today()?'Completed':'Pending'} · ${t.duration} min ${t.repeat?'· Daily':''}</span></div><div class="taskactions"><button data-act="toggle" data-id="${t.id}">${t.completed===today()?'Undo':'✓ Done'}</button><button data-act="edit" data-id="${t.id}">Edit</button><button data-act="delete" data-id="${t.id}">×</button></div></div>`).join('');$('empty').classList.toggle('hidden',tasks.length>0);$('list').classList.toggle('hidden',arr.length===0);$('caption').textContent=`${completed} of ${tasks.length} activities completed.`}
function openForm(t){$('form').reset();$('id').value=t?.id||'';$('formtitle').textContent=t?'Edit activity':'Add an activity';$('title').value=t?.title||'';$('time').value=t?.time||'09:00';$('duration').value=t?.duration||60;$('details').value=t?.details||'';$('message').value=t?.message||"It's time to start your activity!";$('alarm').checked=t?.alarm!==false;$('repeat').checked=!!t?.repeat;$('formmodal').classList.remove('hidden')}
function closeForm(){$('formmodal').classList.add('hidden')}
$('form').onsubmit=e=>{e.preventDefault();let id=$('id').value,old=tasks.find(t=>t.id===id),item={id:id||crypto.randomUUID(),title:$('title').value.trim(),time:$('time').value,duration:+$('duration').value,details:$('details').value.trim(),message:$('message').value.trim(),alarm:$('alarm').checked,repeat:$('repeat').checked,completed:old?.completed||null,created:old?.created||today()};if(old)Object.assign(old,item);else tasks.push(item);save();closeForm();render()};
$('add').onclick=$('first').onclick=()=>openForm();$('close').onclick=$('cancel').onclick=closeForm;
$('list').onclick=e=>{let b=e.target.closest('button[data-act]');if(!b)return;let t=tasks.find(x=>x.id===b.dataset.id);if(!t)return;if(b.dataset.act==='toggle')t.completed=t.completed===today()?null:today();if(b.dataset.act==='edit')return openForm(t);if(b.dataset.act==='delete'&&confirm('Delete this activity?'))tasks=tasks.filter(x=>x.id!==t.id);save();render()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('selected',x===b));render()});
function showReminder(t){active=t.id;$('rtitle').textContent=t.title;$('rmessage').textContent=t.message||"It's time to start your activity!";$('rdetails').textContent=t.details||'Start this activity now.';$('rstatus').textContent=t.alarm===false?'Respond when ready.':'If you do not respond, an alarm will ring in 5 minutes.';$('reminder').classList.remove('hidden');if('Notification'in window&&Notification.permission==='granted')new Notification('Smart Timetable: '+t.title,{body:t.message||'Time to start!'});clearTimeout(alarmTimeout);if(t.alarm!==false)alarmTimeout=setTimeout(startAlarm,300000)}
function startAlarm(){$('rstatus').textContent='⏰ Alarm is ringing! Choose an action.';$('reminder').querySelector('.dialog').classList.add('ringing');beep();alarmLoop=setInterval(beep,1600)}
function beep(){try{let C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.15,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.5);o.onended=()=>c.close()}catch(e){}}
function closeReminder(){clearTimeout(alarmTimeout);clearInterval(alarmLoop);$('reminder').querySelector('.dialog').classList.remove('ringing');$('reminder').classList.add('hidden');active=null}
function check(){let n=new Date(),hm=n.toTimeString().slice(0,5);tasks.forEach(t=>{let k=t.id+'-'+today();if(t.completed===today()||seen.has(k))return;if(hm>=t.time){seen.add(k);showReminder(t)}})}
$('start').onclick=closeReminder;$('rDone').onclick=()=>{let t=tasks.find(x=>x.id===active);if(t)t.completed=today();save();closeReminder();render()};$('snooze').onclick=()=>{let t=tasks.find(x=>x.id===active);if(t){let d=new Date(Date.now()+300000);t.time=d.toTimeString().slice(0,5);seen.delete(t.id+'-'+today());save();render()}closeReminder()};
$('notify').onclick=async()=>{if(!('Notification'in window))return alert('Notifications are not supported by this browser.');let p=await Notification.requestPermission();alert(p==='granted'?'Notifications enabled.':'Permission not granted.')};
$('image').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{$('preview').innerHTML=`<img src="${r.result}" alt="Timetable preview">`};r.readAsDataURL(f)};
render();setInterval(()=>{render();check()},1000);

// Extra utilities: theme toggle, data backup/restore, reset, clear completed, focus timer.
(function(){
  const themeKey = 'smart-timetable-theme';
  const savedTheme = localStorage.getItem(themeKey);
  if(savedTheme === 'light') document.body.classList.add('light-theme');
  const themeBtn = document.getElementById('themeToggle');
  function updateThemeButton(){
    if(!themeBtn) return;
    themeBtn.textContent = document.body.classList.contains('light-theme') ? '🌙 Dark mode' : '☀️ Light mode';
  }
  updateThemeButton();
  themeBtn?.addEventListener('click',()=>{
    document.body.classList.toggle('light-theme');
    localStorage.setItem(themeKey,document.body.classList.contains('light-theme')?'light':'dark');
    updateThemeButton();
  });

  document.getElementById('resetAll')?.addEventListener('click',()=>{
    if(!confirm('Reset the entire timetable? This will permanently remove all saved activities from this browser.')) return;
    tasks = [];
    seen.clear();
    save();
    closeReminder();
    render();
  });
  document.getElementById('clearCompleted')?.addEventListener('click',()=>{
    const count = tasks.filter(t=>t.completed===today()).length;
    if(!count) return alert('There are no completed activities to clear.');
    if(!confirm(`Remove ${count} completed activity/activities?`)) return;
    tasks = tasks.filter(t=>t.completed!==today());
    save(); render();
  });
  document.getElementById('exportBtn')?.addEventListener('click',()=>{
    const blob = new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='smart-timetable-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('importFile')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0]; if(!file)return;
    try{
      const imported=JSON.parse(await file.text());
      if(!Array.isArray(imported) || imported.some(t=>!t || typeof t.title!=='string' || typeof t.time!=='string')) throw new Error('Invalid backup');
      if(!confirm(`Import ${imported.length} activities? This will replace your current timetable.`)) return;
      tasks=imported; seen.clear(); save(); render(); alert('Timetable imported successfully.');
    }catch(err){alert('Could not import this file. Please select a valid Smart Timetable JSON backup.');}
    finally{e.target.value='';}
  });

  let focusSeconds=25*60, focusInterval=null;
  const timerEl=document.getElementById('focusTimer');
  function drawFocus(){if(timerEl)timerEl.textContent=String(Math.floor(focusSeconds/60)).padStart(2,'0')+':'+String(focusSeconds%60).padStart(2,'0');}
  document.getElementById('focusStart')?.addEventListener('click',()=>{
    const btn=document.getElementById('focusStart');
    if(focusInterval){clearInterval(focusInterval);focusInterval=null;btn.textContent='Resume';return;}
    btn.textContent='Pause';
    focusInterval=setInterval(()=>{
      focusSeconds--;drawFocus();
      if(focusSeconds<=0){clearInterval(focusInterval);focusInterval=null;btn.textContent='Start';alert('Focus session complete! Take a short break.');}
    },1000);
  });
  document.getElementById('focusReset')?.addEventListener('click',()=>{
    clearInterval(focusInterval);focusInterval=null;focusSeconds=25*60;drawFocus();
    const btn=document.getElementById('focusStart');if(btn)btn.textContent='Start';
  });
  drawFocus();
})();
