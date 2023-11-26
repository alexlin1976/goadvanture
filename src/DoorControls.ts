import { GameScene } from "./GameScene";
import { Direction } from "./Direction";
import { UserPlayer } from "./UserPlayer";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export class DoorControls {
  private lastMovementIntent = Direction.NONE;
  constructor(private player: UserPlayer, private tileMap: Phaser.Tilemaps.Tilemap, private gameScene: GameScene) {}
  private doing = false

  private isClosedDoorTileInDirection(direction: Direction): boolean {
    return this.isClosedDoorTile(this.tilePosInDirection(direction));
  }

  private tilePosInDirection(direction: Direction): Vector2 {
    return this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction] ?? new Vector2());
  }

  private animatedTileSprite: Phaser.GameObjects.Sprite | undefined;
  private isClosedDoorTile(pos: Vector2): boolean {
    if (this.hasNoTile(pos)) return true;
    return this.tileMap.layers.some((layer) => {
      const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
      if (!this.doing && tile && tile.properties.closedDoors) {
        this.doing = true;
        const tilePosition = this.tileMap.tileToWorldXY(tile.x, tile.y)!;
        this.animatedTileSprite = this.gameScene.add.sprite(tilePosition.x + 24, tilePosition.y + 24, tile.properties.animation);
        this.animatedTileSprite.scale = 3;
        console.log(`open door @ tile ${pos.x},${pos.y}`)
        this.gameScene.anims.create({
            key: 'spriteAnimation',
            frames: this.gameScene.anims.generateFrameNumbers(tile.properties.animation, { start: tile.properties.start, end: tile.properties.end }),
            frameRate: 10,
            repeat: 0,
          });
        tile.visible = false;
        this.animatedTileSprite.setDepth(2);
        this.animatedTileSprite.play('spriteAnimation');
        this.animatedTileSprite.anims.play('spriteAnimation').on('animationcomplete', () => {
          this.animatedTileSprite?.destroy();
          this.tileMap.removeTileAt(pos.x, pos.y, true, undefined, layer.name)
          this.gameScene.anims.remove('spriteAnimation');
          this.doing = false;
      });
    
        return true;
      }
      return false;
    });
  }
  
  private hasNoTile(pos: Vector2): boolean {
    return !this.tileMap.layers.some((layer) =>
      this.tileMap.hasTileAt(pos.x, pos.y, layer.name)
    );
  }
 
  private movementDirectionVectors: {
    [key in Direction]?: Vector2;
  } = {
    [Direction.UP]: Vector2.UP,
    [Direction.DOWN]: Vector2.DOWN,
    [Direction.LEFT]: Vector2.LEFT,
    [Direction.RIGHT]: Vector2.RIGHT,
  };

  movePlayer(direction: Direction): void {
    this.lastMovementIntent = direction;
    if (this.isClosedDoorTileInDirection(direction)) {
        console.log("Encountered closed door")
    }
  }

  update() {
  }
}