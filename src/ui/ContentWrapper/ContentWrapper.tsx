import React from 'react';
import "./ContentWrapper.scss";
import TransformContainer from "../ObjectTransform/components/TransformContainer/TransformContainer";
import {itemMediaUpload} from "../../modules/FileExplorer/api/google";
import {getElementByType, triggerEvent} from "../../helpers/events";

const ContentWrapper = ({children}) => {
    return (
        <TransformContainer className={'viewport-container'} data-height={'fixed'}>
            <div className="content-wrapper" onDrop={e => {
                triggerEvent("action:init", e);
                if (getElementByType(e, 'modal')) return;
                itemMediaUpload(e);
            }} onDragOver={(e) => e.preventDefault()}>
                {children}
            </div>
        </TransformContainer>
    );
};

export default ContentWrapper;