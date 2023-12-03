// GameScriptLoader.ts

import GameMap from "./GameMap";

class GameScriptLoader {
  script: any;
  villagers: any;
  constructor() {
  }

  async loadJson(path: string): Promise<any> {
    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      return await response.json(); // Adjust 'any' based on your JSON structure
    } catch (error) {
      console.error(`Error during json ${path} loading:`, error);
    }
  }

  async loadScript(): Promise<void> {
    this.script = await this.loadJson('assets/GameScript.json');
    console.log('Game script loaded:', this.script);
    this.villagers = await this.loadJson('assets/Villagers.json');
    console.log('Villagers loaded:', this.script);
  }

  startScene() {
    return this.script.startMap;
  }

  gamemap(key: string): GameMap {
    return new GameMap(this.script.maps[key]);
  }

  villager(key: string): any {
    return this.villagers[key];
  }
}
  
  export default GameScriptLoader;
  export const gameScript = new GameScriptLoader();