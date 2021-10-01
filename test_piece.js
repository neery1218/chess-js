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
  'a4',
  'b6',
  'a5',
  'h6',
  'axb6',
  'h5',
  'b7',
  'h4',
  'bxa8=Q'
]

for (m of moves) {
  b.move(m)
  console.log(b.toString())
}