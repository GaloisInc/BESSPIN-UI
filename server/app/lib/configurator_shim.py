"""
Interface to feature model configurator
"""
import os
import logging
import json
import subprocess
from shlex import quote
import tempfile
import copy

# pylint: disable=invalid-name

logging.basicConfig(level=logging.DEBUG)

if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
    WORK_DIR_OBJ = tempfile.TemporaryDirectory()
    WORK_DIR = WORK_DIR_OBJ.name
else:
    WORK_DIR = tempfile.gettempdir()

CLAFER = os.environ.get('BESSPIN_CLAFER', 'clafer')
FORMAT_VERSIONS = [1]
CMD_PRINT_CLAFER = "besspin-feature-model-tool print-clafer {}"
CMD_CLAFER = "clafer {} -m fmjson"
CMD_CONFIGURATION_ALGO = (
    # the cd into the work_dir is important because clafer write its output file
    # in the working directory
    "cd {} && ".format(WORK_DIR) +
    "clafer -m fmjson {} && besspin-feature-model-tool count-configs {}"
)
USE_TOOLSUITE = os.getenv('USE_TOOLSUITE', False)

def load_json(filename):
    """
    Loads a file as json
    """
    with open(filename) as f:
        page = f.read()
    return json.loads(page)

def convert_model_to_json(source):
    """
    Convert the source of a model to json
    """

    filename = os.path.join(WORK_DIR, 'generated_file')
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.fm.json'
    with open(filename_cfr, 'wb') as f:
        f.write(source)

    if USE_TOOLSUITE:
        cp = subprocess.run([
            "su", "-", "besspinuser", "-c",
            "cd ~/tool-suite &&" +
            "nix-shell --run " + quote(CMD_CLAFER.format(filename_cfr))],
            capture_output=True
        )
    else:
        cp = subprocess.run([CLAFER, filename_cfr, '-m', 'fmjson'], capture_output=True)

    logging.debug('Clafer stdout: ' + str(cp.stdout))
    logging.debug('Clafer stderr: ' + str(cp.stderr))
    json_feat_model = load_json(filename_json)

    version = json_feat_model['version']['base']
    if version not in FORMAT_VERSIONS:
        logging.debug(version)
        raise RuntimeError('unsupported json format version {}'.format(version))
    return json_feat_model

CMD_PRINT_CLAFER = "besspin-feature-model-tool print-clafer {}"

def fmjson_to_clafer(source):
    """
    Convert a feature model from fm.json format to clafer format,
    when USE_TOOLSUITE is set
    """
    if (not USE_TOOLSUITE):
        return source.decode('utf8')

    filename = os.path.join(WORK_DIR, 'generated_file')
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.fm.json'
    with open(filename_json, 'wb') as f:
        f.write(source)
    cmd = quote(CMD_PRINT_CLAFER.format(filename_json))

    cp = subprocess.run([
        "su", "-", "besspinuser", "-c",
        "cd ~/tool-suite &&" +
        "nix-shell --run " + cmd],
        capture_output=True)
    logging.debug('besspin-feature-model-tool stdout: ' + str(cp.stdout))
    logging.debug('besspin-feature-model-tool stderr: ' + str(cp.stderr))

    if cp.stderr:
        raise RuntimeError(cp.stderr)

    return cp.stdout.decode('utf8')

def selected_features_to_constraints(feats, even_not_validated=False):
    """
    Convert a set of selected features to constraints.
    Only the features that are validated are translated into constraints,
    otherwise all are translated when `even_not_validated` is set.

    :return: str
    """
    res = ""

    for sel in reversed(feats):
        sel_str = sel['other']

        mode = sel['mode']
        if sel['validated'] or even_not_validated:
            if mode == 'selected':
                res += "[ " + sel_str + " ]" + "\n"
            elif mode == 'rejected':
                res += "[ !" + sel_str + " ]" + "\n"
    return res

def combine_featmodel_cfgs(model, cfgs):
    """
    Combine a feature model with configurations
    :param model:
    :param cfgs:

    :return: feature model in fm.json format
    """
    assert 'constraints' in model
    cfg_model = copy.deepcopy(model)
    for sel in cfgs:
        sel_str = sel['other']
        mode = sel['mode']
        validated = sel['validated']
        if validated:
            if mode == 'selected':
                cfg_model['constraints'].append({
                    'kind': 'feat',
                    'name': sel_str,
                })
            elif mode == 'rejected':
                cfg_model['constraints'].append({
                    'kind': 'op',
                    'op': 'not',
                    'args': [
                        {
                            'kind': 'feat',
                            'name': sel_str,
                        },
                    ]
                })
            else:
                raise RuntimeError('feature selection is neither selected or rejected')
    return cfg_model



def _find_answer_in_configuration_algo_output(out):
    split_out = out.split('\n')
    logging.debug('SPLIY: ' + str(split_out))
    for line in reversed(split_out):
        try:
            i = int(line.strip())
            return i
        except ValueError:
            continue

def validate_all_features(feature_selection):
    """
    Validates all the features selected.
    """
    feat_sel = copy.deepcopy(feature_selection)
    for e in feat_sel:
        e['validated'] = True

    return feat_sel

def configuration_algo(cfr_source, feature_selection):
    """
    Execute the configuration validation algorithm and returns a boolean
    indicating the success or failure of the validation.
    When `USE_TOOLSUITE` is disabled, it blindly returns true

    :param cfr_source:
    :param feature_selection:

    :return: boolean
    """
    if not USE_TOOLSUITE:
        return True

    filename = os.path.join(WORK_DIR, 'generated_configured_feature_model')
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.fm.json'

    logging.debug('CFR source: ' + cfr_source)
    with open(filename_cfr, 'w') as f:
        f.write(cfr_source)
        f.write(selected_features_to_constraints(feature_selection, even_not_validated=True))

    with open(filename_cfr, 'r') as f:
        text = f.read()
        logging.debug('CFR+CONSTRAINTS: \n' + text)

    cmd = quote(CMD_CONFIGURATION_ALGO.format(filename_cfr, filename_json))
    cp = subprocess.run([
        "su", "-", "besspinuser", "-c",
        "cd ~/tool-suite &&" +
        "nix-shell --run " + cmd],
        capture_output=True)
    logging.debug('configuration algo stdout: ' + str(cp.stdout))
    logging.debug('configuration algo stderr: ' + str(cp.stderr))

    if cp.stderr:
        raise RuntimeError(cp.stderr)

    n = _find_answer_in_configuration_algo_output(cp.stdout.decode('utf8'))
    return n > 0