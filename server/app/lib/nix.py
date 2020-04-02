import subprocess
from shlex import quote


def make_nix_command(path, cmd):
    """
    :param
    :param cmd: string of the command to run

    :return: list of parameters for subprocess to use
    """
    nix_cmd = f'whoami && cd {path} && . $HOME/.nix-profile/etc/profile.d/nix.sh && nix-shell --run {quote(cmd)}'
    return [nix_cmd]


def run_nix_subprocess(path, cmd):
    """
    :param path: string of path to run command in
    :param cmd: string of the command to run in Nix

    :return: subprocess handle
    """

    nix_cmd = make_nix_command(path, cmd)

    return subprocess.run(
        nix_cmd,
        capture_output=True,
        shell=True
    )
