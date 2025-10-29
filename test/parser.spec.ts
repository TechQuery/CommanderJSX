import { parseData, parseArguments } from '../source/dist/parser';

describe('Data parser', () => {
    it('should parse String to Data', () => {
        expect(parseData('1')).toBe(1);
        expect(parseData('2x')).toBe('2x');
        expect(parseData('1,2x')).toEqual(expect.arrayContaining([1, '2x']));
    });

    it('should parse Command-line arguments to an Object', () => {
        expect(
            parseArguments(['-a', '-b', '0', '-cd', '--test', '--example', '0,1', 'sample'])
        ).toMatchObject({
            options: {
                a: true,
                b: 0,
                c: true,
                d: true,
                test: true,
                example: [0, 1]
            },
            data: ['sample']
        });
    });
});
