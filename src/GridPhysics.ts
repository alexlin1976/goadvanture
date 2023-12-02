import { GameScene } from "./GameScene";
import { Direction } from "./Direction";
import { Player } from "./Player";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export class GridPhysics {
  private movementDirection: Direction = Direction.NONE;
  private lastMovementIntent = Direction.NONE;
  constructor(private player: Player,
     private tileMap: Phaser.Tilemaps.Tilemap, 
     private speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4,
     private geoFence?: Phaser.Geom.Rectangle) {}

  private isBlockingByMoving(direction: Direction, pixelsToMove: number): boolean {
    const directionVec = this.movementDirectionVectors[
      direction
    ]?.clone();
    const movementDistance = directionVec?.multiply(new Vector2(pixelsToMove));
    const newPlayerPos = this.player.getPosition().add(movementDistance ?? new Vector2());
    if (this.hasAnotherPlayer(newPlayerPos)) return true;
    switch (direction) {
      case Direction.LEFT: newPlayerPos.x -= GameScene.TILE_SIZE / 2; break;
      case Direction.RIGHT: newPlayerPos.x += GameScene.TILE_SIZE / 2; break;
      case Direction.DOWN: break;
      case Direction.UP: newPlayerPos.y -= GameScene.TILE_SIZE / 3 * 1;break;
    }
    if (newPlayerPos.x < 0 || newPlayerPos.y < 0 || 
      newPlayerPos.x >= this.tileMap.widthInPixels * 3 || newPlayerPos.y >= this.tileMap.heightInPixels * 3)
      return true;
    
    return this.tileMap.layers.some((layer) => {
      const tile = layer.tilemapLayer.getTileAtWorldXY(newPlayerPos.x, newPlayerPos.y);
      if (tile)
      return tile && tile.properties.collides;
    });
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

  private hasAnotherPlayer(pos: Vector2): boolean {
    const playerRect = new Phaser.Geom.Rectangle(pos.x - GameScene.TILE_SIZE / 2, pos.y - GameScene.TILE_SIZE / 3, GameScene.TILE_SIZE, GameScene.TILE_SIZE / 3.0);
    return this.currentPlayers.some(player => player !== this.player && Phaser.Geom.Rectangle.Overlaps(playerRect, player.getSprite().getBounds()));
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
    if (this.isMoving()) {
      return;
    }
      this.startMoving(direction);
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

    if (this.shouldContinueMoving(pixelsToWalkThisUpdate)) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
      this.updatePlayerTilePos();
    }
    else {
      this.stopMoving();
    }
  }

  private updatePlayerTilePos() {
    this.player.setTilePos(
      new Phaser.Math.Vector2(
        Math.floor((this.player.getPosition().x) / GameScene.TILE_SIZE), 
        Math.floor((this.player.getPosition().y) / GameScene.TILE_SIZE)));
  }

  private shouldContinueMoving(pixelsToMove: number): boolean {
    return (
      this.movementDirection == this.lastMovementIntent &&
      !this.isBlockingByMoving(this.lastMovementIntent, pixelsToMove));
  }

  private movePlayerSprite(pixelsToMove: number) {
    const directionVec = this.movementDirectionVectors[
      this.movementDirection
    ]?.clone();
    const movementDistance = directionVec?.multiply(new Vector2(pixelsToMove));
    const newPlayerPos = this.player.getPosition().add(movementDistance ?? new Vector2());
    this.player.setPosition(newPlayerPos);
  }

 private getPixelsToWalkThisUpdate(delta: number): number {
   const deltaInSeconds = delta / 1000;
   return this.speedPixelsPerSecond * deltaInSeconds;
 }
}