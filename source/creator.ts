import { Command, CommandMeta } from './Command';

declare global {
    namespace JSX {
        interface IntrinsicElements<T> {
            [key: string]: Command<T>;
        }
    }
}

export function createCommand<T>(
    component: { new (meta: CommandMeta<T>): Command<T> },
    props: CommandMeta<T>,
    ...children: Command<T>[]
) {
    return new component({ ...props, children });
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
