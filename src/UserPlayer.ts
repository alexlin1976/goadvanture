import { Direction } from "./Direction";
import Enemy from "./Enemy";
import GameMap from "./GameMap";
import { GameScene } from "./GameScene";
import { Player } from "./Player";
import Villager from "./Villager";

export class UserPlayer extends Player {
  static preload(gamescene: GameScene) {
    gamescene.load.spritesheet("player", "assets/Odderf-Walk-Sheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    gamescene.load.spritesheet("player-attack", "assets/Odderf-Attack-Sheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    gamescene.load.spritesheet("player-sword", "assets/Odderf-Sword-Sheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  private maxHp: integer = 100;
  private hp: integer = 100;
  private ap: integer = 3;
  private range: integer = 10;
  private attackingSpeed = 1000;

  swordSprite!: Phaser.GameObjects.Sprite;
  constructor(
    private tileMap: Phaser.Tilemaps.Tilemap, 
    tilePos: Phaser.Math.Vector2,
    gamescene: GameScene,
    private gamemap: GameMap,
    private newMap: (newMap: any) => void,
  ) {
    // console.log(`start pos = (${tilePos.x}, ${tilePos.y})`)
    const playerSprite = gamescene.add.sprite(0, 0, "player");
    playerSprite.setDepth(3);
    playerSprite.scale = 3;

    gamescene.cameras.main.startFollow(playerSprite);
    gamescene.cameras.main.roundPixels = true;

    super("player",playerSprite,tilePos,gamescene);

    const swordSprite = gamescene.add.sprite(0, 0, "player-sword");
    swordSprite.setDepth(3.5);
    swordSprite.scale = 3;
    this.swordSprite = swordSprite;
    swordSprite.visible = false;

    this.createAnimation(gamescene, 0, 5, Direction.UP, "moving");
    this.createAnimation(gamescene, 18, 23, Direction.RIGHT, "moving");
    this.createAnimation(gamescene, 6, 11, Direction.DOWN, "moving");
    this.createAnimation(gamescene, 12, 17, Direction.LEFT, "moving");

    this.createAnimation(gamescene, 2, 6, Direction.UP, "attacking", "player-attack");
    this.createAnimation(gamescene, 28, 31, Direction.RIGHT, "attacking", "player-attack");
    this.createAnimation(gamescene, 11, 14, Direction.DOWN, "attacking", "player-attack");
    this.createAnimation(gamescene, 20, 24, Direction.LEFT, "attacking", "player-attack");

    this.createAnimation(gamescene, 2, 6, Direction.UP, "sword", "player-sword");
    this.createAnimation(gamescene, 28, 31, Direction.RIGHT, "sword", "player-sword");
    this.createAnimation(gamescene, 11, 14, Direction.DOWN, "sword", "player-sword");
    this.createAnimation(gamescene, 20, 24, Direction.LEFT, "sword", "player-sword");
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    super.setTilePos(tilePosition);
    // console.log(`player current pos = ${tilePosition.x}, ${tilePosition.y}`)
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
  update(villagers: Array<Villager>, interact: boolean, enemies: Array<Enemy>, _time: number) {
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

    this.updateEnemies(enemies, _time, this.ap, this.attackingSpeed, this.range);
    this.drawHealthBar();
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

  startAnimation(direction: Direction, isAttacking?: boolean): void {
    super.startAnimation(direction, isAttacking);
    if (isAttacking) {
      this.swordSprite.visible = true;
      this.swordSprite.anims.play(this.animationkey(direction, "sword"));
    }
  }

  stopAnimation(direction: Direction): void {
    // console.log(`current sword frame: ${this.swordSprite.anims.currentFrame?.index}`)
    this.swordSprite.visible = false;
    super.stopAnimation(direction);
  }

  setPosition(position: Phaser.Math.Vector2): void {
    super.setPosition(position);
    this.swordSprite.setPosition(position.x, position.y);
  }

  hitby(ap: number): void {
    this.hp -= ap;
    this.drawHealthBar();
  }

  getHealth(): number {
    return this.hp / this.maxHp;
  }
}