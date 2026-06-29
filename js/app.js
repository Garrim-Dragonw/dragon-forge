const KEY="garrim_pt_mvp_v10_serie_righe_logo_fix";
let data=JSON.parse(localStorage.getItem(KEY))||null;
let activeId=null, session=null;
const $=id=>document.getElementById(id);
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const activeClient=()=>data.clients.find(c=>c.id===activeId);

function sessionDoneCount(c){
  return Number(c.packageCompleted ?? 0);
}
function isSessionCompleted(s){
  const rows=parseRows(s.exercises||"");
  if(!rows.length || !s.clientEdits) return false;
  return rows.every((r,i)=>{
    const setCount=targetSetsCount(r);
    const sets=s.clientEdits[i]?.sets || {};
    return Array.from({length:setCount},(_,setIndex)=>sets[setIndex]?.done===true || sets[setIndex]?.done==="true").every(Boolean);
  });
}
function formatAppointment(value){
  if(!value) return "Nessun allenamento fissato";
  const d=new Date(value);
  if(isNaN(d)) return value;
  return d.toLocaleString("it-IT",{weekday:"short",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
}
function sessionCounterHTML(c){
  const done=Number(c.packageCompleted ?? 0), total=Number(c.packageTotal||0);
  const label=total ? `${done}/${total}` : `${done}`;
  const pct=total ? Math.min(100,Math.round(done/total*100)) : 0;
  return `<div class="session-counter"><div><small class="muted">Allenamenti fatti insieme</small><br><b>${label}</b> ${total?`<span class="muted">sedute · ${pct}% pacchetto</span>`:`<span class="muted">sedute completate</span>`}</div><span class="badge">Monitoraggio abbonamento</span></div>`;
}
function nextAppointmentHTML(c, editable=false){
  const proposal=c.appointmentProposal;
  if(editable){
    return `<div class="next-session-card">
      <h3>Prossimo allenamento concordato</h3>
      <div class="date-big">${formatAppointment(c.nextAppointment)}</div>
      <div class="grid-form" style="grid-template-columns:1fr auto;margin-top:10px">
        <input id="nextAppointmentInput" type="datetime-local" value="${esc(c.nextAppointment||"")}">
        <button type="button" id="saveNextAppointmentBtn">Salva data</button>
      </div>
      ${proposal?`<div class="proposal-box"><b>Proposta cliente:</b><br>${formatAppointment(proposal.value)}<br><small class="muted">${esc(proposal.note||"")}</small><br><button type="button" class="ghost" id="acceptProposalBtn" style="margin-top:8px">Accetta proposta</button></div>`:""}
    </div>`;
  }
  return `<div class="next-session-card">
    <h3>Prossimo allenamento</h3>
    <div class="date-big">${formatAppointment(c.nextAppointment)}</div>
    ${proposal?`<div class="proposal-box"><b>Proposta inviata:</b><br>${formatAppointment(proposal.value)}<br><small class="muted">${esc(proposal.note||"In attesa di conferma coach")}</small></div>`:""}
  </div>`;
}

function demoData(){
  const clients=[
    {
      id:uid(), name:"Alessandro B.", goal:"Massa muscolare", code:"ALESS-123", packageCompleted:3, packageTotal:10, nextAppointment:"2026-06-29T18:30", appointmentProposal:null, notes:"Focus panca e upper. Buona aderenza.",
      measurements:[
        {date:"2026-05-30",weight:85.8,height:178,chest:102,waist:88,arm:35.5,leg:58,notes:"Partenza"},
        {date:"2026-06-07",weight:86.2,height:178,chest:102.5,waist:87.5,arm:36,leg:58.5,notes:"Buona risposta"},
        {date:"2026-06-14",weight:86.7,height:178,chest:103.2,waist:87.2,arm:36.4,leg:59,notes:"Carichi in salita"},
        {date:"2026-06-21",weight:87.1,height:178,chest:104,waist:87,arm:36.8,leg:59.4,notes:"Ottimo"}
      ],
      sessions:[
        {date:"2026-06-01",name:"Upper A",adherence:90,exercises:"Panca piana | 4 | 6 | 70 | 7\nRematore bilanciere | 4 | 8 | 60 | 7\nChest press | 3 | 10 | 40 | 8"},
        {date:"2026-06-08",name:"Upper A",adherence:95,exercises:"Panca piana | 4 | 6 | 72.5 | 8\nRematore bilanciere | 4 | 8 | 62.5 | 8\nChest press | 3 | 10 | 42.5 | 8"},
        {date:"2026-06-15",name:"Upper A",adherence:90,exercises:"Panca piana | 4 | 6 | 75 | 8\nRematore bilanciere | 4 | 8 | 65 | 8\nChest press | 3 | 10 | 45 | 8"},
        {date:"2026-06-22",name:"Upper A",adherence:100,exercises:"Panca piana | 4 | 6 | 77.5 | 8\nRematore bilanciere | 4 | 8 | 67.5 | 8\nChest press | 3 | 10 | 47.5 | 8"}
      ]
    },
    {
      id:uid(), name:"Veronica R.", goal:"Ricomposizione", code:"VERO-456", packageCompleted:2, packageTotal:8, nextAppointment:"2026-06-30T12:00", appointmentProposal:null, notes:"Focus tecnica, controllo e dolore lombare nullo.",
      measurements:[
        {date:"2026-05-29",weight:68.4,height:166,chest:91,waist:78,arm:28.5,leg:55,notes:"Partenza"},
        {date:"2026-06-06",weight:67.9,height:166,chest:91,waist:76.8,arm:28.6,leg:55.2,notes:"Meno gonfiore"},
        {date:"2026-06-13",weight:67.3,height:166,chest:90.8,waist:75.9,arm:28.8,leg:55.4,notes:"Bene"},
        {date:"2026-06-20",weight:66.8,height:166,chest:90.5,waist:75.1,arm:29,leg:55.6,notes:"Aderenza alta"}
      ],
      sessions:[
        {date:"2026-06-02",name:"Total Body 1",adherence:85,exercises:"Leg press | 3 | 10 | 80 | 7\nLat machine | 3 | 10 | 32 | 7\nChest press | 3 | 12 | 20 | 7"},
        {date:"2026-06-09",name:"Total Body 1",adherence:90,exercises:"Leg press | 3 | 10 | 85 | 7\nLat machine | 3 | 10 | 34 | 7\nChest press | 3 | 12 | 22 | 7"},
        {date:"2026-06-16",name:"Total Body 1",adherence:95,exercises:"Leg press | 3 | 10 | 90 | 8\nLat machine | 3 | 10 | 36 | 8\nChest press | 3 | 12 | 24 | 8"}
      ]
    },
    {
      id:uid(), name:"Marco F.", goal:"Dimagrimento + forza", code:"MARCO-789", packageCompleted:3, packageTotal:12, nextAppointment:"2026-07-01T19:00", appointmentProposal:null, notes:"Focus squat/pressa e costanza alimentare.",
      measurements:[
        {date:"2026-05-28",weight:104.6,height:183,chest:112,waist:108,arm:38.5,leg:64,notes:"Partenza"},
        {date:"2026-06-05",weight:103.2,height:183,chest:111.5,waist:106.5,arm:38.4,leg:63.8,notes:"Ottimo inizio"},
        {date:"2026-06-12",weight:102.4,height:183,chest:111,waist:105.4,arm:38.2,leg:63.7,notes:"Scende bene"},
        {date:"2026-06-19",weight:101.6,height:183,chest:110.6,waist:104.2,arm:38.2,leg:63.5,notes:"Stabile e motivato"}
      ],
      sessions:[
        {date:"2026-06-03",name:"Lower A",adherence:80,exercises:"Pressa | 4 | 10 | 180 | 7\nLeg extension | 3 | 12 | 45 | 8\nLat machine | 3 | 10 | 45 | 7"},
        {date:"2026-06-10",name:"Lower A",adherence:85,exercises:"Pressa | 4 | 10 | 190 | 7\nLeg extension | 3 | 12 | 47.5 | 8\nLat machine | 3 | 10 | 47.5 | 7"},
        {date:"2026-06-17",name:"Lower A",adherence:90,exercises:"Pressa | 4 | 10 | 200 | 8\nLeg extension | 3 | 12 | 50 | 8\nLat machine | 3 | 10 | 50 | 8"}
      ]
    }
  ];
  return {clients};
}

function resetDemo(){
  data=demoData();
  // Dati demo: alcune sedute già completate dal cliente
  data.clients.forEach(c=>{
    (c.sessions||[]).forEach((s,si)=>{
      if(si < Math.max(1,(c.sessions||[]).length-1)){
        s.clientEdits={};
        parseRows(s.exercises).forEach((r,i)=>{
          s.clientEdits[i]={done:true,reps:String(r.reps||""),load:String(r.load||"").replace("kg","").trim(),setsDone:String(r.setsDone||"")};
        });
      }
    });
  });
  activeId=data.clients[0].id;save();renderAll();
}
if(!data) resetDemo(); else activeId=data.clients[0]?.id;

$("resetDemoBtn").onclick=()=>{if(confirm("Resettare i dati demo?"))resetDemo()};

$("loginBtn").onclick=()=>{
  const role=$("loginRole").value, code=$("loginCode").value.trim();
  if(role==="coach"&&code==="coach123"){session={role:"coach"};showCoach();return}
  if(role==="client"){
    const found=data.clients.find(c=>(c.code||"").toLowerCase()===code.toLowerCase());
    if(found){session={role:"client",clientId:found.id};showClient(found.id);return}
  }
  alert("Codice non valido");
};
function hideAll(){$("loginPage").classList.add("hidden");$("coachApp").classList.add("hidden");$("clientApp").classList.add("hidden")}
function logout(){hideAll();$("loginPage").classList.remove("hidden")}
$("logoutBtn").onclick=logout;$("sideLogout").onclick=logout;$("clientLogoutBtn").onclick=logout;
function showCoach(){hideAll();$("coachApp").classList.remove("hidden");renderAll()}
function showClient(id){hideAll();$("clientApp").classList.remove("hidden");renderClient(id)}

document.querySelectorAll(".nav-btn[data-page]").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  $(btn.dataset.page+"Page").classList.remove("hidden");
  renderAll();
});
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.add("hidden"));
  btn.classList.add("active");$(btn.dataset.tab).classList.remove("hidden");
  renderClientArea();
});

function renderAll(){renderStats();renderRecent();renderClients();renderClientArea();renderArchives()}
function renderStats(){
  $("statClients").textContent=data.clients.length;
  $("statMeasurements").textContent=data.clients.flatMap(c=>c.measurements||[]).length;
  $("statSessions").textContent=data.clients.flatMap(c=>c.sessions||[]).length;
  const all=data.clients.flatMap(c=>c.sessions||[]).filter(s=>s.adherence);
  $("statAdherence").textContent=all.length?Math.round(all.reduce((a,b)=>a+Number(b.adherence),0)/all.length)+"%":"0%";
}
function renderRecent(){
  $("recentClients").innerHTML=data.clients.map(c=>{
    const last=(c.measurements||[]).at(-1); const first=(c.measurements||[])[0];
    const delta=last&&first?(Number(last.weight)-Number(first.weight)).toFixed(1):"--";
    return `<div class="client-row" onclick="openClient('${c.id}')"><div class="avatar">${esc(c.name[0])}</div><div><b>${esc(c.name)}</b><br><small class="muted">${esc(c.goal)} · peso ${esc(last?.weight||'--')}kg · trend ${delta}kg · sedute ${sessionDoneCount(c)}/${c.packageTotal||'--'}</small></div><div class="ring">${sessionDoneCount(c)} ok</div></div>`;
  }).join("");
}
window.openClient=id=>{activeId=id;document.querySelector('[data-page="clients"]').click();renderAll()};
function renderClients(){
  $("clientList").innerHTML=data.clients.map(c=>`<div class="client-row" onclick="activeId='${c.id}';renderAll()"><div class="avatar">${esc(c.name[0])}</div><div><b>${esc(c.name)}</b><br><small class="muted">${esc(c.code)} · ${esc(c.goal)} · sedute ${sessionDoneCount(c)}/${c.packageTotal||"--"}</small></div><span>›</span></div>`).join("");
}
function renderClientArea(){
  const c=activeClient();
  $("emptyState").classList.toggle("hidden",!!c);$("clientArea").classList.toggle("hidden",!c);
  if(!c)return;
  $("activeClientName").textContent=c.name;$("activeClientGoal").textContent=c.goal;$("activeClientCode").textContent="Codice cliente: "+c.code;$("coachNotes").value=c.notes||"";
  renderLatest(c);renderSessions(c);renderMeasures(c);renderCharts(c);
}
function renderLatest(c){
  $("coachSessionCounter").innerHTML=sessionCounterHTML(c);
  if($("packageTotalInput")){
    $("packageDoneInput").value = c.packageCompleted ?? 0;
    $("packageTotalInput").value = c.packageTotal || "";
    $("savePackageBtn").onclick = () => {
      c.packageCompleted = Number($("packageDoneInput").value || 0);
      c.packageTotal = Number($("packageTotalInput").value || 0);
      save();
      renderAll();
      alert("Conteggio sedute aggiornato.");
    };
  }
  if($("coachNextAppointment")){
    $("coachNextAppointment").innerHTML = nextAppointmentHTML(c,true);
    $("saveNextAppointmentBtn").onclick = () => {
      c.nextAppointment = $("nextAppointmentInput").value;
      c.appointmentProposal = null;
      save();
      renderAll();
      alert("Prossimo allenamento aggiornato.");
    };
    const accept=$("acceptProposalBtn");
    if(accept){
      accept.onclick = () => {
        c.nextAppointment = c.appointmentProposal.value;
        c.appointmentProposal = null;
        save();
        renderAll();
        alert("Proposta accettata.");
      };
    }
  }
  const m=(c.measurements||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).at(-1)||{};
  const items=[["Peso",m.weight?"{v} kg".replace("{v}",m.weight):"--"],["Altezza",m.height?"{v} cm".replace("{v}",m.height):"--"],["Torace",m.chest?"{v} cm".replace("{v}",m.chest):"--"],["Vita",m.waist?"{v} cm".replace("{v}",m.waist):"--"],["Braccia",m.arm?"{v} cm".replace("{v}",m.arm):"--"],["Gamba",m.leg?"{v} cm".replace("{v}",m.leg):"--"]];
  $("latestMeasures").innerHTML=items.map(i=>`<div class="measure-box"><small>${i[0]}</small><b>${i[1]}</b></div>`).join("");
}
function parseRows(exercises){
  return String(exercises||"").split("\n").filter(Boolean).map((l,i)=>{
    const p=l.split("|").map(x=>x.trim());
    return {name:p[0]||l,sets:p[1]||"",reps:p[2]||"",load:p[3]||"",setsDone:p[4]||""};
  });
}
function workoutTable(exercises){
  return `<table class="workout-table"><thead><tr><th>#</th><th>Esercizio</th><th>Serie</th><th>Reps</th><th>Carico</th><th>Serie fatte</th></tr></thead><tbody>`+
  parseRows(exercises).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${esc(r.sets)}</td><td>${esc(r.reps)}</td><td>${esc(r.load)}</td><td>${esc(r.setsDone)}</td></tr>`).join("")+`</tbody></table>`;
}
function renderSessions(c){
  $("sessionList").innerHTML=(c.sessions||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(s=>`<div class="card"><span class="badge">${esc(s.date)} · aderenza ${esc(s.adherence||'--')}%</span><h3>${esc(s.name)}</h3>${workoutTable(s.exercises)}${coachClientEditsTable(s)}</div>`).join("");
}
function coachClientEditsTable(s){
  if(!s.clientEdits || !Object.keys(s.clientEdits).length) return "";
  const rows=parseRows(s.exercises);
  let body="";
  Object.keys(s.clientEdits).forEach(i=>{
    const ex=rows[i]?.name||"Esercizio";
    const sets=s.clientEdits[i].sets || {};
    if(Object.keys(sets).length){
      Object.keys(sets).forEach(setIndex=>{
        const set=sets[setIndex];
        body += `<tr><td>${set.done===true||set.done==="true"?"✅":"—"}</td><td>${esc(ex)}</td><td>${Number(setIndex)+1}</td><td>${esc(set.reps||"--")}</td><td>${esc(set.load||"--")}</td></tr>`;
      });
    } else {
      body += `<tr><td>${s.clientEdits[i].done===true||s.clientEdits[i].done==="true"?"✅":"—"}</td><td>${esc(ex)}</td><td>--</td><td>${esc(s.clientEdits[i].reps||"--")}</td><td>${esc(s.clientEdits[i].load||"--")}</td></tr>`;
    }
  });
  return `<h3 style="margin-top:14px">Dati inseriti dal cliente</h3><table class="workout-table"><thead><tr><th>Ok</th><th>Esercizio</th><th>Serie</th><th>Reps</th><th>Carico</th></tr></thead><tbody>${body}</tbody></table>`;
}
function renderMeasures(c){
  $("measureList").innerHTML=(c.measurements||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(m=>`<div class="card"><span class="badge">${esc(m.date)}</span><div class="measure-grid" style="margin-top:10px">
    <div class="measure-box"><small>Peso</small><b>${esc(m.weight)} kg</b></div>
    <div class="measure-box"><small>Altezza</small><b>${esc(m.height)} cm</b></div>
    <div class="measure-box"><small>Torace</small><b>${esc(m.chest)} cm</b></div>
    <div class="measure-box"><small>Vita</small><b>${esc(m.waist)} cm</b></div>
    <div class="measure-box"><small>Braccia</small><b>${esc(m.arm)} cm</b></div>
    <div class="measure-box"><small>Gamba</small><b>${esc(m.leg)} cm</b></div>
  </div><p class="muted">${esc(m.notes||'')}</p></div>`).join("");
}
var chartStore = chartStore || {};
function drawLine(canvasId, labels, series, unit){
  if(!chartStore) chartStore = {};
  chartStore[canvasId] = {labels, series, unit};
  const can=$(canvasId);
  if(!can) return;
  drawLineOnCanvas(can, labels, series, unit);
}
function drawLineOnCanvas(can, labels, series, unit){
  const ctx=can.getContext("2d");ctx.clearRect(0,0,can.width,can.height);
  ctx.fillStyle="#9eaa99";ctx.font="15px system-ui";
  if(!labels.length||!series.length){ctx.fillText("Nessun dato.",30,60);return}
  const all=series.flatMap(s=>s.values).filter(v=>!isNaN(v));
  if(!all.length){ctx.fillText("Nessun dato numerico.",30,60);return}
  const min=Math.min(...all)-1,max=Math.max(...all)+1,pad=48,w=can.width-pad*2,h=can.height-pad*2;
  ctx.strokeStyle="#243924";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,pad);ctx.lineTo(pad,pad+h);ctx.lineTo(pad+w,pad+h);ctx.stroke();
  const colors=["#7dde45","#b7ff7a","#4b8a2d","#f08a22","#d9ffbf"];
  series.forEach((s,si)=>{
    ctx.strokeStyle=colors[si%colors.length];ctx.lineWidth=4;ctx.beginPath();
    s.values.forEach((v,i)=>{const x=pad+(labels.length===1?0.5:i/(labels.length-1))*w,y=pad+h-((v-min)/(max-min))*h;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});
    ctx.stroke();ctx.fillStyle=colors[si%colors.length];
    s.values.forEach((v,i)=>{const x=pad+(labels.length===1?0.5:i/(labels.length-1))*w,y=pad+h-((v-min)/(max-min))*h;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.fillText(String(v),x-12,y-12)});
    ctx.fillText(s.name, pad+10, pad+22+si*22);
  });
  ctx.fillStyle="#f6f8f1";
  labels.forEach((l,i)=>{const x=pad+(labels.length===1?0.5:i/(labels.length-1))*w;ctx.fillText(String(l).slice(5),x-22,pad+h+26)});
}
function openChart(canvasId, title){
  const spec = chartStore[canvasId];
  if(!spec) return;
  $("chartModalTitle").textContent = title || "Grafico";
  $("chartModal").classList.add("open");
  const modalCanvas = $("modalChartCanvas");
  setTimeout(()=>drawLineOnCanvas(modalCanvas, spec.labels, spec.series, spec.unit), 30);
}

document.addEventListener("click", e=>{
  const btn=e.target.closest && e.target.closest("[data-client-section]");
  if(btn){
    const target=$(btn.dataset.clientSection);
    if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
  }
});

document.addEventListener("click", e=>{
  if(e.target && e.target.classList && e.target.classList.contains("chart-click")){
    openChart(e.target.id, e.target.dataset.chartTitle);
  }
});
$("closeChartModal").onclick=()=>$("chartModal").classList.remove("open");
$("chartModal").onclick=e=>{ if(e.target.id==="chartModal") $("chartModal").classList.remove("open"); };

function renderCharts(c){
  const ms=(c.measurements||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  drawLine("weightChart",ms.map(m=>m.date),[{name:"Peso kg",values:ms.map(m=>Number(m.weight))}],"kg");
  drawLine("measureChart",ms.map(m=>m.date),[
    {name:"Torace",values:ms.map(m=>Number(m.chest))},
    {name:"Vita",values:ms.map(m=>Number(m.waist))},
    {name:"Braccia",values:ms.map(m=>Number(m.arm))},
    {name:"Gamba",values:ms.map(m=>Number(m.leg))}
  ],"cm");
  const sessions=(c.sessions||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const exerciseMap={};
  sessions.forEach(s=>parseRows(s.exercises).forEach(r=>{
    const load=parseFloat(String(r.load).replace(",","."));
    if(!isNaN(load)){exerciseMap[r.name]??=[]; exerciseMap[r.name].push(load)}
  }));
  const selected=Object.keys(exerciseMap).slice(0,3).map(name=>({name,values:exerciseMap[name]}));
  drawLine("strengthChart",sessions.map(s=>s.date),selected,"kg");
}
function renderArchives(){
  $("allSessions").innerHTML=data.clients.flatMap(c=>(c.sessions||[]).map(s=>`<div class="card"><span class="badge">${esc(c.name)} · ${esc(s.date)}</span><h3>${esc(s.name)}</h3>${workoutTable(s.exercises)}${coachClientEditsTable(s)}</div>`)).join("");
  $("allMeasures").innerHTML=data.clients.flatMap(c=>(c.measurements||[]).map(m=>`<div class="card"><span class="badge">${esc(c.name)} · ${esc(m.date)}</span><p>Peso ${esc(m.weight)}kg · Torace ${esc(m.chest)}cm · Vita ${esc(m.waist)}cm · Braccia ${esc(m.arm)}cm · Gamba ${esc(m.leg)}cm</p></div>`)).join("");
}

$("clientForm").onsubmit=e=>{e.preventDefault();const name=$("clientName").value.trim();const c={id:uid(),name,goal:$("clientGoal").value.trim(),code:name.toUpperCase().slice(0,5)+"-"+Math.floor(100+Math.random()*900),notes:"",measurements:[],sessions:[]};data.clients.push(c);activeId=c.id;save();e.target.reset();renderAll()};
$("sessionForm").onsubmit=e=>{e.preventDefault();const c=activeClient();c.sessions.push({date:$("sessionDate").value,name:$("sessionName").value,adherence:$("sessionAdherence").value,exercises:$("sessionExercises").value});save();e.target.reset();$("sessionDate").valueAsDate=new Date();renderAll()};
function addMeasure(clientId,prefix){const c=data.clients.find(x=>x.id===clientId);c.measurements.push({date:$(prefix+"Date").value,weight:$(prefix+"Weight").value,height:$(prefix+"Height").value,chest:$(prefix+"Chest").value,waist:$(prefix+"Waist").value,arm:$(prefix+"Arm").value,leg:$(prefix+"Leg").value,notes:$(prefix+"Notes").value});save()}
$("measureForm").onsubmit=e=>{e.preventDefault();addMeasure(activeId,"measure");e.target.reset();$("measureDate").valueAsDate=new Date();renderAll()};
$("saveNotesBtn").onclick=()=>{const c=activeClient();c.notes=$("coachNotes").value;save();renderAll()};
$("deleteClientBtn").onclick=()=>{const c=activeClient();if(c&&confirm("Eliminare "+c.name+"?")){data.clients=data.clients.filter(x=>x.id!==c.id);activeId=data.clients[0]?.id;save();renderAll()}};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="garrim_pt_mvp_dati.json";a.click();URL.revokeObjectURL(url)};

function renderClient(id){
  const c=data.clients.find(x=>x.id===id);if(!c)return logout();
  $("clientTopName").textContent=c.name;$("clientGoalText").textContent=c.goal;
  $("clientSessionCounter").innerHTML=sessionCounterHTML(c);
  $("clientNextAppointment").innerHTML=nextAppointmentHTML(c,false);
  $("clientCurrentAppointmentForProposal").textContent=formatAppointment(c.nextAppointment);
  $("clientNextSession").textContent=(c.sessions||[]).at(-1)?.name||"Seduta";
  $("clientSessionCount").textContent=(c.sessions||[]).length;$("clientMeasureCount").textContent=(c.measurements||[]).length;
  const ms=(c.measurements||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  $("clientLastWeight").textContent=ms.length?ms.at(-1).weight+"kg":"--";
  $("clientDelta").textContent=ms.length>1?(Number(ms.at(-1).weight)-Number(ms[0].weight)).toFixed(1)+"kg":"--";
  $("clientSessions").innerHTML=(c.sessions||[]).slice().reverse().map((s,revIndex)=>{
    const realIndex=(c.sessions||[]).length-1-revIndex;
    return `<div class="card"><span class="badge">${esc(s.date)} · ${esc(s.adherence)}%</span><h3>${esc(s.name)}</h3>
      <p class="muted">Spunta gli esercizi completati. Puoi modificare solo serie, reps e carico realmente eseguiti.</p>
      ${clientEditableWorkout(s, realIndex)}
      <button class="save-client-workout" onclick="saveClientWorkout(${realIndex})">Salva carichi e reps</button>
    </div>`;
  }).join("");
  renderClientCharts(c);
}
function targetSetsCount(r){
  const n=parseInt(String(r.sets||"").replace(/[^0-9]/g,""),10);
  return Number.isFinite(n) && n>0 ? n : 1;
}
function clientEditableWorkout(s, sessionIndex){
  const rows=parseRows(s.exercises);
  s.clientEdits ||= {};
  return rows.map((r,i)=>{
    const setCount=targetSetsCount(r);
    s.clientEdits[i] ||= {};
    s.clientEdits[i].sets ||= {};
    const defaultLoad=String(r.load||"").replace("kg","").trim();
    const defaultReps=String(r.reps||"").trim();
    const setRows=Array.from({length:setCount},(_,setIndex)=>{
      const setNo=setIndex+1;
      const edit=s.clientEdits[i].sets?.[setIndex] || {};
      const checked=(edit.done===true || edit.done==="true") ? "checked" : "";
      return `<div class="set-row">
        <div class="set-title">Serie ${setNo}</div>
        <div>
          <label>Reps</label>
          <input data-session="${sessionIndex}" data-exercise="${i}" data-set="${setIndex}" data-field="reps" value="${esc(edit.reps ?? defaultReps)}" inputmode="decimal">
        </div>
        <div>
          <label>Carico</label>
          <input data-session="${sessionIndex}" data-exercise="${i}" data-set="${setIndex}" data-field="load" value="${esc(edit.load ?? defaultLoad)}" inputmode="decimal">
        </div>
        <div>
          <label>Ok</label>
          <input class="done-check" type="checkbox" data-session="${sessionIndex}" data-exercise="${i}" data-set="${setIndex}" data-field="done" ${checked}>
        </div>
      </div>`;
    }).join("");
    return `<div class="exercise-series-block">
      <div class="exercise-name">${esc(r.name)}</div>
      <small class="muted">Target: ${esc(r.sets||"--")} serie · ${esc(r.reps||"--")} reps · ${esc(r.load||"--")} kg</small>
      ${setRows}
      <button type="button" class="rest-btn" onclick="startRestTimer(90)" style="margin-top:8px">Timer recupero 90s</button>
    </div>`;
  }).join("");
}
window.saveClientWorkout=function(sessionIndex){
  const c=data.clients.find(x=>x.id===session.clientId);
  const s=c.sessions[sessionIndex];
  s.clientEdits ||= {};
  document.querySelectorAll(`[data-session="${sessionIndex}"][data-exercise]`).forEach(input=>{
    const ex=input.dataset.exercise, set=input.dataset.set, field=input.dataset.field;
    s.clientEdits[ex] ||= {};
    s.clientEdits[ex].sets ||= {};
    s.clientEdits[ex].sets[set] ||= {};
    s.clientEdits[ex].sets[set][field]= input.type==="checkbox" ? input.checked : input.value;
  });
  save();
  renderClient(session.clientId);
  alert("Allenamento salvato: serie, reps e carichi aggiornati.");
}
let restInterval=null;
window.startRestTimer=function(seconds){
  clearInterval(restInterval);
  let remaining=seconds;
  const toast=$("timerToast");
  const tick=()=>{
    const m=Math.floor(remaining/60), s=String(remaining%60).padStart(2,"0");
    toast.textContent=`Recupero: ${m}:${s}`;
    toast.classList.add("show");
    if(remaining<=0){
      clearInterval(restInterval);
      toast.textContent="Recupero finito 💪";
      setTimeout(()=>toast.classList.remove("show"),1800);
    }
    remaining--;
  };
  tick();
  restInterval=setInterval(tick,1000);
}
function renderClientCharts(c){
  const ms=(c.measurements||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  drawLine("clientWeightChart",ms.map(m=>m.date),[{name:"Peso kg",values:ms.map(m=>Number(m.weight))}],"kg");
  drawLine("clientMeasureChart",ms.map(m=>m.date),[
    {name:"Torace",values:ms.map(m=>Number(m.chest))},
    {name:"Vita",values:ms.map(m=>Number(m.waist))},
    {name:"Braccia",values:ms.map(m=>Number(m.arm))},
    {name:"Gamba",values:ms.map(m=>Number(m.leg))}
  ],"cm");
  const sessions=(c.sessions||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const exerciseMap={};
  sessions.forEach(s=>parseRows(s.exercises).forEach(r=>{
    const load=parseFloat(String(r.load).replace(",","."));
    if(!isNaN(load)){exerciseMap[r.name]??=[]; exerciseMap[r.name].push(load)}
  }));
  const selected=Object.keys(exerciseMap).slice(0,3).map(name=>({name,values:exerciseMap[name]}));
  drawLine("clientStrengthChart",sessions.map(s=>s.date),selected,"kg");
}
$("clientMeasureForm").onsubmit=e=>{e.preventDefault();addMeasure(session.clientId,"clientMeasure");e.target.reset();$("clientMeasureDate").valueAsDate=new Date();renderClient(session.clientId);alert("Misurazione salvata")};
$("clientProposalForm").onsubmit=e=>{
  e.preventDefault();
  const c=data.clients.find(x=>x.id===session.clientId);
  c.appointmentProposal={value:$("clientProposalDate").value,note:$("clientProposalNote").value};
  save();
  e.target.reset();
  renderClient(session.clientId);
  alert("Proposta inviata al coach.");
};
$("sessionDate").valueAsDate=new Date();$("measureDate").valueAsDate=new Date();$("clientMeasureDate").valueAsDate=new Date();
