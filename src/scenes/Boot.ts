export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.setPath('./assets');
  }

  create() {
    this.scene.start('Preload');
  }
}
