import * as PIXI from "pixi.js";
import { Joystick } from "../src/";

declare var require: any; //

const app = new PIXI.Application({
  view: document.getElementById('canvas') as HTMLCanvasElement,
  backgroundColor: 0xffffff,
});

;
const resize = () => app.renderer.resize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', resize);
resize();


const joystick = new Joystick({
  outer: require("./images/joystick.png"), // require = get parcel's url
  inner: require("./images/joystick-handle.png"), // require = get parcel's url

  outerScale: { x: 0.3, y: 0.3 },
  innerScale: { x: 0.5, y: 0.5 },
  // outerScale: { x: 1, y: 1 },
  // innerScale: { x: 1, y: 1 },

  onChange: (data) => console.log('change', data),
  onStart: () => console.log('start'),
  onEnd: () => console.log('end'),
});
joystick.position.set(50, 50);
app.stage.addChild(joystick);

app.start();

