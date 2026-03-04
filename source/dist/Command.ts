import { packageOf } from '@tech_query/node-toolkit';

import { OptionData, Data, parseArguments } from './parser';
import { createTable } from './creator';

export interface Option {
    shortcut?: string;
    parameters?: string;
    pattern?: RegExp;
    description?: string;
}

export type Options<T> = Record<keyof T, Option>;

export type Executor<I, O = any> = (options: OptionData<I>, ...data: Data[]) => O;

export type CommandChildren<I = any, O = any> = Command<I, O> | Array<CommandChildren<I, O>>;

export interface CommandMeta<I, O = any> extends Option {
    name?: string;
    version?: string;
    options?: Options<I>;
    children?: CommandChildren<I>;
    executor?: Executor<I, O>;
}

const PresetOption = {
    version: { shortcut: 'v', description: 'show Version number' },
    help: { shortcut: 'h', description: 'show Help information' }
};

export class Command<I = any, O = any> implements CommandMeta<I, O> {
    name = '';
    parameters = '';
    description = '';
    version = '';
    options: Options<I> = {} as Options<I>;
    parent?: Command;
    children: Command[] = [];
    executor?: Executor<I, O>;

    constructor(meta: CommandMeta<I, O>) {
        Object.assign(this, meta);

        for (const command of this.children) command.parent = this;

        this.addPreset();
    }

    static nameOf(meta: Record<string, any>, commandPath: string) {
        if (typeof meta.bin != 'object') return meta.name as string;

        commandPath = commandPath.replaceAll('\\', '/');

        return Object.entries(meta.bin as Record<string, string>).find(([name, path]) =>
            commandPath.endsWith(path.replace(/^\.\//, ''))
        )?.[0];
    }

    static async execute<I, O>(command: Command<I, O>, args: string[]) {
        const { data, options } = parseArguments<I>(args);

        if (!command.parent && (!command.name || !command.version || !command.description)) {
            const [_, commandPath] = process.argv;
            const { meta } = packageOf(commandPath);

            command.name ||= this.nameOf(meta, commandPath) || '';
            command.description ||= meta.description || '';

            if ((command.version ||= meta.version || ''))
                (command.options as Record<keyof typeof PresetOption, any>).version =
                    PresetOption.version;
        }
        return command.execute(options as OptionData<I>, ...data);
    }

    execute(options: OptionData<I>, ...data: Data[]): O | void {
        const command = this.children.find(({ name }) => name === data[0]);

        if (command instanceof Command) return command.execute(options, ...data.slice(1));

        options = this.checkPattern(this.replaceShortcut(options));

        if ('version' in options) {
            console.log(this.version);
        } else if ('help' in options) {
            this.showHelp();
        } else if (this.executor instanceof Function) {
            return this.executor(options, ...data);
        } else {
            throw ReferenceError(`Unknown "${data[0]}" command`);
        }
    }

    protected replaceShortcut(options: OptionData<I>) {
        const map: Record<string, keyof I> = Object.fromEntries(
                Object.entries<Option>(this.options).map(([key, { shortcut }]) => [shortcut, key])
            ),
            data: OptionData<I> = {} as OptionData<I>;

        for (const key in options)
            if (key in map) data[map[key]] = options[key];
            else data[key] = options[key];

        return data;
    }

    protected checkPattern(options: OptionData<I>) {
        for (const key in options) {
            const option = this.options[key];

            if (!option) throw ReferenceError(`Unknown "${key}" option`);

            if (option.pattern?.test(options[key] + '') === false)
                throw SyntaxError(`"${key}=${options[key]}" doesn't match ${option.pattern}`);
        }
        return options;
    }

    protected addPreset() {
        const { name, options, children } = this,
            { version, help } = PresetOption;

        Object.assign(this.options, {
            ...(this.version ? { version } : {}),
            help,
            ...options
        });

        if (name !== 'help' && !children.find(({ name }) => name === 'help'))
            children.push(
                new Command({
                    name: 'help',
                    ...help,
                    parameters: '[command]',
                    executor: (_, command) => this.showHelp(command as string)
                })
            );
    }

    showHelp(command?: string) {
        const that = command ? this.children.find(({ name }) => name === command) : this;

        if (!that) throw new ReferenceError(`Unknown "${command}" command`);

        console.log(that + '');
    }

    *getParentNames() {
        let that: Command | undefined = this;

        while ((that = that.parent)) yield that.name;
    }

    toString() {
        const result = [
            [this.parameters, this.name, ...this.getParentNames()].reverse().join(' ').trim(),
            this.description,
            'Options:\n' + this.toOptionString()
        ];

        if (this.children[0]) result.push('Commands:\n' + this.toChildrenString());

        return result.join('\n\n');
    }

    toOptionString() {
        return createTable(
            Object.entries<Option>(this.options as Options<I>)
                .sort(([A], [B]) => A.localeCompare(B))
                .map(([name, { shortcut, parameters = '', description = '' }]) => [
                    '',
                    `${shortcut ? `-${shortcut}, ` : ''}${name[1] ? '-' : ''}-${name}`,
                    parameters,
                    description
                ])
        );
    }

    toChildrenString() {
        return createTable(
            this.children
                .sort(({ name: A }, { name: B }) => A.localeCompare(B))
                .map(({ name, parameters = '', description = '' }) => [
                    '',
                    name,
                    parameters,
                    description
                ])
        );
    }
}
