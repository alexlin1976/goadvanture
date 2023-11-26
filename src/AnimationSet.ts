import { GameScene } from "./GameScene";

export class AnimationSet {
    definitions: any;
    constructor(
    ) {
        this.loadSettings();
    }

    async loadSettings(): Promise<void> {
        try {
          const response = await fetch('assets/AnimationSet.json');
    
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
    
          const definitions: any = await response.json(); // Adjust 'any' based on your JSON structure
          this.definitions = definitions; // Exporting to a global variable
    
          console.log('Animation definitions loaded:', definitions);
        } catch (error) {
          console.error('Error during animation definitions loading:', error);
        }
    }

    preload(gameScene: Phaser.Scene) {
        Object.keys(this.definitions.assetsSet).forEach(name => {
            const definition = this.definitions.assetsSet[name];
            console.log(`preload ${name} with ${definition.asset}`)
            gameScene.load.spritesheet(name, definition.asset, {
                frameWidth: definition.width * 16,
                frameHeight: definition.height * 16
              });
        });
    }

    createTileMapAnimation(tileMap: Phaser.Tilemaps.Tilemap, gameScene: GameScene) {
        tileMap.layers.forEach(layer => {
            layer.data.forEach(row => {
                row.forEach(tile => {
                    if (tile.properties.hasAnimation) {
                        const definition = this.definitions.animations[tile.properties.animation];
                        const asset = this.definitions.assetsSet[definition.asset];
                        console.log(`this tile has an animation ${tile.properties.animation} from ${definition.start} to ${definition.start + definition.steps - 1}`)
                        const tilePosition = tileMap.tileToWorldXY(tile.x + tile.properties.xOffset * asset.width, tile.y + tile.properties.yOffset * asset.height)!;
                        const smokeSprite = gameScene.add.sprite(tilePosition.x + 24, tilePosition.y + 24,tile.properties.animation);
                        smokeSprite.setDepth(5);
                        smokeSprite.scale = 3;
                        gameScene.anims.create({
                          key: tile.properties.animation,
                          frames: gameScene.anims.generateFrameNumbers(definition.asset, { start: definition.start, end: definition.start + definition.steps - 1 }),
                          frameRate: 10,
                          repeat: -1,
                        });
                        smokeSprite.anims.play(tile.properties.animation);
                    
                    }
                })
            });
        });
    }
}

export const animationSet = new AnimationSet();