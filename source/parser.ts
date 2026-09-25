export type PrimitiveData = string | number | boolean | null;

export type Data = PrimitiveData | Record<string, PrimitiveData> | PrimitiveData[];

export function parseData(raw: string): Data {
    try {
        return JSON.parse((raw = raw.trim()));
    } catch {
        return raw.includes(',') ? (raw.split(',').map(parseData) as PrimitiveData[]) : raw;
    }
}

export type OptionData<T> = Record<keyof T, Data>;

export function parseArguments<T>(list: string[]) {
    const options: OptionData<T> = {} as OptionData<T>,
        data: Data[] = [];
    let lastKey = '';

    for (const item of list)
        if (item.startsWith('--')) {
            lastKey = item.slice(2);
            options[lastKey as keyof T] = true;
        } else if (item.startsWith('-')) {
            if (item[2]) for (const k of item.slice(1)) options[k as keyof T] = true;
            else {
                lastKey = item[1];
                options[lastKey as keyof T] = true;
            }
        } else if (lastKey) {
            options[lastKey as keyof T] = parseData(item);
            lastKey = '';
        } else {
            data.push(parseData(item));
        }
    return { options, data };
}
