export class ScratchBrush {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly _currentAngle: number;
  private readonly _bristleStrokeWidth: number;
  private readonly _bristles: Bristle[];
  private readonly _lineWidth: number;

  public lastPosition: Phaser.Types.Math.Vector2Like;
  public position: Phaser.Types.Math.Vector2Like;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this._bristleStrokeWidth = 100;
    this._lineWidth = 50;
    this._bristles = this.makeBristles(this._bristleStrokeWidth);
    this.lastPosition = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
  }

  setInit({ x, y }: Phaser.Types.Math.Vector2Like) {
    this.lastPosition = { x, y };
    this.position = { x, y };
  }

  startLine(width?: number) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = width ?? this._lineWidth;
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.moveTo(this.position.x, this.position.y);
  }

  updateMousePosition({ x, y }: Phaser.Types.Math.Vector2Like) {
    this.lastPosition = { ...this.position };
    this.position = { x, y };
  }

  drawImage(image: HTMLImageElement) {
    const newAngle = this.getNewAngle(
      this.lastPosition,
      this.position,
      this._currentAngle
    );
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate(newAngle);
    this.ctx.drawImage(
      image,
      -(image.width / 2),
      -(image.height / 2),
      image.width * 2,
      image.height * 2
    );
  }

  drawLine(offset?: Phaser.Types.Math.Vector2Like) {
    if (offset) {
      this.position.x = this.position.x + offset.x;
      this.position.y = this.position.y + offset.y;
    }
    this.ctx.filter = 'blur(1px)';
    this.ctx.lineTo(this.position.x, this.position.y);
    this.ctx.stroke();
  }

  drawBristles(offset?: Phaser.Types.Math.Vector2Like) {
    if (offset) {
      this.position.x = this.position.x + offset.x;
      this.position.y = this.position.y + offset.y;
    }
    const oldAngle = this._currentAngle;
    const newAngle = this.getNewAngle(
      this.lastPosition,
      this.position,
      oldAngle
    );
    this._bristles.forEach((bristle) => {
      this.ctx.beginPath();
      const bristleOrigin = this.rotatePoint(
        bristle.distance - this._bristleStrokeWidth / 2,
        oldAngle,
        this.lastPosition
      );

      let bristleDestination = this.rotatePoint(
        bristle.distance - this._bristleStrokeWidth / 2,
        newAngle,
        this.position
      );
      const controlPoint = this.rotatePoint(
        bristle.distance - this._bristleStrokeWidth / 2,
        newAngle,
        this.lastPosition
      );
      bristleDestination = this.rotatePoint(
        bristle.distance - this._bristleStrokeWidth / 2,
        newAngle,
        this.position
      );
      this.drawBristleStroke(
        this.ctx,
        bristleOrigin,
        bristleDestination,
        bristle,
        controlPoint
      );
    }, this);
  }

  private drawBristleStroke(
    context: CanvasRenderingContext2D,
    origin: Phaser.Types.Math.Vector2Like,
    destination: Phaser.Types.Math.Vector2Like,
    bristle: Bristle,
    controlPoint: Phaser.Types.Math.Vector2Like
  ) {
    context.beginPath();
    context.moveTo(origin[0], origin[1]);
    context.strokeStyle = bristle.color;
    context.lineWidth = bristle.thickness;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.shadowColor = bristle.color;
    context.shadowBlur = bristle.thickness / 2;
    context.quadraticCurveTo(
      controlPoint.x,
      controlPoint.y,
      destination.x,
      destination.y
    );
    context.lineTo(destination[0], destination[1]);
    context.stroke();
  }

  private makeBristles(strokeWidth: number = 40) {
    const brush: Bristle[] = [];
    const bristleCount = Math.round(strokeWidth / 3);
    const gap = strokeWidth / bristleCount;
    for (let i = 0; i < bristleCount; i++) {
      const distance =
        i === 0 ? 0 : gap * i + (Math.random() * gap) / 2 - gap / 2;
      brush.push({
        distance,
        thickness: Math.random() * 2 + 2,
        color: '#000000'
      });
    }
    return brush;
  }

  private rotatePoint(
    distance: number,
    angle: number,
    origin: Phaser.Types.Math.Vector2Like
  ): Phaser.Types.Math.Vector2Like {
    return {
      x: origin.x + distance * Math.cos(angle),
      y: origin.y + distance * Math.sin(angle)
    };
  }

  private getNewAngle(
    origin: Phaser.Types.Math.Vector2Like,
    destination: Phaser.Types.Math.Vector2Like,
    oldAngle?: number
  ) {
    const bearing = this.getBearing(origin, destination);
    if (isNil(oldAngle)) {
      //console.debug(bearing);
      return bearing;
    }
    return oldAngle - this.angleDiff(oldAngle, bearing);
  }

  private getBearing(
    origin: Phaser.Types.Math.Vector2Like,
    destination: Phaser.Types.Math.Vector2Like
  ) {
    return (
      (Math.atan2(destination.y - origin.y, destination.x - origin.x) -
        Math.PI / 2) %
      (Math.PI * 2)
    );
  }

  private angleDiff(angleA: number, angleB: number) {
    const twoPi = Math.PI * 2;
    const diff =
      ((angleA - (angleB > 0 ? angleB : angleB + twoPi) + Math.PI) % twoPi) -
      Math.PI;
    return diff < -Math.PI ? diff + twoPi : diff;
  }
}

interface Bristle {
  distance: number;
  thickness: number;
  color: string;
}

const isNil = (value: unknown) => value === null || value === undefined;
