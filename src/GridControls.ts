import { Direction } from "./Direction";
import { DoorControls } from "./DoorControls";
import { GridPhysics } from "./GridPhysics";

export class GridControls {
  constructor(
    private input: Phaser.Input.InputPlugin,
    private gridPhysics: GridPhysics,
    private doorControls: DoorControls,
  ) {}

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.left.isDown) {
      this.gridPhysics.movePlayer(Direction.LEFT);
      this.doorControls.movePlayer(Direction.LEFT);
    } else if (cursors?.right.isDown) {
      this.gridPhysics.movePlayer(Direction.RIGHT);
      this.doorControls.movePlayer(Direction.RIGHT);
    } else if (cursors?.up.isDown) {
      this.gridPhysics.movePlayer(Direction.UP);
      this.doorControls.movePlayer(Direction.UP);
    } else if (cursors?.down.isDown) {
      this.gridPhysics.movePlayer(Direction.DOWN);
      this.doorControls.movePlayer(Direction.DOWN);
    }
  }
}