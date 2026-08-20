import { $, uid, esc, parseRows } from "./utils.js";
import { saveData } from "./storage.js";
import { setupAuth } from "./auth.js";
import { createSeedData } from "./seed.js";
import { renderCharts, renderClientCharts, setupChartInteractions } from "./charts.js";
const KEY="dragon_forge_demo_v2_adriano";
let data=JSON.parse(localStorage.getItem(KEY))||null;
let activeId=null, session=null;
const save=()=>saveData(KEY,data);
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

function resetDemo(){
  data=createSeedData();
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

function hideAll(){
  $("loginPage").classList.add("hidden");
  $("coachApp").classList.add("hidden");
  $("clientApp").classList.add("hidden");
}

function logout(){
  hideAll();
  $("loginPage").classList.remove("hidden");
}

function showCoach(){
  hideAll();
  $("coachApp").classList.remove("hidden");
  renderAll();
}

function showClient(id){
  hideAll();
  $("clientApp").classList.remove("hidden");
  renderClient(id);
}

setupAuth({
  getClients: () => data.clients,

  onCoachLogin: () => {
    session = {
      role: "coach"
    };

    showCoach();
  },

  onClientLogin: client => {
    session = {
      role: "client",
      clientId: client.id
    };

    showClient(client.id);
  },

  onLogout: logout
});
setupChartInteractions();
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
document.addEventListener("click", e=>{
  const btn=e.target.closest && e.target.closest("[data-client-section]");
  if(btn){
    const target=$(btn.dataset.clientSection);
    if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
  }
});
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
