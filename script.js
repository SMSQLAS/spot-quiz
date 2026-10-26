"use strict";
// All answer regions are percentages of the original dispensing-record image.
// No transparent clickable controls are placed over correct answers: the cursor stays unchanged.
const questions = [
  {
    prescription: "question1_rx.png", record: "question1_record.png",
    spots: [
      { id: "date", label: "処方日（10.23）", regions: [{x:0.758,y:0.035,w:0.088,h:0.026}], mark:{x:0.803,y:0.048},
        explanation: "調剤録の処方日は『08.10.23』ですが、処方箋の交付日は『08.10.22』。<strong>処方日を08.10.22に修正</strong>します。調剤日08.10.23は今回の誤りではありません。" },
      { id: "drug", label: "グリコラン錠250mg", regions: [{x:0.110,y:0.435,w:0.220,h:0.027}], mark:{x:0.215,y:0.450},
        explanation: "処方箋は『メトホルミン塩酸塩錠250mg：MT』。調剤録の『グリコラン錠250mg』（GL）をそのまま使わず、<strong>MTに対応するメトグルコの後発品</strong>を選びます。GLとMTは用法・用量等の承認内容が異なるため、単純に同じ薬として扱いません。" }
    ]
  },
  {
    prescription: "question2_rx.png", record: "question2_record.png",
    spots: [
      { id: "directions", label: "用法（分1 朝食後）", regions: [{x:0.110,y:0.401,w:0.151,h:0.029}], mark:{x:0.185,y:0.415},
        explanation: "処方箋は<strong>1日2回・朝夕食後</strong>。調剤録の『分1 朝食後』は誤りなので、<strong>『分2 朝夕食後』</strong>に修正します。" },
      { id: "fee", label: "薬Aロ45", regions: [{x:0.718,y:0.661,w:0.131,h:0.036}], mark:{x:0.786,y:0.680},
        explanation: "この設問は<strong>新患さん</strong>の想定です。調剤録の『薬Aロ45』ではなく、<strong>『薬Bロ59』</strong>を選びます。今回の新患という条件を確認することがポイントです。" }
    ]
  }
];

const el = id => document.getElementById(id);
const startScreen = el("startScreen"), quizScreen = el("quizScreen"), resultScreen = el("resultScreen");
const recordCanvas = el("recordCanvas"), circleLayer = el("circleLayer");
const zoomLevels = [1,1.4,1.9,2.5,3.2];
let current=0, found=new Set(), mistakes=0, totalMistakes=0, zoom={rx:0,record:0}, completed=false;

function screen(which) {
  startScreen.hidden = which!=="start";
  quizScreen.hidden = which!=="quiz";
  resultScreen.hidden = which!=="result";
  window.scrollTo({top:0,behavior:"instant"});
}
function resetZoom(which) {
  zoom[which] = 0;
  applyZoom(which);
}
function applyZoom(which) {
  const pct = Math.round(zoomLevels[zoom[which]]*100);
  el(which+"Canvas").style.width = pct+"%";
  el(which+"ZoomLabel").textContent=pct+"%";
}
function showQuestion() {
  found=new Set();mistakes=0;completed=false;
  const q=questions[current];
  el("rxImage").src=q.prescription;
  el("recordImage").src=q.record;
  el("rxImage").alt="問題"+(current+1)+"の処方箋";
  el("recordImage").alt="問題"+(current+1)+"の調剤録";
  resetZoom("rx");resetZoom("record");
  el("rxViewport").scrollTo(0,0);el("recordViewport").scrollTo(0,0);
  circleLayer.replaceChildren();
  el("explanationCard").hidden=true;
  el("progressLabel").textContent=`問題 ${current+1} / ${questions.length}`;
  el("progressFill").style.width=((current+1)/questions.length*100)+"%";
  el("questionHeading").textContent=`問題${current+1}　間違いは${q.spots.length}か所`;
  setStatus("調剤録の画像をタップして、間違いを探してね！");
  updateCount();
  screen("quiz");
}
function updateCount(){el("scoreLabel").textContent=`発見 ${found.size} / ${questions[current].spots.length}`;}
function setStatus(text,bad=false){const box=el("tapFeedback");box.textContent=text;box.style.color=bad?"#bc2745":"#4f2d91";}
function addCircle(pos){
  const mark=document.createElement("div");mark.className="spot-circle";
  mark.style.left=(pos.x*100)+"%";mark.style.top=(pos.y*100)+"%";
  circleLayer.appendChild(mark);
}
function revealAnswers(){
  completed=true;
  const list=el("explanationList");list.replaceChildren();
  for(const spot of questions[current].spots){
    const li=document.createElement("li");
    const heading=document.createElement("strong");heading.textContent=spot.label;
    li.appendChild(heading);
    const content=document.createElement("div");content.innerHTML=spot.explanation;
    li.appendChild(content);list.appendChild(li);
  }
  el("nextButton").textContent=current===questions.length-1?"結果を見る":"次の問題へ";
  el("explanationCard").hidden=false;
  setStatus("全2か所、正解！ 下に解説を表示しました✨");
  el("explanationCard").scrollIntoView({behavior:"smooth",block:"start"});
}
function processClick(ev){
  if(completed)return;
  const r=recordCanvas.getBoundingClientRect();
  const x=(ev.clientX-r.left)/r.width, y=(ev.clientY-r.top)/r.height;
  if(x<0||x>1||y<0||y>1)return;
  const hit=questions[current].spots.find(s=>s.regions.some(a=>x>=a.x&&x<=a.x+a.w&&y>=a.y&&y<=a.y+a.h));
  if(!hit){mistakes++;totalMistakes++;setStatus("そこは間違いではありません。ほかを探してみてね！",true);return;}
  if(found.has(hit.id)){setStatus("そこはもう発見済み！ 別の場所を探してみてね😊");return;}
  found.add(hit.id);addCircle(hit.mark);updateCount();
  if(found.size===questions[current].spots.length){revealAnswers();}
  else setStatus(`正解！ ${found.size}か所発見。あと${questions[current].spots.length-found.size}か所！`);
}
function startQuiz(){current=0;totalMistakes=0;showQuestion();}
recordCanvas.addEventListener("click",processClick);
el("startButton").addEventListener("click",startQuiz);
el("retryButton").addEventListener("click",startQuiz);
el("nextButton").addEventListener("click",()=>{
  if(!completed)return;
  if(current<questions.length-1){current++;showQuestion();return;}
  el("resultCount").textContent="4 / 4";
  el("mistapResult").textContent=`正解箇所以外のタップ：${totalMistakes}回`;
  screen("result");
});
document.querySelectorAll(".zoom-controls button").forEach(button=>{
 button.addEventListener("click",()=>{
  const which=button.dataset.sheet;
  zoom[which]=Math.max(0,Math.min(zoomLevels.length-1,zoom[which]+Number(button.dataset.dir)));
  applyZoom(which);
 });
});
screen("start");
