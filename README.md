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