import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserInfoProvider } from '../../providers/user-info/user-info';
import { NewMessageModal } from './newMessageModal';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-message-tab',
  templateUrl: 'message-tab.html'
})
export class MessageTabPage {

  fmessage:string = ""

  //------- VARIABLE FOR PERSONAL CHAT -----
  DMChats:any[];
  loadedDMChats: any[];

  //------- VARIABLE FOR GROUP CHAT --------
  groupChats:any[];
  loadedGroupChats:any[];
  groupChatSenderName ="";

  //------ VARIABLE TO CONCATENATE BOTH GROUP CHAT AND PERSONAL CHAT ------
  allChats: any[];
  allChatsPrettify: any[];

  //------------- CONSTRUCTOR FOR THE MESSAGE PAGE --------------
  constructor(public navCtrl: NavController, public navParams: NavParams, public afData: AngularFireDatabase,
  	public uInfo: UserInfoProvider, public modalCtrl: ModalController) {

      //---------- LOADING DM MESSAGE AND GROUP MESSAGES ---------
      this.loadDMMessages();
      this.loadGroupMessages();

  }

  ionViewDidEnter() {
      console.log('ionViewDidLoad MessageTabPage');
  }



//--------------------------------------------------------------------------
//--------------------------- LOAD PERSONAL MESSAGE ------------------------
//--------------------------------------------------------------------------
loadDMMessages(){
      this.DMChats = [];
      for(var i in this.uInfo.getUserInfo().chats){
        // this.uInfo.getUserInfo().chats[i].type = "DM";
        this.DMChats.push(this.uInfo.getUserInfo().chats[i]);
      }
      this.loadedDMChats = this.DMChats;
}

 //-------------------------------------------------------------------------
 //----------------------------- LOAD GROUP MESSAGES -----------------------
 //-------------------------------------------------------------------------
 loadGroupMessages(){
   if(this.uInfo.getUserInfo().currentEoko != false){
     this.afData.database.ref("Eokos").child(this.uInfo.getCurrentEokoID()).child("chats").once('value', success => {

        //------ IF PEOPLE SUCCESSFULLY LOAD GROUP CHATS --------
       this.groupChats = [];
       for(var i in success.val()){
         for(var j in success.val()[i].ids){
           if(this.uInfo.getUserInfo().id == success.val()[i].ids[j].id){
             this.groupChats.push(success.val()[i]);
           }
         }
       }

       //-------- SET GROUP PHOTO IN THE GROUP CHAT -------
       this.loadedGroupChats = this.groupChats;
       this.loadAllMessages();
     },


     //----- IF CANNOT LOAD GROUP CHAT ------
     fail => {
       console.log("failed");
     });
   }
 }


//---------- LOAD ALL MESSAGES --------
 loadAllMessages(){
    this.allChats = [];
    this.allChats = this.allChats.concat(this.DMChats);
    this.allChats = this.allChats.concat(this.groupChats);
    this.chatPrettifying();
 }


 //-------------------------------------------------------------------------
 //--------------- CREATE THE FINAL CHAT OBJECT FOR HTML PAGE --------------
 //-------------------------------------------------------------------------
 async chatPrettifying(){
    this.allChatsPrettify = [];


     for (var i in this.allChats){

         //-------- INTIALIZE A SET OF VARIABLES ----------
         let photoID = "";
         let result = "";
         let chatName = "";
         let lastText = "Nothing in this chat yet";
         let unread = false;
         let sender = "";
         let type = "";

         //--------- IF THIS IS A DM CHAT ---------
         if (this.allChats[i].userID){
            photoID = this.allChats[i].userID
            chatName = this.allChats[i].firstname + " " + this.allChats[i].lastname;
            if (this.allChats[i].lastText)
                lastText = this.allChats[i].lastText;
            unread = this.allChats[i].unread;
            sender = this.allChats[i].sender;

            type = "DM";

        }

        //----------------- IF THIS IS A GROUP CHAT --------------
         else{
             photoID = this.allChats[i].ownerID;
             chatName = this.allChats[i].chatName;
             if (this.allChats[i].lastText.messageText) lastText = this.allChats[i].lastText.messageText;

             //--------- CHECK IF THE USER IS THE ONE WHO SEND THE MESSAGE -------------
             sender = this.setSenderName(this.allChats[i].lastText.userID, this.allChats[i].lastText.firstname);
             type = "group";

         }

         //--------- GET THE PHOTO ID --------
         await firebase.storage().ref("profiles")
            .child(photoID + ".jpg").getDownloadURL().then(success => {
                result = success;
            }, fail => {
                    let defaultAvatar = "https://firebasestorage.googleapis.com/v0/b/eoko-cc928.appspot.com/o/profiles%2Fdefault_avatar.jpg?alt=media&token=761a4187-2508-44fb-994c-9bd0b6842181"
                    result = defaultAvatar;
            });



        //--------- CHAT OBJECT PRETTIFY ------
        let chatObjectPrettify = {

            photoID: result,
            chatName: chatName,
            unread: unread,
            lastText: lastText,
            sender: sender,
            type: type,
        }

        this.allChatsPrettify.push(chatObjectPrettify);


     }

     //------- SORTING ALL CHATS BY TIMESTAMP
     this.allChatsPrettify.sort(function(x,y){
         return y.timestamp - x.timestamp;
     });

     console.log(this.allChatsPrettify);
 }


    //-------- ENTER CHAT ---------
    // enterAllChat(chat){
    //     if (chat.type == "DM"){
    //         this.enterChat(chat);
    //         this.afData.database.ref("users").child(this.uInfo.getUserInfo().id).child("chats").child(chat.userID).update({unread: false});
    //     }
    //     else{
    //
    //     }
    // }


   //--------- SET THE SENDER NAME OF THE MESSAGE --------
   setSenderName(senderId, senderFirstName){
   var senderName = "";
     if(this.uInfo.getUserInfo().id == senderId) senderName = "You";
     else{
          senderName = senderFirstName;
     }
     return senderName;
   }



  //-----------------------------------------------------------------
  //------------- THIS IS TO OPEN THE MODAL WHEN SOMEONE DM ---------
  //-----------------------------------------------------------------
   newDMMessage(){
      let modal = this.modalCtrl.create(NewMessageModal);
      modal.onDidDismiss(data => {
        this.loadDMMessages();
        // this.enterChat(data);
      });
      modal.present();
    }


  //---------- CALLING FUNCTIONS TO LOAD GROUP AND PERSONAL MESSAGE -------
  doRefresh(refresher) {
    this.loadGroupMessages();
    this.loadDMMessages();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  //---------- FOR SEARCHING -------
  initializeFriends(){
    this.DMChats = this.loadedDMChats;
    this.groupChats = this.loadedGroupChats;

  }


//-------- SEARCH MESSAGES ---------
  searchMessages(searchbar) {


    // ------- INITIALIZE FRIENDS ---------
    this.initializeFriends();


    //--------- CREATE A SEARCH BAR --------
    var q = searchbar.srcElement.value;


    //------ RETURN NOTHING IF SEARCH IS EMPTY ------
    if (!q) return;

    //--------- IF FIND IT, THEN RETURN TRUE? -------
    if (String(q).replace(/\s/g, "").length == 0) {
      return true;
    }

    //------ WHEN SEARCH, MAKE SURE ALL WORDS ARE CONVERT TO LOWER CASE -----
    this.DMChats = this.DMChats.filter((v) => {
      if(v.firstname && v.lastname && v.lastText && q) {
        if (v.firstname.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
            v.lastname.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
            v.lastText.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

//----------------------------------------------------------------------
//------------------------- GROUP CHATS FILTERING ----------------------
//----------------------------------------------------------------------
    this.groupChats = this.groupChats.filter((v) => {
      if(v.chatName && q && v.lastText.messageText == "") {
        if (v.chatName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
      else if (v.chatName && q && v.lastText.messageText && v.lastText.firstname && v.lastText.lastname){
        if (v.chatName.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
            v.lastText.firstname.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
            v.lastText.lastname.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
            v.lastText.messageText.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }
}
