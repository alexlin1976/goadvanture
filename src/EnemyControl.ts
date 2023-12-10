import { Direction } from "./Direction";
import { GridPhysics } from "./GridPhysics";
import Enemy from "./Enemy";
import { UserPlayer } from "./UserPlayer";
import { Player } from "./Player";

export class EnemyControl {
    constructor(
        private gridPhysics: GridPhysics,
        private enemy: Enemy
      ) {}
    
    private lastUpdate?: number;
    private currentDirection : Direction = Direction.NONE;
    update(time: number, delta: number, userPlayers: Player[]) {
      if (!this.enemy.shouldMove()) return;
      const nearbyPlayer = this.checkNearbyPlayer(userPlayers);
      if (nearbyPlayer) {
        const newDiretion = this.gridPhysics.moveTowards(nearbyPlayer, delta);
        if (newDiretion) {
          this.lastUpdate = time;
          this.currentDirection = newDiretion;
          this.gridPhysics.movePlayer(this.currentDirection);
          // console.log(`chasing the player ${this.currentDirection}`);
          return;
        }
      }
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

    nearbyRange = 300;
    checkNearbyPlayer(userPlayers: Player[]): Player | null {
      const nearbys = userPlayers.filter(player => this.enemy.insideRange(player, this.nearbyRange));
      return nearbys.length > 0 ? nearbys[0] : null;
    }
}