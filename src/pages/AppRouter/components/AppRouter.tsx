import React, {useLayoutEffect} from 'react';
import AppRoutes from "./AppRoutes";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {actions} from "pages/AppRouter/store/reducers";
import {sendLocalRequest} from "../../../api/requests";
import {triggerEvent} from "../../../helpers/events";
import store from "../../../store";

const AppRouter = () => {
    const location = useNavigate();
    const dispatch = useDispatch();
    dispatch(actions.setLocation());
    useLayoutEffect(() => {
        dispatch(actions.setLocation());
        sendLocalRequest('/api/pages/', {}, "GET").then(r => {
            if (r.detail) {
                triggerEvent("router:navigate", {path: '/main/'});
            }
        });
    }, [location]);

    return (
        <AppRoutes/>
    );
};

export default AppRouter;