import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import ItemImage from "./Image/ItemImage";
import ItemTable from "./Table/ItemTable";
import ItemFile from "./File/ItemFile";
import ItemTextfield from "./Textfield/ItemTextfield";
import ItemVideo from "./Video/ItemVideo";
import ItemBase from "./Base/BaseItem";
import PageFrom from "./PageFrom/PageFrom";
import ItemTimeline from "./Timeline/ItemTimeline";
import ItemPrice from "./Price/ItemPrice";
import TimelineEntry from "./Timeline/TimelineEntry";
import ItemLink from "./Link/ItemLink";
import SubscriptionItem from "./Subscription/SubscriptionItem";
import ButtonItem from "./Button/ButtonItem";
import Viewer from "./Model/Viewer";

export const Components = {
    'base': ItemBase,
    'link': ItemLink,
    'page_from': PageFrom,
    'image': ItemImage,
    'table': ItemTable,
    'video': ItemVideo,
    'file': ItemFile,
    'model': Viewer,
    'textfield': ItemTextfield,
    'timeline': ItemTimeline,
    'timeline_entry': TimelineEntry,
    'price': ItemPrice,
    'subscription': SubscriptionItem,
    'button':ButtonItem,
}

const ItemData = ({data}) => {
    if (data.url && !['image','video'].includes(data.type) && !data.url.match(/google|youtube|drive/)) {
        data.url = 'https://drive.google.com/uc?export=download&id=' + data.url;
    }
    return (
        <>
            {React.createElement(Components[data.type], {
                    data,
                    key: data.id
                })}
        </>
    );
};

export default ItemData;