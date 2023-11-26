// GameScriptLoader.ts

import GameMap from "./GameMap";

class GameScriptLoader {
  script: any;
  constructor() {
  }

  async loadScript(): Promise<void> {
    try {
      const response = await fetch('assets/GameScript.json');

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const script: any = await response.json(); // Adjust 'any' based on your JSON structure
      this.script = script; // Exporting to a global variable

      console.log('Game script loaded:', script);
    } catch (error) {
      console.error('Error during script loading:', error);
    }
  }

  startScene() {
    return this.script.startMap;
  }

  gamemap(key: string): GameMap {
    return new GameMap(this.script.maps[key]);
  }

  villager(key: string): any {
    return this.script.villagers[key];
  }
}
  
  export default GameScriptLoader;
  export const gameScript = new GameScriptLoader();