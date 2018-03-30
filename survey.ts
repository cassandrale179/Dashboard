import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserInfoProvider } from '../../providers/user-info/user-info';
import * as firebase from 'firebase';


@Component({
  selector: 'survey',
  templateUrl: 'survey.html'
})
export class SurveyComponent {
    eokoData: any;
    create: boolean = false;


  constructor(public afAuth: AngularFireAuth, public afData: AngularFireDatabase,
             public uInfo: UserInfoProvider){
    this.uInfo.getCurrentEokoInfo();
    this.eokoData = this.uInfo.getCurrentEokoInfo();
    this.loadEokoData();
  }


  //----------- LOAD EOKO DATA --------
    loadEokoData(){
        this.eokoData = this.uInfo.getCurrentEokoInfo();
        if (this.eokoData == undefined){
            setTimeout(() =>{
                console.log('Try again');
                this.loadEokoData();
        },1000);
      }

      //-------- ONLY WHEN EOKO DATA IS LOADED THEN CALL THESE FUNCTIONS ------
        else{

        }
    }



    AddQuestion(){
        let onequestion = {
            question: "", 
        }
        

    }


}
