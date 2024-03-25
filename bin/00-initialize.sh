#!/usr/bin/env bash
# shellcheck disable=SC2155,SC2207

if [[ -z $TERM ]]; then export TERM=xterm-256color; fi

readonly VERSION="0.0.1"
readonly RESET=$(tput sgr0)
readonly RED=$(tput setaf 1)
readonly GREEN=$(tput setaf 2)
readonly GRAY=$(tput setaf 8)
readonly YELLOW=$(tput setaf 3)
readonly OK="[${GREEN}OK${RESET}]"
readonly NO="[${RED}NO${RESET}]"
readonly NP="[${GRAY}--${RESET}]"

function print:help() {
  echo ""
  echo "Version: $VERSION"
  echo ""
  echo "Usage: $0 --capture [--sync]"
  echo ""
  echo "  --capture   ${GRAY}save the configuration of all submodules (${YELLOW}.submodules.json${GRAY}).${RESET}"
  echo "  --sync      ${GRAY}synchronize submodules with the saved (${YELLOW}.submodules.json${GRAY}) configuration.${RESET}"
  echo "  --version   ${GRAY}print the version and exit.${RESET}"
  echo "  --help      ${GRAY}print usage and exit.${RESET}"
  echo ""
}

function remotes() {
  echo "{ \"name\": \"<remote_name>\", \"url\": \"<url>\" }"
  git remote -v | awk '{ print ",\{ \"name\": \"" $1 "\", \"url\": \"" $2 "\" \}" }' | uniq
}

function capture:repo() {
  # find all submodules folders
  local dirs=($(fd package.json --max-depth 2 | xargs -I _ dirname _))

  # iterate over all submodules and extract the remotes configuration
  local separator="" dir=""
  for dir in "${dirs[@]}"; do
    cd "$dir" || exit
    # shellcheck disable=SC1083
    local upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
    echo "${separator}\"$dir\": { \"branch\": \"$upstream\", \"remotes\": [ $(remotes) ] } "
    separator=","
    cd - >/dev/null || exit
  done
}

function capture() {
  echo "{ $(capture:repo) }" |
    jq '. | to_entries | map_values(.value |= del(.remotes[0]))'
}

function sync() {
  local submodules="" submodule="" dir="" branch="" remote="" name="" url="" upstream=""

  # read file .submodules.json and iterate over all submodules
  submodules=$(jq -r 'to_entries[] | .key' .submodules.json)

  # origin remote is a default remote name, so we should skip it.
  # we should register all new remotes if they do not exist yet
  for submodule in $submodules; do
    local index=0
    dir=$(jq -r ".[$submodule].key" .submodules.json)
    branch=$(jq -r ".[$submodule].value.branch" .submodules.json)

    while true; do
      remote=$(jq -r ".[$submodule].value.remotes[$index]" .submodules.json)
      name=$(echo "$remote" | jq -r '.name')
      url=$(echo "$remote" | jq -r '.url')
      index=$((index + 1))
      if [[ "$name" == "null" ]]; then break; fi
      if [[ "$name" == "origin" ]]; then
        # echo "$OK ${YELLOW}${dir}${RESET} has remote ${GRAY}$name${RESET}"
        continue
      fi

      local httpUrl=$(echo "$url" | sed "s#git@github.com:#https://github.com/#g")

      pushd "$dir" &>/dev/null || exit
      # re-configure the remote if it does not exist or have a different URL
      if ! git remote get-url "$name" &>/dev/null; then
        echo "$NO ${YELLOW}${dir}${RESET} has no remote ${GRAY}$name${RESET} - fixing now!"
        git remote add "$name" "$httpUrl"
        echo "$NP ${YELLOW}${dir}${RESET} created remote ${GRAY}$name${RESET}"
      else
        echo "$OK ${YELLOW}${dir}${RESET} has remote ${GRAY}$name${RESET}"
        local configuredUrl=$(git remote get-url "$name")

        # re-configure the remote URL to HTTPS
        if [[ "$configuredUrl" != "$httpUrl" ]]; then
          echo "$NO ${YELLOW}${dir}${RESET} set remote ${GRAY}$name${RESET} to ($configuredUrl)"
          git remote set-url "$name" "$httpUrl" 
          echo "$NP ${YELLOW}${dir}${RESET} remote ${GRAY}$name${RESET} re-configured to ($httpUrl)"
        fi
      fi
      # fetch the remotes
      git fetch --all
      popd &>/dev/null || exit
    done

    pushd "$dir" &>/dev/null || exit
    # shellcheck disable=SC1083
    upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
    if [[ "$upstream" == "$branch" ]]; then
      echo "$NP ${YELLOW}${dir}${RESET} is on branch ${GRAY}$branch${RESET}"
    else
      echo "$NO ${YELLOW}${dir}${RESET} is on branch '${GRAY}$upstream${RESET}' - switching to ${GRAY}$branch${RESET}"
      # take the last part of branch name "{remote}/{branch}"
      local branchSegment=$(echo "$branch" | awk -F'/' '{print $2}')
      git checkout "${branchSegment}"
    fi
    popd &>/dev/null || exit

  done

}

function main() {
  ## depends on the input flag run different functions
  case "$1" in
  --capture)
    capture "$@" >.submodules.json
    ;;
  --sync)
    sync "$@"
    ;;
  --version)
    echo "0.0.1"
    ;;
  --help)
    print:help
    ;;
  *)
    print:help
    exit 1
    ;;
  esac
}

main "$@"
