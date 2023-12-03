import * as Phaser from "phaser";
import { UserPlayer } from "./UserPlayer";
import { GridControls } from "./GridControls";
import { GridPhysics } from "./GridPhysics";
import { DoorControls } from "./DoorControls";
import { gameScript } from "./GameScriptLoader";
import GameMap from "./GameMap";
import Villager from "./Villager";
import { AnimationSet, animationSet } from "./AnimationSet";
import { Player } from "./Player";

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
  private gridControls!: GridControls;
  private gridPhysics!: GridPhysics;
  private doorControls!: DoorControls;
  private villagers!: [Villager];

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

    const playerSprite = this.add.sprite(0, 0, "player");
    playerSprite.setDepth(3);
    playerSprite.scale = 3;

    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    const startPos = GameScene.startPos != null ? GameScene.startPos : this.gamemap.startPos();
    const player = new UserPlayer(playerSprite, 
      map,
      startPos, 
      this,
      this.gamemap, 
      (newMap) => {
        console.log(`goto new map ${newMap}`)
        const key: string = newMap.to;
        GameScene.createKey = key;
        GameScene.startPos = new Phaser.Math.Vector2(newMap.toX, newMap.toY);
        this.game.scene.add(key, GameScene);
        this.scene.start(key, { remove: true });
        this.game.scene.remove(this.scene.key);
      });
    this.player = player;

    this.gridPhysics = new GridPhysics(player, map);
    this.doorControls = new DoorControls(player, map, this);
    this.gridControls = new GridControls(
      this.input,
      this.gridPhysics,
      this.doorControls
    );

    animationSet.createTileMapAnimation(map, this);
    this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  }

  private aKey!: Phaser.Input.Keyboard.Key;
  
  public update(_time: number, delta: number) {
    const players = [...this.villagers, this.player];
    this.gridControls.update();
    this.gridPhysics.update(delta, players);
    this.doorControls.update();
    this.villagers.forEach(villager => villager.update(_time, delta, players));
    this.player.update(this.villagers, this.aKey.isDown);
  }

  gamemap!: GameMap
  public preload() {
    ["Terrain","Floors","Decoration","Doors Windows","Roofs","Walls","Nature","Marketplace","Water"]
    .forEach(tileset => this.load.image(tileset, `assets/Rural Village ${tileset}.png`) )

    this.gamemap = gameScript.gamemap(this.scene.key);
    this.load.tilemapTiledJSON(this.scene.key, this.gamemap.asset());
    this.load.spritesheet("player", "assets/Odderf-Walk-Sheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("player-attach", "assets/Odderf-Attack-Sheet.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('animatedDoor', 'assets/Village Animated Doors.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.gamemap.loadVillagersSheets(this);

    animationSet.loadSettings();
    animationSet.preload(this);
  }
}
