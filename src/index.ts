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

export function printObjectContents(obj: Record<string, any>): void {
  const printRecursive = (value: any, prefix: string = ''): void => {
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          printRecursive(value[key], newPrefix);
        }
      }
    } else {
      console.log(`${prefix}: ${value}`);
    }
  };

  printRecursive(obj);
}

export const game = new Phaser.Game(gameConfig);