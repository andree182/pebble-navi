"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pebblePalette = void 0;
exports.nearestColor = nearestColor;
exports.quantizeToPebble = quantizeToPebble;
exports.quantizeToPebble2Bit = quantizeToPebble2Bit;
var GCOLOR_TO_RGB565 = new Uint16Array(64);
for (var i = 0; i < 64; i++) {
    var r = (i >> 4) & 0x3;
    var g = (i >> 2) & 0x3;
    var b = i & 0x3;
    var r5 = Math.round((r * 31) / 3);
    var g6 = Math.round((g * 63) / 3);
    var b5 = Math.round((b * 31) / 3);
    GCOLOR_TO_RGB565[i] = ((r5 << 11) | (g6 << 5) | b5);
}
exports.pebblePalette = GCOLOR_TO_RGB565;
function nearestColor(r, g, b) {
    var r2 = Math.round(r / 85);
    var g2 = Math.round(g / 85);
    var b2 = Math.round(b / 85);
    return (r2 << 4) | (g2 << 2) | b2;
}
function quantizeToPebble(rgba, width, height) {
    var pixels = new Uint8Array(width * height);
    for (var i = 0; i < width * height; i++) {
        var r = rgba[i * 4];
        var g = rgba[i * 4 + 1];
        var b = rgba[i * 4 + 2];
        pixels[i] = nearestColor(r, g, b);
    }
    return { pixels: pixels, palette: exports.pebblePalette };
}
function quantizeToPebble2Bit(rgba, width, height) {
    var numPixels = width * height;
    var packedLen = Math.ceil(numPixels / 4);
    var packed = new Uint8Array(packedLen);
    for (var i = 0; i < numPixels; i++) {
        var r = rgba[i * 4];
        var g = rgba[i * 4 + 1];
        var b = rgba[i * 4 + 2];
        var gray = Math.round((r + g + b) / 3 / 85);
        var idx = i >> 2;
        var shift = (3 - (i & 3)) << 1;
        packed[idx] = (packed[idx] & ~(3 << shift)) | ((gray & 3) << shift);
    }
    return { pixels: packed };
}
