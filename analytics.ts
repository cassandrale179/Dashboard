import { Component, ViewChild} from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserInfoProvider } from '../../providers/user-info/user-info';
import {} from '@types/googlemaps';

@Component({
  selector: 'analytics',
  templateUrl: 'analytics.html'
})

//----------- ANALYTICS COMPONENT -------
export class AnalyticsComponent {

    //-------  GOOGLE MAPS API ELEMENTS -------
    @ViewChild('gmap') gmapElement: any;
    map: google.maps.Map;
    heatmap: google.maps.visualization.HeatmapLayer;
    LangLatArr: any;
    MapPoints: any;

    //------------- VARIABLES ----------
    eokoData:any;
    anaBtn:any;
    actionList:any;
    activeActionList:any;
    pastActionList:any;
    cardData:any;

    //-------- MOST USED SECTION --------
    ActionPerTag: any;
    ActionPerSubTag: any;
    PrettifyTags: any;
    PrettifySubTags: any;
    TagsAndTitleFrequency: any;


    //----------- CHART BACKEND -----------
    SortedActionTime: any;
    PeopleJoin: any;
    ActionCreated: any;
    TimeAxis: any;



    //------------------------ CHART VARIABLES --------------------------
    public lineChartData:Array<any> = [];

    //--------- CHART LABEL ------------
    public lineChartLabels:Array<any> = [];

    //-------- CHART OPTIONS ----------
    public lineChartOptions:any = {
        responsive: true
    };


    //------------ CHART COLOR -----------
    public lineChartColors:Array<any> = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(220, 118, 51,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];

  //--------- CHART LEGEND AND TYPE -------
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';


  //-------------------------------------------------------------------------------------
  //------------------------ CONSTRUCTOR FOR THE ANALYTICS COMPONENT --------------------
  //--------------------------------------------------------------------------------------
  constructor(public afAuth: AngularFireAuth, public afData: AngularFireDatabase, public uInfo: UserInfoProvider) {
    this.anaBtn = 'actions';
    this.eokoData = this.uInfo.getCurrentEokoInfo();
    this.loadEokoData();
  }

  //-------------- THAT LOOP TO TRY GETTING THE EOKO DATA --------
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
        console.log('getting êoko data...')
        this.generateActionList();
        this.getTags();
        this.SortActionByTimeStamp();
      }
    }


    //------------- PULL ALL ACTIONS WITHIN AN EOKO ---------
    generateActionList(){
    	this.actionList = [];
    	this.activeActionList = [];
    	this.pastActionList = [];

        //---------- GET ACTIVE ACTIONS --------
    	try{
    		for(var i in this.eokoData.actions){
    			this.activeActionList.push(this.eokoData.actions[i]);
    		}
    	}
        catch(err){
            console.log("no active actions");
        }

        //---------- GET PAST ACTIONS ----------
    	try{
    		for(var i in this.eokoData.pastActions){
    			this.pastActionList.push(this.eokoData.pastActions[i]);
    		}
    	}
        catch(err){
            console.log("no past actions");
        }

        //------------ JOIN BOTH PAST AND ACTIVE ACTIONS TOGETHER ---------
    	this.actionList = this.activeActionList.concat(this.pastActionList);
        return this.actionList;
    }




    //---------------------------------------------------------------------------------------
    //--------------------------------------- GET TAGS --------------------------------------
    //---------------------------------------------------------------------------------------
    getTags(){
        this.ActionPerTag = {};
        this.ActionPerSubTag = {};
        var TagArray = [];

        //------- IF AN ACTIONS EXIST -------
        if (this.actionList){

            //------ LOOP THROUGH ALL ACTIONS AND EXTRACT THEIR TAGS -----
            for (var key in this.actionList){

                //------- GET ACTIONS OBJECT -------
                var action = this.actionList[key];
                var tags = action.tags;
                var subtags = action.subtags;

                //---- LOOP THROUGH EACH TAG AND PUT ACTION UNDER IT ---
                for (let t = 0; t < tags.length; t++){
                    if (this.ActionPerTag[tags[t]]){
                        this.ActionPerTag[tags[t]].push(action);
                    }
                    else{
                        this.ActionPerTag[tags[t]] = [action];
                    }
                }

                //--- LOOP THROUGH EACH SUBTAG AND PUT ACTION UNDER IT ---
                if (subtags != undefined){
                    for (let s = 0; s < subtags.length; s++){
                        if (this.ActionPerSubTag[subtags[s]]){
                            this.ActionPerSubTag[tags[s]].push(action);
                        }
                        else{
                            this.ActionPerSubTag[tags[s]] = [action];
                        }
                    }
                }
            }

            //------- DISPLAY LIST OF TAGS ON HTML PAGE ------
            this.PrettifyTags = []
            for (var key in this.ActionPerTag){
                var obj = {
                    name: key,
                    count: this.ActionPerTag[key].length
                }
                this.PrettifyTags.push(obj);
            }

            this.PrettifyTags.sort(function (a, b) {
                  return b.count- a.count;
            });


            //------- DISPLAY LIST OF SUBTAGS ON HTML PAGE ------
            this.PrettifySubTags = [];
            for (var key in this.ActionPerSubTag){
                var obj = {
                    name: key,
                    count: this.ActionPerSubTag[key].length
                }
                this.PrettifySubTags.push(obj);
            }
            this.PrettifySubTags.sort(function (a, b) {
                  return b.count- a.count;
            });
            this.getTitle();
        }

        //------- IF THERE ARE NO ACTIONS ------
        else{
            console.log("NO ACTIONS FOUND");
        }
    }


    //------------------ GET TITLE -------------------
    getTitle(){
        this.TagsAndTitleFrequency = [];

        for (var tag in this.ActionPerTag)
        {
            var ListOfWordsPerTag = [];
            var WordCount = {};
            var ActionArray = this.ActionPerTag[tag];

            //--------- LOOP THROUGH THE LIST OF ACTIONS --------
            for (let a = 0; a < ActionArray.length; a++){
                var action = ActionArray[a];

                //--------- SOME REGEX SHIT ---------
                var title = action.name.replace(/[{()}/?!]/g, '');
                title = title.toLowerCase();

                //------- SPLIT EVERYTHING INTO WORDS -------
                var ArrayOfWords = title.split(" ");
                ListOfWordsPerTag = ListOfWordsPerTag.concat(ArrayOfWords);
            }


            //--------- COUNT OCCURRENCE OF WORDS ---------
            var SortedWordCount = [];
            for (var i = 0; i < ListOfWordsPerTag.length; i++) {
                      var word = ListOfWordsPerTag[i];
                      if (word != "" && word != "a" && word != "the"){
                           WordCount[word] = WordCount[word] ? WordCount[word] + 1 : 1;
                      }
                  }

            for (var WordObject in WordCount) {
                    var wordcount = {
                        wordname: WordObject,
                        count: WordCount[WordObject]
                    }
                    SortedWordCount.push(wordcount);
            }
            SortedWordCount.sort(function(a, b) {
                return b.count - a.count;
            });


            //------------ ADD TAG AND ASSOCIATED WORD TO THE ARRAY -------
            var TagsAndTitleFrequencyObj = {
                tagname: tag,
                wordArr: SortedWordCount
            }
            this.TagsAndTitleFrequency.push(TagsAndTitleFrequencyObj);
        }
        console.log(this.TagsAndTitleFrequency);
    }



    //--------------------------------------------------------------------------------------
    //----------------------------- BACKEND FOR CHARTS -------------------------------------
    //--------------------------------------------------------------------------------------
    SortActionByTimeStamp(){
        this.SortedActionTime = [];
        for (var action in this.actionList){
            this.SortedActionTime.push(this.actionList[action]);
        }
        this.SortedActionTime = this.actionList.sort(function (a, b) {
              return b.actionCreatedTime - a.actionCreatedTime;
        });
        var endOfTime = this.SortedActionTime[0].actionCreatedTime;
        var beginOfTime = this.SortedActionTime[this.SortedActionTime.length-1].actionCreatedTime;
        this.WeeklyTimeStamp(beginOfTime, endOfTime);
    }


    //------------ CALCULATE ACTIONS AND JOINS PER WEEK --------
    WeeklyTimeStamp(beginOfTime, endOfTime){
        var oneweek = 86400000*7;
        var interval = beginOfTime;
        var weekArray = [];
        console.log(interval, endOfTime);
        while (interval < endOfTime){
            interval += oneweek;
            var timeobj = {
                time: interval,
                count: 0,
                peopleJoin: 0
            }
            weekArray.push(timeobj);
        }
        console.log(weekArray);

        for (var key in this.actionList){
            var action = this.actionList[key];
            var actionTime = action.actionCreatedTime;
            for (let t = 0; t < weekArray.length; t++){
                if (actionTime < weekArray[t].time){
                    weekArray[t].count += 1;
                    weekArray[t].peopleJoin += Object.keys(action.joined).length;
                    break;
                }
            }

        }

        this.TimeAxis = [];
        this.PeopleJoin = [];
        this.ActionCreated = [];

        //---------------- PRETTIFY WEEKLY ------------------
        for (var eachpoint in weekArray){
            var prettyTime = String(new Date(weekArray[eachpoint].time*1000)).substring(4,10);
            this.TimeAxis.push(prettyTime);
            this.PeopleJoin.push(weekArray[eachpoint].peopleJoin);
            this.ActionCreated.push(weekArray[eachpoint].count);
        }
        this.lineChartLabels = this.TimeAxis;
        this.lineChartData.push({data: this.ActionCreated, label: 'Number of Actions Created'});
        this.lineChartData.push({data:this.PeopleJoin, label: 'Number of People Joined'});




    }


  //--------------------------------------------------------------------------------------
  //----------------------------------- CREATE A MAP -------------------------------------
  //--------------------------------------------------------------------------------------
    ngOnInit() {
      var mapProp = {
        center: new google.maps.LatLng(39.95661269999999, -75.18994409999999),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);


      //--------------- CREATING A HEAT MAP LAYER ---------------
      this.heatmap = new google.maps.visualization.HeatmapLayer({
          data: this.getPoints(),
          map: this.map,
          radius: 61,
          opacity: 0.75
      });
    }


    //------------ TOGGLE HEATMAP ----------
    toggleHeatMap(){
        this.heatmap.setMap(this.heatmap.getMap() ? null : this.map);
    }


    //------------- FUNCTION TO GET LANGTITUDE AND LONGTITUDE FOR HEATMAP --------

    //https://developers.google.com/maps/documentation/javascript/heatmaplayer
    //Weighted Data Points to the heatmap data, where Action is the long and lat,
    //and number joined is the weight
    getPoints(){
        this.LangLatArr = [];
        this.MapPoints = [];
        var actionList = this.generateActionList();
        if (actionList){
            this.LangLatArr = actionList.map(action => {  //this is to push both coordinate and weight for later
                //console.log("each action", action);
                var obj = {
                    points: action.coordinate,
                    count: Object.keys(action.joined).length
                };
                return obj;
            });


            //-------- GET EACH COORDINATE SEPARATELY -----------
            for (let i = 0; i < this.LangLatArr.length; i++){  //
                var coordinates = this.LangLatArr[i].points;
                if (coordinates != ""){
                    var langtitude = parseFloat(coordinates.split(",")[0]);
                    var longtitude = parseFloat(coordinates.split(",")[1]);
                    var point = new google.maps.LatLng(longtitude,langtitude);
                    var weighting = this.LangLatArr[i].count;
                    var mapbundle = {
                        location: point,
                        weight: weighting  //weighting is the count people joined stuff
                    };
                    this.MapPoints.push(mapbundle);
                }
            }
            return this.MapPoints;
        }


        //------------ THERE ARE NO ACTIONS, SO NO HEATMAP ---------
        else{
            return [];
        }
    }

    //---------------------------------------------------------------------------------------
    //------------ WHEN YOU CLICK ON AN ACTION, IT SHOWS THE ACTION INFROMATION -------------
    //---------------------------------------------------------------------------------------
    populateCard(action)
    {
    	this.cardData = {};
    	this.cardData = action;

    	var startime = new Date(action.startTime);
    	this.cardData['startTime'] = startime.toLocaleDateString() + " @ " + startime.toLocaleTimeString();

    	var endtime = new Date(action.endTime);
    	this.cardData['endTime'] = endtime.toLocaleDateString() + " @ " + endtime.toLocaleTimeString();

    	if(!action.joined){
    		console.log("no joined people");
    		this.cardData['joined'] = [];
    		this.cardData['joinedText'] = "No users joined this action";
    	}
    	else{
    		this.cardData['joinedText'] = "";
    		var fin = [];
    		for(var i in action.joined){
    			console.log("action is", action.joined[i]);
    			fin.push(action.joined[i]);
    		}
    		this.cardData['joined'] = fin;
    		console.log("______cardData_____",this.cardData.joined,action.joined);
    	}
    }
}
