# 🕹 pixi-virtual-joystick

Virtual Touch Joystick for [pixi.js](https://github.com/pixijs/pixi.js)

<img src="screenshot.gif?raw=1" />

## Usage

```typescript
import { Joystick } from "pixi-virtual-joystick";

const joystick = new Joystick({
  outer: "images/joystick.png",
  inner: "images/joystick-handle.png",

  outerScale: { x: 0.5, y: 0.5 },
  innerScale: { x: 0.8, y: 0.8 },

  onChange: (data) => {
    console.log(data.angle); // Angle from 0 to 360
    console.log(data.direction); // 'left', 'top', 'bottom', 'right', 'top_left', 'top_right', 'bottom_left' or 'bottom_right'.
    console.log(data.power); // Power from 0 to 1
  },

  onStart: () => {
    console.log('start')
  },

  onEnd: () => {
    console.log('end')
  },
});

app.stage.addChild(joystick);
```

## Similar alternatives

- [nipplejs](https://github.com/yoannmoinet/nipplejs/) (more features, DOM-based)
- [react-nipple](https://github.com/loopmode/react-nipple)

## License

Endel Dreyer © MIT
