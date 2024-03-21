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

const main = async () => {
    const files = await fg('**/package.json')

    // extract dependencies from package.json files
    const all = files
        .filter((path: string) => !path.includes(NODE_MODULES))
        .map((filePath: string) => {
            const packageJson = readPackageJson(filePath);
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
    const dirsOrder = executionOrder.map((name: string) => graph.node(name))

    const strategyMatrix = {
        strategy: {
            matrix: {
                packages: dirsOrder
            }
        }
    }

    console.log(stringify(strategyMatrix))
}

main().catch((err) => {
    console.error(err)
})