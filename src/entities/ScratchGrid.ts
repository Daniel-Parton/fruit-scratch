import { getSceneSizeData } from '@/utils/SceneSizeHelper';
import { ScratchItem } from './ScratchItem';
import { GAME_EVENTS } from 'GameEvents';

type PlacementData = {
  p1_1: ScratchItem;
  p1_2: ScratchItem;
  p1_3: ScratchItem;
  p2_1: ScratchItem;
  p2_2: ScratchItem;
  p2_3: ScratchItem;
  p3_1: ScratchItem;
  p3_2: ScratchItem;
  p3_3: ScratchItem;
};

export class ScratchGrid extends Phaser.GameObjects.Group {
  scratchContext: CanvasRenderingContext2D;
  data: PlacementData;
  itemKeys: string[] = [
    'banana',
    'cherry',
    'apple',
    'mango',
    'orange',
    'pineapple'
  ];
  winPercentage = 0.5;
  winnerKey?: string;

  get itemsComplete() {
    if (!this.data) {
      return 0;
    }

    return Object.keys(this.data).reduce((c, key) => {
      const item = this.data[key] as ScratchItem;
      return item.isComplete ? c + 1 : c;
    }, 0);
  }

  constructor(scene: Phaser.Scene, context: CanvasRenderingContext2D) {
    super(scene);
    this.scratchContext = context;
    scene.add.existing(this);
    this.init();
  }

  init() {
    this.data = {
      p1_1: new ScratchItem(this.scene),
      p1_2: new ScratchItem(this.scene),
      p1_3: new ScratchItem(this.scene),
      p2_1: new ScratchItem(this.scene),
      p2_2: new ScratchItem(this.scene),
      p2_3: new ScratchItem(this.scene),
      p3_1: new ScratchItem(this.scene),
      p3_2: new ScratchItem(this.scene),
      p3_3: new ScratchItem(this.scene)
    };

    const { width, height } = getSceneSizeData(this.scene);
    const gridWidth = width;
    const gridHeight = height;
    const itemWidth = gridWidth / 3;
    const itemHeight = gridHeight / 3;

    this.generate();

    for (const key in this.data) {
      const item = this.data[key] as ScratchItem;
      item.setDisplaySize(itemWidth, itemHeight);
      this.add(item, true);
    }

    Phaser.Actions.GridAlign(this.getChildren(), {
      width: 3,
      height: 3,
      position: Phaser.Display.Align.CENTER,
      cellWidth: itemWidth,
      cellHeight: itemHeight
    });

    this.scene.events.on(
      GAME_EVENTS.scratched,
      (scratchPosition: Phaser.Types.Math.Vector2Like) => {
        let percentBefore = 0;
        let percentAfter = 0;

        const scratchHitBox = new Phaser.Geom.Rectangle(
          scratchPosition.x - 25,
          scratchPosition.y - 25,
          50,
          50
        );

        for (const key in this.data) {
          const item = this.data[key] as ScratchItem;
          percentBefore += item.percentComplete;
          if (
            !item.isComplete &&
            Phaser.Geom.Intersects.RectangleToRectangle(
              scratchHitBox,
              item.getBounds()
            )
          ) {
            percentAfter += item.checkComplete(this.scratchContext);
          } else {
            percentAfter += item.percentComplete;
          }
        }

        percentAfter = percentAfter / 9;
        percentBefore = percentBefore / 9;

        if (percentAfter > percentBefore) {
          this.scene.events.emit(
            GAME_EVENTS.scratchPercentIncreased,
            scratchPosition,
            percentAfter - percentBefore
          );
        }
      }
    );
  }

  generate() {
    const isWinner = Math.random() < this.winPercentage;
    if (isWinner) {
      this.generateWin();
    } else {
      this.generateLose();
    }
  }

  generateWin() {
    debugger;
    this.resetData();
    const winningItem = this.resolveRandomItemKey();

    const keys = Object.keys(this.data);
    const randomKeys = [];

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      randomKeys.push(keys[randomIndex]);
      keys.splice(randomIndex, 1); // Remove the selected key to avoid duplicates
    }

    randomKeys.forEach((key) => {
      (this.data[key] as ScratchItem).setItem(winningItem);
    });

    const success = this.tryFillGrid(1, [winningItem]);
    if (!success) {
      this.generateWin();
    }
  }

  generateLose() {
    this.resetData();
    const success = this.tryFillGrid(0);
    if (!success) {
      this.generateLose();
    }
  }

  tryFillGrid(allowedWinCount: number, baseExcludeItems: string[] = []) {
    let success = true;

    const notAllowed = () => {
      return this.checkWinCount() > allowedWinCount;
    };

    for (const key in this.data) {
      const value = this.data[key] as ScratchItem;
      if (!value.textureKey) {
        const ignoredItems = [...baseExcludeItems];
        do {
          value.setItem(this.resolveRandomItemKey(ignoredItems));
          if (notAllowed()) {
            ignoredItems.push(value.textureKey);
          }
          if (ignoredItems.length === this.itemKeys.length) {
            success = false;
          }
        } while (notAllowed() && success);
      }
      if (!success) {
        break;
      }
    }

    return success;
  }

  checkWinCount(): number {
    const keyLookup = Object.keys(this.data).reduce<Record<string, number>>(
      (lookup, k) => {
        const key = (this.data[k] as ScratchItem).textureKey;
        if (key) {
          if (!lookup[key]) lookup[key] = 0;
          ++lookup[key];
        }
        return lookup;
      },
      {}
    );

    return Object.keys(keyLookup).filter((k) => keyLookup[k] >= 3).length;
  }

  resetData() {
    Object.keys(this.data).forEach((key) => {
      (this.data[key] as ScratchItem).clearItem();
    }, this);
  }

  resolveRandomItemKey(exclude?: string[]) {
    const items =
      exclude?.length > 0
        ? this.itemKeys.filter((item) => !exclude.includes(item))
        : this.itemKeys;
    return items[Math.floor(Math.random() * items.length)];
  }
}
