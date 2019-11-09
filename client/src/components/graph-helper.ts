import {
    DataSet,
    Network,
} from 'vis-network';

import {
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

interface IVisNode {
    id: string;
    label: string;
    shape: string;
    color: string;
}

interface IVisEdge {
    id: string;
    label: string;
    from: string;
    to: string;
    dashes: boolean;
    color: string;
}

interface IVisSelection {
    state: SelectionState;
    validated: boolean;
}

interface ISelectionMap {
    [id: string]: IVisSelection;
}

interface IVisTree {
    nodes: DataSet<IVisNode>;
    edges: DataSet<IVisEdge>;
    selections: ISelectionMap;
}

enum SelectionState {
    unselected,
    selected,
    rejected,
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

interface ISelectedNode {
    model: IFeature;
    state: SelectionState;
    validated: boolean;
}

interface ISelectedNodeMap {
    [id: string]: ISelectedNode;
}

const SELECTABLE_CARD = 'opt';

const getColor = (card: string): SelectionColors => {

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

const mapModelToTree = (featureModel: IFeatureModel): IVisTree => {

    const featureIds = Object.keys(featureModel.features);

    return featureIds.reduce((acc: IVisTree, featureId: string): IVisTree => {
        const feature = featureModel.features[featureId];

        if (!feature) return acc;

        const card = feature.card;
        const color = getColor(card);

        acc.nodes.add({
            id: featureId,
            label: `${featureId}\n [${card}]\n gcard: ${feature.gcard}`,
            shape: 'box',
            color: color,
        });

        const edges = feature.children.map((childId: string): IVisEdge => {
            return {
                id: `${featureId}-${childId}`,
                label: '',
                from: featureId,
                to: childId,
                dashes: false,
                color: '#dddddd', // light grey
            };
        });

        acc.edges.add(edges);

        // TODO: this should be managed in Redux
        if (card === SELECTABLE_CARD) {
            acc.selections[featureId] = {
                state: SelectionState.unselected,
                validated: false,
            };
        }

        return acc;
    }, { nodes: new DataSet([]), edges: new DataSet([]), selections: {} });
};

export const graphFeatureModel = (
    domNode: HTMLDivElement,
    featureModel: IFeatureModel,
    selectFeature: typeof selectFeatureCallback,
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

    const data = mapModelToTree(featureModel);
    const network = new Network(domNode, { nodes: data.nodes, edges: data.edges }, options);

    network.on('click', (params) => {
        const nodeId = network.getNodeAt(params.pointer.DOM) as string;

        if (nodeId == null) return; // short-circuit for non-selection click

        const selectedNode = data.selections[nodeId];

        if (selectedNode) {
            switch (selectedNode.state) {
                case SelectionState.unselected:
                    selectedNode.state = SelectionState.selected;
                    selectedNode.validated = false;
                    data.nodes.update({ id: nodeId, color: SelectionColors.on });
                    selectFeature(nodeId, 'selected', nodeId, false);
                    selectFeature(nodeId, SelectionMode.selected, nodeId, false);
                    return;
                case SelectionState.selected:
                    selectedNode.state = SelectionState.rejected;
                    selectedNode.validated = false;
                    data.nodes.update({ id: nodeId, color: SelectionColors.invalidRejected });
                    return;
                case SelectionState.rejected:
                    selectedNode.state = SelectionState.unselected;
                    data.nodes.update({ id: nodeId, color: SelectionColors.opt });
                    return;
                default:
                    console.error(`Unknown selection state (${selectedNode.state})`);
            }
        }
    });
};
