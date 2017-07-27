const varuint = require('varuint-bitcoin')
const typeforce = require('typeforce')

const readSlice = offset => buffer => {
  return [buffer.slice(0, offset), buffer.slice(offset)]
}

// readUInt32 :: Buffer -> (Res, Buffer)
function readUInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  var i = buffer.readUInt32LE(0)
  return [i, buffer.slice(4)]
}

// readUInt32 :: Buffer -> (Res, Buffer)
function readInt32 (buffer) {
  typeforce(typeforce.Buffer, buffer)
  var i = buffer.readInt32LE(0)
  return [i, buffer.slice(4)]
}

function readUInt64LE (buffer, offset) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readUInt32LE(offset + 4)
  b *= 0x100000000
  // verifuint(b + a, 0x001fffffffffffff)
  return b + a
}

function readUInt64 (buffer) {
  var i = readUInt64LE(buffer, 8)
  return [i, buffer.slice(8)]
}

// readVarInt :: Buffer -> (Res, Buffer)
function readVarInt (buffer) {
  var vi = varuint.decode(buffer, 0)
  return [vi, buffer.slice(varuint.decode.bytes)]
}

// readVarSlice :: Buffer -> (Res, Buffer)
function readVarSlice (buffer) {
  const [len, offset] = readVarInt(buffer)
  const [res, offset2] = readSlice(len)(buffer.slice(offset))
  return [res, buffer.slice(offset + offset2)]
}

// compose :: adds -> (state -> buffer -> [state, buffer])
function compose (args) {
  return function (state, buffer) {
    typeforce(typeforce.Buffer, buffer)
    args.reduce(([state, buffer], f) => f(state, buffer), [state, buffer])
    return [state, buffer]
  }
}
// addProp :: propName -> f -> (state -> buffer -> [state, buffer])
function addProp (propName, f) {
  return function (state, buffer) {
    typeforce(typeforce.Buffer, buffer)
    const [res, bufferLeft] = f(buffer)
    state[propName] = res
    return [state, bufferLeft]
  }
}

module.exports = {
  readSlice,
  readUInt32,
  readInt32,
  readUInt64,
  readVarInt,
  readVarSlice,
  compose,
  addProp
}
