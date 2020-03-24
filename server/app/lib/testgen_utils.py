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
