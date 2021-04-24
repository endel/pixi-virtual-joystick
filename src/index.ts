import * as PIXI from "pixi.js";

export interface JoystickChangeEvent {
  angle: number;
  direction: Direction;
  power: number;
}

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
  outer?: PIXI.Sprite | PIXI.Graphics | PIXI.Container,
  inner?: PIXI.Sprite | PIXI.Graphics | PIXI.Container,
  outerScale?: { x: number, y: number },
  innerScale?: { x: number, y: number },
  onChange?: (data: JoystickChangeEvent) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class Joystick extends PIXI.Container {
  settings: JoystickSettings;

  outerRadius: number = 0;
  innerRadius: number = 0;

  outer!: PIXI.Sprite | PIXI.Graphics | PIXI.Container;
  inner!: PIXI.Sprite | PIXI.Graphics | PIXI.Container;

  innerAlphaStandby = 0.5;

  constructor(opts: JoystickSettings) {
    super();

    this.settings = Object.assign({
      outerScale: { x: 1, y: 1 },
      innerScale: { x: 1, y: 1 },
    }, opts);

    if (!this.settings.outer) {
      const outer = new PIXI.Graphics();
      outer.beginFill(0x000000);
      outer.drawCircle(0, 0, 60);
      outer.alpha = 0.5;
      this.settings.outer = outer;
    }

    if (!this.settings.inner) {
      const inner = new PIXI.Graphics();
      inner.beginFill(0x000000);
      inner.drawCircle(0, 0, 35);
      inner.alpha = this.innerAlphaStandby;
      this.settings.inner = inner;
    }

    this.initialize();
  }

  initialize() {
    this.outer = this.settings.outer!;
    this.inner = this.settings.inner!;

    this.outer.scale.set(this.settings.outerScale!.x, this.settings.outerScale!.y);
    this.inner.scale.set(this.settings.innerScale!.x, this.settings.innerScale!.y);

    if ('anchor' in this.outer) { this.outer.anchor.set(0.5); }
    if ('anchor' in this.inner) { this.inner.anchor.set(0.5); }

    this.addChild(this.outer);
    this.addChild(this.inner);

    // this.outerRadius = this.containerJoystick.width / 2;
    this.outerRadius = this.width / 2.5;
    this.innerRadius = this.inner.width / 2;

    this.bindEvents();
  }

  protected bindEvents() {
    let that = this;
    this.interactive = true;

    let dragging: boolean = false;
    let eventData: PIXI.InteractionData;
    let power: number;
    let startPosition: PIXI.Point;

    function onDragStart(event: PIXI.InteractionEvent) {
      eventData = event.data;
      startPosition = eventData.getLocalPosition(that);

      dragging = true;
      that.inner.alpha = 1;

      that.settings.onStart?.();
    }

    function onDragEnd(event: PIXI.InteractionEvent) {
      if (dragging == false) { return; }

      that.inner.position.set(0, 0);

      dragging = false;
      that.inner.alpha = that.innerAlphaStandby;

      that.settings.onEnd?.();
    }

    function onDragMove(event: PIXI.InteractionEvent) {
      if (dragging == false) { return; }

      let newPosition = eventData.getLocalPosition(that);

      let sideX = newPosition.x - startPosition.x;
      let sideY = newPosition.y - startPosition.y;

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
        that.inner.position.set(centerPoint.x, centerPoint.y);
        power = that.getPower(centerPoint);
        that.settings.onChange?.({ angle, direction, power, });
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

        that.inner.position.set(centerPoint.x, centerPoint.y);
        power = that.getPower(centerPoint);
        that.settings.onChange?.({ angle, direction, power, });
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
      that.inner.position.set(centerPoint.x, centerPoint.y);

      that.settings.onChange?.({ angle, direction, power, });
    };

    this.on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)
  }

  protected getPower(centerPoint: PIXI.Point) {
    const a = centerPoint.x - 0;
    const b = centerPoint.y - 0;
    return Math.min(1, Math.sqrt(a * a + b * b) / this.outerRadius);
  }

  protected getDirection(center: PIXI.Point) {
    let rad = Math.atan2(center.y, center.x);// [-PI, PI]
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