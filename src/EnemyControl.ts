import { Direction } from "./Direction";
import { GridPhysics } from "./GridPhysics";
import Enemy from "./Enemy";

export class EnemyControl {
    constructor(
        private gridPhysics: GridPhysics,
        private Villain: Enemy
      ) {}
    
      private lastUpdate?: number;
      private currentDirection : Direction = Direction.NONE;
      update(time: number) {
        if (!this.Villain.shouldMove()) return;
        let shouldUpdate = true;
        if (this.lastUpdate && time - this.lastUpdate < 1000) {
            shouldUpdate = false;
        }
        if (shouldUpdate) {
            this.lastUpdate = time;
            const newDirection = Math.floor(Math.random() * 4) + 1;
            this.currentDirection = Object.values(Direction)[newDirection];
        }
        this.gridPhysics.movePlayer(this.currentDirection);
      }
}