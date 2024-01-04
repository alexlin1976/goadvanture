export default class PlayerData {
    constructor(
        private data: any,
        private ap: integer,
        private attackSpeed: integer,
        private hp: integer,
        private maxHp: integer,
        private level: integer,
        private experience: integer,
        private gold: integer
    ) {
    }

    toJSON(): Record<string, number> {
        return {
          ap: this.ap,
          attackSpeed: this.attackSpeed,
          hp: this.hp,
          maxHp: this.maxHp,
          level: this.level,
          experience: this.experience,
          gold: this.gold,
        };
    }

    save() {
        const jsonString = JSON.stringify(this.toJSON());
        console.log(`serialize the player data ${jsonString}`);
        localStorage.setItem('playerData', jsonString);
    }

    load(serializedData: string) {
        const data = JSON.parse(serializedData);
        this.ap = data.ap;
        this.attackSpeed = data.attackSpeed;
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.level = data.level;
        this.experience = data.experience;
        this.gold = data.gold;
    }

    getAp(): integer {
        return this.ap;
    }

    changeAp(by: integer) {
        this.ap += by;
    }

    getAttackSpeed(): integer {
        return this.attackSpeed;
    }

    getCastCoolDown(): integer {
        return 2000;
    }

    getHp(): integer {
        return this.hp;
    }

    changeHp(by: integer) {
        this.hp += by;
    }

    getMaxHp(): integer {
        return this.maxHp;
    }
    
    getExperience(): integer {
        return this.experience;
    }

    changeExperience(by: integer): boolean {
        this.experience += by;
        return this.checkLevelUp();
    }

    getGold(): integer {
        return this.gold;
    }

    changeGold(by: integer) {
        this.gold += by;
    }

    leveupUp(setting: any) {
        this.level += 1;
        console.log(`level up to ${this.level}`);
        this.ap += setting.ap;
        this.maxHp += setting.hp;
        this.hp = this.maxHp;
        this.attackSpeed += setting.attack_period;
    }

    checkLevelUp(): boolean {
        if (this.data.level_settings) {
            let expRequired = 0;
            let levelStep = this.level;
            for (const setting of this.data.level_settings) {
                const from = setting.from;
                const to = setting.to ?? 9999;
                if (from <= this.level && this.level <= to) {
                    expRequired += (levelStep * setting.exp);
                    if (this.experience >= expRequired) {
                        this.leveupUp(setting);
                        return true;
                    }
                    break;
                }
                else {
                    expRequired += setting.exp * (to - from + 1);
                    levelStep -= (to - from + 1);
                }
            }
        }
        return false;
    }
}