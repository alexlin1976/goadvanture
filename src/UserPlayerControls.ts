import { Direction } from "./Direction";
import { DoorControls } from "./DoorControls";
import { GridPhysics } from "./GridPhysics";
import { UserPlayer } from "./UserPlayer";

export class UserPlayerControls {
  constructor(
    private input: Phaser.Input.InputPlugin,
    private gridPhysics: GridPhysics,
    private userPlayer: UserPlayer,
    private doorControls: DoorControls,
  ) {}

  update(_time: number, delta: number) {
    const space = this.input.keyboard?.addKey("SPACE");
    const attacking = this.userPlayer.setUserAttacking(space?.isDown ?? false, _time);
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.left.isDown) {
      this.gridPhysics.movePlayer(Direction.LEFT, attacking);
      this.doorControls.movePlayer(Direction.LEFT);
    } else if (cursors?.right.isDown) {
      this.gridPhysics.movePlayer(Direction.RIGHT, attacking);
      this.doorControls.movePlayer(Direction.RIGHT);
    } else if (cursors?.up.isDown) {
      this.gridPhysics.movePlayer(Direction.UP, attacking);
      this.doorControls.movePlayer(Direction.UP);
    } else if (cursors?.down.isDown) {
      this.gridPhysics.movePlayer(Direction.DOWN, attacking);
      this.doorControls.movePlayer(Direction.DOWN);
    }
    else {
      this.userPlayer.stopAnimation(this.userPlayer.getFaceDirection());
    }
  }
}