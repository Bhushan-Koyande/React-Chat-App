import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {Route,BrowserRouter} from 'react-router-dom';
import LoginComponent from './login/login';
import SignupComponent from './signup/signup';
import DashboardComponent from './dashboard/dashboard'

const firebase=require("firebase");
require("firebase/firestore");

firebase.initializeApp({
    apiKey: "AIzaSyAgmWAKl4dDcQTzO30B6WJACOvxNtlzBgg",
    authDomain: "chat-app-58c32.firebaseapp.com",
    databaseURL: "https://chat-app-58c32.firebaseio.com",
    projectId: "chat-app-58c32",
    storageBucket: "chat-app-58c32.appspot.com",
    messagingSenderId: "423651553020",
    appId: "1:423651553020:web:c21719b072ca2bc90f3179",
    measurementId: "G-5WXJ4KTQWY"
});

const routing=(
    <BrowserRouter>
        <div className="routing-container">
            <Route path='/login' component={LoginComponent}></Route>
            <Route path='/signup' component={SignupComponent}></Route>
            <Route path='/dashboard' component={DashboardComponent}></Route>
        </div>
    </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
