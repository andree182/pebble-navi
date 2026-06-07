"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedTile = getCachedTile;
exports.setCachedTile = setCachedTile;
exports.getCachedGeocode = getCachedGeocode;
exports.setCachedGeocode = setCachedGeocode;
var cache = typeof localStorage !== 'undefined' && localStorage
    ? {
        get: function (k) {
            return localStorage.getItem(k);
        },
        set: function (k, v) {
            localStorage.setItem(k, v);
        },
    }
    : new Map();
function key(z, x, y) {
    return "tile:".concat(z, "/").concat(x, "/").concat(y);
}
function encodeB64(data) {
    var binary = '';
    for (var i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
}
function decodeB64(b64) {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
function getCachedTile(z, x, y) {
    var raw = cache.get(key(z, x, y));
    return raw ? decodeB64(raw) : null;
}
function setCachedTile(z, x, y, data) {
    cache.set(key(z, x, y), encodeB64(data));
}
function getCachedGeocode(query) {
    var raw = cache.get("geo:".concat(query));
    return raw ? JSON.parse(raw) : null;
}
function setCachedGeocode(query, coords) {
    cache.set("geo:".concat(query), JSON.stringify(coords));
}
