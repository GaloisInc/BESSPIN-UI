import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    ISelectionMap,
    selectFeature,
    clearFeatureSelections,
} from '../state/system';

import {
    graphFeatureModel,
    IFeatureModel
} from './graph-helper';

export interface IGraphProps {
    data?: IFeatureModel;
    selectFeature: typeof selectFeature;
    clearFeatureSelections: typeof clearFeatureSelections;
    currentSelections: ISelectionMap;
}

export const Graph: React.FC<IGraphProps> = ({
    data: treeData,
    selectFeature,
    currentSelections,
    clearFeatureSelections,
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

    useEffect(() => {
        // This will be called when the component will unmount
        // At that point, we need to clear out any feature selections since
        // that means the page is unloading (i.e. we are going to a new page)
        return function cleanupSelections() {
            clearFeatureSelections();
        };
    }, [clearFeatureSelections]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};