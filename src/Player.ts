import { Direction } from "./Direction";
import { GameScene } from "./GameScene";
import Reward, { Exp, Gold } from "./Reward";

export class Player {
  private bubbleGraphics: Phaser.GameObjects.Graphics;
  private bubbleText: Phaser.GameObjects.Text;
  private healthBar: Phaser.GameObjects.Graphics;
  private attacking: boolean = false;
  sprite: Phaser.GameObjects.Sprite;
  constructor(
    private key: string,
    sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
    gameScene: GameScene
  ) {
    this.sprite = sprite;
    this.sprite.setPosition(
      tilePos.x * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
      tilePos.y * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2
    );

    var graphics = gameScene.add.graphics();
    var text = gameScene.add.text(0, 0, "", {fontSize: '16px'});
    graphics.visible = false;
    graphics.depth = 6;
    text.visible = false;
    text.depth = 7;
    this.bubbleGraphics = graphics;
    this.bubbleText = text;
    this.healthBar = gameScene.add.graphics();
    this.healthBar.depth = 7;
  }

  isAttacking(): boolean {
    return this.attacking;
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  name(): string {
    return this.key;
  }

  getTilePos(): Phaser.Math.Vector2 {
    if (this._isDead) return new Phaser.Math.Vector2(-100, -100);
    return this.tilePos.clone();
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    if (this._isDead) return;
    this.tilePos = tilePosition.clone();
  }

  getPosition(): Phaser.Math.Vector2 {
    if (this._isDead) return new Phaser.Math.Vector2(-100, -100);
    return this.sprite.getCenter();
  }

  setPosition(position: Phaser.Math.Vector2): void {
    if (this._isDead) return;
    this.sprite.setPosition(position.x, position.y);
  }

  private currentDirection?: Direction;
  private faceDirection = Direction.NONE;

  stopAnimation(direction: Direction) {
    if (this._isDead) return;
    this.attacking = false;
    this.currentDirection = undefined;
    const animationManager = this.sprite.anims.animationManager;
    this.sprite.setTexture(this.key);
    this.sprite.anims.stop();
    if (direction == Direction.NONE) return;
    const standingFrame = animationManager.get(this.animationkey(direction, "moving")).frames[1].frame.name;
    this.sprite.setFrame(standingFrame);
  }

  startAnimation(direction: Direction, isAttacking: boolean = false) {
    if (this._isDead) return;
    this.attacking = isAttacking;
    this.currentDirection = direction;
    if (isAttacking) {
      this.sprite.setTexture(`${this.key}-attack`);
      this.sprite.anims.play(this.animationkey(direction, "attacking"));
    }
    else {
      this.sprite.setTexture(this.key);
      this.sprite.anims.play(this.animationkey(direction, "moving"));
    }
  }

  getDirection(): Direction | undefined {
    return this.currentDirection;
  }

  setFaceDirection(direction: Direction) {
    this.faceDirection = direction;
  }

  getFaceDirection(): Direction {
    return this.faceDirection;
  }

  animationkey(direction: string, state: string) {
    return `${this.key}_${state}_${direction}`;
  }

  createAnimation(gameScene: GameScene, start: integer, end: integer, direction: string, state: string, textureKey?: string) {
    if (gameScene.anims.get(this.animationkey(direction, state))) return;
    gameScene.anims.create({
        key: this.animationkey(direction, state),
        frames: gameScene.anims.generateFrameNumbers(
          textureKey ? textureKey : this.key, {
            start: start,
            end: end
        }),
        frameRate: 10,
        repeat: -1,
        yoyo: true
    });
  }

  showBubleText(text: string) {
    this.bubbleText.text = text;
    this.bubbleText.x = this.getSprite().x + 10;
    this.bubbleText.y = this.getSprite().y - 5 - 20 - this.bubbleText.height;
    this.bubbleGraphics.clear();
    this.bubbleGraphics.fillStyle(0x000000, 0.7);
    this.bubbleGraphics.fillRoundedRect(this.bubbleText.x - 10, this.bubbleText.y - 10, this.bubbleText.width + 20, this.bubbleText.height + 20, 10);
    this.bubbleText.visible = true;
    this.bubbleGraphics.visible = true;
  }

  hideBubbleText() {
    this.bubbleText.visible = false;
    this.bubbleGraphics.visible = false;
  }

  getHealth(): number {
    return 1.0;
  }

  drawHealthBar() {
    this.healthBar.clear();
    const { x, y } = this.sprite.getCenter();
    if (x && y) {
      this.healthBar.fillStyle(0x000000, 0.8);
      this.healthBar.fillRect(x - 10, y - 5 - 8 * 3, 20, 5);
      this.healthBar.fillStyle(0xff0000, 1);
      this.healthBar.fillRect(x - 10, y - 5 - 8 * 3, 20 * this.getHealth(), 5);
    }
  }

  private _isDead = false;
  dead(destroy: boolean = true) {
    this._isDead = true;
    if (destroy) {
      this.sprite.visible = false;
      this.sprite.destroy();
    }
    this.healthBar.visible = false;
    this.healthBar.destroy();
  }

  isDead(): boolean {
    return this._isDead;
  }

  insideRange(enemy: Player, range: integer): boolean {
    const ePos = enemy.getPosition();
    const pPos = this.getPosition();
    const distance = Math.sqrt(Math.pow(ePos.x - pPos.x, 2) + Math.pow(ePos.y - pPos.y, 2));
    return (distance < GameScene.TILE_SIZE + range);
  }

  // Attacking
  lastAttack?: number = undefined;
  updateEnemies(enemies: Array<Player>, _time: number, ap: integer, attackPeriod: integer, range: integer) {
    if (!this.isAttacking()) {
      this.lastAttack = undefined;
      return;
    }
    if (this.lastAttack && _time - this.lastAttack < attackPeriod) return;
    this.lastAttack = _time;
    for (const enemy of enemies) {
      if (this.insideRange(enemy, range)) {
        const ePos = enemy.getPosition();
        const pPos = this.getPosition();
          let facing = false;
        switch (this.getFaceDirection()) {
          case Direction.UP:facing = ePos.y <= pPos.y;break;
          case Direction.DOWN:facing = ePos.y >= pPos.y;break;
          case Direction.LEFT:facing = ePos.x <= pPos.x;break;
          case Direction.RIGHT:facing = ePos.x >= pPos.x;break;
          default:break;
        }
        if (facing) enemy.hitby(ap, this);
      }
    }
  }

  hitby(ap: integer, player: Player) {

  }

  receiveRewards(rewards: Reward[]) {
    console.log("Receiving rewards")
    for (const reward of rewards) {
      if (reward instanceof Exp) {
        const exp: Exp = reward;
        console.log(`get ${exp.getAmount()} experiences`);
      }
      if (reward instanceof Gold) {
        const gold: Gold = reward;
        console.log(`get ${gold.getAmount()} golds`);
      }
    }
  }
}