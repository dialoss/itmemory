import React, {useEffect, useLayoutEffect, useState} from 'react';
import "./DelayedVisibility.scss";

const DelayedVisibility = ({trigger, timeout, children, className}) => {
    const [visible, setVisible] = useState(false);

    useLayoutEffect(() => {
        setVisible(false);
        setTimeout(()=>{setVisible(true)},timeout);
    }, [trigger]);
    return (
        <div className={'delayed-visibility ' + (className || '') + ' ' + (visible ? 'visible':'hidden')}>
            {children}
        </div>
    );
};

export default DelayedVisibility;