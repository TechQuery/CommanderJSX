import { Command, CommandMeta } from './Command';
declare global {
    namespace JSX {
        interface ElementType<T = any> {
            new (meta: CommandMeta<T>): Command<T>;
        }
        interface Element extends Command<any> {
        }
        interface IntrinsicAttributes {
            children?: Command<any> | Command<any>[];
        }
    }
}
/**
 * JSX runtime for CommanderJSX
 * @see {@link https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md}
 * @see {@link https://babeljs.io/docs/babel-plugin-transform-react-jsx}
 */
export declare function jsx<T>(type: {
    new (meta: CommandMeta<T>): Command<T>;
}, { children, ...props }: CommandMeta<T> & {
    children?: Command<T> | Command<T>[];
}): Command<T>;
export declare const jsxs: typeof jsx;
export declare const jsxDEV: typeof jsx;
/**
 * Fragment support (not typically used in CommanderJSX, but required by JSX runtime)
 */
export declare const Fragment: ({ children }: {
    children?: Command<any>[];
}) => Command<any>[];
