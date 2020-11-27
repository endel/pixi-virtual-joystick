# 🕹 pixi-virtual-joystick

Virtual Joystick for [pixi.js](https://github.com/pixijs/pixi.js).

## Usage

```typescript
import { Joystick } from "pixi-virtual-joystick";

const container = new PIXI.Container();
const joystick = new Joystick(container, {
  outer: require("./images/joystick.png"), // require = get parcel's url
  inner: require("./images/joystick-handle.png"), // require = get parcel's url

  rockerX: 100,
  rockerY: 100,

  outerScale: { x: 0.3, y: 0.3 },
  innerScale: { x: 0.5, y: 0.5 },
  // outerScale: { x: 1, y: 1 },
  // innerScale: { x: 1, y: 1 },

  onChange: (data) => console.log('onJoyStickMove:', data),
  onStart: () => console.log('onJoyStickStart:'),
  onEnd: () => console.log('onJoyStickEnd:'),
});

app.stage.addChild(container);
```

## License

Endel Dreyer  MIT
