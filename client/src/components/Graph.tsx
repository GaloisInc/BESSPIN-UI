import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    ISelectionMap,
    selectFeature,
} from '../state/system';

import {
    graphFeatureModel,
    IFeatureModel
} from './graph-helper';

export interface IGraphProps {
    data?: IFeatureModel;
    selectFeature: typeof selectFeature;
    currentSelections: ISelectionMap;
}


export const Graph: React.FC<IGraphProps> = ({
    data: treeData,
    selectFeature,
    currentSelections,
}) => {

    const visContainer = useRef(null) as RefObject<HTMLDivElement>;

    useEffect(() => {
        const ref = visContainer ? visContainer.current : null;

        if (!ref) return;
        if (!treeData) return;

        const hasDataToRender = treeData && treeData.features && Object.keys(treeData.features).length > 0;

        if (!hasDataToRender) return;

        graphFeatureModel(ref, treeData, selectFeature);
    }, [treeData, visContainer, selectFeature]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};