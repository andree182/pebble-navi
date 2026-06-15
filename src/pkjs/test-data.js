"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_DESTINATIONS = exports.DO_MOVEMENT_TESTING = exports.DO_TESTING = exports.ENABLE_LOGS = void 0;
exports.testOverride = testOverride;
exports.testAutoMove = testAutoMove;
var rxjs_1 = require("rxjs");
var telemetry_1 = require("./telemetry");
exports.ENABLE_LOGS = (0, telemetry_1.isTelemetryEnabled)();
exports.DO_TESTING = false;
exports.DO_MOVEMENT_TESTING = false;
exports.TEST_DESTINATIONS = exports.DO_TESTING
    ? [
        {
            name: 'Brandenburger Tor',
            lat: 52.51672061856219,
            lng: 13.378728425932048,
        },
        {
            name: 'Alexanderplatz',
            lat: 52.520976307736106,
            lng: 13.414912636513549,
        },
    ]
    : [];
function testOverride(pos) {
    if (!exports.DO_TESTING) {
        return pos;
    }
    pos.coords.latitude = 52.520976307736106;
    pos.coords.longitude = 13.414912636513549;
    return pos;
}
function testAutoMove(location) {
    if (!exports.DO_MOVEMENT_TESTING) {
        return;
    }
    (0, rxjs_1.interval)(1000).subscribe(function (nbr) {
        location.next({
            coords: {
                latitude: 52.520976307736106 + 0.00001 * nbr,
                longitude: 13.414912636513549,
            },
        });
    });
}
