import {alg, Edge, Graph} from "graphlib";
import fs from "fs";
import path from "path";
import fg from "fast-glob";
import {stringify} from "yaml";
import dedent from "dedent";

interface PackageJson {
    name: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

function readPackageJson(filePath: string): PackageJson {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
}

const NAMESPACE = "@diia-inhouse";
const NODE_MODULES = "node_modules";

const composeWorkflowJobs = (graph: Graph, lookupNameToDir: Record<string, string>) =>
    (moduleName: string, index: number) => {
        const edges = <Edge[]>graph.nodeEdges(moduleName);

        // for some packages we may have no directory, they are missed
        let dir = graph.node(moduleName);
        if (dir === undefined) {
            dir = moduleName.split("/").slice(1)[0];
            // throw new Error(`dir (${dir}) is undefined for ${moduleName}`)
        }

        const buildName = `build-${dir === "." ? "root" : dir}`;
        const dependencies = new Set(edges.map((edge) => `build-${lookupNameToDir[edge.w]}`));
        dependencies.delete(buildName);
        dependencies.delete("build-undefined"); // unresolvable dependencies

        const services = {
            verdaccio: {
                image: "verdaccio/verdaccio",
                ports: ["4873:4873"],
                // ref: https://github.com/orgs/community/discussions/42127
                volumes: ["${{ github.workspace }}/.github/workflows/verdaccio/conf:/verdaccio/conf"],
                options: "--name verdaccio",
            },
        }

        return [
            buildName,
            {
                "runs-on": "ubuntu-latest",
                // permissions: {contents: "read", packages: "write"},
                ...(dependencies.size === 0 ? {} : {needs: [...Array.from(dependencies)]}),
                services,
                steps: [
                    // ref: https://github.com/actions/checkout/issues/211
                    {
                        name: "Chown user",
                        run: "sudo chown -R $USER:$USER $GITHUB_WORKSPACE",
                    },
                    {
                        uses: "actions/checkout@v4",
                        with: {submodules: "true"},
                    },
                    {
                        name: "Sync submodules configuration",
                        run: dedent`bin/00-initialize.sh --sync`,
                    },
                    {
                        // Restart Verdaccio after volumes have been checked out
                        name: "Restart Verdaccio",
                        uses: "docker://docker",
                        with: {
                            args: "docker restart verdaccio",
                        },
                    },
                    // ref: https://www.andreamedda.com/posts/go-buf-github-actions/
                    // ref: https://github.com/arduino/setup-protoc
                    {
                        name: "Install Protoc",
                        uses: "arduino/setup-protoc@v3",
                    },
                    {
                        uses: "actions/setup-node@v4",
                        with: {
                            "node-version": "18.19.1",
                            "registry-url": "http://localhost:4873/",
                        },
                    },
                    // ref: https://github.com/uiolee/create-hexo/blob/3d695204fd15a7d9ca126b2002a34e86d02b649c/.github/workflows/ci.yml#L118
                    // ref: https://github.com/juanpicado/e2e-ci-example-gh-actions/blob/e0e4a5a32856d244193a91b82129cc9bef8fc830/.github/workflows/node.js.yml
                    {
                        name: "Configure NPM registry to Verdaccio for Package",
                        run: dedent`
                            rm -rf .npmrc && touch .npmrc
                            npm set registry http://localhost:4873/
                            npx npm-cli-adduser -u test -p 1234 -e test@domain.test -r http://localhost:4873
                            npx npm-cli-login -u test -p 1234 -e test@domain.test -r http://localhost:4873
                            [ ! -d "${dir}" ] && exit 0 || cd "${dir}"
                            rm -rf .npmrc && touch .npmrc
                            npx npm-cli-login -u test -p 1234 -e test@domain.test -r http://localhost:4873
                        `,
                    },
                    {
                        name: 'Make folder for artifacts',
                        run: dedent`mkdir -p .artifacts`,
                    },
                    {
                        uses: "actions/download-artifact@v4",
                        with: {path: ".artifacts"},
                    },
                    {
                        name: "Publish NPM Package from Artifacts into Verdaccio",
                        run: dedent`
                            find .artifacts -type f -name "*.tgz" -exec npm publish {} \;
                            find diia-setup-howto/backend/clients -type f -name "*.tgz" -exec npm publish {} \;
                        `,
                    },
                    {
                        name: "Build and Pack",
                        run: dedent`
                            [ ! -d "${dir}" ] && exit 0 || cd "${dir}"
                            npm install
                            npm pack
                        `,
                    },
                    {
                        name: "Run Unit Testing",
                        run: dedent`
                            [ ! -d "${dir}" ] && exit 0 || cd "${dir}"
                            npm test --if-present
                        `,
                    },
                    {
                        uses: "actions/upload-artifact@v4",
                        with: {
                            name: `artifact-${dir}`,
                            overwrite: true,
                            "compression-level": 0,
                            "retention-days": 5,
                            path: `${dir}/diia-inhouse-*.tgz`,
                        },
                    }
                ],
            },
        ];
    };

type Args = { dir?: string };

const main = async ({dir}: Args = {}) => {
    const cwd = dir ?? process.cwd();
    const files = await fg("**/package.json", {cwd});

    // extract dependencies from package.json files
    const all = files
        .filter((path: string) => !path.includes(NODE_MODULES))
        .filter((path: string) => !path.includes("clients/"))
        .filter((path: string) => !path.includes("services/"))
        .map((filePath: string) => {
            const resolvedPath = path.resolve(cwd, filePath);
            const packageJson = readPackageJson(resolvedPath);
            const dependencies = Object.keys(packageJson.dependencies || {});
            const devDependencies = Object.keys(packageJson.devDependencies || {});
            const unique = Array.from(new Set([...dependencies, ...devDependencies]));

            // filter only in house packages
            return {
                name: packageJson.name,
                directory: path.dirname(filePath),
                dependencies: unique.filter((d) => d.includes(NAMESPACE)),
            };
        });

    // build graph and edges
    const graph = new Graph();
    all.forEach(({name, directory, dependencies}) => {
        graph.setNode(name, directory);

        dependencies.forEach((moduleName: string) => {
            graph.setEdge(name, moduleName);
        });
    });

    const executionOrder = alg.topsort(graph).reverse();
    // const lookupDirToName = Object.fromEntries(all.map(({ name, directory }) => [directory, name]));
    const lookupNameToDir = Object.fromEntries(all.map(({name, directory}) => [name, directory]));

    // const dirsOrder = executionOrder.map((name: string) => graph.node(name)).filter(Boolean);
    // const strategyMatrix = {
    //     strategy: {
    //         matrix: {
    //             packages: dirsOrder
    //         }
    //     }
    // }
    // console.log(stringify(strategyMatrix))

    // ref: https://docs.github.com/en/packages/quickstart
    const workflow = {
        name: "Node.js Packages Build",
        on: {
            // release: {types: ["created"]},
            push: {branches: ["main"]},
        },
        jobs: {
            ...Object.fromEntries(executionOrder.map(composeWorkflowJobs(graph, lookupNameToDir))),
        },
    };

    console.log(stringify(workflow, {lineWidth: 200}));
};

main({dir: process.argv?.[2]}).catch((err) => {
    console.error(err);
});
