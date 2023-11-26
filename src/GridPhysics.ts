import { GameScene } from "./GameScene";
import { Direction } from "./Direction";
import { Player } from "./Player";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export class GridPhysics {
  private movementDirection: Direction = Direction.NONE;
  private lastMovementIntent = Direction.NONE;
  private tileSizePixelsWalked: number = 0;
  constructor(private player: Player,
     private tileMap: Phaser.Tilemaps.Tilemap, 
     private speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4,
     private geoFence?: Phaser.Geom.Rectangle) {}

  private isBlockingDirection(direction: Direction): boolean {
    const pos = this.tilePosInDirection(direction);
    return this.hasBlockingTile(pos) ||
    this.hasAnotherPlayer(pos);
  }

  private isCrossingFence(direction: Direction): boolean {
    if (this.geoFence) {
      const pos = this.tilePosInDirection(direction);
      if (pos.x <= this.geoFence.left || pos.x >= this.geoFence.right ||
        pos.y <= this.geoFence.top || pos.y >= this.geoFence.bottom)
        return true;
    }
    return false;
  }

  private tilePosInDirection(direction: Direction): Vector2 {
    return this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction] ?? new Vector2());
  }

  private hasBlockingTile(pos: Vector2): boolean {
    if (this.hasNoTile(pos)) return true;
    return this.tileMap.layers.some((layer) => {
      const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  private hasAnotherPlayer(pos: Vector2): boolean {
    return this.currentPlayers.some(player => player.getTilePos().x == pos.x && player.getTilePos().y == pos.y);
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
    this.player.setFaceDirection(direction);
    this.lastMovementIntent = direction;
    if (this.isMoving()) return;
    if (this.isBlockingDirection(direction) || this.isCrossingFence(direction)) {
      this.player.stopAnimation(direction);
    } else {
      this.startMoving(direction);
    }
  }

  private isMoving(): boolean {
    return this.movementDirection != Direction.NONE;
  }

  private startMoving(direction: Direction): void {
    this.player.startAnimation(direction);
    this.movementDirection = direction;
    this.updatePlayerTilePos();
  }

  private stopMoving(): void {
    this.player.stopAnimation(this.movementDirection);
    this.movementDirection = Direction.NONE;
  }

  private currentPlayers: Array<Player> = [];
  update(delta: number, players: Array<Player>) {
    this.currentPlayers = players;
    if (this.isMoving()) {
      this.updatePlayerPosition(delta);
    }
    this.lastMovementIntent = Direction.NONE;
  }

  private updatePlayerPosition(delta: number) {
    const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);

    if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
    } else if (this.shouldContinueMoving()) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
      this.updatePlayerTilePos();
    } else {
      this.movePlayerSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
      this.stopMoving();
    }
  }

  private updatePlayerTilePos() {
    this.player.setTilePos(
      this.player
        .getTilePos()
        .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
    );
  }

  private shouldContinueMoving(): boolean {
    return (
      this.movementDirection == this.lastMovementIntent &&
      !(this.isBlockingDirection(this.lastMovementIntent) ||
      this.isCrossingFence(this.lastMovementIntent))
    );
  }

  private movePlayerSprite(pixelsToMove: number) {
    const directionVec = this.movementDirectionVectors[
      this.movementDirection
    ]?.clone();
    const movementDistance = directionVec?.multiply(new Vector2(pixelsToMove));
    const newPlayerPos = this.player.getPosition().add(movementDistance ?? new Vector2());
    this.player.setPosition(newPlayerPos);
    this.tileSizePixelsWalked += pixelsToMove;
    this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
  }

  private willCrossTileBorderThisUpdate(
    pixelsToWalkThisUpdate: number
  ): boolean {
    return (
      this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
    );
  }

 private getPixelsToWalkThisUpdate(delta: number): number {
   const deltaInSeconds = delta / 1000;
   return this.speedPixelsPerSecond * deltaInSeconds;
 }
}