#!/usr/bin/env bash

vt() {
  npm version $1 -m "v%s"
}

gi() {
  git status $@
}

gl() {
  git log --color --graph --abbrev-commit --decorate --pretty=format:'%C(yellow)%h%Creset %C(auto)%d%Creset %C(white)%s%Creset %C(cyan)<%cn,%Creset %C(blue)%cr%Creset%C(cyan)>%Creset' $@
}

gmd() {
  git add .
  git commit --amend -m
}
