import { Express } from 'express';
/* eslint-disable @typescript-eslint/no-explicit-any */
// This code was taken from a stack overflow post
// https://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express

function print(path: any, layer: any) {
    if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
    } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))));
    } else if (layer.method) {
        console.log(
            '\x1b[32m %s /%s',
            layer.method.toUpperCase(),
            path.concat(split(layer.regexp)).filter(Boolean).join('/') + '\x1b[0m',
        );
    }
}

function split(thing: any) {
    if (typeof thing === 'string') {
        return thing.split('/');
    } else if (thing.fast_slash) {
        return '';
    } else {
        const match = thing
            .toString()
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '$')
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//);
        return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>';
    }
}

export default function logRouteList(app: Express) {
    app._router.stack.forEach(print.bind(null, []));
}
