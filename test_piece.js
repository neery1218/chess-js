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

b.move('e4')
b.move('d5')
b.move('Bb5')
// b.move('c6')

// b.move('e4')
// b.move('e5')
// b.move('Qf3')
// b.move('a6')
// b.move('Bc4')
// b.move('h6')
// b.move('Qf7')
console.log(b.toString())