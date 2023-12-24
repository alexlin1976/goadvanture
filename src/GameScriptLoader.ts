// GameScriptLoader.ts

import GameMap from "./GameMap";
import PlayerData from "./PlayerData";

export let frogHero!: PlayerData;
class GameScriptLoader {
  script: any;
  villagers: any;
  enemies: any;
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
    console.log('Villagers loaded:', this.villagers);
    this.enemies = await this.loadJson('assets/Enemies.json')
    let playerData = await this.loadJson('assets/CharacterData.json')
    console.log('Player loaded:', playerData);
    let frogHeroData = playerData["frog hero"]
    frogHero = new PlayerData(
      frogHeroData,
      frogHeroData.start_ap, 
      frogHeroData.start_attack_period, 
      frogHeroData.start_hp, 
      frogHeroData.start_hp,
      1,
      0,
      frogHeroData.start_gold);
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

  enemy(key: string): any {
    return this.enemies[key];
  }
}
  
  export default GameScriptLoader;
  export const gameScript = new GameScriptLoader();