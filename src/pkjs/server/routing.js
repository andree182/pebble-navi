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
exports.bearingTo = bearingTo;
exports.haversine = haversine;
exports.closestPointOnSegment = closestPointOnSegment;
exports.distanceToRoute = distanceToRoute;
exports.routeProgress = routeProgress;
exports.findNextStep = findNextStep;
exports.fetchRoute = fetchRoute;
var SERVERS = {
    driving: { base: 'https://routing.openstreetmap.de/routed-car/route/v1', profile: 'driving' },
    cycling: { base: 'https://routing.openstreetmap.de/routed-bike/route/v1', profile: 'cycling' },
    walking: { base: 'https://routing.openstreetmap.de/routed-foot/route/v1', profile: 'walking' },
};
var UA = 'pebble-map-renderer/1.0';
var EARTH_RADIUS_M = 6371000;
function bearingTo(from, to) {
    var toRad = function (d) { return (d * Math.PI) / 180; };
    var φ1 = toRad(from.lat);
    var φ2 = toRad(to.lat);
    var Δλ = toRad(to.lng - from.lng);
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
function haversine(lat1, lng1, lat2, lng2) {
    var toRad = function (d) { return (d * Math.PI) / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(dLng / 2), 2);
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}
function closestPointOnSegment(lat, lng, ax, ay, bx, by) {
    var dx = bx - ax;
    var dy = by - ay;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0)
        return { lat: ax, lng: ay };
    var t = ((lat - ax) * dx + (lng - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return { lat: ax + t * dx, lng: ay + t * dy };
}
function distanceToRoute(lat, lng, coords) {
    var minDist = Infinity;
    for (var i = 0; i < coords.length - 1; i++) {
        var _a = coords[i], alng = _a[0], alat = _a[1];
        var _b = coords[i + 1], blng = _b[0], blat = _b[1];
        var cp = closestPointOnSegment(lat, lng, alat, alng, blat, blng);
        var d = haversine(lat, lng, cp.lat, cp.lng);
        if (d < minDist)
            minDist = d;
    }
    return minDist;
}
function cumulativeDistances(coords) {
    var dists = [0];
    for (var i = 1; i < coords.length; i++) {
        var _a = coords[i - 1], lng1 = _a[0], lat1 = _a[1];
        var _b = coords[i], lng2 = _b[0], lat2 = _b[1];
        dists.push(dists[i - 1] + haversine(lat1, lng1, lat2, lng2));
    }
    return dists;
}
function routeProgress(coords, pos) {
    var segIdx = 0;
    var best = Infinity;
    var bestT = 0;
    for (var i = 0; i < coords.length - 1; i++) {
        var _a = coords[i], lng1 = _a[0], lat1 = _a[1];
        var _b = coords[i + 1], lng2 = _b[0], lat2 = _b[1];
        var cp = closestPointOnSegment(pos.lat, pos.lng, lat1, lng1, lat2, lng2);
        var d = haversine(pos.lat, pos.lng, cp.lat, cp.lng);
        var segLen = haversine(lat1, lng1, lat2, lng2);
        var t = segLen > 0 ? haversine(lat1, lng1, cp.lat, cp.lng) / segLen : 0;
        if (d < best) {
            best = d;
            segIdx = i;
            bestT = t;
        }
    }
    var cumDists = cumulativeDistances(coords);
    return {
        segIdx: segIdx,
        frac: bestT,
        cumDist: cumDists[segIdx] +
            bestT *
                haversine(coords[segIdx][1], coords[segIdx][0], coords[segIdx + 1][1], coords[segIdx + 1][0]),
    };
}
function findNextStep(route, pos) {
    var steps = route.steps;
    if (!(steps === null || steps === void 0 ? void 0 : steps.length))
        return null;
    var coords = route.coordinates;
    var cu = routeProgress(coords, pos);
    var cumDists = cumulativeDistances(coords);
    var stepCumDists = [];
    for (var _i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
        var step = steps_1[_i];
        var best = Infinity;
        var idx = 0;
        for (var i = 0; i < coords.length - 1; i++) {
            var _a = coords[i], lng1 = _a[0], lat1 = _a[1];
            var _b = coords[i + 1], lng2 = _b[0], lat2 = _b[1];
            var cp = closestPointOnSegment(step.location.lat, step.location.lng, lat1, lng1, lat2, lng2);
            var d = haversine(step.location.lat, step.location.lng, cp.lat, cp.lng);
            if (d < best) {
                best = d;
                idx = i;
            }
        }
        stepCumDists.push(cumDists[idx]);
    }
    for (var i = 0; i < steps.length; i++) {
        if (stepCumDists[i] >= cu.cumDist) {
            return { step: steps[i], remainingDist: stepCumDists[i] - cu.cumDist };
        }
    }
    return null;
}
function fetchRoute(from, to, profile) {
    return __awaiter(this, void 0, void 0, function () {
        var srv, url, res, data, r, steps, _i, _a, s, _b;
        var _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    srv = (_c = SERVERS[profile]) !== null && _c !== void 0 ? _c : SERVERS.driving;
                    url = "".concat(srv.base, "/").concat(srv.profile, "/").concat(from.lng, ",").concat(from.lat, ";").concat(to.lng, ",").concat(to.lat, "?geometries=geojson&overview=full&alternatives=false&steps=true");
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, { headers: { 'User-Agent': UA } })];
                case 2:
                    res = _g.sent();
                    if (!res.ok)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _g.sent();
                    if (!data || data.code !== 'Ok' || !((_d = data.routes) === null || _d === void 0 ? void 0 : _d.length))
                        return [2 /*return*/, null];
                    r = data.routes[0];
                    steps = [];
                    if ((_f = (_e = r.legs) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.steps) {
                        for (_i = 0, _a = r.legs[0].steps; _i < _a.length; _i++) {
                            s = _a[_i];
                            steps.push({
                                name: s.name,
                                distance: s.distance,
                                duration: s.duration,
                                location: {
                                    lat: s.maneuver.location[1],
                                    lng: s.maneuver.location[0],
                                },
                                type: s.maneuver.type,
                                modifier: s.maneuver.modifier,
                            });
                        }
                    }
                    return [2 /*return*/, {
                            coordinates: r.geometry.coordinates,
                            distance: r.distance,
                            duration: r.duration,
                            steps: steps,
                        }];
                case 4:
                    _b = _g.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
