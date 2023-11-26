import { LEFT } from "phaser";
import { Direction, getDirectionFromString } from "./Direction";
import { GameScene } from "./GameScene";
import { gameScript } from "./GameScriptLoader";
import { GridPhysics } from "./GridPhysics";
import { Player } from "./Player";
import { VillagerControl } from "./VillagerControl";

export enum VillagerState {
    IDLE = "idle",
    WALKING = "walking",
}

class Villager extends Player {
    private state: VillagerState;
    constructor(
        sprite: Phaser.GameObjects.Sprite,
        tilePos: Phaser.Math.Vector2,
        gamescene: GameScene,
        tileMap: Phaser.Tilemaps.Tilemap,
        private villager: any,
    ) {
        super(villager.name, sprite,tilePos,gamescene);
        this.state = villager.state == "stay" ? VillagerState.IDLE : VillagerState.WALKING;
        const movingframe = gameScript.villager(this.villager.villager).movingframe;
        if (movingframe) {
            this.createAnimationByFrame(gamescene, movingframe.left, Direction.LEFT, "moving");
            this.createAnimationByFrame(gamescene, movingframe.right, Direction.RIGHT, "moving");
            this.createAnimationByFrame(gamescene, movingframe.up, Direction.UP, "moving");
            this.createAnimationByFrame(gamescene, movingframe.down, Direction.DOWN, "moving");
        }
        const idleframe = gameScript.villager(this.villager.villager).idleframe;
        if (idleframe) {
            this.createAnimationByFrame(gamescene, idleframe.left, Direction.LEFT, "idle");
            this.createAnimationByFrame(gamescene, idleframe.right, Direction.RIGHT, "idle");
            this.createAnimationByFrame(gamescene, idleframe.up, Direction.UP, "idle");
            this.createAnimationByFrame(gamescene, idleframe.down, Direction.DOWN, "idle");
        }
        let defaultDirection = Direction.DOWN;
        if (villager.defaultDirection) {
            const direction = getDirectionFromString(villager.defaultDirection);
            if (direction)
                defaultDirection = direction;
        }
        this.setFaceDirection(defaultDirection);

        let rect: Phaser.Geom.Rectangle | undefined;
        if (this.villager.movingrange) {
            const left = this.villager.pos.x - this.villager.movingrange.width;
            const top = this.villager.pos.y - this.villager.movingrange.height;
            rect = new Phaser.Geom.Rectangle(left, top, this.villager.movingrange.width * 2, this.villager.movingrange.height * 2);
        }

        this.gridPhysics = new GridPhysics(this, tileMap, GameScene.TILE_SIZE * 1.7, rect);
        this.villagerControl = new VillagerControl(this.gridPhysics, this);
    }

    gridPhysics!: GridPhysics
    villagerControl!: VillagerControl
    static create(gameScene: GameScene, tileMap: Phaser.Tilemaps.Tilemap, villager: any): Villager {
        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE * 0.3;
        const sprite = gameScene.add.sprite(villager.pos.x * GameScene.TILE_SIZE + offsetX,
             villager.pos.y * GameScene.TILE_SIZE + offsetY,
             villager.name);
        sprite.setDepth(3);
        sprite.scale = 3;
        return new Villager(sprite, new Phaser.Math.Vector2(villager.pos.x, villager.pos.y), gameScene, tileMap, villager);
    }

    shouldMove(): boolean {
        return this.state == VillagerState.WALKING;
    }

    createAnimationByFrame(gameScene: GameScene, frame: any, direction: string, state: string) {
        this.createAnimation(gameScene, frame.start, frame.end, direction, state);
    }

    update(time: number, delta: number, players: Array<Player>) {
        this.villagerControl.update(time);
        this.gridPhysics.update(delta, players);
    }

    private talking = false;
    talk(player?: Player) {
        if (this.talking) return;
        this.talking = true;
        const prevState = this.state;
        this.state = VillagerState.IDLE;
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

        const arr = this.villager.sentences;
        const randomIndex = Math.floor(Math.random() * arr.length);
        this.showBubleText(arr[randomIndex]);
        setTimeout(() => {
            this.hideBubbleText();
            this.talking = false;
            this.state = prevState;
            if (this.state == VillagerState.WALKING) {
                this.startAnimation(this.getDirection()!);
            }
        }, 2000);
    }
    
    setFaceDirection(direction: Direction): void {
        super.setFaceDirection(direction);
        if (this.state == VillagerState.IDLE)
            this.getSprite().play(this.animationkey(direction, "idle"));
    }
}
export default Villager;