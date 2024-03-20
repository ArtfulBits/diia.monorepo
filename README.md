# diia.monorepo

Monorepo that configures https://github.com/diia-open-source repos as one big working space

## Tools

```bash
# volta tool, allows to PIN node version and package manager
curl https://get.volta.sh | bash

# fix/pin node version for repository
cd be-configs
volta pin node@18
```

## Initialization

```bash
git submodule init
git submodule update --init

# ref: https://stackoverflow.com/questions/3796927/how-do-i-git-clone-a-repo-including-its-submodules
```

## Approach

```bash
#
# How to add sub-module into monorepo
#
git submodule add https://github.com/diia-open-source/be-configs.git

#
# how to refresh submodule dir?
#
git submodule update --init --recursive
## OR:
cd be-configs
git checkout main
git pull

#
# how to push changes from submodule to main repo?
#
cd be-configs
git checkout -b my_new_branch_name_that_i_will_publish
git commit --all -m "message" # commit all changes
git add . && git commit -m "message 2" # commit file or folder changes
git push

#
# how to reset all changes in submodules to their original state?
#
git submodule foreach --recursive git reset --hard origin/main

## remove any untracked files:
git submodule foreach --recursive git clean -ffd
```

## Local Development

```bash
# install required tools
brew install mkcert
brew install nss # required for Firefox
brew install gnu-sed # gsed

# install Root CA certificate in OS
mkcert -install

# custom certificates for HTTPS (avoid wildcard certificates, they are not well treated by chrome)
mkcert "registry.dev" "registry.local" "registry.localhost" localhost 127.0.0.1 0.0.0.0 ::1
mv registry*.pem ./.verdaccio/config/

# register registry.local domain
sudo gsed -i '1i 127.0.0.1  registry.local' /etc/hosts # .local usually used for broadcasting
sudo gsed -i '1i 127.0.0.1  registry.dev' /etc/hosts
sudo gsed -i '1i 127.0.0.1  registry.localhost' /etc/hosts

# force DNS cache to refresh
sudo killall -HUP mDNSResponder

# run all local hosted services required for running the solution
docker-compose up -d

# verify the local NPM
open https://registry.dev:4873

# update NPM configuration
npm set registry https://registry.dev:4873
# OR:
NPM_CONFIG_REGISTRY=https://registry.dev:4873

# also should be registered a CA certificate for npm
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"

# register user (recommended: admin/admin with email developer.diia@local.dev)
npm adduser --registry https://registry.dev:4873/

# verify that new user created
cat .verdaccio/config/htpasswd

# configure NPM to use local registry 
npm set registry https://registry.dev:4873/
npm profile set password --registry https://registry.dev:4873/

# verify login (admin/admin)
npm login --registry=https://registry.dev:4873

# compose archive for publishing (expected something like: diia-inhouse-genproto-1.10.1.tgz)
npm pack
```

```bash
cd be-configs
npm install

# publish package into local registry
npm publish
```

expected output: 

```text
npm notice === Tarball Details === 
npm notice name:          @diia-inhouse/configs                   
npm notice version:       1.27.2                                  
npm notice filename:      diia-inhouse-configs-1.27.2.tgz         
npm notice package size:  12.3 kB                                 
npm notice unpacked size: 40.7 kB                                 
npm notice shasum:        0ba18735bfcd22bc6806a925196ecd3a1b0a968f
npm notice integrity:     sha512-V9x/nGrpbpx9L[...]EGlmrNeMMQs2g==
npm notice total files:   30                                      
npm notice 
npm notice Publishing to https://registry.dev:4873 with tag latest and default access
+ @diia-inhouse/configs@1.27.2
```

## CI/CD configuration

1. GitHub Actions will be used for initial CI/CD
2. packages will be published to the github npm registry
