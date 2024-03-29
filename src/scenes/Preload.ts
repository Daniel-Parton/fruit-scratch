export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.setPath('./assets');
    this.load.image('background', 'background.png');
    this.load.image('banana', 'banana.png');
    this.load.image('cherry', 'cherry.png');
    this.load.image('apple', 'apple.png');
    this.load.image('orange', 'orange.png');
    this.load.image('mango', 'mango.png');
    this.load.image('pineapple', 'pineapple.png');
    this.load.image('brush', 'brush.png');
    this.load.image('flare', 'flare.png');
    this.load.spritesheet('scratch-particles', 'scratch-particles.png', {
      frameWidth: 26,
      frameHeight: 17,
      startFrame: 0,
      endFrame: 3
    });
  }

  create() {
    this.scene.start('Play');
  }

  loadAudio(path: string) {
    this.load.audio(
      path,
      ['.mp3', '.ogg', '.m4a'].map((ext) => `${path}${ext}`)
    );
  }
}
