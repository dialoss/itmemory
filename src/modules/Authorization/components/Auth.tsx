import React from 'react';
import "./Auth.scss";
import AuthButton from "./AuthButton";
import {useSelector} from "react-redux";
import {triggerEvent} from "../../../helpers/events";

const Auth = () => {
    const user = useSelector(state => state.users.current);
    function login() {
        triggerEvent('user-auth', true);
    }
    function logout() {
        triggerEvent('user-auth', false);
    }
    return (
        <div className={"auth"}>
            {!user.authenticated ?
                <AuthButton type={'choice'} callback={login}>Вход</AuthButton> :
                <AuthButton type={'logout'} callback={logout}>Выйти</AuthButton>}
        </div>
    );
};

export default Auth;