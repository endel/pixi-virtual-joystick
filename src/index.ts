import * as PIXI from "pixi.js";

export enum Direction {
  LEFT = 'left',
  TOP = 'top',
  BOTTOM = 'bottom',
  RIGHT = 'right',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
}

export interface JoystickSettings {
  outer: string,
  inner: string,
  outerScale?: { x: number, y: number },
  innerScale?: { x: number, y: number },
  onChange: (data: { angle: number, direction: Direction, power: number }) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class Joystick extends PIXI.Container {
  settings: JoystickSettings;
  elements: PIXI.Container;
  outer: PIXI.Sprite;
  inner: PIXI.Sprite;
  outerRadius: number = 0;
  innerRadius: number = 0;

  constructor(opts: JoystickSettings) {
    super();

    this.settings = Object.assign({
      outerScale: { x: 1, y: 1 },
      innerScale: { x: 1, y: 1 },
    }, opts);

    this.loadResources(() => this.initialize());
  }


  loadResources(callback: () => void) {
    const loader = new PIXI.Loader();
    loader.add('outer', this.settings.outer);
    loader.add('inner', this.settings.inner);
    loader.onComplete.once(() => callback?.());
    loader.load();
  }

  initialize() {
    let outerImg = PIXI.Texture.from(this.settings.outer);
    let innerImg = PIXI.Texture.from(this.settings.inner);

    this.elements = new PIXI.Container();

    this.outer = new PIXI.Sprite(outerImg);
    this.inner = new PIXI.Sprite(innerImg);

    this.outer.scale.set(this.settings.outerScale.x, this.settings.outerScale.y);
    this.inner.scale.set(this.settings.innerScale.x, this.settings.innerScale.y);

    this.outer.anchor.set(0.5);
    this.inner.anchor.set(0.5);

    this.elements.addChild(this.outer);
    this.elements.addChild(this.inner);

    // this.outerRadius = this.containerJoystick.width / 2;
    this.outerRadius = this.elements.width / 2.5;
    this.innerRadius = this.inner.width / 2;

    this.elements.position.set(this.position.x, this.position.y);
    this.addChild(this.elements);

    this.bindEvents();
  }

  protected bindEvents() {
    let that = this;
    this.elements.interactive = true;

    let dragging: boolean = false;
    let eventData: PIXI.InteractionData;
    let power: number;

    function onDragStart(event: PIXI.InteractionEvent) {
      eventData = event.data;

      // let startPosition = eventData.getLocalPosition(this.parent);
      dragging = true;

      that.settings.onStart?.();
    }

    function onDragEnd(event) {
      if (dragging == false) { return; }

      dragging = false;
      that.inner.position.set(0, 0);

      that.settings.onEnd?.();
    }

    function onDragMove(event) {
      if (dragging == false) { return; }

      let newPosition = eventData.getLocalPosition(this.parent);

      let sideX = newPosition.x - that.position.x;
      let sideY = newPosition.y - that.position.y;

      let centerPoint = new PIXI.Point(0, 0);
      let angle = 0;

      if (sideX == 0 && sideY == 0) { return; }

      let calRadius = 0;

      if (sideX * sideX + sideY * sideY >= that.outerRadius * that.outerRadius) {
        calRadius = that.outerRadius;
      }
      else {
        calRadius = that.outerRadius - that.innerRadius;
      }

      /**
       * x:   -1 <-> 1
       * y:   -1 <-> 1
       *          Y
       *          ^
       *          |
       *     180  |  90
       *    ------------> X
       *     270  |  360
       *          |
       *          |
       */

      let direction = Direction.LEFT;

      if (sideX == 0) {
        if (sideY > 0) {
          centerPoint.set(0, (sideY > that.outerRadius) ? that.outerRadius : sideY);
          angle = 270;
          direction = Direction.BOTTOM;
        } else {
          centerPoint.set(0, -(Math.abs(sideY) > that.outerRadius ? that.outerRadius : Math.abs(sideY)));
          angle = 90;
          direction = Direction.TOP;
        }
        that.inner.position = centerPoint;
        power = that.getPower(centerPoint);
        that.settings.onChange({ angle, direction, power, });
        return;
      }

      if (sideY == 0) {
        if (sideX > 0) {
          centerPoint.set((Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          angle = 0;
          direction = Direction.LEFT;
        } else {
          centerPoint.set(-(Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          angle = 180;
          direction = Direction.RIGHT;
        }

        that.inner.position = centerPoint;
        power = that.getPower(centerPoint);
        that.settings.onChange({ angle, direction, power, });
        return;
      }

      let tanVal = Math.abs(sideY / sideX);
      let radian = Math.atan(tanVal);
      angle = radian * 180 / Math.PI;

      let centerX = 0;
      let centerY = 0;

      if (sideX * sideX + sideY * sideY >= that.outerRadius * that.outerRadius) {
        centerX = that.outerRadius * Math.cos(radian);
        centerY = that.outerRadius * Math.sin(radian);
      }
      else {
        centerX = Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX);
        centerY = Math.abs(sideY) > that.outerRadius ? that.outerRadius : Math.abs(sideY);
      }

      if (sideY < 0) {
        centerY = -Math.abs(centerY);
      }
      if (sideX < 0) {
        centerX = -Math.abs(centerX);
      }

      if (sideX > 0 && sideY < 0) {
        // < 90
      }
      else if (sideX < 0 && sideY < 0) {
        // 90 ~ 180
        angle = 180 - angle;
      }
      else if (sideX < 0 && sideY > 0) {
        // 180 ~ 270
        angle = angle + 180;
      }
      else if (sideX > 0 && sideY > 0) {
        // 270 ~ 369
        angle = 360 - angle;
      }
      centerPoint.set(centerX, centerY);
      power = that.getPower(centerPoint);

      direction = that.getDirection(centerPoint);
      that.inner.position = centerPoint;

      that.settings.onChange({ angle, direction, power, });
    };

    this.elements.on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)
  }

  protected getPower(centerPoint: PIXI.Point) {
    const a = centerPoint.x - 0;
    const b = centerPoint.y - 0;
    return Math.sqrt(a * a + b * b) / this.outerRadius;
  }

  protected getDirection(pos) {
    let rad = Math.atan2(pos.y, pos.x);// [-PI, PI]
    if ((rad >= -Math.PI / 8 && rad < 0) || (rad >= 0 && rad < Math.PI / 8)) {
      return Direction.RIGHT;
    } else if (rad >= Math.PI / 8 && rad < 3 * Math.PI / 8) {
      return Direction.BOTTOM_RIGHT;
    } else if (rad >= 3 * Math.PI / 8 && rad < 5 * Math.PI / 8) {
      return Direction.BOTTOM;
    } else if (rad >= 5 * Math.PI / 8 && rad < 7 * Math.PI / 8) {
      return Direction.BOTTOM_LEFT;
    } else if ((rad >= 7 * Math.PI / 8 && rad < Math.PI) || (rad >= -Math.PI && rad < -7 * Math.PI / 8)) {
      return Direction.LEFT;
    } else if (rad >= -7 * Math.PI / 8 && rad < -5 * Math.PI / 8) {
      return Direction.TOP_LEFT;
    } else if (rad >= -5 * Math.PI / 8 && rad < -3 * Math.PI / 8) {
      return Direction.TOP;
    } else {
      return Direction.TOP_RIGHT;
    }
  }


}