"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.loadUnits = loadUnits;
exports.saveUnits = saveUnits;
exports.loadDestinations = loadDestinations;
exports.saveDestinations = saveDestinations;
exports.rleEncode = rleEncode;
exports.asciiNormalize = asciiNormalize;
var DESTINATIONS_KEY = 'destinations';
var UNITS_KEY = 'units';
var SETTINGS_KEY = 'nav_settings';
function loadSettings() {
    try {
        var saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    catch (e) { }
    return { zoom: 16, mode: 'walking', rotationMode: false };
}
function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function loadUnits() {
    return localStorage.getItem(UNITS_KEY) || 'metric';
}
function saveUnits(units) {
    localStorage.setItem(UNITS_KEY, units);
}
function loadDestinations() {
    try {
        var saved = localStorage.getItem(DESTINATIONS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    catch (e) { }
    return [
        {
            name: 'test',
            lat: 7,
            lng: 52,
        },
    ];
}
function saveDestinations(destinations) {
    try {
        localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations));
    }
    catch (e) { }
}
function rleEncode(data) {
    var out = [];
    var i = 0;
    while (i < data.length) {
        var val = data[i];
        var runLen = 1;
        while (i + runLen < data.length && data[i + runLen] === val && runLen < 256) {
            runLen++;
        }
        if (runLen >= 2 || val >= 64) {
            out.push(64, runLen - 1, val);
            i += runLen;
        }
        else {
            out.push(val);
            i++;
        }
    }
    return new Uint8Array(out);
}
var charMap = {
    ä: 'a',
    ö: 'o',
    ü: 'u',
    Ä: 'A',
    Ö: 'O',
    Ü: 'U',
    é: 'e',
    è: 'e',
    ê: 'e',
    ë: 'e',
    É: 'E',
    à: 'a',
    â: 'a',
    ã: 'a',
    å: 'a',
    À: 'A',
    Â: 'A',
    Ã: 'A',
    Å: 'A',
    ç: 'c',
    Ç: 'C',
    ñ: 'n',
    Ñ: 'N',
    ó: 'o',
    ò: 'o',
    ô: 'o',
    õ: 'o',
    Ó: 'O',
    Ò: 'O',
    Ô: 'O',
    Õ: 'O',
    í: 'i',
    ì: 'i',
    î: 'i',
    ï: 'i',
    Í: 'I',
    Ì: 'I',
    Î: 'I',
    Ï: 'I',
    ú: 'u',
    ù: 'u',
    û: 'u',
    Ú: 'U',
    Ù: 'U',
    Û: 'U',
    ý: 'y',
    ÿ: 'y',
    Ý: 'Y',
    ß: 'ss',
    æ: 'ae',
    Æ: 'AE',
    œ: 'oe',
    Œ: 'OE',
};
function IsAscii(c) {
    return c.length === 1 && c >= " c >= ' " && c <= '~';
}
function asciiNormalize(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
        var c = s[i];
        var mapped = charMap[c];
        if (mapped) {
            out += mapped;
        }
        else if (IsAscii(c)) {
            out += c;
        }
    }
    return out.trim();
}
