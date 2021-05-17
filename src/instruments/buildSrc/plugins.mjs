import fs from 'fs';
import os from 'os';
import image from '@rollup/plugin-image';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel as babelPlugin } from '@rollup/plugin-babel';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';
import {Directories} from "./directories.mjs";

const __dirname = new URL('.', import.meta.url).pathname;

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function babel() {
    return babelPlugin({
        presets: [
            ['@babel/preset-env', { targets: { safari: '11' } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            ['@babel/preset-typescript'],
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            ['@babel/plugin-transform-runtime', { regenerator: true }],
        ],
        babelHelpers: 'runtime',
        compact: false,
        extensions,
    });
}

function postCss(instrumentFolder, instrumentName) {
    let plugins = [];

    const tailwindConfigPath = `${__dirname}/../src/${instrumentFolder}/tailwind.config.js`;

    if (fs.existsSync(tailwindConfigPath)) {
        plugins = [
            tailwindcss(tailwindConfigPath)
        ];
    } else {
        plugins = [
            tailwindcss(undefined)
        ];
    }

    return postcss({
        use: { sass: {} },
        plugins,
        extract: `bundle.css`,
    });
}

export function baseCompile(instrumentFolder, instrumentName) {
    return [
        image(),
        nodeResolve({extensions}),
        commonjs({include: /node_modules/}),
        babel(),
        typescriptPaths({
            tsConfigPath:`${Directories.src}/tsconfig.json`,
            preserveExtensions: true,
        }),
        replace({'process.env.NODE_ENV': '"production"'}),
        postCss(instrumentFolder, instrumentName),
    ]
}