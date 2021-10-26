export class Position {
  x: number
  y: number

  constructor(x: number, y :number) {
    this.x = x;
    this.y = y;
  }

  add(other_pos: Position) {
    return new Position(this.x + other_pos.x, this.y + other_pos.y);
  }

  toString() {
    return this.x + ":" + this.y;
  }

  copy() {
    return new Position(this.x, this.y);
  }
}