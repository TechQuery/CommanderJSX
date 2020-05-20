# CommanderJSX

**Command-line Arguments Parser** with [JSX][1] support

[![NPM Dependency](https://david-dm.org/TechQuery/CommanderJSX.svg)][2]
[![Build Status](https://travis-ci.com/TechQuery/CommanderJSX.svg?branch=master)][3]

[![NPM](https://nodei.co/npm/commander-jsx.png?downloads=true&downloadRank=true&stars=true)][4]

## Example

`index.tsx`

```JavaScript
import { Command, createCommand } from 'commander-jsx';

Command.execute(
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
    </git>,
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

    git [command] [options]

    Distributed Version Control system

    Options:
      -h, --help       show Help information
      -v, --version    show Version number

    Commands:
      help    [command]  show Help information
      remote             Manage the set of repositories ("remotes") whose branches you track

[1]: https://facebook.github.io/jsx/
[2]: https://david-dm.org/TechQuery/CommanderJSX
[3]: https://travis-ci.com/TechQuery/CommanderJSX
[4]: https://nodei.co/npm/commander-jsx/
