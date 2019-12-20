"""
Interface to feature model configurator
"""
import os
import logging
import json
import subprocess
import tempfile
import copy

# pylint: disable=invalid-name

logging.basicConfig(level=logging.DEBUG)

if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
    WORK_DIR_OBJ = tempfile.TemporaryDirectory()
    WORK_DIR = WORK_DIR_OBJ.name
else:
    WORK_DIR = '.'

CLAFER = os.environ.get('BESSPIN_CLAFER', 'clafer')
FORMAT_VERSIONS = [1]

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
    cp = subprocess.run([CLAFER, filename_cfr, '-m', 'fmjson'], capture_output=True)
    logging.debug('Clafer output: ' + str(cp.stdout))
    json_feat_model = load_json(filename_json)
    version = json_feat_model['version']['base']
    if version not in FORMAT_VERSIONS:
        logging.debug(version)
        raise RuntimeError('unsupported json format version {}'.format(version))
    return json_feat_model

def selected_features_to_constraints(feats):
    """
    Convert a set of selected features to constraints

    :return: str
    """
    res = ""
    for sel in feats:
        sel_str = sel['other']

        mode = sel['mode']
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




def configuration_algo(conftree, feature_selection):
    """
    A mock configuration algorithon. Says yes to everything
    """
    for e in feature_selection:
        e['validated'] = True

    return feature_selection
