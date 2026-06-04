"use strict";
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
exports.TILE_SIZE = void 0;
exports.worldPixel = worldPixel;
exports.getTile = getTile;
exports.tryParseLatLng = tryParseLatLng;
exports.geocode = geocode;
var tile_cache_js_1 = require("./tile-cache.js");
exports.TILE_SIZE = 256;
var TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
var UA = 'pebble-map-renderer/1.0';
function worldPixel(lat, lng, zoom) {
    var n = Math.pow(2, zoom);
    var x = (lng + 180) / 360;
    var y = (1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
        2;
    return { wx: x * n * exports.TILE_SIZE, wy: y * n * exports.TILE_SIZE };
}
function getTile(z, x, y) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, url, res, buf, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cached = (0, tile_cache_js_1.getCachedTile)(z, x, y);
                    if (cached)
                        return [2 /*return*/, cached];
                    url = TILE_URL.replace('{z}', String(z))
                        .replace('{x}', String(x))
                        .replace('{y}', String(y));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, { headers: { 'User-Agent': UA } })];
                case 2:
                    res = _c.sent();
                    if (!res.ok)
                        return [2 /*return*/, null];
                    _a = Uint8Array.bind;
                    return [4 /*yield*/, res.arrayBuffer()];
                case 3:
                    buf = new (_a.apply(Uint8Array, [void 0, _c.sent()]))();
                    (0, tile_cache_js_1.setCachedTile)(z, x, y, buf);
                    return [2 /*return*/, buf];
                case 4:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function tryParseLatLng(s) {
    var parts = s.split(',').map(function (p) { return p.trim(); });
    if (parts.length === 2) {
        var lat = parseFloat(parts[0]);
        var lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng))
            return { lat: lat, lng: lng };
    }
    return null;
}
function geocode(query) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, url, res, data, coords, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cached = (0, tile_cache_js_1.getCachedGeocode)(query);
                    if (cached)
                        return [2 /*return*/, cached];
                    url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=".concat(encodeURIComponent(query));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, { headers: { 'User-Agent': UA } })];
                case 2:
                    res = _b.sent();
                    if (!res.ok)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = (_b.sent());
                    if (!data.length)
                        return [2 /*return*/, null];
                    coords = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                    };
                    (0, tile_cache_js_1.setCachedGeocode)(query, coords);
                    return [2 /*return*/, coords];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
