import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"

//
// 🌌 Scene
//
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0, 5, 20)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

//
// 💥 Particle System
//
const MAX = 6000

const geometry = new THREE.BufferGeometry()
const pos = new Float32Array(MAX * 3)
const vel = new Float32Array(MAX * 3)
const alive = new Array(MAX).fill(false)

geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3))

const material = new THREE.PointsMaterial({
  size: 0.08,
  color: 0xffffff
})

const points = new THREE.Points(geometry, material)
scene.add(points)

//
// 🧠 Shape System（完整煙火類型）
//
const Shape = {

  sphere() {
    return randVec()
  },

  ring() {
    const a = Math.random() * Math.PI * 2
    return new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
  },

  palm() {
    const a = Math.random() * Math.PI * 2
    return new THREE.Vector3(Math.cos(a), Math.random(), Math.sin(a)).normalize()
  },

  chrysanthemum() {
    return randVec().multiplyScalar(Math.random() * 1.5)
  },

  willow() {
    return new THREE.Vector3(
      rand(-0.5,0.5),
      Math.random() * 1.5,
      rand(-0.5,0.5)
    ).normalize()
  },

  crackle() {
    return randVec().multiplyScalar(Math.random() * 2)
  },

  strobe() {
    return randVec().multiplyScalar(0.5 + Math.random()*2)
  },

  heart() {
    let t = Math.random() * Math.PI * 2
    return new THREE.Vector3(
      16*Math.pow(Math.sin(t),3),
      0.5,
      13*Math.cos(t)-5*Math.cos(2*t)
    ).normalize()
  },

  peony() {
    return randVec()
  },

  random() {
    return randVec()
  }
}

function randVec() {
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
// 🔧 GUI state
//
const gui = {
  shape: "sphere",
  count: 300,
  speed: 6,
  gravity: -3
}

//
// 🎛 UI binding（全部修正：不使用 inline onclick）
//
document.getElementById("shape").onchange = e =>
  gui.shape = e.target.value

document.getElementById("count").oninput = e =>
  gui.count = +e.target.value

document.getElementById("speed").oninput = e =>
  gui.speed = +e.target.value

document.getElementById("gravity").oninput = e =>
  gui.gravity = +e.target.value

//
// 💥 FIRE FUNCTION（關鍵修正）
//
function explode() {

  const fn = Shape[gui.shape] || Shape.sphere

  for (let i = 0; i < gui.count; i++) {

    const id = alive.indexOf(false)
    if (id === -1) return

    pos[id*3] = 0
    pos[id*3+1] = 0
    pos[id*3+2] = 0

    const v = fn().multiplyScalar(gui.speed)

    vel[id*3] = v.x
    vel[id*3+1] = v.y
    vel[id*3+2] = v.z

    alive[id] = true
  }

  geometry.attributes.position.needsUpdate = true
}

//
// ✔ 正確事件綁定（修 bug 核心）
//
document.getElementById("fireBtn")
  .addEventListener("click", explode)

//
// 🌪 Particle update
//
function update() {

  for (let i = 0; i < MAX; i++) {

    if (!alive[i]) continue

    vel[i*3+1] += gui.gravity * 0.01

    pos[i*3] += vel[i*3]
    pos[i*3+1] += vel[i*3+1]
    pos[i*3+2] += vel[i*3+2]

    if (pos[i*3+1] < -6) alive[i] = false
  }

  geometry.attributes.position.needsUpdate = true
}

//
// 🔁 Loop
//
function animate() {
  requestAnimationFrame(animate)
  update()
  controls.update()
  renderer.render(scene, camera)
}
animate()

//
// 📐 resize
//
window.addEventListener("resize", () => {
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

//
// ☰ panel toggle（100%穩定版）
//
const panel = document.getElementById("panel")
document.getElementById("toggle").addEventListener("click", () => {
  panel.classList.toggle("collapsed")
})
