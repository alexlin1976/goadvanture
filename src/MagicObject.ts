import { Direction } from "./Direction";
import Enemy from "./Enemy";
import { GameScene } from "./GameScene";
import { UserPlayer } from "./UserPlayer";

export default class MagicObject {

    private circleGraphics?: Phaser.GameObjects.Graphics;
    private circleX: number;
    private circleY: number;
    
    constructor(
        gameScene: GameScene,
        private player: UserPlayer,
        private movingSpeed: number,
        private movingRange: number,
        private direction: Direction
    ) {
        this.circleGraphics = gameScene.add.graphics();
        let x = player.getPosition().x;
        let y = player.getPosition().y;
        switch (direction) {
            case Direction.UP: y -= GameScene.TILE_SIZE / 2; break;
            case Direction.DOWN: y += GameScene.TILE_SIZE / 2; break;
            case Direction.LEFT: x -= GameScene.TILE_SIZE / 2; break;
            case Direction.RIGHT: x += GameScene.TILE_SIZE / 2; break;
        }
        this.circleGraphics.fillStyle(0xFF0000);
        this.circleGraphics.fillCircle(x, y, 10);
        this.circleX = x;
        this.circleY = y;
        this.circleGraphics.setDepth(3);
    }

    private movedDistance = 0;
    update(_delta: number, tileMap: Phaser.Tilemaps.Tilemap, enemies: Array<Enemy>) {
        const distance = this.movingSpeed * _delta / 1000;
        if (!this.circleGraphics) return;
        let x = this.circleX;
        let y = this.circleY;
        switch (this.direction) {
            case Direction.UP: y -= distance; break;
            case Direction.DOWN: y += distance; break;
            case Direction.LEFT: x -= distance; break;
            case Direction.RIGHT: x += distance; break;
        }
        this.circleGraphics.clear();
        this.circleGraphics.fillStyle(0xFF0000);
        this.circleGraphics.fillCircle(x, y, 6);
        this.circleX = x;
        this.circleY = y;
        this.movedDistance += distance;
        if (this.movedDistance >= this.movingRange) {
            console.log("magic is gone!");
            this.circleGraphics?.destroy();
            this.player.magicDone(this);
            return;
        }
        tileMap.layers.forEach(layer => {
            const tile = tileMap.getTileAtWorldXY(x, y, false, undefined, layer.name);
            if (tile && tile.properties.collides) {
                console.log('magic is gone earier because hit wall');
                this.circleGraphics?.destroy();
                this.player.magicDone(this);
                return;
            }
        });

        enemies.forEach( enemy => {
            const rect = new Phaser.Geom.Rectangle(enemy.getPosition().x - GameScene.TILE_SIZE / 2, enemy.getPosition().y - GameScene.TILE_SIZE / 2, GameScene.TILE_SIZE, GameScene.TILE_SIZE);
            if (rect.contains(x, y)) {
                enemy.hitby(this.getAttackPoint(), this.player);
                this.circleGraphics?.destroy();
                this.player.magicDone(this);
                return;
            }
        });
    }

    getAttackPoint(): integer {
        return 10;
    }
}

export class Fireball extends MagicObject {

}