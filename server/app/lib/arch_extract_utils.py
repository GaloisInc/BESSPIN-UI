import copy
import re

from config import config


def get_config_arch_extract_template(cpu):
    """
    Get the default arch-extract config file

    :param cpu:
    :return: str of config file
    """

    DEFAULT_ARCH_EXTRACT_CONFIG = f'/home/besspinuser/tool-suite/tutorial/{cpu}.toml'

    with open(DEFAULT_ARCH_EXTRACT_CONFIG, 'r') as f:
        config_text = f.read()
    return config_text