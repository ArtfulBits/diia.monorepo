import {alg, Graph} from 'graphlib'
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { stringify } from 'yaml'

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

const main = async ({ dir }: Args = {}) => {
    const cwd = dir ?? process.cwd()
    console.log('cwd', cwd, dir)
    const files = await fg('**/package.json', { cwd })

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
        .filter(({name}) => name.includes(NAMESPACE))

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

    const strategyMatrix = {
        strategy: {
            matrix: {
                packages: dirsOrder
            }
        }
    }

    console.log(stringify(strategyMatrix))
}

main({ dir: process.argv?.[2] }).catch((err) => {
    console.error(err)
})