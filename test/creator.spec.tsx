import { createCommand, createTable } from '../source';

describe('Creating utility', () => {
    it('should create a Command tree with JSX', () => {
        const command = (
            <test description="test">
                <example />
            </test>
        );
        expect(command).toMatchObject({
            name: 'test',
            description: 'test'
        });
        expect(command.children[0]).toMatchObject({ name: 'example' });
    });

    it('should create a Text Table with Space separators', () => {
        expect(
            createTable([
                ['a', 'BB', 'c'],
                ['AA', 'b', 'CC']
            ])
        ).toBe('a   BB  c\nAA  b   CC');
    });
});
