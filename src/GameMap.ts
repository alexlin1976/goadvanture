import { GameScene } from "./GameScene";
import { gameScript } from "./GameScriptLoader";
import Villager from "./Villager";
import Enemy from "./Enemy";

class GameMap {
    constructor(
        private mapObj: any
    ) {
        console.log(this.mapObj);
    }

    asset(): String {
        return this.mapObj.tiledMap;
    }

    startPos(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.mapObj.startPos.x, this.mapObj.startPos.y);
    }

    checkEntrance(pos: Phaser.Math.Vector2): any | undefined {
        for (const entrance of this.mapObj.entrance) {
            if (entrance.x == pos.x && entrance.y == pos.y) {
                return entrance;
            }
        }
    }

    loadVillagersSheets(gameScene: GameScene) {
        // if (!this.mapObj.villager) return;
        for (const villager of this.mapObj.villagers) {
            const asset = gameScript.villager(villager.villager);
            // console.log(`load villager sheet key: ${villager.name} asset:${asset.asset}`)
            gameScene.load.spritesheet(villager.name, asset.asset, {
                frameWidth: 16,
                frameHeight: 16,
              });
        }
    }

    loadEnemiesSheets(gameScene: GameScene) {
        if (!this.mapObj.enemies) return;
        for (const enemy of this.mapObj.enemies) {
            const asset = gameScript.enemy(enemy.enemy);
            console.log(`load enemy sheet key: ${asset.name} asset:${asset.asset}`)
            let width = (asset.slice) ? asset.slice.width : 16;
            let height = (asset.slice) ? asset.slice.height : 16;
            console.log(`enemy size (${width}, ${height})`)
            gameScene.load.spritesheet(`enemy_${enemy.enemy}`, asset.asset, {
                frameWidth: width,
                frameHeight: height,
              });
        }
    }

    createVillagers(gameScene: GameScene, tileMap: Phaser.Tilemaps.Tilemap): [Villager] {
        return this.mapObj.villagers.map( (villager: any) => Villager.create(gameScene, tileMap, villager));
    }

    createEnemies(gameScene: GameScene, tilemap: Phaser.Tilemaps.Tilemap): Enemy[] {
        if (!this.mapObj.enemies) return[];
        console.log("create enemies");
        const collideTiles: boolean[][] = [];
        for (let i = 0; i < tilemap.height; i++) {
          const row = [];
          for (let j = 0; j < tilemap.width; j++) {
            row.push(false);
          }
          collideTiles.push(row);
        }

        tilemap.layers.forEach(layer => {
            layer.data.forEach(row => {
                row.forEach(tile => {
                    if (tile.properties.collides) {
                        collideTiles[tile.y][tile.x] = true;
                    }
                })
            })
        });

        const availableTiles: Phaser.Math.Vector2[] = [];
        for (let i = 0; i < tilemap.height; i++) {
            const row = [];
            for (let j = 0; j < tilemap.width; j++) {
              if (!collideTiles[i][j])
                // console.log(`available tile @ (${j},${i})`)
                availableTiles.push(new Phaser.Math.Vector2(j,i));
            }
        }
        console.log(`number of availableTiles is ${availableTiles.length}`);

        const enemies: Enemy[] = [];
        for (const enemy of this.mapObj.enemies) {
            const asset = gameScript.enemy(enemy.enemy);
            if (enemy.count) {
                for (let i=0; i<enemy.count; i++) {
                    const randomIndex = Math.floor(Math.random() * availableTiles.length);
                    const pos = availableTiles.splice(randomIndex, 1)[0];
                    enemies.push(Enemy.create(gameScene, i, pos, tilemap, {...enemy,...asset}));
                }
            }
        }

        return enemies;
    }         
}

export default GameMap;