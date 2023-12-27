import { frogHero } from "./GameScriptLoader";

export default class StatusScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StatusScene' });
    }
  
    preload() {
        this.load.spritesheet('Portrait', 'assets/Odderf.png', {
        frameWidth: 48,
        frameHeight: 48,
        });
    }
  
    create() {
        const graphics = this.add.graphics();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const frameStartX = 50;
        const frameStartY = 50
        graphics.fillStyle(0x000000, 1); // Set fill color and alpha (1 for opaque)
        graphics.fillRoundedRect(frameStartX, frameStartY, width - 100, height - 100, 20); // Draw a round rectangle
      
        const portraitImage = this.add.sprite(frameStartX + 20, frameStartY + 20, 'Portrait');
        portraitImage.scale = 3;
        portraitImage.setFrame(1);
        portraitImage.setOrigin(0, 0);
    
        const text = this.add.text(frameStartX + 200, frameStartY + 20, `HP: ${frogHero.getHp()} / ${frogHero.getMaxHp()}\nAP: ${frogHero.getAp()}`, {
            fontSize: '24px',
            color: '#ffffff',
            align: 'left',
          });

        if (this.input.keyboard) 
            this.input.keyboard.on('keydown-ESC', () => {
                this.closeDialog();
            });
    }
  
    private closeDialog() {
      this.scene.stop('StatusScene');
      this.game.scene.remove('StatusScene');
    }
  }
  