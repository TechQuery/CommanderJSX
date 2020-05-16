import { createCommand, Command } from '../source';

const log = (console.log = jest.fn());

const command = (
    <git version="2.10.0" description="Distributed Version Control system">
        <remote
            description={`Manage the set of repositories ("remotes") whose branches you track`}
        >
            <add
                description="Adds a remote named <name> for the repository at <url>"
                options={{
                    t: { parameters: '<branch>', description: 'Branch tree' }
                }}
                executor={({ t }, name, url) => console.log(t, name, url)}
            />
        </remote>
    </git>
);

describe('Command execution', () => {
    it('should show the Version number of root Command', async () => {
        Command.execute(command, ['-v']);

        expect(log).lastCalledWith('2.10.0');
    });

    it('should show the Help text of root Command', () => {
        Command.execute(command, ['-h']);

        expect(log).lastCalledWith(`git
Distributed Version Control system

Options:
  -h           show Help information
  --help       show Help information
  -v           show Version number
  --version    show Version number
Commands:
  help      show Help information
  remote    Manage the set of repositories ("remotes") whose branches you track`);
    });

    it('should show the Help text of sub Command', () => {
        Command.execute(command, ['remote', 'help']);

        expect(log).lastCalledWith(`git remote
Manage the set of repositories ("remotes") whose branches you track

Options:
  -h        show Help information
  --help    show Help information
Commands:
  add     Adds a remote named <name> for the repository at <url>
  help    show Help information`);
    });

    it('should show the Help text of sub Command with Options', () => {
        Command.execute(command, ['remote', 'add', '--help']);

        expect(log).lastCalledWith(`git remote add
Adds a remote named <name> for the repository at <url>

Options:
  -h                show Help information
  --help            show Help information
  -t      <branch>  Branch tree`);
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
});
