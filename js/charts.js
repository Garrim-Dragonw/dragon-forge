import { $, parseRows } from "./utils.js";
/* =========================================
   CHART CORE
========================================= */
let chartStore = {};
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
/* =========================================
   CHART MODAL
========================================= */
function openChart(canvasId, title){
  const spec = chartStore[canvasId];
  if(!spec) return;
  $("chartModalTitle").textContent = title || "Grafico";
  $("chartModal").classList.add("open");
  const modalCanvas = $("modalChartCanvas");
  setTimeout(()=>drawLineOnCanvas(modalCanvas, spec.labels, spec.series, spec.unit), 30);
}
/* =========================================
   CHART INTERACTIONS
========================================= */

export function setupChartInteractions(){

  document.addEventListener("click", e=>{
    if(
      e.target &&
      e.target.classList &&
      e.target.classList.contains("chart-click")
    ){
      openChart(
        e.target.id,
        e.target.dataset.chartTitle
      );
    }
  });

  $("closeChartModal").onclick = () => {
    $("chartModal").classList.remove("open");
  };

  $("chartModal").onclick = e => {
    if(e.target.id === "chartModal"){
      $("chartModal").classList.remove("open");
    }
  };
}
/* =========================================
   CLIENT CHARTS
========================================= */
export function renderClientCharts(client){
  const ms=(client.measurements||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  drawLine(
    "clientWeightChart",
    ms.map(m=>m.date),
    [{name:"Peso kg",values:ms.map(m=>Number(m.weight))}],
    "kg"
  );
  drawLine(
    "clientMeasureChart",
    ms.map(m=>m.date),
    [
      {name:"Torace",values:ms.map(m=>Number(m.chest))},
      {name:"Vita",values:ms.map(m=>Number(m.waist))},
      {name:"Braccia",values:ms.map(m=>Number(m.arm))},
      {name:"Gamba",values:ms.map(m=>Number(m.leg))}
    ],
    "cm"
  );
  const sessions=(client.sessions||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const exerciseMap={};
  sessions.forEach(s=>parseRows(s.exercises).forEach(r=>{
    const load=parseFloat(String(r.load).replace(",","."));
    if(!isNaN(load)){
      exerciseMap[r.name]??=[];
      exerciseMap[r.name].push(load);
    }
  }));
  const selected=Object.keys(exerciseMap)
    .slice(0,3)
    .map(name=>({
      name,
      values:exerciseMap[name]
    }));
  drawLine(
    "clientStrengthChart",
    sessions.map(s=>s.date),
    selected,
    "kg"
  );
}
/* =========================================
   COACH CHARTS
========================================= */
export function renderCharts(c){
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