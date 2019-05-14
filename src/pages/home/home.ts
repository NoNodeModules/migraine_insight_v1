import { Component } from '@angular/core';
import { IonicPage, NavController, Tabs } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { ArticlePage } from '../home/article/article';
import { MyDataProvider } from '../../providers/my-data/my-data'; // MyData
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';  // Firebase
import { StatusBar } from '@ionic-native/status-bar';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';  // Storage
import moment from 'moment'; // moment

import { HomeDetailPage } from '../home/home-detail/home-detail';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

    uid: any;
    data1: any;

    //cards: any;
    //category: string = 'gear';
    q1_1_showMe: boolean = true;

    q1_1migraines: boolean = false;
    q1_1TTH: boolean = false;
    q1_1clusterHeadaches: boolean = false;
    q1_1hemiplegicMigraines: boolean = true;
    q1_1basilarMigraines: boolean = false;
    q1_1abdominalMigraines: boolean = false;
    q1_1opthalmicMigraines: boolean = false;

    q1_2_showMe: boolean = true;
    panelWeek1_showMe: boolean = true;
    panelWeek2_showMe: boolean = false;
    panelWeek3_showMe: boolean = false;
    panelWeek4_showMe: boolean = false;
    panelWeek5_showMe: boolean = false;

    //progress_showMe: boolean = false;

    oStatshide: boolean = true;

    posts: any;
    posts2: any;
    posts3: any;
    posts4: any;
    //slideOptions: any;
    //flashCardFlipped: boolean = false;

    daysLogged: any;
    avgTimeBetweenMigraines_Days: any;
    avgTimeBetweenMigraines_Hours: any;
    dayOfWeekMostMigraines: any;
    mostRecentMigraine_dayssince: any;
    mostRecentPeriod_days: any;

    registrationDate: Date;

    constructor(private storage: Storage, public http: Http, private statusBar: StatusBar, private tabs:Tabs, public navCtrl: NavController, private myData: MyDataProvider, public afAuth: AngularFireAuth, private db: AngularFireDatabase) {
      this.statusBar.backgroundColorByHexString("#b4bad2");

      // week 1
      this.http.get('https://healy.io/starbase/migraineweek1_json').map(res => res.json()).subscribe(data => {
        data.forEach(entry => {
            //entry.bodyNoHTML[0].value = entry.body[0].value ? String(entry.body[0].value).replace(/<[^>]+>/gm, '') : '';
            //entry.bodyNoHTML[0].value = entry.body[0].value ? String(entry.body[0].value).replace('&nbsp;', '') : '';
            //console.log("ENTRY -- ", entry);
          });
          this.posts = data;
          console.log("posts -- ", data);
        });

      // week 2
      this.http.get('https://healy.io/starbase/migraineweek2_json').map(res => res.json()).subscribe(data => { this.posts2 = data; });
      // week 3
      this.http.get('https://healy.io/starbase/migraineweek3_json').map(res => res.json()).subscribe(data => { this.posts3 = data; });
      // week 4
      this.http.get('https://healy.io/starbase/migraineweek4_json').map(res => res.json()).subscribe(data => { this.posts4 = data; });

      this.storage.get('registrationDate').then((val) => {
             var tzOffset = new Date().getTimezoneOffset()/60;
             this.registrationDate = new Date(moment.utc(val).add(tzOffset,'hours').format());
         });

      this.data1 = {
        auras : 1,						// Question 1
        migraineLength : 1,				// Question 2
        pulsing : 1,					// Question 3

        /* diagnosed_migraines : 0,			// checkboxes 4
        diagnosed_TTH : 0,
        diagnosed_clusterHeadaches : 0,
        diagnosed_hemiplegicMigraines : 0,
        diagnosed_basilarMigraines : 0,
        diagnosed_abdominalMigraines : 0,
        diagnosed_ophthalmicMigraines : 0, */

        selfSuspect_migraines : 0,			// checkboxes 5
        selfSuspect_TTH : 0,
        selfSuspect_clusterHeadaches : 0,
        selfSuspect_hemiplegicMigraines : 0,
        selfSuspect_basilarMigraines : 0,
        selfSuspect_abdominalMigraines : 0,
        selfSuspect_ophthalmicMigraines : 0,

        diagnosed_asthma : 0,				// checkboxes 6
        diagnosed_epilepsy : 0,
        diagnosed_cancer : 0,
        diagnosed_diabetes : 0,
        diagnosed_eatingdisorder : 0,
        diagnosed_depression : 0,
        diagnosed_anxiety : 0,
        diagnosed_ptsd : 0,

        otherDiagnoses : "",				// input 7
        migraineMedications : "",			// input 8
        otherMedications : "",				// input 9
        allergies : "",					// input 10

        child_physicalAbuse : 0,			// checkboxes 11
        child_sexualAbuse : 0,
        child_alcoholicDrugAddict : 0,
        child_livedWithMentallyIll : 0,
        child_domesticViolence : 0,
        child_otherTrauma : 0,

        gender : 1,						// select 12
        age : "",						// input 13
        ethnicity : 1,					// select 14
        country : "",					// input 15
        postalCode : "",					// input 16
      };


        this.afAuth.authState.subscribe(auth => {
          if (!auth) { } else {
              this.uid = auth.uid;
              // GET survey answers
              this.db.object('/users/'+this.uid).subscribe(user => {
                    this.data1 = user.surveyAnswers;
              });
          }
        });
    }

    // END CONTSTRUCTOR


    pick(post, theTitle) {
        console.log("POST - ", post);
        console.log("theTitle - ", theTitle);
        this.storage.set("currentArticle" , JSON.stringify(post));
        this.navCtrl.push(HomeDetailPage);
	   }

    switchTab(tabIndex) {
      this.tabs.select(tabIndex);
    }

    //switchTab(tabIndex) {
    //  this.tabs.select(tabIndex);
    //}
    ionViewWillEnter() {
      this.statusBar.backgroundColorByHexString("#6cb4dc");
      //this.statusBar.overlaysWebView(true);
      //this.statusBar.backgroundColorByHexString("#f1f1f1");
    }

    /* -- function: refresh
    	$scope.$on('$ionicView.afterEnter', function() { $scope.refreshMe(); });
    $scope.refreshMe = function() {

    	// is the survey done (surveyDone)? yes, load surveyAnswers from DB. (no? do nothing. you have blank already loaded.)

    	//$scope.quer = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/surveyDone/surveyDone/');
    	//$scope.quer.on('value', function(snapshot) 	{
    		//console.log("snapshot: " + snapshot.val());
    			//if (snapshot.val() == 'yes') {
    				//console.log('we have answers already! load em.');
    				var ref = new Firebase($rootScope.URL + '/users/' + firebase.auth().currentUser.uid + '/surveyAnswers/');
    				ref.on('value', function(snapshot) 	{
    					console.log('snapshot: ' + s(snapshot.val()));
    					if (snapshot.val() != null) {
    						console.log("not null");
    						$scope.data = snapshot.val();
    					}
    				});
    			//}
    		//});
    	} */

    selectAnswer(qName){
    //selectAnswer($event){
      if (qName == "q1_1") { this.q1_1_showMe = false; }
      if (qName == "q1_2") { this.q1_2_showMe = false; }
    }

    showQuestions(qName){
      if (qName == "q1_1") { this.q1_1_showMe = true; }
      if (qName == "q1_2") { this.q1_2_showMe = true; }
    }

    goArticle(articleName) {
        // go to next page
        this.navCtrl.push(ArticlePage);
        //this.navCtrl.push(ResultsPeriodPage)
    }

    /* Question 4, 5, 6, 11 -- you don't need this?? data writes without it.
  	selectCheckbox(questName) {
  		var theAnswer = "";
  		if (document.getElementById(questName).checked) { theAnswer = "yes"; }
  		else { theAnswer = "no"; }

  		this.surveyAnswers[questName] = theAnswer;
  		//alert(s($scope.surveyAnswers));
  	}; */

    showPanel(panelName) {
        //console.log("PanelName: " + panelName);
        this.panelWeek1_showMe = false;
        this.panelWeek2_showMe = false;
        this.panelWeek3_showMe = false;
        this.panelWeek4_showMe = false;
        this.panelWeek5_showMe = false;
        if (panelName == "panelWeek1") this.panelWeek1_showMe = true;
        if (panelName == "panelWeek2") this.panelWeek2_showMe = true;
        if (panelName == "panelWeek3") this.panelWeek3_showMe = true;
        if (panelName == "panelWeek4") this.panelWeek4_showMe = true;
        if (panelName == "panelWeek5") this.panelWeek5_showMe = true;
    }

    showProgress() {
        //console.log("PanelName: " + panelName);
        //this.progress_showMe = true;
        this.oStatshide = false;

          // ** DAYS LOGGED **
          this.daysLogged = (moment(this.registrationDate).diff(moment().startOf('day'), 'days') * -1) + 1;
          if (!this.daysLogged) { this.daysLogged = 0; }

          var hoursSinceStart = moment(this.registrationDate).diff(moment().startOf('day'), 'hours') * -1;

          // AVG TIME BETWEEN MIGRAINES
          var migraines2 = this.myData.getMigraines();
          migraines2 = migraines2.sort(function(a, b) { return +(a.myDateTime > b.myDateTime) || +(a.myDateTime === b.myDateTime) - 1; });

          if (migraines2.length > 1) { // must have two migraines! thus, the 1
            var hoursBetweenMigraines = hoursSinceStart / migraines2.length;
            this.avgTimeBetweenMigraines_Days = Math.round(hoursBetweenMigraines / 24);
            this.avgTimeBetweenMigraines_Hours = Math.round((hoursBetweenMigraines % 24));
          } else {
            this.avgTimeBetweenMigraines_Days = 0;
            this.avgTimeBetweenMigraines_Hours = 0;
          }

          // DAYS SINCE LAST MIGRAINE
          if (migraines2.length > 0) {
            this.mostRecentMigraine_dayssince = moment(migraines2[migraines2.length - 1].myDateTime).startOf('day').diff(moment().startOf('day'), 'days') * -1;
          } else {
            this.mostRecentMigraine_dayssince = 0;
          }

          // DAY OF THE WEEK MOST MIGRAINES
          //var theArray = JSON.parse(window.localStorage["Migraines"]);
          var numArray = [0,0,0,0,0,0,0];
          var namesArray = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          //var theDay = "Sunday";
          var position = 0;
          var largest= 0;

          // make array with total of each day - loop through migraine array
          for(var i = 0; i < migraines2.length; i++) {
              var dayOfWeek = new Date(migraines2[i].myDateTime).getDay();
              numArray[dayOfWeek] = numArray[dayOfWeek] + 1;
          }

          // in arry of totals for each day, which position is highest?
          for (var x=0; x<=numArray.length;x++){
              if (numArray[x]>largest) {
                  var largest=numArray[x];
                  position = x;
              }
          }

          //console.log("position: " + position);
          if (migraines2.length == 0) { this.dayOfWeekMostMigraines = "None"; }
          else { this.dayOfWeekMostMigraines = namesArray[position]; }

          // DAY OF CURRENT CYCLE
          var periods = this.myData.getPeriods().sort(function(a, b) { return +(a.myDateTime > b.myDateTime) || +(a.myDateTime === b.myDateTime) - 1; });
          //console.log('periods: ', JSON.stringify(periods));
          if (periods.length > 0) {
            console.log('periods[periods.length].myDateTime: ', periods[periods.length - 1].myDateTime);
            this.mostRecentPeriod_days = 1 + Number(moment(new Date().getTime()).endOf('day').diff(moment(periods[periods.length - 1].myDateTime).startOf('day'), 'days'));
          //console.log('this.mostRecentPeriod_days: ', this.mostRecentPeriod_days);
        } else {
          this.mostRecentPeriod_days = 0;
        }
      }


    // Question 1
  	selectAuras(num) {
  		//alert('$scope.surveyAnswers: ' + s($scope.surveyAnswers) +
  		// "auras: " + $scope.surveyAnswers.auras);
  		this.data1.auras = num;
      this.q1_2_showMe = false;

  		// save to DB
  		var theAnswer = "";
  		if (num == 1) { theAnswer = "never"; }
  		if (num == 2) { theAnswer = "sometimes"; }
  		if (num == 3) { theAnswer = "always"; }
  		this.saveSurveyAnswer("AuraOrNot",theAnswer,"multipleChoice");
  	}

    saveQ1Answers() {
        var theAnswer = "";
        console.log("Q1");
        console.log("q1Mig: ", this.q1_1migraines);

      //  console.log("this.data1.diagnosed_clusterHeadaches: " + this.data1.auras);
      //  if (this.data1.diagnosed_migraines == 1) { console.log("migraines"); }
    //    if (this.data1.diagnosed_TTH == 1) { console.log("TTH"); }
    //    this.q1_1_showMe = false;


        /* diagnosed_migraines : 0,			// checkboxes 4
        diagnosed_TTH : 0,
        diagnosed_clusterHeadaches : 0,
        diagnosed_hemiplegicMigraines : 0,
        diagnosed_basilarMigraines : 0,
        diagnosed_abdominalMigraines : 0,
        diagnosed_ophthalmicMigraines : 0, */

        this.saveSurveyAnswer("WhatHeadacheTypes",theAnswer,"checkboxMultiple");
    }

    saveSurveyAnswer(theQuestion,theAnswer,theQuestionType) {
      // SET survey answers
      //console.log("this.data1: " + this.data1);
      this.myData.makeASurveyAnswer(theQuestion, theAnswer, theQuestionType);
  	}

}




/* LEGACY */

//	fix, future. don't need surveyAnswers, just data.
/*	$scope.surveyAnswers =
							{
								"auras":"never",				// select 1
								"length":"0-4",				// select 2
								"pulsing":"pulsing",				// select 3

								"diagnosed_migraines":"noanswer",		// checkboxes 4
								"diagnosed_TTH":"noanswer",
								"diagnosed_clusterHeadaches":"noanswer",
								"diagnosed_hemiplegicMigraines":"noanswer",
								"diagnosed_basilarMigraines":"noanswer",
								"diagnosed_abdominalMigraines":"noanswer",
								"diagnosed_ophthalmicMigraines":"noanswer",

								"selfSuspect_migraines":"noanswer",		// checkboxes 5
								"selfSuspect_TTH":"noanswer",
								"selfSuspect_clusterHeadaches":"noanswer",
								"selfSuspect_hemiplegicMigraines":"noanswer",
								"selfSuspect_basilarMigraines":"noanswer",
								"selfSuspect_abdominalMigraines":"noanswer",
								"selfSuspect_ophthalmicMigraines":"noanswer",

								"diagnosed_asthma":"noanswer",		// checkboxes 6
								"diagnosed_epilepsy":"noanswer",
								"diagnosed_cancer":"noanswer",
								"diagnosed_diabetes":"noanswer",
								"diagnosed_eatingdisorder":"noanswer",
								"diagnosed_depression":"noanswer",
								"diagnosed_anxiety":"noanswer",
								"diagnosed_ptsd":"noanswer",

								"otherDiagnoses":"noanswer",			// input 7
								"migraineMedications":"noanswer",		// input 8
								"otherMedications":"noanswer",		// input 9
								"allergies":"noanswer",				// input 10

								"child_physicalAbuse":"noanswer",		// checkboxes 11
								"child_sexualAbuse":"noanswer",
								"child_alcoholicDrugAddict":"noanswer",
								"child_livedWithMentallyIll":"noanswer",
								"child_domesticViolence":"noanswer",
								"child_otherTrauma":"noanswer",

								"gender":"female",				// select 12
								"age":"noanswer",					// input 13
								"ethnicity":"Black",				// select 14
								"country":"noanswer",				// input 15
								"postalCode":"noanswer"				// input 16
							};

              */
