"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPipeline = createPipeline;
var osm_js_1 = require("./osm.js");
var routing_js_1 = require("./routing.js");
var renderer_js_1 = require("./renderer.js");
var pebble_palette_js_1 = require("./pebble-palette.js");
function encodeB64(bytes) {
    var binary = '';
    for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function renderForState(s, existingRoute) {
    return __awaiter(this, void 0, void 0, function () {
        var center, centerPx, vl, vt, tx0, ty0, tx1, ty1, tilePromises, _loop_1, tx, tileResults, tiles, route, _a, _b, rgba, _c, pixels, palette, paletteBytes, i, nextStep, ns;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    center = s.currentPos || s.origin;
                    centerPx = (0, osm_js_1.worldPixel)(center.lat, center.lng, s.zoom);
                    vl = centerPx.wx - s.width / 2;
                    vt = centerPx.wy - s.height / 2;
                    tx0 = Math.floor(vl / osm_js_1.TILE_SIZE);
                    ty0 = Math.floor(vt / osm_js_1.TILE_SIZE);
                    tx1 = Math.floor((vl + s.width - 1) / osm_js_1.TILE_SIZE);
                    ty1 = Math.floor((vt + s.height - 1) / osm_js_1.TILE_SIZE);
                    tilePromises = [];
                    _loop_1 = function (tx) {
                        var _loop_2 = function (ty) {
                            tilePromises.push((0, osm_js_1.getTile)(s.zoom, tx, ty).then(function (buf) { return (buf ? { tx: tx, ty: ty, buffer: buf } : null); }));
                        };
                        for (var ty = ty0; ty <= ty1; ty++) {
                            _loop_2(ty);
                        }
                    };
                    for (tx = tx0; tx <= tx1; tx++) {
                        _loop_1(tx);
                    }
                    return [4 /*yield*/, Promise.all(tilePromises)];
                case 1:
                    tileResults = _e.sent();
                    tiles = tileResults.filter(function (t) { return t !== null; });
                    if (!(existingRoute !== null && existingRoute !== void 0)) return [3 /*break*/, 2];
                    _a = existingRoute;
                    return [3 /*break*/, 6];
                case 2:
                    if (!s.dest) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, routing_js_1.fetchRoute)(s.origin, s.dest, s.mode)];
                case 3:
                    _b = ((_d = (_e.sent())) !== null && _d !== void 0 ? _d : undefined);
                    return [3 /*break*/, 5];
                case 4:
                    _b = undefined;
                    _e.label = 5;
                case 5:
                    _a = (_b);
                    _e.label = 6;
                case 6:
                    route = _a;
                    rgba = (0, renderer_js_1.renderMap)({
                        width: s.width,
                        height: s.height,
                        zoom: s.zoom,
                        center: center,
                        start: s.origin,
                        dest: s.dest,
                        currentPos: s.currentPos,
                        bearing: s.bearing,
                        route: route,
                        tiles: tiles,
                    });
                    _c = (0, pebble_palette_js_1.quantizeToPebble)(rgba, s.width, s.height), pixels = _c.pixels, palette = _c.palette;
                    paletteBytes = new Uint8Array(128);
                    for (i = 0; i < 64; i++) {
                        paletteBytes[i * 2] = palette[i] & 0xff;
                        paletteBytes[i * 2 + 1] = (palette[i] >> 8) & 0xff;
                    }
                    if (route && s.currentPos) {
                        ns = (0, routing_js_1.findNextStep)(route, s.currentPos);
                        if (ns)
                            nextStep = ns;
                    }
                    return [2 /*return*/, {
                            pixels: encodeB64(pixels),
                            palette: encodeB64(paletteBytes),
                            route: route,
                            nextStep: nextStep,
                        }];
            }
        });
    });
}
function createPipeline(initial) {
    var state = __assign({}, initial);
    var lastRoute;
    return {
        setState: function (partial) {
            state = __assign(__assign({}, state), partial);
        },
        render: function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, renderForState(state, lastRoute)];
                        case 1:
                            result = _a.sent();
                            if (result.route) {
                                lastRoute = result.route;
                            }
                            else {
                                lastRoute = undefined;
                            }
                            return [2 /*return*/, result];
                    }
                });
            });
        },
        getState: function () {
            return __assign({}, state);
        },
    };
}
