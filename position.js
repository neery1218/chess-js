class Position {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    add (other_pos) {
        return new Position(this.x + other_pos.x, this.y + other_pos.y)
    }

    toString() {
        return this.x + ":" + this.y
    }
}

module.exports.Position = Position
