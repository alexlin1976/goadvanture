import * as Phaser from "phaser";
import { UserPlayer } from "./UserPlayer";
import { UserPlayerControls } from "./UserPlayerControls";
import { GridPhysics } from "./GridPhysics";
import { DoorControls } from "./DoorControls";
import { frogHero, gameScript } from "./GameScriptLoader";
import GameMap from "./GameMap";
import Villager from "./Villager";
import { AnimationSet, animationSet } from "./AnimationSet";
import { Player } from "./Player";
import Enemy from "./Enemy";
import StatusScene from "./StatusScene";

export class GameScene extends Phaser.Scene {
  static readonly TILE_SIZE = 48;
  static createKey: string;
  static startPos?: Phaser.Math.Vector2;

  constructor() {
    const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
      active: false,
      visible: false,
      key: GameScene.createKey,
    };
        super(sceneConfig);
  }

  private player!: UserPlayer;
  private userPlayerControls!: UserPlayerControls;
  private gridPhysics!: GridPhysics;
  private doorControls!: DoorControls;
  private villagers!: [Villager];
  private enemies!: Enemy[];

  public create() {
    const map = this.make.tilemap({ key: this.scene.key });
    
    for (const tileset of map.tilesets)
      map.addTilesetImage(tileset.name, tileset.name);
    for (let i = 0; i < map.layers.length; i++) {
      const layer = map
        .createLayer(i, map.tilesets.map(tileset => tileset.name ), 0, 0)
      if (layer !== null) {
        layer.setDepth(i);
        layer.scale = 3;
      }
    }

    this.villagers = this.gamemap.createVillagers(this, map);
    this.enemies = this.gamemap.createEnemies(this, map);

    const startPos = GameScene.startPos != null ? GameScene.startPos : this.gamemap.startPos();
    const player = new UserPlayer(
      frogHero,
      map,
      startPos, 
      this,
      this.gamemap, 
      (newMap) => {this.newMap(newMap);});
    this.player = player;

    this.gridPhysics = new GridPhysics(player, map);
    this.doorControls = new DoorControls(player, map, this);
    this.userPlayerControls = new UserPlayerControls(
      this.input,
      this.gridPhysics,
      this.player,
      this.doorControls
    );

    animationSet.createTileMapAnimation(map, this);
    this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.scene.get('StatusScene') === null) {
        const scene = this.scene.add('StatusScene', StatusScene, true) as StatusScene;
        scene.currentSceneKey = this.scene.key;
        this.scene.pause();
      }
    });  
  }

  private aKey!: Phaser.Input.Keyboard.Key;

  private newMap(newMap: any) {
      // console.log(`goto new map ${newMap}`)
      const key: string = newMap.to;
      GameScene.createKey = key;
      GameScene.startPos = new Phaser.Math.Vector2(newMap.toX, newMap.toY);
      this.game.scene.add(key, GameScene);
      this.scene.start(key, { remove: true });
      this.game.scene.remove(this.scene.key);
  }
  
  public update(_time: number, delta: number) {
    const players = [...this.villagers, this.player, ...this.enemies];
    this.userPlayerControls.update(_time, delta);
    this.gridPhysics.update(delta, players);
    this.doorControls.update();
    this.villagers.forEach(villager => villager.update(_time, delta, players));
    this.enemies.forEach(enemy => enemy.update(_time, delta, players));
    this.player.update(this.villagers, this.aKey.isDown, this.enemies, delta, _time);
  }

  gamemap!: GameMap
  public preload() {
    ["Terrain","Floors","Decoration","Doors Windows","Roofs","Walls","Nature","Marketplace","Water"]
    .forEach(tileset => this.load.image(tileset, `assets/Rural Village ${tileset}.png`) )

    this.gamemap = gameScript.gamemap(this.scene.key);
    this.load.tilemapTiledJSON(this.scene.key, this.gamemap.asset());
    this.load.spritesheet('animatedDoor', 'assets/Village Animated Doors.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    UserPlayer.preload(this);

    this.gamemap.loadVillagersSheets(this);
    this.gamemap.loadEnemiesSheets(this);

    animationSet.loadSettings();
    animationSet.preload(this);
  }
}
