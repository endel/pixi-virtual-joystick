declare var require: any; // parcel/typescript workaround.

import * as PIXI from "pixi.js";
import { Joystick } from "../src/";

const app = new PIXI.Application({
  view: document.getElementById('canvas') as HTMLCanvasElement,
  backgroundColor: 0x45ffb5,
  autoDensity: true,
  resolution: window.devicePixelRatio,
});

const leftText = new PIXI.Text("[left data]");
const rightText = new PIXI.Text("[right data]");
const leftJoystick = new Joystick({
  outer: require("./images/joystick.png"), // require = get parcel's url
  inner: require("./images/joystick-handle.png"), // require = get parcel's url
  outerScale: { x: 0.5, y: 0.5 },
  innerScale: { x: 0.8, y: 0.8 },
  onChange: (data) => {
    leftText.text = JSON.stringify(data);
  },
  onStart: () => console.log('start'),
  onEnd: () => console.log('end'),
});
app.stage.addChild(leftJoystick);

const rightJoystick = new Joystick({
  outer: require("./images/joystick.png"), // require = get parcel's url
  inner: require("./images/joystick-handle.png"), // require = get parcel's url
  outerScale: { x: 0.5, y: 0.5 },
  innerScale: { x: 0.8, y: 0.8 },
  onChange: (data) => {
    rightText.text = JSON.stringify(data);
  },
  onStart: () => console.log('start'),
  onEnd: () => console.log('end'),
});
app.stage.addChild(rightJoystick);

leftText.position.set(0, 0);
rightText.position.set(0, 50);
app.stage.addChild(leftText);
app.stage.addChild(rightText);

const resize = () => {
  leftJoystick.position.set(80, window.innerHeight - 430);
  rightJoystick.position.set(window.innerWidth - 730, window.innerHeight - 430);
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.resize();
}
resize();
window.addEventListener('resize', resize);

app.start();