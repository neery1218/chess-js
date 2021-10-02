const { Board } = require("./board");
const { Knight, Bishop, Rook, Queen, Pawn, Piece } = require("./piece");
const { Position } = require("./position");


var b = new Board()
console.log(b.toString())

var pawn = b.white_pieces.find(p => p instanceof Pawn)
console.log(pawn.get_moves(b))

var knight = b.white_pieces.find(p => p instanceof Knight)
console.log(knight.get_moves(b))

var bishop = b.white_pieces.find(p => p instanceof Bishop)
console.log(bishop.get_moves(b))

// console.debug = function() {}

console.log(b.toString())
debugger;

var b = new Board()
var moves = [
  'e3',
  'a5',
  'Qh5',
  'Ra6',
  'Qxa5',
  'h5',
  'h4',
  'Rah6',
  'Qxc7',
  'f6',
  'Qxd7',
  'Kf7',
  'Qxb7',
  'Qd3',
  'Qxb8',
  'Qh7',
  'Qxc8',
  'Kg6',
  'Qe6',
]

for (m of moves) {
  b.move(m)
  console.log(b.toString())
}

b.eval_game()