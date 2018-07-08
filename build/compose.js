'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var typeforce = require('typeforce');

// compose :: addProps -> (state -> buffer -> [state, buffer])
var compose = function compose(args) {
  return function (state, buffer) {
    typeforce(typeforce.Array, args);
    typeforce(typeforce.Object, state);
    typeforce(typeforce.Buffer, buffer);
    return args.reduce(function (_ref, f) {
      var _ref2 = _slicedToArray(_ref, 2),
          state = _ref2[0],
          buffer = _ref2[1];

      return f(state, buffer);
    }, [state, buffer]);
  };
};

// addProp :: propName -> f -> (state -> buffer -> [state, buffer])
var addProp = function addProp(propName, f) {
  return function (state, buffer) {
    typeforce(typeforce.String, propName);
    typeforce(typeforce.Function, f);
    typeforce(typeforce.Object, state);
    typeforce(typeforce.Buffer, buffer);

    var _f = f(buffer),
        _f2 = _slicedToArray(_f, 2),
        res = _f2[0],
        bufferLeft = _f2[1];

    state[propName] = res;
    return [state, bufferLeft];
  };
};

module.exports = {
  compose: compose,
  addProp: addProp
};