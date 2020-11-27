/**
 * Implementation based on
 * https://github.com/Yuntwo/game-pixi/blob/master/h5/component/joystick.js
 */

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

export class Joystick extends PIXI.Container {
  settings: any;
  containerJoystick: PIXI.Container;
  outer: PIXI.Sprite;
  inner: PIXI.Sprite;
  outerRadius: number = 0;
  innerRadius: number = 0;

  constructor(opts) {
    super();

    this.settings = opts;

    this.loadResources(() => this.initialize());
  }


  /**
  * 资源加载
  * @param {*} callback
  */
  loadResources(callback: () => void) {
    PIXI.Loader.shared.add('outer', this.settings.outer);
    PIXI.Loader.shared.add('inner', this.settings.inner);
    PIXI.Loader.shared.onComplete.once(() => callback?.());
    PIXI.Loader.shared.load();
  }

  /**
  * 初始化摇杆
  */
  initialize() {
    let outerImg = PIXI.Texture.from(this.settings.outer);
    let innerImg = PIXI.Texture.from(this.settings.inner);

    this.containerJoystick = new PIXI.Container();

    this.outer = new PIXI.Sprite(outerImg);
    this.inner = new PIXI.Sprite(innerImg);

    this.outer.scale = this.settings.outerScale;
    this.inner.scale = this.settings.innerScale;

    this.outer.anchor.set(0.5);
    this.inner.anchor.set(0.5);

    // this.containerJoystick.anchor.set(0.5);
    this.containerJoystick.addChild(this.outer);
    this.containerJoystick.addChild(this.inner);

    // this.outerRadius = this.containerJoystick.width / 2; //外置摇杆半径
    this.outerRadius = this.containerJoystick.width / 2.5; //外置摇杆半径
    this.innerRadius = this.inner.width / 2; //内置摇杆半径

    this.containerJoystick.position.set(this.position.x, this.position.y);
    this.addChild(this.containerJoystick);

    this.bindEvents();
  }

  /**
  * 初始化事件
  */
  protected bindEvents() {
    let that = this;
    this.containerJoystick.interactive = true;

    let dragging: boolean = false;
    let eventData: PIXI.InteractionData;

    function onDragStart(event: PIXI.InteractionEvent) {
      eventData = event.data;

      let startPosition = eventData.getLocalPosition(this.parent);
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
      let currentAngle = 0;

      if (sideX == 0 && sideY == 0) {
        return;
      }

      //判断执行计算的半径。
      let calRadius = 0;

      //判断移动的距离是否超过外圈，参考勾股定理
      if (sideX * sideX + sideY * sideY >= that.outerRadius * that.outerRadius) {
        calRadius = that.outerRadius;
        //超过外圈，以外圈半径计算。
      }
      else {
        //未超过，以内外圈差值计算
        calRadius = that.outerRadius - that.innerRadius;
      }

      //采用WebGL使用的是正交右手坐标系
      /**
       * x轴最左边为-1，最右边为1；
       * y轴最下边为-1，最上边为1；
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

      //X轴方向没有移动
      if (sideX == 0) {
        if (sideY > 0) {
          centerPoint.set(0, (sideY > that.outerRadius) ? that.outerRadius : sideY);
          currentAngle = 270;
          direction = Direction.BOTTOM;
        } else {
          centerPoint.set(0, -(Math.abs(sideY) > that.outerRadius ? that.outerRadius : Math.abs(sideY)));
          currentAngle = 90;
          direction = Direction.TOP;
        }
        that.inner.position = centerPoint;
        that.settings.onChange({
          angle: currentAngle,
          direction
        });
        return;
      }

      if (sideY == 0) {//Y轴方向没有移动
        if (sideX > 0) {
          centerPoint.set((Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          currentAngle = 0;
          direction = Direction.LEFT;
        } else {
          centerPoint.set(-(Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          currentAngle = 180;
          direction = Direction.RIGHT;
        }

        that.inner.position = centerPoint;
        that.settings.onChange({
          angle: currentAngle,
          direction
        });
        return;
      }

      let tanVal = Math.abs(sideY / sideX);
      let radian = Math.atan(tanVal);
      let angle = radian * 180 / Math.PI;
      currentAngle = angle;

      //计算现在摇杆的中心点主坐标了。
      let centerX = 0;
      let centerY = 0;

      //移动的距离是否超过外圈
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
        //角度小于90度，对应右上角区域
      }
      else if (sideX < 0 && sideY < 0) {
        //90度<角度<180度，对应左下角区域
        currentAngle = 180 - currentAngle;
      }
      else if (sideX < 0 && sideY > 0) {
        //180度<角度<270度，对应左下角区域
        currentAngle = currentAngle + 180;
      }
      else if (sideX > 0 && sideY > 0) {
        //270度<角度<369度，对应右下角区域
        currentAngle = 360 - currentAngle;
      }
      centerPoint.set(centerX, centerY);

      direction = getDirection(centerPoint);
      that.inner.position = centerPoint;

      that.settings.onChange({
        angle: currentAngle,
        direction
      });
    };

    this.containerJoystick.on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)

    /**
     * 获得方向
     * @param {*} pos
     */
    function getDirection(pos) {
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

}