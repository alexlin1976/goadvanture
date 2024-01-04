import { Direction } from "./Direction";
import Enemy from "./Enemy";
import GameMap from "./GameMap";
import { GameScene } from "./GameScene";
import MagicObject, { Fireball } from "./MagicObject";
import { Player } from "./Player";
import PlayerData from "./PlayerData";
import Reward, { Exp, Gold } from "./Reward";
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
    gamescene.load.spritesheet("player-dead", "assets/Odderf-Death-Sheet.png", {
      frameWidth: 32,
      frameHeight: 16,
    });
  }

  private range: integer = 15;
  private userAttacking = false;
  private userCasting = false;
  private lastStartCasting: number | null = null;
  private castingPeriod: number = 1000;

  swordSprite!: Phaser.GameObjects.Sprite;
  constructor(
    private playerData: PlayerData,
    private tileMap: Phaser.Tilemaps.Tilemap, 
    tilePos: Phaser.Math.Vector2,
    private gamescene: GameScene,
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

    gamescene.anims.create({
      key: "player-death",
      frames: gamescene.anims.generateFrameNumbers(
        "player-dead", {
          start: 6,
          end: 12
      }),
      frameRate: 10,
      repeat: 0
  });
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

  setUserAttacking(attacking: boolean, _time: number): boolean {
    if (this.userAttacking == attacking) return this.userAttacking;
    if (this.lastAttack && _time - this.lastAttack < this.playerData.getAttackSpeed()) return this.userAttacking;
    this.userAttacking = attacking;
    if (this.userAttacking) this.startAnimation(this.getFaceDirection(), this.userAttacking);
    else this.stopAnimation(this.getFaceDirection());
    return this.userAttacking;
  }

  setUserCasting(casting: boolean, _time: number): boolean {
    if (this.userCasting && this.lastStartCasting && 
      (_time - this.lastStartCasting) < this.castingPeriod) {
        return true;
    }
    if (casting && !this.userCasting) {
      this.userCasting = true;
      this.lastStartCasting = _time;
      this.startMagic();
      setTimeout(() => {
        console.log("Magic cool down");
        this.userCasting = false;
      }, this.playerData.getCastCoolDown());
      return true;
    }
    return false;
  }

  private magicObjects: MagicObject[] = [];
  startMagic() {
    console.log("start magic!!!");
    const magicObject = new Fireball(this.gamescene, this, 200, 100, this.getFaceDirection());
    this.magicObjects.push(magicObject);
  }

  magicDone(finished: MagicObject) {
    this.magicObjects = this.magicObjects.filter(obj => obj !== finished);
  }

  currentInteractive?: any = null;
  update(villagers: Array<Villager>, interact: boolean, enemies: Array<Enemy>, _delta: number, _time: number) {
    if (this.isDead()) return;
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

    if (this.magicObjects) {
      this.magicObjects.forEach(element => {
        element.update(_delta, this.tileMap, enemies);
      });
    }

    this.updateEnemies(enemies, _time, this.playerData.getAp(), this.playerData.getAttackSpeed(), this.range);
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
    if (this.userAttacking) return;
    this.swordSprite.visible = false;
    super.stopAnimation(direction);
  }

  setPosition(position: Phaser.Math.Vector2): void {
    super.setPosition(position);
    this.swordSprite.setPosition(position.x, position.y);
  }

  hitby(ap: number, player: Player): void {
    this.playerData.changeHp(-ap);
    this.drawHealthBar();

    if (this.playerData.getHp() <= 0)
      this.dead();
  }

  dead(destroy?: boolean): void {
    super.dead(false);
    this.stopAnimation(Direction.NONE);
    this.sprite.setTexture("player-dead");
    this.sprite.anims.play("player-death").on('animationcomplete', () => {
      this.sprite.anims.stop();
    });

  }

  getHealth(): number {
    return this.playerData.getHp() / this.playerData.getMaxHp();
  }

  private textQueue: string[] = [];
  private drawTextUp(text: string) {
    this.textQueue.push(text);

    // Check if no text is currently being shown
    if (this.textQueue.length === 1) {
      this.showNextText();
    }
  }

  private showNextText() {
    const nextText = this.textQueue[0];

    if (nextText) {
      const text = this.getSprite().scene.add.text(this.getPosition().x + 24, this.getPosition().y + 24, nextText, {
        fontSize: '24px',
        color: '#FFA500',
      });
      text.setOrigin(0.5, 0.5);
      text.setDepth(5);

      this.getSprite().scene.tweens.add({
        targets: text,
        y: this.getPosition().y - 24,
        duration: 500,
        ease: 'Linear',
        onComplete: () => {
          // Remove the displayed text from the queue
          this.textQueue.shift();
          text.destroy();
          // Show the next text if the queue is not empty
          if (this.textQueue.length > 0) {
            this.showNextText();
          }
        },
      });
    }
  }

  receiveRewards(rewards: Reward[]): void {
    let levelUp: boolean = false;
    for (const reward of rewards) {
      if (reward instanceof Exp) {
        const exp: Exp = reward;
        console.log(`get ${exp.getAmount()} EXP`);
        this.drawTextUp(`${exp.getAmount()} EXP`);
        levelUp = this.playerData.changeExperience(exp.getAmount());
      }
      else if (reward instanceof Gold) {
        const gold: Gold = reward;
        console.log(`get ${gold.getAmount()} golds`);
        this.drawTextUp(`${gold.getAmount()} G`);
        this.playerData.changeGold(gold.getAmount());
      }
    }
    if (levelUp) {
      this.drawTextUp("LEVEL UP!!!");
    }
    this.playerData.save();
  }
}