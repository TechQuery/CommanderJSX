import { createCommand, Command } from '../source';

const log = (console.log = jest.fn());

const command = (
    <Command
        name="git"
        version="2.10.0"
        parameters="[command] [options]"
        description="Distributed Version Control system"
    >
        <Command
            name="remote"
            description='Manage the set of repositories ("remotes") whose branches you track'
        >
            <Command
                name="add"
                description="Adds a remote named <name> for the repository at <url>"
                options={{
                    tree: {
                        shortcut: 't',
                        parameters: '<branch>',
                        pattern: /^\w+$/,
                        description: 'Branch tree'
                    }
                }}
                executor={({ tree }, name, url) => console.log(tree, name, url)}
            />
        </Command>
    </Command>
);

describe('Command execution', () => {
    it('should show the Version number of root Command', async () => {
        Command.execute(command, ['-v']);

        expect(log).lastCalledWith('2.10.0');
    });

    it('should show the Help text of root Command', () => {
        Command.execute(command, ['-h']);

        expect(log).lastCalledWith(`git [command] [options]

Distributed Version Control system

Options:
  -h, --help       show Help information
  -v, --version    show Version number

Commands:
  help    [command]  show Help information
  remote             Manage the set of repositories ("remotes") whose branches you track`);
    });

    it('should show the Help text of sub Command', () => {
        Command.execute(command, ['remote', 'help']);

        expect(log).lastCalledWith(`git remote

Manage the set of repositories ("remotes") whose branches you track

Options:
  -h, --help       show Help information
  -v, --version    show Version number

Commands:
  add              Adds a remote named <name> for the repository at <url>
  help  [command]  show Help information`);
    });

    it('should show the Help text of sub Command with Options', () => {
        const text = `git remote add

Adds a remote named <name> for the repository at <url>

Options:
  -h, --help               show Help information
  -t, --tree     <branch>  Branch tree
  -v, --version            show Version number`;

        Command.execute(command, ['remote', 'help', 'add']);

        expect(log).lastCalledWith(text);

        Command.execute(command, ['remote', 'add', '--help']);

        expect(log).lastCalledWith(text);
    });

    it('should execute the Command with Options & Data', () => {
        Command.execute(command, [
            'remote',
            'add',
            '-t',
            'master',
            'origin',
            'https://github.com/TechQuery/CommanderJSX.git'
        ]);

        expect(log).lastCalledWith(
            'master',
            'origin',
            'https://github.com/TechQuery/CommanderJSX.git'
        );
    });

    it('should handle the Error of Options & Commands', () => {
        expect(() => Command.execute(command, ['test'])).toThrowError(
            new ReferenceError('Unknown "test" command')
        );
        expect(() => Command.execute(command, ['--test'])).toThrowError(
            new ReferenceError('Unknown "test" option')
        );
        expect(() =>
            Command.execute(command, ['remote', 'add', '-t', 'a/1'])
        ).toThrowError(new SyntaxError(`"tree=a/1" doesn't match /^\\w+$/`));
    });
});
