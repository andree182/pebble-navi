"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./server/polyfills");
var settings_1 = require("./settings");
var pipeline_1 = require("./server/pipeline");
var CHUNK_SIZE = 8000;
var DEBUG_PNG = true;
console.log('JS App Started');
var pipeline = null;
var destinations = [];
var rendering = false;
function loadDestinations() {
    try {
        var saved = localStorage.getItem('destinations');
        if (saved)
            destinations = JSON.parse(saved);
    }
    catch (e) {
        destinations = [];
    }
}
function saveDestinations() {
    try {
        localStorage.setItem('destinations', JSON.stringify(destinations));
    }
    catch (e) { }
}
function sendBitmapToWatch(pixelsBase64, paletteBase64, onDone) {
    if (DEBUG_PNG)
        console.log('sendBitmapToWatch: pixels len=' +
            pixelsBase64.length +
            ' palette len=' +
            paletteBase64.length);
    var pixels, paletteBytes;
    try {
        pixels = atob(pixelsBase64);
        paletteBytes = atob(paletteBase64);
    }
    catch (e) {
        if (DEBUG_PNG)
            console.log('atob failed: ' + e);
        if (onDone)
            onDone();
        return;
    }
    if (DEBUG_PNG)
        console.log('atob ok: pixels=' + pixels.length + ' bytes, palette=' + paletteBytes.length + ' bytes');
    var totalChunks = Math.ceil(pixels.length / CHUNK_SIZE);
    if (DEBUG_PNG)
        console.log('Sending ' + totalChunks + ' chunks');
    var paletteArr = [];
    for (var i = 0; i < paletteBytes.length; i++) {
        paletteArr.push(paletteBytes.charCodeAt(i));
    }
    Pebble.sendAppMessage({ IMAGE_PALETTE: paletteArr }, function () {
        if (DEBUG_PNG)
            console.log('Palette sent ok');
        sendChunk(0);
    }, function (err) {
        if (DEBUG_PNG)
            console.log('Palette send failed: ' + err);
        if (onDone)
            onDone();
    });
    function sendChunk(index) {
        if (index >= totalChunks) {
            if (DEBUG_PNG)
                console.log('All ' + totalChunks + ' chunks sent');
            if (onDone)
                onDone();
            return;
        }
        var chunk = pixels.substr(index * CHUNK_SIZE, CHUNK_SIZE);
        var bytes = [];
        for (var i = 0; i < chunk.length; i++) {
            bytes.push(chunk.charCodeAt(i));
        }
        if (DEBUG_PNG)
            console.log('Sending chunk ' + index + '/' + totalChunks + ' (' + bytes.length + ' bytes)');
        var dict = {
            IMAGE_CHUNK_INDEX: index,
            IMAGE_CHUNKS_TOTAL: totalChunks,
            IMAGE_CHUNK_DATA: bytes,
        };
        Pebble.sendAppMessage(dict, function () {
            if (DEBUG_PNG)
                console.log('Chunk ' + index + ' acked');
            sendChunk(index + 1);
        }, function (err) {
            if (DEBUG_PNG)
                console.log('Chunk ' + index + ' failed: ' + JSON.stringify(err));
            if (onDone)
                onDone();
        });
    }
}
function sendRouteToWatch(output) {
    if (!output.route)
        return;
    var ns = output.nextStep;
    var dict = {
        ROUTE_DISTANCE: Math.round(output.route.distance),
        ROUTE_DURATION: Math.round(output.route.duration / 60),
    };
    if (ns) {
        dict.NEXT_STEP_TYPE = ns.step.type;
        dict.NEXT_STEP_MODIFIER = ns.step.modifier || '';
        dict.NEXT_STEP_NAME = ns.step.name || '';
        dict.NEXT_STEP_DISTANCE = Math.round(ns.remainingDist);
    }
    Pebble.sendAppMessage(dict, function () { }, function (err) {
        console.log('Route info send failed: ' + err);
    });
}
function refresh() {
    if (rendering) {
        console.log('refresh: already rendering, skipping');
        return;
    }
    if (!pipeline) {
        console.log('refresh: pipeline not ready');
        return;
    }
    rendering = true;
    console.log('refresh: starting render');
    pipeline
        .render()
        .then(function (output) {
        if (DEBUG_PNG)
            console.log('render done: pixels=' + output.pixels.length + ' palette=' + output.palette.length);
        sendBitmapToWatch(output.pixels, output.palette, function () {
            rendering = false;
        });
        sendRouteToWatch(output);
    })
        .catch(function (err) {
        rendering = false;
        console.log('Render error: ' + (err.stack || err));
    });
}
function locationSuccess(pos) {
    if (!pipeline)
        return;
    pipeline.setState({
        currentPos: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        bearing: pos.coords.heading || undefined,
    });
    refresh();
}
function locationError(err) {
    console.log('GPS error: ' + err.message);
}
function sendDestinationsToWatch() {
    var names = destinations.map(function (d) {
        return d.name || d.lat + ',' + d.lng;
    });
    for (var i = 0; i < names.length; i++) {
        Pebble.sendAppMessage({
            SELECTED_DEST_INDEX: i,
            ROUTE_DISTANCE: 0,
            ROUTE_DURATION: 0,
            NEXT_STEP_NAME: names[i],
        }, function () { }, function () { });
    }
}
Pebble.addEventListener('ready', function () {
    console.log('PebbleKit JS ready!');
    loadDestinations();
    var info = Pebble.getActiveWatchInfo();
    var w = 144;
    var h = 168;
    if (info.platform === 'emery') {
        w = 200;
        h = 228;
    }
    else if (info.platform === 'chalk') {
        w = 180;
        h = 180;
    }
    console.log('Platform=' + info.platform + ' size=' + w + 'x' + h);
    navigator.geolocation.getCurrentPosition(function (pos) {
        if (!pipeline) {
            pipeline = (0, pipeline_1.createPipeline)({
                origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                zoom: 14,
                mode: 'walking',
                width: w,
                height: h,
            });
        }
        else {
            pipeline.setState({
                origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                currentPos: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                bearing: pos.coords.heading || undefined,
            });
        }
        refresh();
    }, locationError, { timeout: 15000, maximumAge: 60000 });
    navigator.geolocation.watchPosition(locationSuccess, locationError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
    });
});
Pebble.addEventListener('appmessage', function (e) {
    console.log('AppMessage received');
    var payload = e.payload;
    if (payload.ZOOM_DIR != null) {
        if (!pipeline)
            return;
        var dir = payload.ZOOM_DIR;
        var state = pipeline.getState();
        var newZoom = dir === 1 ? state.zoom + 1 : state.zoom - 1;
        newZoom = Math.max(1, Math.min(18, newZoom));
        pipeline.setState({ zoom: newZoom });
        refresh();
    }
    if (payload.REQUEST_DESTINATIONS) {
        sendDestinationsToWatch();
    }
    if (payload.SELECTED_DEST_INDEX != null && destinations[payload.SELECTED_DEST_INDEX]) {
        if (!pipeline)
            return;
        var dest = destinations[payload.SELECTED_DEST_INDEX];
        pipeline.setState({ dest: { lat: dest.lat, lng: dest.lng } });
        refresh();
    }
});
Pebble.addEventListener('showConfiguration', function () {
    var apiKey = localStorage.getItem('ors_api_key') || '';
    var html = (0, settings_1.BuildSettingsMenu)(destinations, apiKey);
    Pebble.openURL('data:text/html,' + encodeURIComponent(html));
});
Pebble.addEventListener('webviewclosed', function (e) {
    if (!e.response)
        return;
    try {
        var data = JSON.parse(decodeURIComponent(e.response));
        if (data.destinations) {
            destinations = data.destinations;
            saveDestinations();
        }
        if (data.ors_api_key) {
            localStorage.setItem('ors_api_key', data.ors_api_key);
        }
    }
    catch (err) {
        console.log('Config parse error: ' + err);
    }
});
