
import {
    DataSet,
    Network,
} from 'vis-network';

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

interface IVisTree {
    nodes: DataSet<IVisNode>;
    edges: DataSet<IVisEdge>;
    topnodecard: string;
}

const mapModelToTree = (featureModel: IFeatureModel): IVisTree => {

    const featureIds = Object.keys(featureModel.features);
    console.log(featureIds);

    return featureIds.reduce((acc: IVisTree, featureId: string): IVisTree => {
        console.log(featureId);
        const feature = featureModel.features[featureId];

        if (!feature) return acc;

        const card = feature.card;
        let color = '';

        switch (card) {
            case 'on':
                color = '#ddffdd'; // green
                break;
            case 'off': 
                color = '#ffdddd'; // red
                break;
            case 'opt': 
                color = '#ffffff'; // white
                break;
        }

        /**
        TODO: global state...
        if (global_selected_nodes.mem(feature)) {
            switch (global_selected_nodes.get_mode(feature)) {
            case 'selected': {
                if (global_selected_nodes.get_validated(feature))
                    color = '#99ff99';
                else
                    color = '#00dd00';
                card = "on";
                break;
            };
            case 'rejected': {
                if (global_selected_nodes.get_validated(feature))
                    color = '#ff9999';
                else
                    color = '#dd0000';
                card = "off";
                break;
            };
            };
        }
        */

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
                color: '#ffffff',
            };
        });

        console.log(edges);
        acc.edges.add(edges);

        return {
            ...acc,
            topnodecard: card,
        };
    }, { nodes: new DataSet([]), edges: new DataSet([]), topnodecard: '' });
}

export const graphFeatureModel = (domNode: HTMLDivElement, featureModel: IFeatureModel) => {
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
    console.log(data);
    const _network = new Network(domNode, data, options);
};
