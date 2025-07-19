import {useSelector} from 'react-redux';
import {Navigate } from 'react-router-dom';
import React from 'react'

const PrivateRoute = ({children}) => {
    const {isLoggedIn, Loading}= useSelector((state)=>state.auth);
    if (Loading) return null; 
    return isLoggedIn ? children : <Navigate to="/login" />;
}

export default PrivateRoute