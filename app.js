const form=document.querySelector('#chatForm');
const input=document.querySelector('#userInput');
const messages=document.querySelector('#messages');
const sendButton=form.querySelector('button');
const chatStatus=document.querySelector('#chatStatus');
const localModelBtn=document.querySelector('#localModelBtn');
const modelStatus=document.querySelector('#modelStatus');
let busy=false;
let localEngine=null;
function addMessage(text,role){const el=document.createElement('div');el.className='msg '+role;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el}
function demoReply(text){
 const q=text.toLowerCase();
 if(/hello|hi\b|hey/.test(q)) return 'Greetings, explorer! Omnia Symphonia is online in demonstration mode. What shall we create?';
 if(/what can you do|capabilit|help/.test(q)) return 'I can help plan projects, explain concepts, draft content, and assist with code. Load the optional on-device language model for genuine model-generated responses, if your browser/device supports WebGPU.';
 if(/code|python|javascript|program/.test(q)) return 'Software mission acknowledged. Describe the language, goal, and constraints. For genuine coding assistance, load the on-device model or configure the server-side AI provider.';
 if(/security|cyber|threat/.test(q)) return 'Security module status: showcase only. No live threat detection is running. A production system requires validated telemetry, detection logic, monitoring, and reviewed response procedures.';
 if(/predict|data|analysis/.test(q)) return 'Analytics module status: awaiting a dataset and a configured analysis pipeline. No prediction or accuracy claim is being made by this demo.';
 return 'Signal received: "'+text+'". This is a local demo response, not a live model answer. Try loading the on-device AI model or configure the optional server backend.';
}

/* Harmony — guided assistant for using the dashboard. Client-side only:
   a step-by-step tour plus plain answers to how-to questions. */
const harmonySteps=[
 {sel:'#sec-entrance',title:'Cosmic Entrance',text:'This is the front door — what Omnia Symphonia is, at a glance: one place where many kinds of intelligence work together.'},
 {sel:'#sec-network',title:'Neural Network Harmony',text:'The network view. Each node is a different kind of intelligence — language, vision, data — wired together so they can share what they know.'},
 {sel:'#sec-stack',title:'Technology Stack',text:"What's under the hood: Python and FastAPI on the server, plain HTML, CSS and JavaScript in your browser, and an OpenAI-compatible API for live model replies."},
 {sel:'#sec-aurora',title:'Digital Aurora',text:"The live status strip. Runtime tells you whether you're in the browser demo or connected to the Python backend, and API connection shows whether a model is configured."},
 {sel:'#sec-ecosystem',title:'Integrated AI Ecosystem',text:'The six intelligences at a glance: language, vision, data, security, creative, and automation. Each one is a lane you can build on.'},
 {sel:'#sec-infrastructure',title:'Global Infrastructure',text:'Where it runs: a distributed-ready design across five continents, with monitoring and room to scale.'},
 {sel:'#sec-capability',title:'Capability Status',text:"The honest scoreboard: what's ready to connect, what needs data or a model, and what's still just a prototype."},
 {sel:'#sec-chat',title:'AI Demonstration',text:'The part you can touch. Type a question for a demo answer, load the on-device model for real replies in your browser, or connect the backend for a server model.'}
];
const tourOverlay=document.querySelector('#tourOverlay');
const tourText=document.querySelector('#tourText');
const tourStepLabel=document.querySelector('#tourStepLabel');
const tourBackBtn=document.querySelector('#tourBack');
const tourNextBtn=document.querySelector('#tourNext');
let tourIndex=-1;
function showTourStep(i){
 document.querySelectorAll('.tour-highlight').forEach(el=>el.classList.remove('tour-highlight'));
 const step=harmonySteps[i];
 const target=document.querySelector(step.sel);
 if(target){target.classList.add('tour-highlight');target.scrollIntoView({behavior:'smooth',block:'center'});}
 tourText.textContent=step.text;
 tourStepLabel.textContent='Step '+(i+1)+' of '+harmonySteps.length+' — '+step.title;
 tourBackBtn.disabled=i===0;
 tourNextBtn.textContent=i===harmonySteps.length-1?'Finish':'Next';
}
function startTour(){tourIndex=0;tourOverlay.hidden=false;showTourStep(0);}
function endTour(){tourIndex=-1;tourOverlay.hidden=true;document.querySelectorAll('.tour-highlight').forEach(el=>el.classList.remove('tour-highlight'));}
document.querySelector('#tourBtn').addEventListener('click',()=>{addMessage("Let's walk through it together — I'll highlight each section and explain it as we go.",'bot');startTour();});
tourNextBtn.addEventListener('click',()=>{if(tourIndex>=harmonySteps.length-1){endTour();addMessage('That\'s the whole dashboard. Ask me anything about a section, or try the demo chat whenever you\'re ready.','bot');}else{tourIndex++;showTourStep(tourIndex);}});
tourBackBtn.addEventListener('click',()=>{if(tourIndex>0){tourIndex--;showTourStep(tourIndex);}});
document.querySelector('#tourClose').addEventListener('click',endTour);
function harmonyGuide(text){
 const q=text.toLowerCase();
 if(/tour|walk ?through|show me around|\bguide\b/.test(q)) return '__TOUR__';
 if(/what can (i|you) do|what does this (dashboard|site|page) do|how (do i|can i) use/.test(q)) return 'Here is the short version: read the panels left to right for the story, check Digital Aurora for live status, and use the chat below to try the AI demo. For the full walkthrough, tap "Take the tour" and I will guide you section by section.';
 if(/how (does|do).*(demo|chat)|use the (chat|demo)|talk to (you|omnia)/.test(q)) return 'Type a question in the chat box and send it. In demo mode you get a local sample answer. For real replies, tap "Load on-device AI model" to run a small model in your browser, or connect the Python backend as the README describes.';
 if(/what is (this|omnia|omnia symphonia)/.test(q)) return 'Omnia Symphonia is a prototype AI command center: one dashboard that brings language, vision, data, security, creative and automation intelligence together. This live page is the static demo — the Python backend is a separate step.';
 return null;
}
document.querySelectorAll('.harmony-chips button').forEach(btn=>{
 btn.addEventListener('click',()=>{
   const kind=btn.getAttribute('data-harmony');
   if(kind==='tour'){addMessage("Let's walk through it together — I'll highlight each section and explain it as we go.",'bot');startTour();return;}
   const q=kind==='what'?'What can I do here?':'How does the AI demo work?';
   addMessage(q,'user');
   addMessage(harmonyGuide(q),'bot');
 });
});
async function loadLocalModel(){
 if(busy||localEngine)return;
 if(!('gpu' in navigator)){modelStatus.textContent='WebGPU unavailable in this browser. Try a recent Chrome version/device.';return}
 busy=true;localModelBtn.disabled=true;modelStatus.textContent='Loading model runtime… first load requires internet.';
 const statusMsg=addMessage('Preparing on-device AI. The model download may be large and can take time. Keep this page open on Wi-Fi if possible.','bot');
 try{
   // WebLLM downloads model weights into browser-managed storage. This is an open-weight model,
   // not a model trained from scratch by this project.
   const {CreateMLCEngine}=await import('https://esm.run/@mlc-ai/web-llm');
   const model='Llama-3.2-1B-Instruct-q4f16_1-MLC';
   localEngine=await CreateMLCEngine(model,{initProgressCallback:(p)=>{modelStatus.textContent=p.text||'Loading model…';}});
   statusMsg.textContent='On-device model loaded. Responses are generated on this device when supported.';
   modelStatus.textContent='Ready: '+model;
   chatStatus.textContent='On-device model • local inference';
 }catch(err){
   localEngine=null;
   const reason=(err&&err.message)?err.message:'Unknown initialization error';
   statusMsg.textContent='Could not load the on-device model: '+reason+'. You can still use demo mode or the server AI option.';
   modelStatus.textContent='Model unavailable — see message';
 }finally{busy=false;localModelBtn.disabled=false}
}
localModelBtn.addEventListener('click',loadLocalModel);
form.addEventListener('submit',async e=>{
 e.preventDefault();const text=input.value.trim();if(!text||busy)return;
 addMessage(text,'user');input.value='';
 const guide=harmonyGuide(text);
 if(guide){
   if(guide==='__TOUR__'){addMessage("Let's walk through it together — I'll highlight each section and explain it as we go.",'bot');startTour();}
   else addMessage(guide,'bot');
   input.focus();return;
 }
 busy=true;sendButton.disabled=true;
 const pending=addMessage('Processing signal…','bot');
 try{
   if(localEngine){
     const result=await localEngine.chat.completions.create({messages:[
       {role:'system',content:'You are Omnia Symphonia, a helpful, honest assistant. Be concise and do not claim access or capabilities you do not have.'},
       {role:'user',content:text}
     ],temperature:0.7,max_tokens:512});
     pending.textContent=result.choices?.[0]?.message?.content||'The local model returned an empty response.';
     chatStatus.textContent='On-device model • local inference';
   } else {
     const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
     if(response.ok){const data=await response.json();pending.textContent=data.reply||'The model returned an empty response.';chatStatus.textContent='Connected • server model response';}
     else {pending.textContent=demoReply(text);}
   }
 }catch(err){pending.textContent='AI request failed: '+((err&&err.message)||'unknown error')+'. Try again, or use demo mode.';}
 finally{busy=false;sendButton.disabled=false;messages.scrollTop=messages.scrollHeight;input.focus();}
});
fetch('/api/health').then(r=>r.ok?r.json():null).then(data=>{if(data&&data.model_configured){document.querySelector('#runtime').textContent='Python backend';document.querySelector('#apiState').textContent='Connected';chatStatus.textContent='Backend ready • server model configured';}}).catch(()=>{});
