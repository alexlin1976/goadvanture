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
    
        //   console.log('Animation definitions loaded:', definitions);
        } catch (error) {
          console.error('Error during animation definitions loading:', error);
        }
    }

    preload(gameScene: Phaser.Scene) {
        Object.keys(this.definitions.assetsSet).forEach(name => {
            const definition = this.definitions.assetsSet[name];
            // console.log(`preload ${name} with ${definition.asset}`)
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
                        // console.log(`loading animation ${tile.properties.animation} ${tile.properties.group_x} ${tile.properties.group_y}`);
                        const tilePosition = tileMap.tileToWorldXY(tile.x + tile.properties.xOffset * asset.width, tile.y + tile.properties.yOffset * asset.height)!;
                        const animationSprite = gameScene.add.sprite(tilePosition.x + 24, tilePosition.y + 24,tile.properties.animation);
                        animationSprite.setDepth(5);
                        animationSprite.scale = 3;
                        const framerate = "framerate" in definition ? definition.framerate : 10;
                        if ("group_x" in tile.properties && "group_y" in tile.properties) {
                            let frames: Array<integer> = [];
                            // console.log(`${definition.frames}`)
                            for (var i=0; i<definition.frames.length; i++) {
                                frames.push(definition.frames[i] + definition.tilesetwidth * tile.properties.group_y + tile.properties.group_x);
                            }
                            // console.log(`${tile.properties.group_x},${tile.properties.group_y} frames: ${frames}`)
                            const key = `${tile.properties.animation}_${tile.properties.group_x}_${tile.properties.group_y}`;
                            if (!gameScene.anims.get(key))
                                gameScene.anims.create({
                                    key: key,
                                    frames: gameScene.anims.generateFrameNumbers(definition.asset, { frames: frames }),
                                    frameRate: framerate,
                                    repeat: -1,
                                });
                            animationSprite.anims.play(`${tile.properties.animation}_${tile.properties.group_x}_${tile.properties.group_y}`);
                        }
                        else {
                            const key = tile.properties.animation;
                            if (!gameScene.anims.get(key))
                                gameScene.anims.create({
                                    key: key,
                                    frames: gameScene.anims.generateFrameNumbers(definition.asset, { start: definition.start, end: definition.start + definition.steps - 1 }),
                                    frameRate: framerate,
                                    repeat: -1,
                                });
                            animationSprite.anims.play(tile.properties.animation);
                        }
                    }
                })
            });
        });
    }
}

export const animationSet = new AnimationSet();