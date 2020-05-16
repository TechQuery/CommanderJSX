import { OptionData, Data, parseArguments } from './parser';
import { createTable } from './creator';

export interface Option {
    parameters?: string;
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

    execute(options: OptionData<T>, ...data: Data[]) {
        const command = this.children.find(({ name }) => name === data[0]);

        if (command instanceof Command) {
            command.execute(options, ...data.slice(1));
        } else if ('v' in options || 'version' in options) {
            console.log(this.version);
        } else if ('h' in options || 'help' in options) {
            this.showHelp();
        } else if (this.executor instanceof Function) {
            this.executor(options, ...data);
        } else {
            throw ReferenceError(`Unknown "${data[0]}" command`);
        }
    }

    private addPreset() {
        const { name, options, children } = this,
            version = { description: 'show Version number' },
            help = { description: 'show Help information' };

        Object.assign(this.options, {
            ...(this.version && { v: version, version }),
            h: help,
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
                    executor: () => this.showHelp()
                })
            );
    }

    showHelp() {
        console.log(this + '');
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
            ''
        ];

        result.push('Options:');
        result.push(this.toOptionString());

        if (this.children[0]) {
            result.push('Commands:');
            result.push(this.toChildrenString());
        }
        return result.join('\n');
    }

    toOptionString() {
        return createTable(
            Object.entries<Option>(this.options as Options<T>)
                .sort(([A], [B]) => A.localeCompare(B))
                .map(([name, { parameters = '', description = '' }]) => [
                    '',
                    name[1] ? '--' + name : '-' + name,
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
