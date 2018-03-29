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

    //------- VIEW CHILD AND GOOGLE MAPS API ELEMENTS -------
    @ViewChild('gmap') gmapElement: any;
    map: google.maps.Map;
    heatmap: google.maps.visualization.HeatmapLayer;
    LangLatArr: any;
    MapPoints: any;

    //-------- VARIABLES -------
    eokoData:any;
    anaBtn:any;
    actionList:any;
    activeActionList:any;
    pastActionList:any;
    cardData:any;


  //------------------------ CONSTRUCTOR FOR THE ANALYTICS COMPONENT --------------------
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
      }
    }


    //------------- PULL ALL ACTIOINS WITHIN AN EOKO ---------
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


  //----------------- CREATE A MAP --------------
    ngOnInit() {
      var mapProp = {
        center: new google.maps.LatLng(-75.18994409999999, 39.95661269999999),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);


      //--------------- CREATING A HEAT MAP LAYER ---------------
      this.heatmap = new google.maps.visualization.HeatmapLayer({
          data: this.getPoints(),
          map: this.map
      });
    }


    //------------ TOGGLE HEATMAP ----------
    toggleHeatMap(){
        this.heatmap.setMap(this.heatmap.getMap() ? null : this.map);
    }


    //------------- FUNCTION TO GET LANGTITUDE AND LONGTITUDE FOR HEATMAP --------
    getPoints(){
        console.log("WHERE THE FUCKS ARE THE COORDINATES!!!!!!!");
        this.LangLatArr = [];
        this.MapPoints = [];
        var actionList = this.generateActionList();
        if (actionList){
            this.LangLatArr = actionList.map(action => action.coordinate);


            //-------- GET EACH COORDINATE SEPARATELY -----------
            for (let i = 0; i < this.LangLatArr.length; i++){
                var coordinates = this.LangLatArr[i];
                if (coordinates != ""){
                    var langtitude = parseFloat(coordinates.split(","));
                    var longtitude = parseFloat(coordinates.split(","));
                    var point = new google.maps.LatLng(langtitude, longtitude);
                    console.log(langtitude, longtitude);
                    console.log(point);
                    this.MapPoints.push(point);
                }
            }

            console.log(this.MapPoints);
            return this.MapPoints;
        }


        //------------ THERE ARE NO ACTIONS, SO NO HEATMAP ---------
        else{
            alert("NO COORDINATE FOUNDS");
            return [];
        }
    }


    //------------ WHEN YOU CLICK ON AN ACTION, IT SHOWS THE ACTION INFROMATION --------
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
    		//this.cardData['joined'] = [];
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
