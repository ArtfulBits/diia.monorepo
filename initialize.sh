#!/usr/bin/env bash

repos=("be-configs" "be-eslint-plugin" "be-eslint-config" "be-genproto" "be-types")

function publish:repo() {
  local repo=$1

  pushd "./$repo" || exit 1
  npm install
  npm test
  npm unpublish --force
  npm publish
  popd || exit 1
}

for repo in "${repos[@]}"; do
  publish:repo "$repo"
done

