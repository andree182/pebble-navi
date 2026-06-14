"use strict";
var _global = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
            ? window
            : {};
if (typeof _global.fetch === 'undefined') {
    _global.fetch = function (url, options) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open((options === null || options === void 0 ? void 0 : options.method) || 'GET', url, true);
            if (options === null || options === void 0 ? void 0 : options.headers) {
                for (var _i = 0, _a = Object.keys(options.headers); _i < _a.length; _i++) {
                    var k = _a[_i];
                    xhr.setRequestHeader(k, options.headers[k]);
                }
            }
            xhr.responseType = 'arraybuffer';
            xhr.timeout = 20000;
            xhr.ontimeout = function () {
                console.error('fetch polyfill');
                return reject(new Error('fetch polyfill: timeout'));
            };
            xhr.onload = function () {
                resolve({
                    ok: xhr.status >= 200 && xhr.status < 300,
                    status: xhr.status,
                    arrayBuffer: function () { return Promise.resolve(xhr.response); },
                    json: function () {
                        var view = new Uint8Array(xhr.response);
                        var text = '';
                        for (var i = 0; i < view.length; i++)
                            text += String.fromCharCode(view[i]);
                        return Promise.resolve(JSON.parse(text));
                    },
                });
            };
            xhr.onerror = function () {
                console.error('fetch polyfill');
                return reject(new Error('fetch polyfill: network error'));
            };
            xhr.send();
        });
    };
}
var _timers = {};
console.time = function (label) {
    _timers[label] = Date.now();
};
console.timeEnd = function (label) {
    var start = _timers[label];
    if (start !== undefined) {
        delete _timers[label];
        console.log(label + ': ' + (Date.now() - start) + 'ms');
    }
};
if (typeof btoa === 'undefined') {
    var chars_1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    globalThis.btoa = function (s) {
        var out = '';
        for (var i = 0; i < s.length; i += 3) {
            var a = s.charCodeAt(i), b = s.charCodeAt(i + 1) || 0, c = s.charCodeAt(i + 2) || 0;
            out +=
                chars_1[a >> 2] +
                    chars_1[((a & 3) << 4) | (b >> 4)] +
                    chars_1[((b & 15) << 2) | (c >> 6)] +
                    chars_1[c & 63];
        }
        var m = s.length % 3;
        return m ? out.slice(0, m - 3 || undefined) + (m === 1 ? '==' : '=') : out;
    };
    globalThis.atob = function (s) {
        s = s.replace(/=+$/, '');
        var out = '';
        for (var i = 0; i < s.length; i += 4) {
            var a = chars_1.indexOf(s[i]), b = chars_1.indexOf(s[i + 1]), c = chars_1.indexOf(s[i + 2]), d = chars_1.indexOf(s[i + 3]);
            out += String.fromCharCode((a << 2) | (b >> 4));
            if (c >= 0)
                out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
            if (d >= 0)
                out += String.fromCharCode(((c & 3) << 6) | d);
        }
        return out;
    };
}
