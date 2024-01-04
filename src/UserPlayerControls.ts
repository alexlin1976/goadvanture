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
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const dKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    let attacking = false;
    let casting = false;
    if (space.isDown) {
      attacking = true;
    }
    if (dKey.isDown) {
      casting = true;
    }
    attacking = this.userPlayer.setUserAttacking(attacking, _time);
    casting = this.userPlayer.setUserCasting(casting, _time);
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.left.isDown) {
      this.gridPhysics.movePlayer(Direction.LEFT, attacking || casting);
      this.doorControls.movePlayer(Direction.LEFT);
    } else if (cursors?.right.isDown) {
      this.gridPhysics.movePlayer(Direction.RIGHT, attacking || casting);
      this.doorControls.movePlayer(Direction.RIGHT);
    } else if (cursors?.up.isDown) {
      this.gridPhysics.movePlayer(Direction.UP, attacking || casting);
      this.doorControls.movePlayer(Direction.UP);
    } else if (cursors?.down.isDown) {
      this.gridPhysics.movePlayer(Direction.DOWN, attacking || casting);
      this.doorControls.movePlayer(Direction.DOWN);
    }
    else {
      this.userPlayer.stopAnimation(this.userPlayer.getFaceDirection());
    }
  }
}