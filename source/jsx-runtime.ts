import { makeArray } from 'web-utility';

import { Command, CommandChildren, CommandMeta } from './dist/Command';

declare global {
    namespace JSX {
        interface ElementType<T = any> {
            new (meta: CommandMeta<T>): Command<T>;
        }
        interface Element extends Command<any> {}
        interface IntrinsicAttributes {
            children?: CommandChildren;
        }
    }
}

/**
 * JSX runtime for CommanderJSX
 * @see {@link https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md}
 * @see {@link https://babeljs.io/docs/babel-plugin-transform-react-jsx}
 */
export const jsx = <T>(
    type: { new (meta: CommandMeta<T>): Command<T> },
    { children, ...props }: CommandMeta<T> & { children?: CommandChildren<T> }
): Command<T> =>
    new type({
        ...props,
        children: makeArray(children)
    } as CommandMeta<T>);

export const jsxs = jsx;
export const jsxDEV = jsx;

/**
 * Fragment support (not typically used in CommanderJSX, but required by JSX runtime)
 */
export const Fragment = ({ children }: JSX.IntrinsicAttributes) => makeArray(children);
