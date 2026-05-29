const colors = {
  cpu: { stroke:'#f5c842', bar:'linear-gradient(90deg,#f5c842,#ff9500)', border:'rgba(245,200,66,0.4)', bg:'rgba(245,200,66,0.06)' },
  gpu: { stroke:'#64dc78', bar:'linear-gradient(90deg,#64dc78,#00c853)', border:'rgba(100,220,120,0.4)', bg:'rgba(100,220,120,0.06)' },
  ram: { stroke:'#5bb8ff', bar:'linear-gradient(90deg,#5bb8ff,#2979ff)', border:'rgba(91,184,255,0.4)', bg:'rgba(91,184,255,0.06)' },
  fps: { stroke:'#c084fc', bar:'linear-gradient(90deg,#c084fc,#9333ea)', border:'rgba(192,132,252,0.4)', bg:'rgba(192,132,252,0.06)' }
}
const histories = { cpu:[], gpu:[], ram:[], fps:[] }
const MAX = 60
let active = 'cpu'
let ramTotal = 16

function push(key, val) {
  histories[key].push(val)
  if (histories[key].length > MAX) histories[key].shift()
}
function heat(val, max=100) {
  const p = val/max
  return p>0.85?'#ff5f5f':p>0.60?'#f5c842':'#64dc78'
}
window.selectMetric = function(key) {
  active = key
  const c = colors[key]
  ;['cpu','gpu','ram','fps'].forEach(k => {
    const el = document.getElementById('card-'+k)
    el.classList.remove('active')
    el.style.borderColor=''
    el.style.background=''
  })
  const card = document.getElementById('card-'+key)
  card.classList.add('active')
  card.style.borderColor = c.border
  card.style.background = c.bg
  const titles={cpu:'CPU HISTORY — 60s',gpu:'GPU HISTORY — 60s',ram:'RAM USAGE — 60s',fps:'FPS HISTORY — 60s'}
  const labels={cpu:'CPU Load',gpu:'GPU Load',ram:'Memory Used',fps:'Frame Rate'}
  document.getElementById('g-title').textContent = titles[key]
  document.getElementById('bar-lbl').textContent = labels[key]
  document.getElementById('main-bar').style.background = c.bar
  document.getElementById('g-current').style.color = c.stroke
  document.getElementById('bar-pct').style.color = c.stroke
  drawGraph()
}
function drawGraph() {
  const c = colors[active]
  const data = histories[active]
  if(!data.length) return
  const cur = data[data.length-1]
  const maxVal = active==='ram'?ramTotal:active==='fps'?120:100
  const pct = Math.min(cur/maxVal,1)
  const label = active==='ram'?cur.toFixed(1)+' GB':active==='fps'?Math.round(cur)+' fps':Math.round(cur)+'%'
  document.getElementById('g-current').textContent = label
  document.getElementById('bar-pct').textContent = label
  document.getElementById('main-bar').style.width = (pct*100)+'%'
  const canvas = document.getElementById('sparkCanvas')
  const ctx = canvas.getContext('2d')
  const W=canvas.width,H=canvas.height
  ctx.clearRect(0,0,W,H)
  if(data.length<2) return
  const pts = data.map((v,i)=>({x:i*(W/(MAX-1)),y:H-(Math.min(v,maxVal)/maxVal)*(H-4)-2}))
  ctx.beginPath()
  ctx.moveTo(0,H)
  pts.forEach(p=>ctx.lineTo(p.x,p.y))
  ctx.lineTo(W,H)
  ctx.closePath()
  const grad=ctx.createLinearGradient(0,0,0,H)
  grad.addColorStop(0,c.stroke+'33')
  grad.addColorStop(1,c.stroke+'00')
  ctx.fillStyle=grad
  ctx.fill()
  ctx.beginPath()
  pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y))
  ctx.strokeStyle=c.stroke
  ctx.lineWidth=1.5
  ctx.lineJoin='round'
  ctx.stroke()
}

async function poll() {
  try {
    const invoke = window.__TAURI__.core.invoke
    const data = await invoke('get_metrics')
    ramTotal = data.ram_total
    push('cpu', data.cpu)
    push('gpu', data.gpu)
    push('ram', data.ram_used)
    push('fps', 60)
    const cpuEl = document.getElementById('v-cpu')
    cpuEl.textContent = Math.round(data.cpu)
    cpuEl.style.color = heat(data.cpu)
    document.getElementById('v-gpu').textContent = Math.round(data.gpu)
    document.getElementById('v-ram').textContent = data.ram_used.toFixed(1)
    document.getElementById('v-ram').style.color = '#5bb8ff'
    document.getElementById('v-fps').textContent = '60'
    document.getElementById('v-fps').style.color = '#c084fc'
    const tCpu = Math.round(data.cpu_temp)
    const tCpuEl = document.getElementById('t-cpu')
    tCpuEl.textContent = tCpu>0?tCpu+'°C':'N/A'
    tCpuEl.style.color = heat(tCpu,100)
    document.getElementById('t-gpu').textContent = 'N/A'
    const osMap={macos:'macOS',windows:'Windows',linux:'Linux'}
    document.getElementById('t-os').textContent = osMap[data.platform]||data.platform
    const appColors=['#f5c842','#5bb8ff','#64dc78','#c084fc']
    const maxCpu = data.top_apps[0]?.cpu||1
    document.getElementById('apps-list').innerHTML = data.top_apps.map((app,i)=>`
      <div class="app-row">
        <div class="app-dot" style="background:${appColors[i]}"></div>
        <span class="app-name">${app.name}</span>
        <div class="app-mini-bar"><div class="app-mini-fill" style="width:${(app.cpu/maxCpu*100).toFixed(0)}%;background:${appColors[i]}"></div></div>
        <span class="app-pct">${app.cpu.toFixed(1)}%</span>
      </div>`).join('')
    drawGraph()
  } catch(e) {
    console.error('poll error:', e)
  }
}

// Close button — Tauri 2 correct API
document.getElementById('close-btn').addEventListener('click', async () => {
  await window.__TAURI__.core.invoke('close_app')
})

document.getElementById("minimize-btn").addEventListener("click", async () => {
  await window.__TAURI__.core.invoke("hide_window")
})

window.selectMetric("cpu")
setTimeout(()=>{ poll(); setInterval(poll, 2000) }, 500)
