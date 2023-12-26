import * as Phaser from 'phaser';
import { GameScene } from './GameScene';
import { frogHero, gameScript } from './GameScriptLoader';

export class StartScene extends Phaser.Scene {
  private backgroundImage: Phaser.GameObjects.TileSprite | undefined;
  private characterSprite: Phaser.GameObjects.Sprite | undefined;

  constructor() {
    super({
      key: 'StartScene',
    });
  }

  preload() {
    gameScript.loadScript();
    this.load.image('bluesky', 'assets/bluesky.jpg');
    this.load.image('background', 'assets/startscene.png');
    this.load.spritesheet("character", "assets/Odderf-Walk-Sheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    const scale2Sky = this.cameras.main.width / this.textures.get('bluesky').getSourceImage().width;
    const blueSkyImage = this.add.image(0, this.cameras.main.height, 'bluesky');
    blueSkyImage.setOrigin(0, 1);
    blueSkyImage.setScale(scale2Sky);

    const scaleToFitHeight = this.cameras.main.height / this.textures.get('background').getSourceImage().height;
    // Create a tile sprite for the background
    this.backgroundImage = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background');
    this.backgroundImage.setOrigin(0, 0);

    const height = window.innerHeight;
    const backgroudHeight = this.backgroundImage.height;
    this.backgroundImage.setScale(scaleToFitHeight);

    // Create the character sprite
    this.characterSprite = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height - 20 * scaleToFitHeight, 'character');
    this.characterSprite.setScale(scaleToFitHeight);
    
    // Create animations for the character sprite
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('character', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1, // -1 means loop indefinitely
    });

    // Set a timer to continuously scroll the background
    this.time.addEvent({
      delay: 16, // Adjust the delay to control the scroll speed (16 ms is approximately 60 FPS)
      loop: true,
      callback: () => {
        if (this.backgroundImage) {
          this.backgroundImage.tilePositionX += 0.5;

          // Check for looping
          if (this.backgroundImage.tilePositionX > this.backgroundImage.width * 3) {
            this.backgroundImage.tilePositionX = 0;
          }
        }
        if (this.characterSprite) {
          // Animate the character sprite to move to the right
          this.characterSprite.play('right', true);
        }
      },
    });
    
    const button = this.add.text(
      this.game.renderer.width / 2,
      this.game.renderer.height / 2,
      '開新遊戲',
      {
        fontSize: '48px',
        color: '#00EECC', // Use color instead of fill
      }
    )
      .setOrigin(0.5)
      .setInteractive();

      button.on('pointerdown', () => {
        console.log(`start scene = ${gameScript.startScene()}`)
        GameScene.createKey = gameScript.startScene();
        GameScene.startPos = undefined;
        this.game.scene.add(gameScript.startScene(), GameScene);
        this.scene.start(gameScript.startScene(), { remove: true });
      });
  
    if (localStorage.getItem('playerData')) {
      const button1 = this.add.text(
        this.game.renderer.width / 2,
        this.game.renderer.height / 2 + 52,
        '讀取遊戲',
        {
          fontSize: '48px',
          color: '#AA0000', // Use color instead of fill
        }
      )
        .setOrigin(0.5)
        .setInteractive();
      button1.on('pointerdown', () => {
        const serializedData = localStorage.getItem('playerData');
        console.log(`start scene = ${gameScript.startScene()}`)
        if (serializedData) {
          console.log(`load frog hero from ${serializedData}`);
          frogHero.load(serializedData);
        }
        GameScene.createKey = gameScript.startScene();
        GameScene.startPos = undefined;
        this.game.scene.add(gameScript.startScene(), GameScene);
        this.scene.start(gameScript.startScene(), { remove: true });
      });
    }
  
    // Create a game title with different colored characters
    this.createGameTitle('來去大冒險!', this.cameras.main.width / 2, this.cameras.main.height / 4);
  }

  createGameTitle(title: string, x: number, y: number) {
    const gameTitle = this.add.group();
  
    const shadowConfig = {
      offsetX: 3, // Adjust the shadow offset as needed
      offsetY: 3,
      fill: '#000', // Shadow color
      alpha: 0.5, // Shadow opacity
    };
  
    for (let i = 0; i < title.length; i++) {
      const character = this.add.text(
        x - (title.length * 72) / 2 + i * 72,
        y,
        title[i],
        {
          fontSize: '72px',
          color: this.getRandomColor(),
        }
      );
  
      // Add shadow to each character
      character.setShadow(shadowConfig.offsetX, shadowConfig.offsetY, shadowConfig.fill, shadowConfig.alpha);
  
      character.setOrigin(0.5);
      gameTitle.add(character);
    }
  }
  
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
