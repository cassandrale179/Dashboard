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
    eokoID: any;
    create: boolean = false;
    survey: any;

    //------ COMPONENT OF A SURVEY ------
    title: any;
    description: any;
    label: any;
    content: any;
    contentObject: any;
    question: any;
    choice: any;
    choices: any;


    /* --------  A SURVEY COMPONENT WILL LOOK LIKE SO -------
        survey: {
            title: "survey title",
            description: "survey description",
            content: [  //an array of contentobject
                {
                    label: "question1",
                    question: "what is a question?",
                    choices: ["choice", "choice", "choice"],
                }
                {
                    label: "question2",
                    question: "what is a question?",
                    choices: []
                }
        ]
    }
    */

//-------------- CONSTRUCTOR FOR THE SURVEY COMPONENT --------------------------
  constructor(public afAuth: AngularFireAuth, public afData: AngularFireDatabase,
             public uInfo: UserInfoProvider){
    this.uInfo.getCurrentEokoInfo();
    this.eokoData = this.uInfo.getCurrentEokoInfo();
    this.eokoID = this.uInfo.getCurrentEokoID();
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
            this.survey = {};
            this.content = [];
            this.label = "Question " + String(this.content.length + 1);
            this.contentObject = {};
            this.choices = [];
        }
    }


    //------------ ADD QUESTIONS TO THE SURVEY -----------------
    AddQuestion(){
        this.contentObject = {
            label: this.label,
            question: this.question,
            choice: this.choices
        }
        this.content.push(this.contentObject);
        this.contentObject = {};
        this.label = "Question " + String(this.content.length + 1);
        this.choices = [];
        this.question = "";
    }


    //------------ ADD ANSWER TO THE SURVEY -----------------
    AddChoice(){
        this.choices.push(this.choice);
        console.log(this.choices);
        this.choice = "";
    }

    //------------ DELETE ANSWER TO THE SURVEY -----------------
    DeleteChoice(c){
        this.choices = this.choices.filter(e => e !== c)
        console.log(this.choices);
    }


    //------------ FUNCTION TO SUBMIT THE SURVEY -----------------
    SubmitSurvey(){
        if (!this.title) console.log("You must have a survey title");
        if (!this.description) console.log("You must have a description");
        else{
            this.survey = {
                title: this.title,
                description: this.description,
                content: this.content
            }
        }

        console.log(this.eokoID);
        this.afData.database.ref('Eokos/' + this.eokoID + '/survey/').push(this.survey);
        this.survey = {};
    }
}
