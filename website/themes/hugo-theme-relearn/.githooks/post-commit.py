#!/usr/bin/env python3

# This script appends the current commit hash to the version information in
# `layouts/partials/version.txt`
#
# Call this script from your ".git/hooks/post-commit" file like this (supporting
# Linux, Windows and MacOS)

# #!/bin/sh
# python3 .githooks/post-commit.py

from datetime import datetime
import os
import re
import subprocess

def main():
    script_name = "POST-COMMIT"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(script_dir, "hooks.log")
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    repo_root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], universal_newlines=True).strip()
    repo_name = os.path.basename(repo_root)

    file_path = 'layouts/partials/version.txt'
    with open(file_path, 'r+') as f:
        version = f.read().strip()
        new_version = ''
        match = re.match(r'(\d+\.\d+\.\d+)(?:\+([^+]+))?', version)
        if match:
            semver = match.group(1)
            old_hash = match.group(2)
            new_hash = subprocess.check_output(['git', 'rev-parse', 'HEAD~1']).decode('utf-8').strip()
            print(f'{time}: {repo_name} - {script_name} - old hash {old_hash} - new hash {new_hash}', file=open(log_file, "a"))
            print(f'{script_name} - old hash {old_hash} - new hash {new_hash}')
            if old_hash != new_hash:
                new_version = f'{semver}+{new_hash}'
                f.seek(0)
                f.write(new_version)
                f.truncate()
                f.close()
                subprocess.check_call(['git', 'add', file_path])
                subprocess.check_call(['git', 'commit', '--amend', '--no-edit'])
            else:
                print(f'{time}: {repo_name} - {script_name} - No change in hash, file {file_path} not updated', file=open(log_file, "a"))
                print(f'{script_name} - No change in hash, file {file_path} not updated')
                exit(0)
        else:
            print(f'{time}: {repo_name} - {script_name} - Invalid version format in {file_path}', file=open(log_file, "a"))
            print(f'{script_name} - Invalid version format in {file_path}')
            exit(1)
        print(f'{time}: {repo_name} - {script_name} - New version {new_version} was written to {file_path}', file=open(log_file, "a"))
        exit(0)

if __name__ == '__main__':
    main()
