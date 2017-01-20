#!/usr/bin/env bash

dk() {
  docker $@
}

dls() {
  print $fg[yellow]
  docker images $@
  print $fg[green]
  docker ps $@
}

dla() {
  dls -a
}

drun() {
  docker run -it -d --restart=always --name "$2" "$1" bash
}

dbash() {
  docker exec -it $(docker ps -aqf "name=$1") bash
}

dmk() {
  docker build --rm -t="$1" .
}

drmi() {
  docker rmi $(docker images -a | grep "$1" | awk '{ print $3 }') 2 > /dev/null
}

drm() {
  docker rm $(docker ps -a | grep "$1" | awk '{ print $1 }') 2 > /dev/null
}

drma() {
  docker rm -v $(docker ps -q --filter status=exited) 2 > /dev/null
  docker rmi $(docker images --filter dangling=true -q) 2 > /dev/null
}