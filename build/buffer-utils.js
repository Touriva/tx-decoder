'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var varuint = require('varuint-bitcoin');
var typeforce = require('typeforce');

// readSlice :: Number -> Buffer -> (Buffer, Buffer)
var readSlice = function readSlice(offset) {
  return function (buffer) {
    return [buffer.slice(0, offset), buffer.slice(offset)];
  };
};

// readUInt32 :: Buffer -> (Number, Buffer)
function readUInt32(buffer) {
  typeforce(typeforce.Buffer, buffer);
  var i = buffer.readUInt32LE(0);
  return [i, buffer.slice(4)];
}

// readUInt32 :: Buffer -> (Number, Buffer)
function readInt32(buffer) {
  typeforce(typeforce.Buffer, buffer);
  var i = buffer.readInt32LE(0);
  return [i, buffer.slice(4)];
}

// readUInt64 :: Buffer -> (Number, Buffer)
function readUInt64(buffer) {
  typeforce(typeforce.Buffer, buffer);
  var a = buffer.readUInt32LE(0);
  var b = buffer.readUInt32LE(4);
  b *= 0x100000000;
  // verifuint(b + a, 0x001fffffffffffff)
  return [b + a, buffer.slice(8)];
}

// readVarInt :: Buffer -> (Res, Buffer)
function readVarInt(buffer) {
  var vi = varuint.decode(buffer, 0);
  return [vi, buffer.slice(varuint.decode.bytes)];
}

// readVarSlice :: Buffer -> (Res, Buffer)
function readVarSlice(buffer) {
  var _readVarInt = readVarInt(buffer),
      _readVarInt2 = _slicedToArray(_readVarInt, 2),
      len = _readVarInt2[0],
      bufferLeft = _readVarInt2[1];

  var _readSlice = readSlice(len)(bufferLeft),
      _readSlice2 = _slicedToArray(_readSlice, 2),
      res = _readSlice2[0],
      bufferLeft2 = _readSlice2[1];

  return [res, bufferLeft2];
}

module.exports = {
  readSlice: readSlice,
  readInt32: readInt32,
  readUInt32: readUInt32,
  readUInt64: readUInt64,
  readVarInt: readVarInt,
  readVarSlice: readVarSlice
};