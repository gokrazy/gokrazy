#!/usr/bin/env python3

# This script avoids to push branches starting with a "#". This is the way
# how I store ticket related feature branches that are work in progress.

# Once a feature branch is finished, it will be rebased to mains HEAD,
# its commits squashed, merged into main and the branch deleted afterwards.

# Call this script from your ".git/hooks/pre-push" file like this (supporting
# Linux, Windows and MacOS)

# #!/bin/sh
# python3 .githooks/pre-push.py

from datetime import datetime
import os
import re
import subprocess

# This hook is called with the following parameters:
# $1 -- Name of the remote to which the push is being done
# $2 -- URL to which the push is being done
# If pushing without using a named remote, those arguments will be equal.

# Information about the commits being pushed is supplied as lines to
# the standard input in the form:
# <local ref> <local sha1> <remote ref> <remote sha1>
# This hook prevents the push of commits that belong to branches starting with
# an "#" (which are work in progress).

def main():
    script_name = "PRE-PUSH"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(script_dir, "hooks.log")
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    repo_root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], universal_newlines=True).strip()
    repo_name = os.path.basename(repo_root)

    local_branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], universal_newlines=True).strip()
    wip_prefix = '^#\\d+(?:\\b.*)$'
    if re.match(wip_prefix, local_branch):
        print(f'{time}: {repo_name} - {script_name} - Branch "{local_branch}" was not pushed because its name starts with a "#" which marks it as work in progress', file=open(log_file, "a"))
        print(f'{script_name} - Branch "{local_branch}" was not pushed because its name starts with a "#" which marks it as work in progress')
        exit(1)
    print(f'{time}: {repo_name} - {script_name} - Branch "{local_branch}" was pushed', file=open(log_file, "a"))
    exit(0)

if __name__ == "__main__":
    main()
