import { LEFT } from "phaser";
import { Direction, getDirectionFromString } from "./Direction";
import { GameScene } from "./GameScene";
import { gameScript } from "./GameScriptLoader";
import { GridPhysics } from "./GridPhysics";
import { Player } from "./Player";
import { EnemyControl } from "./EnemyControl";

export enum EnemyState {
    IDLE = "idle",
    WALKING = "walking",
}

class Enemy extends Player {
    private state: EnemyState;
    constructor(
        sprite: Phaser.GameObjects.Sprite,
        tilePos: Phaser.Math.Vector2,
        gamescene: GameScene,
        tileMap: Phaser.Tilemaps.Tilemap,
        private enemy: any,
        private index: integer
    ) {
        super(enemy.name ?? `enemy_${enemy.enemy}_${index}`, sprite,tilePos,gamescene);
        this.state = enemy.state == "stay" ? EnemyState.IDLE : EnemyState.WALKING;
        const movingframe = gameScript.enemy(this.enemy.enemy).movingframe;
        if (movingframe) {
            this.createAnimationByFrame(gamescene, movingframe.left, Direction.LEFT, "moving");
            this.createAnimationByFrame(gamescene, movingframe.right, Direction.RIGHT, "moving");
            this.createAnimationByFrame(gamescene, movingframe.up, Direction.UP, "moving");
            this.createAnimationByFrame(gamescene, movingframe.down, Direction.DOWN, "moving");
        }
        const idleframe = gameScript.enemy(this.enemy.enemy).idleframe;
        if (idleframe) {
            this.createAnimationByFrame(gamescene, idleframe.left, Direction.LEFT, "idle");
            this.createAnimationByFrame(gamescene, idleframe.right, Direction.RIGHT, "idle");
            this.createAnimationByFrame(gamescene, idleframe.up, Direction.UP, "idle");
            this.createAnimationByFrame(gamescene, idleframe.down, Direction.DOWN, "idle");
        }
        let defaultDirection = Direction.DOWN;
        if (enemy.defaultDirection) {
            const direction = getDirectionFromString(enemy.defaultDirection);
            if (direction)
                defaultDirection = direction;
        }
        this.setFaceDirection(defaultDirection);

        let rect: Phaser.Geom.Rectangle | undefined;
        if (this.enemy.movingrange) {
            const left = this.enemy.pos.x - this.enemy.movingrange.width;
            const top = this.enemy.pos.y - this.enemy.movingrange.height;
            rect = new Phaser.Geom.Rectangle(left, top, this.enemy.movingrange.width * 2, this.enemy.movingrange.height * 2);
        }

        this.gridPhysics = new GridPhysics(this, tileMap, GameScene.TILE_SIZE * 1.7, rect);
        this.enemyControl = new EnemyControl(this.gridPhysics, this);
    }

    gridPhysics!: GridPhysics
    enemyControl!: EnemyControl
    static create(gameScene: GameScene, index: integer, pos: Phaser.Math.Vector2, tileMap: Phaser.Tilemaps.Tilemap, enemy: any): Enemy {
        const sprite = gameScene.add.sprite(pos.x * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
             pos.y * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
             `enemy_${enemy.enemy}`);
        sprite.setDepth(3);
        sprite.scale = 3;
        return new Enemy(sprite, new Phaser.Math.Vector2(pos.x, pos.y), gameScene, tileMap, enemy, index);
    }

    shouldMove(): boolean {
        return this.state == EnemyState.WALKING;
    }

    createAnimationByFrame(gameScene: GameScene, frame: any, direction: string, state: string) {
        this.createAnimation(gameScene, frame.start, frame.end, direction, state, `enemy_${this.enemy.enemy}`);
    }

    update(time: number, delta: number, players: Array<Player>) {
        this.enemyControl.update(time);
        this.gridPhysics.update(delta, players);
        this.drawHealthBar();
    }

    private talking = false;
    talk(player?: Player) {
        if (this.talking) return;
        this.talking = true;
        const prevState = this.state;
        this.state = EnemyState.IDLE;
        if (player) {
            const playerpos = player.getTilePos();
            let direction = Direction.NONE;
            if (player.getTilePos().x < this.getTilePos().x) {
                direction = Direction.LEFT;
            }
            else if (player.getTilePos().x > this.getTilePos().x) {
                direction = Direction.RIGHT;
            }
            else if (player.getTilePos().y < this.getTilePos().y) {
                direction = Direction.UP;
            }
            else {
                direction = Direction.DOWN;
            }
            this.setFaceDirection(direction);
        }

        const arr = this.enemy.sentences;
        const randomIndex = Math.floor(Math.random() * arr.length);
        this.showBubleText(arr[randomIndex]);
        setTimeout(() => {
            this.hideBubbleText();
            this.talking = false;
            this.state = prevState;
            if (this.state == EnemyState.WALKING) {
                this.startAnimation(this.getDirection()!);
            }
        }, 2000);
    }
    
    setFaceDirection(direction: Direction): void {
        super.setFaceDirection(direction);
        if (this.state == EnemyState.IDLE)
            this.getSprite().play(this.animationkey(direction, "idle"));
    }

    maxHp: integer = 10;
    hp: integer = 1;
    getHealth(): number {
        return this.hp / this.maxHp;
    }
}
export default Enemy;