"""
Interface to feature model configurator
"""
import os
import logging
import json
import subprocess
import tempfile

# pylint: disable=invalid-name

logging.basicConfig(level=logging.DEBUG)

if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
    WORK_DIR_OBJ = tempfile.TemporaryDirectory()
    WORK_DIR = WORK_DIR_OBJ.name
else:
    WORK_DIR = '.'

CLAFER = os.environ.get('BESSPIN_CLAFER', 'clafer')

TOP_LEVEL_FEATURE_IDENT = 'Features'

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
    return json_feat_model

def selected_features_to_constraints(feats):
    """
    Convert a set of selected features to constraints

    :return: str
    """
    res = ""
    for sel in feats:
        # delete leading artificial feature path artificially injected
        # when there are several features at top level
        prefix = TOP_LEVEL_FEATURE_IDENT + '.'
        path = sel['content']['other']
        sel_str = path[len(prefix):] if path.startswith(prefix) else path

        mode = sel['content']['mode']
        if mode == 'selected':
            res += "[ " + sel_str + " ]" + "\n"
        elif mode == 'rejected':
            res += "[ !" + sel_str + " ]" + "\n"
    return res

def configuration_algo(conftree, feature_selection):
    """
    A mock configuration algorithon. Says yes to everything
    """
    for e in feature_selection:
        e['content']['validated'] = True

    return feature_selection
