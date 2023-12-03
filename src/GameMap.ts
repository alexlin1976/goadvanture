import { GameScene } from "./GameScene";
import { gameScript } from "./GameScriptLoader";
import Villager from "./Villager";

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
        for (const villager of this.mapObj.villagers) {
            const asset = gameScript.villager(villager.villager);
            // console.log(`load villager sheet key: ${villager.name} asset:${asset.asset}`)
            gameScene.load.spritesheet(villager.name, asset.asset, {
                frameWidth: 16,
                frameHeight: 16,
              });
        }
    }

    createVillagers(gameScene: GameScene, tileMap: Phaser.Tilemaps.Tilemap): [Villager] {
        return this.mapObj.villagers.map( (villager: any) => Villager.create(gameScene, tileMap, villager));
    }
}

export default GameMap;