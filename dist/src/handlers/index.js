"use strict";
exports.__esModule = true;
var panic_1 = require("../panic");
var _t_1 = require("./_t");
var _pt_1 = require("./_pt");
var _nt_1 = require("./_nt");
var _npt_1 = require("./_npt");
// Panic overriding for some testing abilities
var panicImpl = panic_1.panic;
exports.panic = function (s, ident) { return panicImpl(s, ident); };
function overridePanic(cb) {
    if (cb === void 0) { cb = panic_1.panic; }
    panicImpl = cb;
}
exports.overridePanic = overridePanic;
exports.getHandlers = function (d) { return ({
    _t: _t_1.translate(d),
    _pt: _pt_1.translate(d),
    _nt: _nt_1.translate(d),
    _npt: _npt_1.translate(d),
    // should not translate these at all:
    _gg: function (_params, _identInfo) { },
    _pgg: function (_params, _identInfo) { },
    _ngg: function (_params, _identInfo) { },
    _npgg: function (_params, _identInfo) { }
}); };
