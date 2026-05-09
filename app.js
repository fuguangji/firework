import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"

//
// 🧱 renderer（關鍵：先固定 layer）
//
const renderer = new THREE.WebGLRenderer({ antialias:true })
renderer.setSize(innerWidth, innerHeight)
renderer.domElement.style.position = "fixed"
renderer.domElement.style.top = "0"
renderer.domElement.style.left = "0"
renderer.domElement.style.zIndex = "0"   // 🔥 關鍵
document.body.appendChild(renderer.domElement)

//
// 🌌 scene
//
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0,5,18)

const controls = new OrbitControls(camera, renderer.domElement)

//
// 💥 particles（加 safety）
//
const MAX = 3000

const geo = new THREE.BufferGeometry()
const pos = new Float32Array(MAX*3)
const vel = new Float32Array(MAX*3)
const alive = new Array(MAX).fill(false)

try {
  geo.setAttribute("position", new THREE.BufferAttribute(pos,3))
} catch(e){
  console.error("Geometry error", e)
}

const mat = new THREE.PointsMaterial({ size:0.08, color:0xffffff })
const points = new THREE.Points(geo, mat)
scene.add(points)

//
// 🧠 shape（最小穩定版）
//
const Shape = {
  sphere: () => new THREE.Vector3(
    Math.random()-0.5,
    Math.random()-0.5,
    Math.random()-0.5
  ).normalize(),

  ring: () => {
    const a = Math.random()*Math.PI*2
    return new THREE.Vector3(Math.cos(a),0,Math.sin(a))
  },

  palm: () => new THREE.Vector3(0,1,0)
}

//
// 🎛 state
//
const gui = {
  shape:"sphere",
  count:200,
  speed:6,
  gravity:-3
}

//
// 💥 FIRE（加防 crash）
//
function fire(){

  const fn = Shape[gui.shape] || Shape.sphere

  for(let i=0;i<gui.count;i++){

    const id = alive.indexOf(false)
    if(id===-1) return

    pos[id*3]=0
    pos[id*3+1]=0
    pos[id*3+2]=0

    const v = fn().multiplyScalar(gui.speed)

    vel[id*3]=v.x
    vel[id*3+1]=v.y
    vel[id*3+2]=v.z

    alive[id]=true
  }

  geo.attributes.position.needsUpdate=true
}

//
// UI binding（完全安全）
//
const panel = document.getElementById("panel")

document.getElementById("fireBtn").addEventListener("click",fire)

document.getElementById("toggle").addEventListener("click",()=>{
  panel.classList.toggle("hidden")
})

document.getElementById("shape").onchange = e => gui.shape = e.target.value
document.getElementById("count").oninput = e => gui.count = +e.target.value
document.getElementById("speed").oninput = e => gui.speed = +e.target.value
document.getElementById("gravity").oninput = e => gui.gravity = +e.target.value

//
// 🌪 update（防 NaN crash）
//
function update(){

  for(let i=0;i<MAX;i++){

    if(!alive[i]) continue

    vel[i*3+1]+=gui.gravity*0.01

    pos[i*3]+=vel[i*3]
    pos[i*3+1]+=vel[i*3+1]
    pos[i*3+2]+=vel[i*3+2]

    if(pos[i*3+1] < -10 || isNaN(pos[i*3+1])){
      alive[i]=false
    }
  }

  geo.attributes.position.needsUpdate=true
}

//
// 🔁 loop（防 crash）
//
function animate(){
  requestAnimationFrame(animate)

  try{
    update()
    controls.update()
    renderer.render(scene,camera)
  }catch(e){
    console.error("render crash:", e)
  }
}

animate()

//
// resize
//
window.addEventListener("resize",()=>{
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth,innerHeight)
})
