import { ScratchCover } from '@/entities/ScratchCover';
import { ScratchGrid } from '@/entities/ScratchGrid';

export class Play extends Phaser.Scene {
  get height() {
    return this.scale.height;
  }
  get width() {
    return this.scale.width;
  }

  get center(): Phaser.Types.Math.Vector2Like {
    return { x: this.width / 2, y: this.height / 2 };
  }

  cover: ScratchCover;
  grid: ScratchGrid;

  constructor() {
    super('Play');
  }

  create() {
    this.cover = new ScratchCover(this, 'background');
    this.grid = new ScratchGrid(this, this.cover.context);
  }
}
