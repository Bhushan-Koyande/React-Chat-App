import React, { Component } from 'react';
import ChatListComponent from '../chatlist/chatList';
import {Button,withStyles} from '@material-ui/core';
import styles from './styles';
import ChatViewComponent from '../chatview/chatView';
import ChatTextBoxComponent from '../chattextbox/chatTextBox';
import NewChatComponent from '../newchat/newChat';

const firebase=require("firebase");

class DashboardComponent extends React.Component{

    constructor(){
        super();
        this.state={
            selectedChat:null,
            newChatFormVisible:false,
            email:null,
            chats:[]
        }
    }
    render(){

        const{classes}=this.props;

        return(
            <div>
                <ChatListComponent history={this.props.history}
                newChatBtnFn={this.newChatBtnClicked}
                selectChatFn={this.selectChat}
                chats={this.state.chats}
                userEmail={this.state.email}
                selectedChatIndex={this.state.selectedChat}></ChatListComponent>
                {
                    this.state.newChatFormVisible ?
                    null:
                    <ChatViewComponent user={this.state.email} chat={this.state.chats[this.state.selectedChat]}>
                    </ChatViewComponent>
                }
                {
                    this.state.selectedChat!==null && !this.state.newChatFormVisible ?
                    <ChatTextBoxComponent messageReadFn={this.messageRead} submitMessageFn={this.submitMessage}></ChatTextBoxComponent> :
                    null
                }
                {
                    this.state.newChatFormVisible ? 
                    <NewChatComponent goToChatFn={this.goToChat} newChatSubmitFn={this.newChatSubmit} ></NewChatComponent>:
                    null
                }
                <Button onClick={this.signOut} className={classes.signOutBtn}>Sign Out</Button>
            </div>
        )
    }
    newChatBtnClicked=()=>{
        console.log('new chat button clicked');
        this.setState({
            newChatFormVisible:true,
            selectedChat:null
        })
    }
    goToChat=(docKey,msg)=>{
        const usersInChat = docKey.split(':');
        const chat = this.state.chats.find(_chat => usersInChat.every(_user => _chat.users.includes(_user)));
        this.setState({ newChatFormVisible: false });
        await this.selectChat(this.state.chats.indexOf(chat));
        this.submitMessage(msg);
    }
    messageRead = () =>{
        const docKey=this.buildDocKey(this.state.chats[this.state.selectedChat].users.filter(_usr =>_usr!=this.state.email)[0]);
        if(this.clickedMessageWhereNotSender(this.state.selectedChat)){
            firebase.firestore().collection('chats').doc(docKey).update({
                recieverHasRead:true
            })
        }else{
            console.log('clicked message where the user was sender');
        }
    }
    newChatSubmit= async (chatObj) =>{
        const docKey=this.buildDocKey(chatObj.sendTo);
        await firebase
            .firestore()
            .collection('chats')
            .doc(docKey)
            .set({
                recieverHasRead:false,
                users:[this.state.email,chatObj.sendTo],
                messages : [{
                    message:chatObj.message,
                    sender:this.state.email
                }],
                users: [this.state.email, chatObj.sendTo],
                receiverHasRead: false
            })
            this.setState({ newChatFormVisible: false });
        this.selectChat(this.state.chats.length - 1);        
    }
    clickedMessageWhereNotSender = (chatIndex) => this.state.chats[chatIndex].messages[this.state.chats[chatIndex].messages.length - 1].sender !== this.state.email;
    selectChat= async (chatIndex)=>{
        await this.setState({ selectedChat:chatIndex,newChatFormVisible:false });
        this.messageRead();
    }
    buildDocKey=(friend)=> [this.state.email,friend].sort().join(':');
    submitMessage=(msg)=>{
        const docKey=this.buildDocKey(this.state.chats[this.state.selectedChat].users.filter(_usr =>_usr!==this.state.email)[0]);
        console.log(docKey);
        firebase.firestore().collection('chats').doc(docKey).update({
            messages:firebase.firestore.FieldValue.arrayUnion({
                sender:this.state.email,
                message:msg,
                timestamp:Date.now()
            }),
            recieverHasRead:false
        });
    }
    componentDidMount=()=>{
        firebase.auth().onAuthStateChanged(async _usr=>{
            if(!_usr){
                this.props.history.push('/login')
            }else{
                await firebase.firestore().collection('chats').where('users','array-contains',_usr.email).
                onSnapshot(async res=>{
                    const chats=res.docs.map(_doc=>_doc.data());
                    await this.setState({
                        email:_usr.email,
                        chats:chats
                    })
                })
                console.log(this.state);
            }
        })
    }
    signOut=()=>{
        firebase.auth().signOut();
    }
}

export default withStyles(styles)(DashboardComponent);
