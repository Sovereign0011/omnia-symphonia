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
 addMessage(text,'user');input.value='';busy=true;sendButton.disabled=true;
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
