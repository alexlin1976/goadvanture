import { Direction } from "./Direction";
import GameMap from "./GameMap";
import { GameScene } from "./GameScene";
import { Player } from "./Player";
import Villager from "./Villager";

export class UserPlayer extends Player {
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    private tileMap: Phaser.Tilemaps.Tilemap, 
    tilePos: Phaser.Math.Vector2,
    gamescene: GameScene,
    private gamemap: GameMap,
    private newMap: (newMap: any) => void,
  ) {
    super("player",sprite,tilePos,gamescene);
    this.createAnimation(gamescene, 0, 5, Direction.UP, "moving");
    this.createAnimation(gamescene, 18, 23, Direction.RIGHT, "moving");
    this.createAnimation(gamescene, 6, 11, Direction.DOWN, "moving");
    this.createAnimation(gamescene, 12, 17, Direction.LEFT, "moving");
  }
  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    super.setTilePos(tilePosition);
    const nextMap = this.gamemap.checkEntrance(this.getTilePos());
    if (nextMap != null) {
      this.newMap(nextMap);
    }
  }

  private faceDirectionVectors: {
    [key in Direction]?: Phaser.Math.Vector2;
  } = {
    [Direction.UP]: Phaser.Math.Vector2.UP,
    [Direction.DOWN]: Phaser.Math.Vector2.DOWN,
    [Direction.LEFT]: Phaser.Math.Vector2.LEFT,
    [Direction.RIGHT]: Phaser.Math.Vector2.RIGHT,
  };

  currentInteractive?: any = null;
  update(villagers: Array<Villager>, interact: boolean) {
    const prevInteractive = this.currentInteractive;
    const addition = this.faceDirectionVectors[this.getFaceDirection()];
    if (addition) {
      const pos = this.getTilePos().add(addition);
      const interactiveTile = this.tileMap.layers.find((layer) => {
        const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
        if (tile && tile.properties.interactive) return tile;
      });
      if (interactiveTile) this.currentInteractive = interactiveTile;
      else {
        const interactiveVillager = villagers.find(villager => villager.getTilePos().x == pos.x && villager.getTilePos().y == pos.y);
        if (interactiveVillager) this.currentInteractive = interactiveVillager;
        else this.currentInteractive = null;
      }
    }

    if (interact) {
      this.hideBubbleText();
      if (this.currentInteractive instanceof Villager) {
        this.currentInteractive.talk(this);
      }
    }
    else {
      this.showHint(prevInteractive);
    }
  }

  private showHint(prevInteractive?: any) {
    if (this.currentInteractive) {
      if (this.currentInteractive !== prevInteractive) {
        
        if (this.currentInteractive instanceof Villager) {
          this.showBubleText(`按下\"a\"與${this.currentInteractive.name()}交談`);
        }
        else {
          this.showBubleText("按下\"a\"來互動");
        }
      }
    }
    else {
      this.hideBubbleText();
    }
  }
}