import copy
import re
from flask import current_app

from config import config

DEFAULT_CONFIG_INI_PATH = '/home/besspinuser/testgen/config.ini'


def get_config_ini_template():
    """
    Get the config.ini template file and returns its text

    :return: str of config.ini file
    """

    current_app.logger.debug(f'Loading default config.ini at: {DEFAULT_CONFIG_INI_PATH}')

    with open(DEFAULT_CONFIG_INI_PATH, 'r') as f:
        config_text = f.read()
    return config_text

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

def get_config_feat_extract_template(cpu):
    """
    Get the default feat-extract config file

    :param cpu:
    :return: str of config file
    """

    DEFAULT_FEAT_EXTRACT_CONFIG = f'/home/besspinuser/tool-suite/tutorial/{cpu}.toml'

    with open(DEFAULT_FEAT_EXTRACT_CONFIG, 'r') as f:
        config_text = f.read()
    return config_text

def get_variable(config_text, variable):
    """
    Get the value of a variable in config text

    :param config_text: str
    :param variable: str

    :return: value
    """
    pat = re.compile(variable)

    for line in config_text.splitlines():
        altered_line = line
        if pat.match(line):
            l = line.split(' = ')
            res = l[1]
            res = res[1:][:-1] # to remove the double quotes "
            return res

    raise RuntimeError('variable not found')


def set_variable(config_text, variable, value):
    """
    Replace variable in config text with given value

    :param config_text: str
    :param variable: str
    :param value: str

    :return: config_text with variable replaced or raises an error if not found.
    """

    matched = False
    pat = re.compile(variable)
    new_config_text = ''

    for line in config_text.splitlines(True):
        altered_line = line
        if pat.match(line) and (not matched):
            altered_line = variable + ' = ' + value + '\n'
            matched = True
        new_config_text += altered_line

    if not matched:
        raise RuntimeError('variable not found')

    return new_config_text


def set_unique_vuln_class_to_constaints(vuln_class):
    """
    :return: string with constraints [ !vulnClass_Test ] for vulnClass different from vuln_class
    """
    all_vuln_classes = copy.deepcopy(config['default'].VALID_VULN_CLASSES)

    if vuln_class not in all_vuln_classes.keys():
        raise RuntimeError('Invalid vuln class : ' + str(vuln_class))

    del all_vuln_classes[vuln_class]

    constr_string = ''
    for (k, v) in all_vuln_classes.items():
        if not all_vuln_classes[k].endswith('.cfr'):
            raise RuntimeError('Vuln class file does not end with cfr')
        constr_string += "[ !" + all_vuln_classes[k][:-4] + '_Test' + " ]\n"

    return constr_string


def get_prebuilt_piccolo():
    """
    :return: pair of picollo feature model filename and fm.json as a string
    """
    DEFAULT_PREBUILT_PICCOLO = f'/home/besspinuser/tool-suite/tutorial/piccolo-simple-pregen.fm.json'

    with open(DEFAULT_PREBUILT_PICCOLO, 'r') as f:
        feature_model = f.read()
    return 'piccolo-simple-pregen.fm.json', feature_model
