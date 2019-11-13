import {
    DataSet,
    Network,
} from 'vis-network';

import {
    Data,
    Node,
    Edge,
} from 'vis';

import {
    ISelectionMap,
    SelectionMode,
    selectFeature as selectFeatureCallback,
} from '../state/system';

export interface IFeature {
    gcard: string;
    card: string;
    name: string;
    children: string[];
    parent: string;
}

export interface IFeatureModelVersion {
    base: number;
}

export interface IFeatureMap {
    [key: string]: IFeature;
}

export interface IFeatureContraint {
    kind: string;
    name: string;
}

export interface IFeatureModel {
    constraints: IFeatureContraint[];
    features: IFeatureMap;
    roots: string[];
    version: IFeatureModelVersion;
}

enum SelectionColors {
    on = '#ddffdd', // green
    off = '#ffdddd', // red
    opt = '#ffffff', // white
    validSelected = '#99ff99',  // green
    invalidSelected = '#00dd00', // green
    validRejected = '#ff9999', // red
    invalidRejected = '#dd0000', // red
}

const SELECTABLE_CARD = 'opt';

const getColor = (card: string, mode?: SelectionMode): SelectionColors => {
    if (mode) {
        switch (mode) {
            case SelectionMode.selected:
                return SelectionColors.validSelected;
            case SelectionMode.rejected:
                return SelectionColors.validRejected;
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

const mapModelToTree = (featureModel: IFeatureModel, selections: ISelectionMap): Data => {

    const featureIds = Object.keys(featureModel.features);

    return featureIds.reduce((acc: Data, featureId: string): Data => {
        const feature = featureModel.features[featureId];

        if (!feature) return acc;

        const mode = selections[featureId] ? selections[featureId].mode : undefined;
        const card = feature.card;
        const color = getColor(card, mode);

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

export const graphFeatureModel = (
    domNode: HTMLDivElement,
    featureModel: IFeatureModel,
    selectFeature: typeof selectFeatureCallback,
    currentSelections: ISelectionMap,
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

    if (network) {
        Object.values(currentSelections).forEach(s => {
                id: s.uid,
                color: getColor(featureModel.features[s.uid].card, s.mode),
                if (data.nodes) (data.nodes as DataSet<Node>).update({
            });
        });
    } else {
        data = mapModelToTree(featureModel, currentSelections);
        network = new Network(domNode, { nodes: data.nodes, edges: data.edges }, options);
    }

    network.once('click', (params) => {
        const nodeId = network.getNodeAt(params.pointer.DOM) as string;

        if (nodeId == null) return; // short-circuit for non-selection click

        const selectedNode = featureModel.features[nodeId];

        if (selectedNode && selectedNode.card === SELECTABLE_CARD) {
            const mode = currentSelections[nodeId] ? currentSelections[nodeId].mode : SelectionMode.unselected;
            switch (mode) {
                case SelectionMode.unselected:
                    selectFeature(nodeId, SelectionMode.selected, nodeId, false);
                    return;
                case SelectionMode.selected:
                    selectFeature(nodeId, SelectionMode.rejected, nodeId, false);
                    return;
                case SelectionMode.rejected:
                    selectFeature(nodeId, SelectionMode.unselected, nodeId, false);
                    return;
                default:
                    console.error(`Unknown selection state (${mode})`);
            }
        }
    });
};
