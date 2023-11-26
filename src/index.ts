import 'phaser';
import { StartScene } from './StartScene';

const width = window.innerWidth;
const height = window.innerHeight;
const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Sample",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: [StartScene],
  scale: {
    width: width,
    height: height,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "game",
  backgroundColor: "#003300",
};

export const game = new Phaser.Game(gameConfig);