import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"

//
// 🌌 scene
//
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0,5,20)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

//
// 💥 particles
//
const MAX = 8000

const geo = new THREE.BufferGeometry()
const pos = new Float32Array(MAX*3)
const vel = new Float32Array(MAX*3)
const alive = new Array(MAX).fill(false)

geo.setAttribute("position", new THREE.BufferAttribute(pos,3))

const mat = new THREE.PointsMaterial({
  size:0.08,
  color:0xffffff
})

const points = new THREE.Points(geo, mat)
scene.add(points)

//
// 🧠 FULL FIREWORK TYPES（你要的完整）
//
const Shape = {

  sphere() {
    return randVec()
  },

  ring() {
    const a = Math.random()*Math.PI*2
    return new THREE.Vector3(Math.cos(a),0,Math.sin(a))
  },

  palm() {
    const a = Math.random()*Math.PI*2
    return new THREE.Vector3(Math.cos(a),Math.random(),Math.sin(a)).normalize()
  },

  chrysanthemum() {
    return randVec().multiplyScalar(rand(0.8,1.5))
  },

  willow() {
    return new THREE.Vector3(
      rand(-0.5,0.5),
      rand(0.5,1.5),
      rand(-0.5,0.5)
    ).normalize()
  },

  crackle() {
    return randVec().multiplyScalar(rand(1,2.5))
  },

  strobe() {
    return randVec().multiplyScalar(rand(0.5,3))
  },

  heart() {
    const t = Math.random()*Math.PI*2
    return new THREE.Vector3(
      16*Math.pow(Math.sin(t),3),
      0.5,
      13*Math.cos(t)-5*Math.cos(2*t)
    ).normalize()
  },

  peony() {
    return randVec().multiplyScalar(rand(0.5,2))
  },

  random() {
    return randVec()
  }
}

function randVec(){
  return new THREE.Vector3(
    Math.random()-0.5,
    Math.random()-0.5,
    Math.random()-0.5
  ).normalize()
}

function rand(a,b){
  return a + Math.random()*(b-a)
}

//
// 🎛 state
//
const gui = {
  shape:"sphere",
  count:400,
  speed:7,
  gravity:-3
}

document.getElementById("shape").onchange = e => gui.shape = e.target.value
document.getElementById("count").oninput = e => gui.count = +e.target.value
document.getElementById("speed").oninput = e => gui.speed = +e.target.value
document.getElementById("gravity").oninput = e => gui.gravity = +e.target.value

//
// 💥 FIRE (穩定版)
//
function fire() {

  const fn = Shape[gui.shape]

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

document.getElementById("fire").addEventListener("click", fire)

//
// ☰ toggle（穩定）
//
const panel = document.getElementById("panel")
document.getElementById("toggle").addEventListener("click",()=>{
  panel.classList.toggle("hidden")
})

//
// 🌪 update
//
function update(){

  for(let i=0;i<MAX;i++){

    if(!alive[i]) continue

    vel[i*3+1]+=gui.gravity*0.01

    pos[i*3]+=vel[i*3]
    pos[i*3+1]+=vel[i*3+1]
    pos[i*3+2]+=vel[i*3+2]

    if(pos[i*3+1]<-6) alive[i]=false
  }

  geo.attributes.position.needsUpdate=true
}

function animate(){
  requestAnimationFrame(animate)
  update()
  controls.update()
  renderer.render(scene,camera)
}
animate()

window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth,innerHeight)
})
