# CommanderJSX

**Command-line Arguments Parser** with [JSX][1] support

[![NPM Dependency](https://david-dm.org/TechQuery/CommanderJSX.svg)][2]
[![CI & CD](https://github.com/TechQuery/CommanderJSX/actions/workflows/main.yml/badge.svg)][3]

[![NPM](https://nodei.co/npm/commander-jsx.png?downloads=true&downloadRank=true&stars=true)][4]

## Example

`index.tsx`

```JavaScript
import { Command, createCommand } from 'commander-jsx';

Command.execute(
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
    </Command>,
    process.argv.slice(2)
);
```

`tsconfig.json`

```JSON
{
    "compilerOptions": {
        "module": "CommonJS",
        "moduleResolution": "Node",
        "jsx": "react",
        "jsxFactory": "createCommand",
        "target": "ES2017",
        "outDir": "dist/"
    }
}
```

Then, run `git help` in your terminal, it'll outputs:

```text
git [command] [options]

Distributed Version Control system

Options:
  -h, --help       show Help information
  -v, --version    show Version number

Commands:
  help    [command]  show Help information
  remote             Manage the set of repositories ("remotes") whose branches you track
```

[1]: https://facebook.github.io/jsx/
[2]: https://david-dm.org/TechQuery/CommanderJSX
[3]: https://github.com/TechQuery/CommanderJSX/actions/workflows/main.yml
[4]: https://nodei.co/npm/commander-jsx/
