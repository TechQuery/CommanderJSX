import { currentModulePath, packageOf } from '@tech_query/node-toolkit';

import { Command } from '../source/dist';

const log = (console.log = jest.fn()),
    CMP = currentModulePath();
const { meta } = packageOf(CMP);

const simple_command = (
    <Command>
        <Command name="sub-command" />
    </Command>
);

describe('Simple Command execution', () => {
    jest.replaceProperty(process, 'argv', ['node', CMP]);

    it('should find the Command Name in "package.json" for root Command', () => {
        const name = Command.nameOf(
            {
                name: 'test',
                bin: {
                    a: './dist/a.js',
                    b: 'dist/b.js'
                }
            },
            '/home/test/.pnpm/global/5/node_modules/fs-match/dist/a.js'
        );

        expect(name).toBe('a');
    });

    it('should show the Version number of this package for root Command', () => {
        Command.execute(simple_command, ['-v']);

        expect(log).toHaveBeenLastCalledWith(meta.version);
    });

    it('should show the Name & Description of this package for root Command', () => {
        Command.execute(simple_command, ['-h']);

        expect(log).toHaveBeenLastCalledWith(
            `${meta.name}

${meta.description}

Options:
  -h, --help       show Help information
  -v, --version    show Version number

Commands:
  help         [command]  show Help information
  sub-command`
        );
    });
});

const git_command = (
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

describe('Complex Command execution', () => {
    it('should show the Version number of root Command', () => {
        Command.execute(git_command, ['-v']);

        expect(log).toHaveBeenLastCalledWith('2.10.0');
    });

    it('should show the Help text of root Command', () => {
        Command.execute(git_command, ['-h']);

        expect(log).toHaveBeenLastCalledWith(`git [command] [options]

Distributed Version Control system

Options:
  -h, --help       show Help information
  -v, --version    show Version number

Commands:
  help    [command]  show Help information
  remote             Manage the set of repositories ("remotes") whose branches you track`);
    });

    it('should show the Help text of sub Command', () => {
        Command.execute(git_command, ['remote', 'help']);

        expect(log).toHaveBeenLastCalledWith(`git remote

Manage the set of repositories ("remotes") whose branches you track

Options:
  -h, --help    show Help information

Commands:
  add              Adds a remote named <name> for the repository at <url>
  help  [command]  show Help information`);
    });

    it('should show the Help text of sub Command with Options', () => {
        const text = `git remote add

Adds a remote named <name> for the repository at <url>

Options:
  -h, --help            show Help information
  -t, --tree  <branch>  Branch tree

Commands:
  help  [command]  show Help information`;

        Command.execute(git_command, ['remote', 'help', 'add']);

        expect(log).toHaveBeenLastCalledWith(text);

        Command.execute(git_command, ['remote', 'add', '--help']);

        expect(log).toHaveBeenLastCalledWith(text);
    });

    it('should execute the Command with Options & Data', () => {
        Command.execute(git_command, [
            'remote',
            'add',
            '-t',
            'master',
            'origin',
            'https://github.com/TechQuery/CommanderJSX.git'
        ]);

        expect(log).toHaveBeenLastCalledWith(
            'master',
            'origin',
            'https://github.com/TechQuery/CommanderJSX.git'
        );
    });

    it('should handle the Error of Options & Commands', () => {
        expect(() => Command.execute(git_command, ['test'])).toThrow(
            new ReferenceError('Unknown "test" command')
        );
        expect(() => Command.execute(git_command, ['--test'])).toThrow(
            new ReferenceError('Unknown "test" option')
        );
        expect(() => Command.execute(git_command, ['remote', 'add', '-t', 'a/1'])).toThrow(
            new SyntaxError(`"tree=a/1" doesn't match /^\\w+$/`)
        );
    });
});
