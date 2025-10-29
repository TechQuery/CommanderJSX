"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fragment = exports.jsxDEV = exports.jsxs = void 0;
exports.jsx = jsx;
const tslib_1 = require("tslib");
/**
 * JSX runtime for CommanderJSX
 * @see {@link https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md}
 * @see {@link https://babeljs.io/docs/babel-plugin-transform-react-jsx}
 */
function jsx(type, _a) {
    var { children } = _a, props = tslib_1.__rest(_a, ["children"]);
    const childArray = children
        ? Array.isArray(children)
            ? children
            : [children]
        : [];
    return new type(Object.assign(Object.assign({}, props), { children: childArray }));
}
exports.jsxs = jsx;
exports.jsxDEV = jsx;
/**
 * Fragment support (not typically used in CommanderJSX, but required by JSX runtime)
 */
const Fragment = ({ children }) => Array.isArray(children) ? children : children ? [children] : [];
exports.Fragment = Fragment;
