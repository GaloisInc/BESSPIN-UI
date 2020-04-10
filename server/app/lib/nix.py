from subprocess import CompletedProcess, run
from typing import Iterable
from shlex import quote


def make_nix_command(path: str, cmd: Iterable[str]) -> Iterable[str]:
    """
    :param
    :param cmd: string of the command to run

    :return: list of parameters for subprocess to use
    """
    nix_cmd = f'whoami && cd {path} && . $HOME/.nix-profile/etc/profile.d/nix.sh && nix-shell --run {quote(cmd)}'
    return [nix_cmd]


def run_nix_subprocess(path: str, cmd: Iterable[str]) -> CompletedProcess:
    """
    :param path: string of path to run command in
    :param cmd: string of the command to run in Nix

    :return: CompletedProcess object
    """

    nix_cmd = make_nix_command(path, cmd)

    return run(
        nix_cmd,
        capture_output=True,
        shell=True
    )
