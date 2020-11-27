# 🕹 pixi-virtual-joystick

Virtual Touch Joystick for [pixi.js](https://github.com/pixijs/pixi.js)

<img src="screenshot.gif?raw=1" />

## Usage

```typescript
import { Joystick } from "pixi-virtual-joystick";

const joystick = new Joystick({
  outer: "images/joystick.png",
  inner: "images/joystick-handle.png",

  outerScale: { x: 0.3, y: 0.3 },
  innerScale: { x: 0.5, y: 0.5 },

  onChange: (data) => console.log('onJoyStickMove:', data),
  onStart: () => console.log('onJoyStickStart:'),
  onEnd: () => console.log('onJoyStickEnd:'),
});

app.stage.addChild(joystick);
```

## Similar alternatives

- [nipplejs](https://github.com/yoannmoinet/nipplejs/) (more features, DOM-based)
- [react-nipple](https://github.com/loopmode/react-nipple)

## License

Endel Dreyer © MIT
