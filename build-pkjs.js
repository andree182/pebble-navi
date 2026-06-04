#!/usr/bin/env node
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const SDK_ROOT = path.join(
    process.env.HOME,
    'Library/Application Support/Pebble SDK/SDKs/current/sdk-core'
);
const SHARED_ADDITIONS = path.join(
    SDK_ROOT,
    'pebble/common/include/_pkjs_shared_additions.js'
);
const MESSAGE_KEYS = path.join(__dirname, 'build/js/message_keys.json');
const INDEX_ENTRY = path.join(__dirname, 'src/pkjs/index.js');
const OUT_FILE = path.join(__dirname, 'build/pebble-js-app.js');
const OUT_MAP = path.join(__dirname, 'build/pebble-js-app.js.map');

if (!fs.existsSync(SHARED_ADDITIONS)) {
    console.error('Cannot find Pebble SDK shared additions at:', SHARED_ADDITIONS);
    process.exit(1);
}

const entry = [
    `require(${JSON.stringify(SHARED_ADDITIONS)});`,
    `require(${JSON.stringify(INDEX_ENTRY)});`,
    '',
].join('\n');

esbuild
    .build({
        stdin: {
            contents: entry,
            resolveDir: __dirname,
            sourcefile: 'pkjs-entry.js',
        },
        outfile: OUT_FILE,
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: 'es2015',
        sourcemap: true,
        sourceRoot: __dirname,
        logLevel: 'info',
        alias: {
            message_keys: MESSAGE_KEYS,
        },
    })
    .then(() => {
        if (fs.existsSync(OUT_FILE)) {
            const size = fs.statSync(OUT_FILE).size;
            console.log(`pkjs bundle: ${OUT_FILE} (${size} bytes)`);
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
