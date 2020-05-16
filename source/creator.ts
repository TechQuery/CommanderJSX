import { Options, Executor, Command } from './Command';

export interface Props<T> {
    parameters?: string;
    description?: string;
    version?: string;
    options?: Options<T>;
    executor?: Executor<T>;
    children?: Command<T>[];
}

export function createCommand<T>(
    name: string,
    props: Props<T>,
    ...children: Command<T>[]
) {
    return new Command({
        ...props,
        name,
        children
    });
}

export function createTable(list: string[][]) {
    const counts = list.reduce((counts, row) => {
        row.forEach((column, index) => {
            if (index + 1 < row.length)
                counts[index] = Math.max(counts[index], column.length);
        });
        return counts;
    }, Array(list[0].length).fill(0));

    return list
        .map(row =>
            row
                .map((column, index) => column.padEnd(counts[index], ' '))
                .join('  ')
        )
        .join('\n');
}
