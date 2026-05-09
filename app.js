import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0,5,18)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

//
// particle
//
const MAX = 3000
const geo = new THREE.BufferGeometry()
const pos = new Float32Array(MAX*3)
const vel = new Float32Array(MAX*3)
const alive = Array(MAX).fill(false)

geo.setAttribute("position", new THREE.BufferAttribute(pos,3))

const mat = new THREE.PointsMaterial({ size:0.08, color:0xffffff })
const points = new THREE.Points(geo, mat)
scene.add(points)

//
// shape
//
const Shape = {
  sphere: () => randVec(),
  ring: () => {
    const a = Math.random()*Math.PI*2
    return new THREE.Vector3(Math.cos(a),0,Math.sin(a))
  },
  palm: () => randVec(),
  random: () => randVec()
}

function randVec(){
  return new THREE.Vector3(
    Math.random()-0.5,
    Math.random()-0.5,
    Math.random()-0.5
  ).normalize()
}

//
// state
//
const gui = {
  shape:"sphere",
  count:200,
  speed:5,
  gravity:-3
}

//
// UI
//
document.getElementById("shape").addEventListener("change",e=>{
  gui.shape=e.target.value
})

document.getElementById("count").addEventListener("input",e=>{
  gui.count=+e.target.value
})

document.getElementById("speed").addEventListener("input",e=>{
  gui.speed=+e.target.value
})

document.getElementById("gravity").addEventListener("input",e=>{
  gui.gravity=+e.target.value
})

//
// fire
//
function fire(){

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

document.getElementById("fireBtn")
.addEventListener("click",fire)

//
// toggle
//
const panel = document.getElementById("panel")
document.getElementById("toggle")
.addEventListener("click",()=>{
  panel.classList.toggle("hidden")
})

//
// update
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
