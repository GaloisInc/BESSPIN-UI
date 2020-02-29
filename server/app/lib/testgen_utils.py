import re


DEFAULT_CONFIG_INI_PATH = '/home/besspinuser/testgen/config.ini'

def get_config_ini_template():
    """
    Get the config.ini template file and returns its text

    :return: str of config.ini file
    """
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
