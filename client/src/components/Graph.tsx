import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    ISelectionMap,
} from '../state/system';

import {
    graphFeatureModel,
    IFeatureModel,
    SelectFeatureCallback
} from './graph-helper';

export interface IGraphProps {
    data?: IFeatureModel;
    selectFeature: SelectFeatureCallback;
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

        graphFeatureModel(ref, treeData, selectFeature, currentSelections);
    }, [treeData, visContainer, selectFeature, currentSelections]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};