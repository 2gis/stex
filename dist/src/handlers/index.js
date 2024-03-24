"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlers = exports.overridePanic = exports.panic = void 0;
var panic_1 = require("../panic");
var _t_1 = require("./_t");
var _pt_1 = require("./_pt");
var _nt_1 = require("./_nt");
var _npt_1 = require("./_npt");
// Panic overriding for some testing abilities
var panicImpl = panic_1.panic;
var panic = function (s, ident) { return panicImpl(s, ident); };
exports.panic = panic;
function overridePanic(cb) {
    if (cb === void 0) { cb = panic_1.panic; }
    panicImpl = cb;
}
exports.overridePanic = overridePanic;
var getHandlers = function (d) { return ({
    _t: (0, _t_1.translate)(d),
    _pt: (0, _pt_1.translate)(d),
    _nt: (0, _nt_1.translate)(d),
    _npt: (0, _npt_1.translate)(d),
    // should not translate these at all:
    _gg: function (_params, _identInfo) { },
    _pgg: function (_params, _identInfo) { },
    _ngg: function (_params, _identInfo) { },
    _npgg: function (_params, _identInfo) { },
}); };
exports.getHandlers = getHandlers;
//# sourceMappingURL=index.js.map