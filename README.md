## TODO:

- [ ] Remove shaders from html
- [ ] Babel

## ideas

- [ ] interlacion

## STUFF

    git config --global alias.s status
    git config --global alias.l "log --oneline -n5"
    git config --global alias.ll "log -n2"
    git config --global alias.cm "!git add -A && git commit -m"
    git config --global alias.co checkout
    git config --global alias.cm "!git add '.' && git status && git commit"
    git config --global alias.cam "!git add '.' && git status && git commit --amend --no-edit"

    git config --global alias.wip "!git add '.' && git status && git commit -m 'WIP'"
    git config --global alias.rewip "!git cam"
    git config --global alias.unwip "!git log --oneline -n5 && git reset --mixed HEAD^ && git status"

    git config --global alias.posu "!git push origin --set-upstream "

    git config --global --unset alias.am
