import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// Three designed, interwoven optical ribbons. No HTML is sampled by the canvas.
const host = document.querySelector('.optical-art');
const canvas = document.querySelector('#glass-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  if (new URLSearchParams(location.search).has('no3d')) throw new Error('Static preview');
  renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power', preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 600 ? 1 : 1.5));
  renderer.setClearColor(0xffffff, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0,0,9.3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, .04);
  scene.environment = env.texture;
  room.dispose(); pmrem.dispose();
  const group = new THREE.Group();
  scene.add(group);
  const material = new THREE.MeshPhysicalMaterial({
    color:0xffffff, metalness:0, roughness:.075, transmission:1,
    thickness:1.3, ior:1.48, attenuationColor:0x0097ea, attenuationDistance:2.3,
    clearcoat:1, clearcoatRoughness:.06, envMapIntensity:1.2,
    side:THREE.DoubleSide
  });
  // A controlled bevelled ribbon cross-section swept along each designed path.
  function ribbonGeometry(path, segments=120) {
    const frames=path.computeFrenetFrames(segments,true);
    const sides=16, positions=[], normals=[], indices=[];
    for(let i=0;i<=segments;i++) {
      const p=path.getPointAt(i/segments);
      const taper=1+.13*Math.cos(i/segments*Math.PI*2);
      for(let j=0;j<=sides;j++) {
        const a=j/sides*Math.PI*2;
        const u=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.6)*.29*taper;
        const v=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.6)*.19;
        const q=p.clone().addScaledVector(frames.normals[i],u).addScaledVector(frames.binormals[i],v);
        positions.push(q.x,q.y,q.z);
      }
    }
    for(let i=0;i<segments;i++) for(let j=0;j<sides;j++) {
      const a=i*(sides+1)+j,b=a+sides+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices); geo.computeVertexNormals(); return geo;
  }
  const control=[[-.82,-1.13,.1],[.56,-1.16,-.12],[1.1,-.67,-.24],[.95,.32,.12],[.48,1.14,.38],[-.18,1.34,.15],[-.92,.74,-.25],[-1.22,-.12,-.32]];
  for(let i=0;i<3;i++) {
    const curve=new THREE.CatmullRomCurve3(control.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.25);
    const mesh=new THREE.Mesh(ribbonGeometry(curve),material);
    mesh.rotation.set(i===1?1.12:-.15,i===2?1.18:0,i*Math.PI*2/3);
    mesh.position.set(Math.cos(i*Math.PI*2/3)*.57,Math.sin(i*Math.PI*2/3)*.57,(i-1)*.2);
    group.add(mesh);
  }
  group.rotation.set(.35,-.3,-.18);
  const blue=new THREE.Mesh(new THREE.SphereGeometry(.47,32,24),new THREE.MeshStandardMaterial({color:0x0097ea,roughness:.3,metalness:.15}));
  blue.position.set(.55,.45,-.55);group.add(blue);
  const red=new THREE.Mesh(new THREE.SphereGeometry(.25,24,16),new THREE.MeshStandardMaterial({color:0xd92c04,roughness:.28}));
  red.position.set(-1,-.7,-.7);group.add(red);
  scene.add(new THREE.AmbientLight(0xffffff,2));
  const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(3,5,6);scene.add(light);
  let visible=true, frame=0, targetX=0,targetY=0, slowFrames=0, settled=false, previousTime=0, lastRender=0;
  const resize=()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderOnce();};
  const renderOnce=()=>renderer.render(scene,camera);
  const stop=()=>{cancelAnimationFrame(frame);frame=0;};
  const tick=time=>{
    if(time-lastRender<32){frame=requestAnimationFrame(tick);return;}
    const delay=previousTime ? time-previousTime : 0;
    previousTime=time;lastRender=time;
    const start=performance.now();
    group.rotation.x+=(.35+targetY*.035-group.rotation.x)*.035;
    group.rotation.y+=(-.3+targetX*.06-group.rotation.y)*.035;
    group.rotation.z=-.18+Math.sin(time*.00022)*.035;
    group.position.y=Math.sin(time*.00035)*.025;
    renderOnce();
    if(performance.now()-start>75 || delay>120) slowFrames++; else slowFrames=Math.max(0,slowFrames-1);
    if(slowFrames>16){settled=true;stop();host.classList.remove('scene-ready');renderer.dispose();return;}
    if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else frame=0;
  };
  const resume=()=>{if(!frame&&!settled&&visible&&!document.hidden&&!reduced.matches){previousTime=0;frame=requestAnimationFrame(tick);}};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else stop();},{threshold:.05}).observe(host);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():resume());
  reduced.addEventListener('change',()=>{if(reduced.matches){stop();group.rotation.set(.35,-.3,-.18);group.position.y=0;renderOnce();}else resume();});
  document.querySelector('.hero').addEventListener('pointermove',e=>{const rect=host.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-rect.left)/rect.width*2-1));targetY=Math.max(-1,Math.min(1,(e.clientY-rect.top)/rect.height*2-1));});
  document.querySelector('.hero').addEventListener('pointerleave',()=>{targetX=targetY=0;});
  new ResizeObserver(resize).observe(host);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();host.classList.remove('scene-ready');});
  resize();host.classList.add('scene-ready');resume();
  window.opticalPreview={staticRender:()=>{stop();group.rotation.set(.35,-.3,-.18);group.position.y=0;renderOnce();return canvas.toDataURL('image/png');},isRunning:()=>!!frame};
} catch(error) {
  if(renderer) renderer.dispose();
  host.classList.remove('scene-ready');
  // The already loaded image remains visible. Content never depends on WebGL.
}
