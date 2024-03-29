import { getSceneSizeData } from '@/utils/SceneSizeHelper';
import { ScratchBrush } from './ScratchBrush';
import { GAME_EVENTS } from 'GameEvents';

type AutoScratchLineData = {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
};
export type ParticleFireVariants = 'small' | 'medium' | 'large';
export class ScratchCover extends Phaser.GameObjects.Group {
  canvas: Phaser.Textures.CanvasTexture;
  context: CanvasRenderingContext2D;

  brush: ScratchBrush;
  brushImage: HTMLImageElement;
  image: Phaser.GameObjects.Image;
  position: Phaser.Types.Math.Vector2Like = { x: 0, y: 0 };
  isDown: boolean = false;
  isAutoScratching: boolean = false;
  scratchParticles: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, imageKey: string) {
    super(scene);
    scene.add.existing(this);
    this.init(imageKey);
  }

  init(imageKey: string) {
    const imageElement = this.scene.textures
      .get(imageKey)
      .getSourceImage() as HTMLImageElement;

    this.brushImage = this.scene.textures
      .get('brush')
      .getSourceImage() as HTMLImageElement;

    const { height, width } = getSceneSizeData(this.scene);
    this.canvas = this.scene.textures.createCanvas(
      'scratch-cover',
      width,
      height
    );

    this.context = this.canvas.getContext();
    this.context.drawImage(imageElement, 0, 0, width, height);
    this.canvas.update();
    this.image = this.scene.add
      .image(0, 0, 'scratch-cover')
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive();

    this.add(this.image);
    this.brush = new ScratchBrush(this.context);

    this.image.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer) => {
        this.position = { x: pointer.x, y: pointer.y };
        this.brush.setInit(this.position);
        this.brush.startLine();
      },
      this
    );

    this.image.on(
      'pointermove',
      (pointer: Phaser.Input.Pointer) => {
        this.position = { x: pointer.x, y: pointer.y };
        this.brush.updateMousePosition(this.position);
        if (pointer.isDown) {
          this.scratch();
        }
      },
      this
    );

    this.scratchParticles = this.scene.add
      .particles(0, 0, 'scratch-particles', {
        frame: [0, 1, 2, 3],
        lifespan: 1000,
        tint: [0xffff00],
        speed: { min: 50, max: 250 },
        scale: { start: 1, end: 0.1 },
        rotate: { start: 0, end: 360 },
        gravityY: 200,
        frequency: 20,
        alpha: { min: 1, max: 0 },
        x: 200,
        y: 200,
        emitting: false
      })
      .setDepth(2);

    this.scene.events.on(
      GAME_EVENTS.scratchPercentIncreased,
      (position: Phaser.Types.Math.Vector2Like, difference: number) => {
        let variant: ParticleFireVariants = 'medium';
        if (difference > 0.1) {
          variant = 'large';
        } else if (difference < 0.03) {
          variant = 'small';
        }
        this.fireParticles(position, variant);
      },
      this
    );

    this.scene.events.on(
      GAME_EVENTS.itemCompleted,
      this.handleAutoScratch,
      this
    );
  }

  fireParticles(
    position: Phaser.Types.Math.Vector2Like,
    variant: ParticleFireVariants
  ) {
    let amount = 3;
    switch (variant) {
      case 'small':
        amount = 1.5;
        break;
      case 'large':
        amount = 6;
        break;
    }
    this.scratchParticles.emitParticleAt(position.x, position.y, amount);
  }

  private scratch() {
    this.context.globalCompositeOperation = 'destination-out';
    this.context.save();
    this.brush.drawLine();
    this.context.restore();
    this.canvas.update();
    this.scene.events.emit(GAME_EVENTS.scratched, this.position);
  }

  private plotAutoScratchLines(bounds: Phaser.Geom.Rectangle) {
    // Calculate the points for the zigzag path
    const lines: AutoScratchLineData[] = [];
    const plot: Phaser.Math.Vector2[] = [];

    const padding = 15;
    const yChange = bounds.height / 5;
    const xChange = bounds.width / 5;

    let currentY = bounds.y + yChange;
    let currentX = padding + bounds.x;
    let stillDrawing = true;

    //Will draw top left portion of the zigzag
    do {
      const start = new Phaser.Math.Vector2({
        x: padding + bounds.x,
        y: currentY
      });
      currentX += xChange;
      const end = new Phaser.Math.Vector2({
        x: currentX,
        y: bounds.y + padding
      });
      plot.push(start);
      plot.push(end);
      lines.push({ start, end });
      currentY += yChange;
      if (currentY > bounds.y + bounds.height - padding) {
        stillDrawing = false;
      }
    } while (stillDrawing);

    stillDrawing = true;
    currentX = bounds.x + xChange;
    currentY = bounds.y;

    //Will draw bottom right portion of the zigzag
    do {
      const start = new Phaser.Math.Vector2({
        x: currentX,
        y: bounds.y + bounds.height - padding
      });
      currentY += yChange;
      const end = new Phaser.Math.Vector2({
        x: bounds.x + bounds.width - padding,
        y: currentY
      });
      plot.push(start);
      plot.push(end);
      lines.push({ start, end });
      currentX += xChange;
      if (currentX > bounds.x + bounds.width - padding) {
        stillDrawing = false;
      }
    } while (stillDrawing);

    return [lines, plot] as const;
  }

  //Here for debugging
  private debugAutoScratchLinesPath(lines: AutoScratchLineData[]) {
    const graphics = this.scene.add.graphics().setDepth(4);
    graphics.lineStyle(1, 0xffffff);
    graphics.moveTo(lines[0].start.x, lines[0].start.y);

    graphics.beginPath();
    for (const line of lines) {
      graphics.lineTo(line.start.x, line.start.y);
      graphics.lineTo(line.end.x, line.end.y);
    }

    graphics.strokePath();
  }

  private handleAutoScratch(itemBounds: Phaser.Geom.Rectangle) {
    this.isAutoScratching = true;
    // Calculate the points for the zigzag path
    const [lines, plot] = this.plotAutoScratchLines(itemBounds);
    // this.debugAutoScratchLinesPath(lines);
    this.brush.setInit(lines[0].start);
    this.brush.startLine();
    let delay = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const duration = this.getLineDistance(line) * 0.8;
      this.scene.tweens.add({
        targets: line.start,
        x: line.end.x,
        y: line.end.y,
        delay: delay,
        ease: 'Linear',
        duration,
        onUpdate: (_, pos: Phaser.Types.Math.Vector2Like, prop: 'x' | 'y') => {
          if (prop === 'y') {
            this.brush.updateMousePosition(pos);
            this.context.globalCompositeOperation = 'destination-out';
            this.context.save();
            this.brush.drawLine();
            this.context.restore();
            this.canvas.update();
            this.fireParticles(pos, 'small');
          }
        },
        onComplete: () => {
          if (i === lines.length - 1) {
            this.isAutoScratching = false;
          }
        }
      });

      delay += duration;
    }
  }

  private getLineDistance(line: AutoScratchLineData) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
