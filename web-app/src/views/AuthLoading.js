import React,{ useEffect, useContext } from 'react';
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import {language} from 'config';
import { FirebaseContext } from 'common';

function AuthLoading(props) {
    const { api } = useContext(FirebaseContext);
    const {
        fetchUser,
        fetchCarTypes,
        fetchSettings, 
        fetchBookings,
        fetchCancelReasons,
        fetchPromos,
        fetchDriverEarnings,
        fetchUsers,
        fetchBonus,
        fetchNotifications,
        fetchEarningsReport,
        signOut,
        fetchWithdraws
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

    useEffect(()=>{
        dispatch(fetchUser());
        dispatch(fetchCarTypes());
    },[dispatch,fetchUser,fetchCarTypes]);

    useEffect(()=>{
        if(auth.info && auth.info.profile){
            let role = auth.info.profile.usertype;
            if(role === 'rider'){
                dispatch(fetchBookings(auth.info.uid,role));
                dispatch(fetchCancelReasons());
                dispatch(fetchSettings());
            }
            else if(role === 'driver'){
                dispatch(fetchBookings(auth.info.uid,role));
            }
            else if(role === 'admin'){
                dispatch(fetchUsers());
                dispatch(fetchBookings(auth.info.uid,role));
                dispatch(fetchPromos());
                dispatch(fetchDriverEarnings());
                dispatch(fetchBonus());
                dispatch(fetchNotifications());
                dispatch(fetchEarningsReport());
                dispatch(fetchSettings());
                dispatch(fetchCancelReasons());
                dispatch(fetchWithdraws());
            }
            else{
                alert(language.alert,language.not_valid_user_type);
                dispatch(signOut());
            }
    }
    },[auth.info,dispatch,fetchBonus,fetchBookings,fetchCancelReasons,fetchDriverEarnings,fetchEarningsReport,fetchNotifications,fetchPromos,fetchSettings,fetchUsers,fetchWithdraws,signOut]);

    return (
        auth.loading? <CircularLoading/>:props.children
    )
}

export default AuthLoading;