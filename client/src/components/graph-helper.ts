/* eslint-disable camelcase */ // disabling for now
import {
    DataSet,
    Network,
} from 'vis-network';

import {
    Data,
    Node,
    Edge,
} from 'vis-network';

import {
    SelectionMode,
    IFeatureModelRecord,
    selectFeature,
    ISelection,
} from '../state/feature-model';

import {
    selection_search,
} from '../state/selection';

interface IFeature {
    gcard: string;
    card: string;
    name: string;
    children: string[];
    parent: string;
}

interface IFeatureModelVersion {
    base: number;
}

export interface IFeatureMap {
    [key: string]: IFeature;
}

interface IFeatureConstraint {
    kind: string;
    name: string;
}

export interface IFeatureModel {
    constraints: IFeatureConstraint[];
    features: IFeatureMap;
    roots: string[];
    version: IFeatureModelVersion;
}

export const DEFAULT_FEATURE_MODEL: IFeatureModel = {
    constraints: [],
    features: {},
    roots: [],
    version: { base: -1 },
}

export type SelectFeatureCallback = typeof selectFeature;

enum SelectionColors {
    on = '#ddffdd', // green
    off = '#ffdddd', // red
    opt = '#ffffff', // white
    validatedSelected = '#99ff99',  // green
    notValidatedSelected = '#00dd00', // green
    validatedRejected = '#ff9999', // red
    notValidatedRejected = '#dd0000', // red
}

const getColor = (card: string, configs: ISelection, uid: string): SelectionColors => {
    const config = selection_search(configs, uid);
    const inSelection = config.uid !== "notFound" ? true : false;
    const isValidated = config.isValid;
    const mode = config.mode;

    if (inSelection) {
        switch (mode) {
            case SelectionMode.selected: {
                if (isValidated)
                    return SelectionColors.validatedSelected;
                else
                    return SelectionColors.notValidatedSelected;
            }
            case SelectionMode.rejected: {
                if (isValidated)
                    return SelectionColors.validatedRejected;
                else
                    return SelectionColors.notValidatedRejected;
            }
            default:
                return SelectionColors.opt;
        }
    }

    switch (card) {
        case 'on':
            return SelectionColors.on;
        case 'off':
            return SelectionColors.off;
        case 'opt':
            return SelectionColors.opt;
        default:
            console.error(`Invalid card"${card}" encountered when trying to set color`);
            return SelectionColors.opt;
    }
};

const mapModelToTree = (featureModel: IFeatureModel, selections: ISelection): Data => {

    const featureIds = Object.keys(featureModel.features);

    return featureIds.reduce((acc: Data, featureId: string): Data => {
        const feature = featureModel.features[featureId];

        if (!feature) return acc;

        const card = feature.card;
        const color = getColor(card, selections, featureId);

        if (acc.nodes) (acc.nodes as DataSet<Node>).add({
            id: featureId,
            label: `${featureId}\n [${card}]\n gcard: ${feature.gcard}`,
            shape: 'box',
            color: color,
        });

        const edges = feature.children.map((childId: string): Edge => {
            return {
                id: `${featureId}-${childId}`,
                label: '',
                from: featureId,
                to: childId,
                dashes: false,
                color: '#dddddd', // light grey
            };
        });

        if (acc.edges) (acc.edges as DataSet<Edge>).add(edges);

        return acc;
    }, { nodes: new DataSet<Node>([]), edges: new DataSet<Edge>([]) });
};

// We need to ensure that redraws don't cause the graph
// to recenter/resize on any state change (particularly selections)
// To do that, we ensure that the network is only created once by
// caching it via closure.
let network: Network;
let data: Data;
let systemUid: string;

export const graphFeatureModel = (
    domNode: HTMLDivElement,
    selectFeature: SelectFeatureCallback,
    system: IFeatureModelRecord,
) => {

    const options = {
        layout: {
            hierarchical: {
                direction: 'LR',
                sortMethod: 'directed',
                nodeSpacing: 70,
                levelSeparation: 200,
                treeSpacing: 80,
            }
        },
        interaction: {
            dragNodes :false,
            selectConnectedEdges: false,
        },
        physics: {
            enabled: false
        },
    };

    const hasVisDOM = domNode.firstElementChild !== null;
    const isSameSystem = system.uid === systemUid;

    if (isSameSystem && hasVisDOM) {
        data.nodes.forEach((n: Node) => {
            const { id } = n;
            if (id) {
                const { card } = system.conftree.features[id];
                const color = getColor(card, system.configs, system.conftree.features[id].name);
                data.nodes.update({ id, color });
            }
        });
    } else {
        data = mapModelToTree(system.conftree, system ? system.configs : []);
        network = new Network(domNode, { nodes: data.nodes, edges: data.edges }, options);
        systemUid = system.uid;
    }

    network.off('click');
    network.on('click', (params) => {
        const nodeId = network.getNodeAt(params.pointer.DOM) as string;

        if (nodeId == null) return; // short-circuit for non-selection click

        selectFeature(nodeId);
        return;
    });
};
