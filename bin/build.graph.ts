import {alg, Edge, Graph} from 'graphlib'
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import {stringify} from 'yaml'

interface PackageJson {
    name: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

function readPackageJson(filePath: string): PackageJson {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

const NAMESPACE = '@diia-inhouse'
const NODE_MODULES = 'node_modules'

type Args = { dir?: string }

const main = async ({dir}: Args = {}) => {
    const cwd = dir ?? process.cwd()
    const files = await fg('**/package.json', {cwd})

    // extract dependencies from package.json files
    const all = files
        .filter((path: string) => !path.includes(NODE_MODULES))
        .map((filePath: string) => {
            const resolvedPath = path.resolve(cwd, filePath)
            const packageJson = readPackageJson(resolvedPath);
            const dependencies = Object.keys(packageJson.dependencies || {});
            const devDependencies = Object.keys(packageJson.devDependencies || {});
            const unique = Array.from(new Set([...dependencies, ...devDependencies]));

            // filter only in house packages
            return {
                name: packageJson.name,
                directory: path.dirname(filePath),
                dependencies: unique.filter((d) => d.includes(NAMESPACE))
            }
        })

    // build graph and edges
    const graph = new Graph();
    all.forEach(({name, directory, dependencies}) => {
        graph.setNode(name, directory)

        dependencies.forEach((moduleName: string) => {
            graph.setEdge(name, moduleName);
        })
    })

    const executionOrder = alg.topsort(graph).reverse()
    const dirsOrder = executionOrder.map((name: string) => graph.node(name)).filter(Boolean)
    const lookupDirToName = Object.fromEntries(all.map(({name, directory}) => [directory, name]))
    const lookupNameToDir = Object.fromEntries(all.map(({name, directory}) => [name, directory]))

    // const strategyMatrix = {
    //     strategy: {
    //         matrix: {
    //             packages: dirsOrder
    //         }
    //     }
    // }
    // console.log(stringify(strategyMatrix))

    const workflow = {
        name: "Node.js Packages Build",
        on: {
            release: {types: ["created"]},
            push: {branches: ["main"]},
        },
        jobs: {
            ...Object.fromEntries(executionOrder.map((moduleName: string, index: number) => {
                const edges = <Edge[]>graph.nodeEdges(moduleName)

                // for some packages we may have no directory, they are missed
                let dir = graph.node(moduleName)
                if (dir === undefined) {
                    dir = moduleName.split('/').slice(1)[0]
                    // throw new Error(`dir (${dir}) is undefined for ${moduleName}`)
                }

                const buildName = `build-${(dir === '.') ? 'root' : dir}`
                const dependencies = new Set(edges.map((edge) => `build-${lookupNameToDir[edge.w]}`))
                dependencies.delete(buildName)
                dependencies.delete('build-undefined') // unresolvable dependencies

                return [
                    buildName,
                    {
                        'runs-on': "ubuntu-latest",
                        permissions: { contents: 'read', packages: 'write' },
                        ...((dependencies.size === 0) ? {} : {needs: [...Array.from(dependencies)]}),
                        steps: [
                            {
                                uses: "actions/checkout@v4",
                                with: {submodules: "true"}
                            },
                            {
                                uses: "actions/setup-node@v4",
                                with: {
                                    'node-version': "18.19.1",
                                    'registry-url': "https://npm.pkg.github.com/",
                                    scope: '@diia-inhouse'
                                }
                            },
                            {
                                run: 'npm config list'
                            },
                            {
                                run: ` [ ! -d "${dir}" ] && exit 0 \n cd "${dir}" \n npm install \n npm test \n npm publish `,
                                env: { NODE_AUTH_TOKEN: "\${{secrets.NPM_TOKEN}}" }
                            }
                        ],
                    }
                ]
            })),
        },
    }

    console.log(stringify(workflow))
}

main({dir: process.argv?.[2]}).catch((err) => {
    console.error(err)
})