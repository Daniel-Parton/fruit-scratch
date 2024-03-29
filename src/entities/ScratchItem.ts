import { GAME_EVENTS } from 'GameEvents';

export class ScratchItem extends Phaser.Physics.Arcade.Sprite {
  textureKey: string;
  percentComplete: number = 0;
  get isComplete() {
    return this.percentComplete === 100;
  }
  autoCompletePercent: number = 40;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'banana');
    this.textureKey = '';
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  setItem(key: string) {
    this.textureKey = key;
    this.setTexture(key, 0);
  }

  clearItem() {
    this.textureKey = '';
  }

  checkComplete(scratchContext: CanvasRenderingContext2D) {
    if (this.isComplete) {
      return this.percentComplete;
    }

    let counter = 0;
    const bounds = this.getBounds();
    const imageData = scratchContext.getImageData(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    );
    const imageDataLength = imageData.data.length;

    // loop data image drop every 4 items [r, g, b, a, ...]
    for (let i = 0; i < imageDataLength; i += 4) {
      // Increment the counter only if the pixel in completely clear
      if (
        imageData.data[i] === 0 &&
        imageData.data[i + 1] === 0 &&
        imageData.data[i + 2] === 0 &&
        imageData.data[i + 3] === 0
      ) {
        counter++;
      }
    }

    // Convert the counter to a percentage
    const percentComplete =
      counter >= 1 ? (counter / (bounds.width * bounds.height)) * 100 : 0;

    this.percentComplete = percentComplete;

    if (this.percentComplete > this.autoCompletePercent) {
      const bounds = this.getBounds();
      this.percentComplete = 100;
      this.scene.events.emit(GAME_EVENTS.itemCompleted, bounds);

      const emmitter = this.scene.add
        .particles(0, 0, 'flare', {
          speed: 50,
          lifespan: 1000,
          quantity: 4,
          radial: true,
          scale: { start: 0.4, end: 0 },
          emitZone: new Phaser.GameObjects.Particles.Zones.EdgeZone(bounds, 42),
          duration: 500,
          emitting: false
        })
        .setDepth(4);

      this.scene.tweens.add({
        targets: this,
        duration: 300,
        delay: 600,
        onStart: () => {
          emmitter.start();
        },
        scale: this.scale * 1.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          emmitter.stop();
        }
      });
    }
    return percentComplete;
  }
}
