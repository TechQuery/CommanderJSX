export function createTable(list: string[][]) {
    const counts = list.reduce((counts, row) => {
        for (const [index, { length }] of row.entries())
            if (index + 1 < row.length)
                counts[index] = Math.max(counts[index], length);

        return counts;
    }, Array(list[0].length).fill(0));

    return list
        .map(row =>
            row
                .map((column, index) => column.padEnd(counts[index], ' '))
                .join('  ')
                .trimEnd()
        )
        .join('\n');
}
