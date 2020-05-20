import { OptionData, Data, parseArguments } from './parser';
import { createTable } from './creator';

export interface Option {
    shortcut?: string;
    parameters?: string;
    pattern?: RegExp;
    description?: string;
}

export type Options<T> = Record<keyof T, Option>;

export type Executor<T> = (options: OptionData<T>, ...data: Data[]) => any;

export interface CommandMeta<T> extends Option {
    name: string;
    version?: string;
    options?: Options<T>;
    children?: Command<T>[];
    executor?: Executor<T>;
}

export class Command<T = any> {
    name: string;
    parameters = '';
    description = '';
    version = '';
    options: Options<T> = {} as Options<T>;
    parent?: Command<T>;
    children: Command<T>[] = [];
    executor?: Executor<T>;

    constructor({ name, ...meta }: CommandMeta<T>) {
        this.name = name;
        Object.assign(this, meta);

        for (const command of this.children) command.parent = this;

        this.addPreset();
    }

    static execute<T>(command: Command<T>, args: string[]) {
        const { data, options } = parseArguments<T>(args);

        command.execute(options as OptionData<T>, ...data);
    }

    execute(options: OptionData<T>, ...data: Data[]): void {
        const command = this.children.find(({ name }) => name === data[0]);

        if (command instanceof Command)
            return command.execute(options, ...data.slice(1));

        options = this.checkPattern(this.replaceShortcut(options));

        if ('version' in options) {
            console.log(this.version);
        } else if ('help' in options) {
            this.showHelp();
        } else if (this.executor instanceof Function) {
            this.executor(options, ...data);
        } else {
            throw ReferenceError(`Unknown "${data[0]}" command`);
        }
    }

    protected replaceShortcut(options: OptionData<T>) {
        const map: Record<string, keyof T> = Object.fromEntries(
                Object.entries<Option>(
                    this.options
                ).map(([key, { shortcut }]) => [shortcut, key])
            ),
            data: OptionData<T> = {} as OptionData<T>;

        for (const key in options)
            if (key in map) data[map[key]] = options[key];
            else data[key] = options[key];

        return data;
    }

    protected checkPattern(options: OptionData<T>) {
        for (const key in options) {
            const option = this.options[key];

            if (!option) throw ReferenceError(`Unknown "${key}" option`);

            if (option.pattern?.test(options[key] + '') === false)
                throw SyntaxError(
                    `"${key}=${options[key]}" doesn't match ${option.pattern}`
                );
        }
        return options;
    }

    protected addPreset() {
        const { name, options, children, executor } = this,
            version = { shortcut: 'v', description: 'show Version number' },
            help = { shortcut: 'h', description: 'show Help information' };

        Object.assign(this.options, {
            ...(this.version && { version }),
            help,
            ...options
        });

        if (
            name !== 'help' &&
            children[0] &&
            !children.find(({ name }) => name === 'help')
        )
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
        if (!command) return console.log(this + '');

        const that = this.children.find(({ name }) => name === command);

        if (that) console.log(that + '');
    }

    *getParentNames() {
        let that: Command | undefined = this;

        while ((that = that.parent)) yield that.name;
    }

    toString() {
        const result = [
            [this.parameters, this.name, ...this.getParentNames()]
                .reverse()
                .join(' ')
                .trim(),
            this.description,
            'Options:\n' + this.toOptionString()
        ];

        if (this.children[0])
            result.push('Commands:\n' + this.toChildrenString());

        return result.join('\n\n');
    }

    toOptionString() {
        return createTable(
            Object.entries<Option>(this.options as Options<T>)
                .sort(([A], [B]) => A.localeCompare(B))
                .map(
                    ([
                        name,
                        { shortcut, parameters = '', description = '' }
                    ]) => [
                        '',
                        `${shortcut ? `-${shortcut}, ` : ''}${
                            name[1] ? '-' : ''
                        }-${name}`,
                        parameters,
                        description
                    ]
                )
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
