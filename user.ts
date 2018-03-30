import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserInfoProvider } from '../../providers/user-info/user-info';
import * as firebase from 'firebase';
import * as moment from 'moment';


@Component({
  selector: 'user',
  templateUrl: 'user.html'
})
export class UserComponent {

  text: string;
  eokoData:any;
  memberaccept:string;
  memselector:any;
  userList: any;
  photos:any;


//------------ VARIABLES FOR INDIVIDUAL EOKOS  -------------
  contentName:any;
  contentPhoto: any;
  contentJoined: any;
  actionCreated: any;
  actionJoined: any;
  actionEmail:any;
  userFeedback: any;


  //--------  SEARCHBAR VARIABLES ------
  eokoEmail: any;
  backupUserList:any;

 //------ PENDING MEMBERS -------
  pendingMem: any;
  pendingInfo: any;
  pendPhoto: any;


 //----- TAG INFORMATION AND SORTING --------
 tagInfo: any;
 sortType:string = 'smallest';
 tagorcount:string = "createAction";



 //-------------------------------------------------------------------------------------
 //------------------------ CONSTRUCTOR FOR THE USER COMPONENT --------------------------
 //--------------------------------------------------------------------------------------
  constructor(public afAuth: AngularFireAuth, public afData: AngularFireDatabase, public uInfo: UserInfoProvider) {
    this.eokoData = this.uInfo.getCurrentEokoInfo();
    this.memberaccept = 'choose';
    this.contentPhoto = "http://debut.careers/wp-content/uploads/2017/04/Profile-Fallback-01-01.png?x28372";
    this.loadEokoData();
    //this.memselector = ['false','true','false'];
  }


//---------- GET PHOTO OF ALL USERS ----------
async getPhotos(){
      this.photos = {};
      for(var i in this.userList){
         await firebase.storage().ref('profiles').child(this.userList[i].id + ".jpg").getDownloadURL().then(success =>{
             this.photos[this.userList[i].id] = success;
           },
           fail =>{
             this.photos[this.userList[i].id] = 'http://debut.careers/wp-content/uploads/2017/04/Profile-Fallback-01-01.png?x28372';
           });
      }
    }


//---------- GET USER FIRSTNAME, LASTNAME, ID AND THEIR ACTIONS  --------------
allUsers(){
      this.userList = [];
      for(var i in this.eokoData.memberList){
           var userInfo = {
               firstName: this.eokoData.memberList[i].firstname,
               lastName: this.eokoData.memberList[i].lastname,
               id: i,
               createAction: this.eokoData.memberList[i].createActionCount,
               joinAction: this.eokoData.memberList[i].joinActionCount
             };
             this.userList.push(userInfo);
      }
      this.getPhotos();
}

//---------- LOAD EOKO DATA  --------------
loadEokoData(){
    this.eokoData = this.uInfo.getCurrentEokoInfo();
    if (this.eokoData == undefined){
        setTimeout(() =>{
        console.log('Try again');
        this.loadEokoData();
        //this.acceptMem()
      },1000);
    }

    //-------- ONLY WHEN EOKO DATA IS LOADED THEN CALL THESE FUNCTIONS ------
    else{
          //this.ngAfterViewInit();
          this.allUsers();
          this.getUserEmail();
          this.loadPending();
          this.pendinghtml();
      }
    }

//------------  SHOW USER STATUS ON A CARD ------------------
showUserStats(user){
      this.contentName =  user.firstName + ' ' + user.lastName;
      this.contentPhoto = this.photos[user.id];
      this.contentJoined = new Date(this.eokoData.memberList[user.id].joinedTimestamp);
      this.actionCreated = this.eokoData.memberList[user.id].createActionCount;
      this.actionJoined = this.eokoData.memberList[user.id].joinActionCount
      this.actionEmail = this.eokoEmail[user.id];
      this.userFeedback = [];


      //------- CHECK IF THEY HAVE ANY FEEDBACK ---------
      let feedback = this.eokoData.feedback;
      for (let feed in feedback){
          if (feedback[feed].id == user.id){
            this.userFeedback.push(feedback[feed]);
          }
      }

      console.log(this.userFeedback);
}

//----------------- GET USER EMAIL ---------------
async getUserEmail(){
      this.eokoEmail = {};
      for(var i in this.userList){
          await this.afData.database.ref("users").child(this.userList[i].id).once("value")
          .then(email =>{
              this.eokoEmail[this.userList[i].id] = email.val().email;
      });
    }

    var newList = [];
    for(var i in this.userList){
      var obj = {
        firstName: this.userList[i].firstName,
        id: this.userList[i].id,
        lastName: this.userList[i].lastName,
        email: this.eokoEmail[this.userList[i].id],
        createAction: this.userList[i].createAction,
        joinAction: this.userList[i].joinAction
      };
      newList.push(obj);
    }
    this.userList = newList;
    this.backupUserList = newList;
  }

//---------------  SEARCH ALL USERS WITHIN AN EOKO ----------------
searchUsers(searchbar){
        this.userList = this.backupUserList;
        var q = searchbar.srcElement.value;
        console.log("searching...",q);
        if (!q) return;

        if (String(q).replace(/\s/g,"").length == 0){
          return true;
        }
        this.userList = this.userList.filter((v) => {
          if(v.firstName && v.lastName && v.email && q){
                if (v.firstName.toLowerCase().indexOf(q.toLowerCase()) >  -1 ||
                  v.lastName.toLowerCase().indexOf(q.toLowerCase()) > - 1 ||
                  v.email.toLowerCase().indexOf(q.toLowerCase()) > - 1){
                  return true;
                }
            return false;
          }
        });
}


//---------------------- LOADING PENDING PEOPLE ------------------------
loadPending(){
     this.pendingMem = []
     try{
         for(var i in this.eokoData.pendingMemberList){
           this.pendingMem.push(i);
         }
     }
    catch(err){
         console.log("no one is in the pending list...")
         this.pendingMem = null;
    }
}


//---------------------- LOADING PENDING PHOTOS ------------------------
async pendPhotos(){
    this.pendPhoto = {};
    for(var i in this.pendingInfo){
        await firebase.storage().ref('profiles').child(this.pendingInfo[i].id + ".jpg").getDownloadURL().then(success =>{
            this.pendPhoto[this.pendingInfo[i].id] = success;
       },
       fail =>{
         this.pendPhoto[this.pendingInfo[i].id] = 'http://debut.careers/wp-content/uploads/2017/04/Profile-Fallback-01-01.png?x28372';
       });
    }
}


//---------------- HTML FUNCTIONS TO DISPLAY PENDING PEOPLE ---------------
async pendinghtml(){
       this.pendingInfo = [];
       var pos = 0;
      if (this.pendingMem != null){
         for(var i in this.pendingMem){
              await this.afData.database.ref("users").child(this.pendingMem[i]).once("value").then(getInfo => {
                var info = {
                  firstName : getInfo.val().firstname,
                  lastName: getInfo.val().lastname,
                  id: this.pendingMem[i],
                }
                pos += 1;
                this.pendingInfo.push(info);
              }
           )
       }
     }
     this.pendPhotos()
 }

//---------------- DENYING PEOPLE ---------------------
denyMem(user){
     console.log("too bad sucker");
     this.afData.database.ref("Eokos")
        .child(this.uInfo.getCurrentEokoID())
        .child("pendingMemberList").child(user.id).remove().then(good =>{
         console.log("it worked!");
       });
}


//------------------ ACCEPTING PEOPLE ----------------
acceptMem(user){
     var addInfo = {
       createActionCount: 0,
       firstname: user.firstName,
       id: user.id,
       joinActionCount: 0,
       joinedTimeStamp: firebase.database.ServerValue.TIMESTAMP,
       lastname: user.lastName
     }
     this.afData.database.ref("Eokos").child(this.uInfo.getCurrentEokoID()).child("memberList").child(user.id).update(addInfo).then(success =>{
       this.afData.database.ref("Eokos").child(this.uInfo.getCurrentEokoID()).child("pendingMemberList").child(user.id).remove().then(good =>{
         console.log("it worked!");
       });
     });
     console.log(addInfo);
}



    //------------- SORTING FUNCTIONS ---------------
    createSmall(){
         this.sortType = "smallest";
         this.tagorcount = "createAction";
         //this.allUsers()
         console.log("userlist",this.userList);
    }
   createBig(){
         this.sortType = "largest";
         this.tagorcount = "createAction";
     //this.allUsers()
   }
   joinSmall(){
     this.sortType = "smallest";
     this.tagorcount = "joinAction";
     //this.allUsers()
   }
   joinBig(){
     this.sortType = "largest";
     this.tagorcount = "joinAction";
     //this.allUsers()
    }




}



//----------------
