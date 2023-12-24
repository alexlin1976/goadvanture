export default class Reward {
    private amount: integer;
    constructor(
        min: integer,
        max: integer
    ) {
        this.amount = min + Math.round(Math.random() * (max - min));
    }
    getAmount(): integer {
        return this.amount;
    }
}

export class Exp extends Reward {
    constructor(
        min: integer,
        max: integer
    ) {
        super(min, max);
    }
}

export class Gold extends Reward {
    constructor(
        min: integer,
        max: integer
    ) {
        super(min, max);
    }
}