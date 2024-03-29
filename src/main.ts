import './style.css';
import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preload } from './scenes/Preload';
import { Play } from './scenes/Play';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  max: {
    width: 800,
    height: 800
  },
  min: {
    width: 350,
    height: 350
  },
  parent: 'game-container',
  pixelArt: true,
  autoFocus: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container',
    parent: 'game-container'
  },
  scene: [Boot, Preload, Play]
};

new Phaser.Game(config);
