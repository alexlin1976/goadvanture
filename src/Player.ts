import { Direction } from "./Direction";
import { GameScene } from "./GameScene";

export class Player {
  private bubbleGraphics: Phaser.GameObjects.Graphics;
  private bubbleText: Phaser.GameObjects.Text;
  constructor(
    private key: string,
    private sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
    gameScene: GameScene
  ) {
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
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  name(): string {
    return this.key;
  }

  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }

  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getCenter();
  }

  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }

  private currentDirection?: Direction;
  private faceDirection = Direction.NONE;

  stopAnimation(direction: Direction) {
    this.currentDirection = undefined;
    const animationManager = this.sprite.anims.animationManager;
    const standingFrame = animationManager.get(this.animationkey(direction, "moving")).frames[1].frame.name;
    this.sprite.anims.stop();
    this.sprite.setFrame(standingFrame);
  }

  startAnimation(direction: Direction) {
    this.currentDirection = direction;
    this.sprite.anims.play(this.animationkey(direction, "moving"));
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

  createAnimation(gameScene: GameScene, start: integer, end: integer, direction: string, state: string) {
    if (gameScene.anims.get(this.animationkey(direction, state))) return;
    gameScene.anims.create({
        key: this.animationkey(direction, state),
        frames: gameScene.anims.generateFrameNumbers(this.key, {
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
}