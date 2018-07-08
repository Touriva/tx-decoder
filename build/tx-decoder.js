'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * This `decodeTx` decodes a bitcoin transaction. Its an example of how to use the composable helpers
 * to make a decoder.
 */

var _require = require('./compose'),
    compose = _require.compose,
    addProp = _require.addProp;

var _require2 = require('./buffer-utils'),
    readSlice = _require2.readSlice,
    readUInt32 = _require2.readUInt32,
    readInt32 = _require2.readInt32,
    readUInt64 = _require2.readUInt64,
    readVarInt = _require2.readVarInt,
    readVarSlice = _require2.readVarSlice;

/**
 * Transaction's hash is displayed in a reverse order, we need to un-reverse it.
 */
// readHash :: Buffer -> [Hash, Buffer]


var readHash = function readHash(buffer) {
  var _readSlice = readSlice(32)(buffer),
      _readSlice2 = _slicedToArray(_readSlice, 2),
      res = _readSlice2[0],
      bufferLeft = _readSlice2[1];

  var hash = Buffer.from(res, 'hex').reverse().toString('hex');
  return [hash, bufferLeft];
};

// readInputs :: Buffer -> (Res, Buffer)
var readInputs = function readInputs(readFn) {
  return function (buffer) {
    var vins = [];

    var _readVarInt = readVarInt(buffer),
        _readVarInt2 = _slicedToArray(_readVarInt, 2),
        vinLen = _readVarInt2[0],
        bufferLeft = _readVarInt2[1];

    var vin = void 0;
    for (var i = 0; i < vinLen; ++i) {
      var _readFn = readFn(bufferLeft);

      var _readFn2 = _slicedToArray(_readFn, 2);

      vin = _readFn2[0];
      bufferLeft = _readFn2[1];

      vins.push(vin);
    }
    return [vins, bufferLeft];
  };
};

// decodeTx :: Buffer -> [Res, Buffer]
var decodeTx = function decodeTx(buffer) {
  return compose([addProp('version', readInt32), // 4 bytes
  addProp('vin', readInputs(readInput)), // 1-9 bytes (VarInt), Input counter; Variable, Inputs
  addProp('vout', readInputs(readOutput)), // 1-9 bytes (VarInt), Output counter; Variable, Outputs
  addProp('locktime', readUInt32) // 4 bytes
  ])({}, buffer);
};

// readInput :: Buffer -> [Res, Buffer]
var readInput = function readInput(buffer) {
  return compose([addProp('hash', readHash), // 32 bytes, Transaction Hash
  addProp('index', readUInt32), // 4 bytes, Output Index
  addProp('script', readVarSlice), // 1-9 bytes (VarInt), Unlocking-Script Size; Variable, Unlocking-Script
  addProp('sequence', readUInt32) // 4 bytes, Sequence Number
  ])({}, buffer);
};

// readOutput :: Buffer -> [Res, Buffer]
var readOutput = function readOutput(buffer) {
  return compose([addProp('value', readUInt64), // 8 bytes, Amount in satoshis
  addProp('script', readVarSlice) // 1-9 bytes (VarInt), Locking-Script Size; Variable, Locking-Script
  ])({}, buffer);
};

module.exports = {
  decodeTx: decodeTx,
  readHash: readHash,
  readInputs: readInputs,
  readInput: readInput,
  readOutput: readOutput
};