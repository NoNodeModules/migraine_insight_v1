import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireAuth } from 'angularfire2/auth'; // Auth
import moment from 'moment'; // moment
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database'; // Firebase
import { Storage } from '@ionic/storage'; // Storage
import { HelpersProvider } from '../../providers/helpers/helpers'; // helpers
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics


@Injectable()
export class MyDataProvider {

  uid: any;
  eventsFBL: FirebaseListObservable<any>;
  trackersFBL: FirebaseListObservable<any>;

  // trackersActiveFLO: FirebaseListObservable<any>;
  migrainesFBL: FirebaseListObservable<any>;
  periodsFBL: FirebaseListObservable<any>;
  //migrainesFBL: FirebaseListObservable<any>;
  //periodsFBL: FirebaseListObservable<any>;
  trackers: any = [];
  trackersActive: any = [];   // used for scoring
  trackersAll: any = [];   // used for scoring

  surveyAnswersFBL: FirebaseListObservable<any>;
  surveyAnswers: any = [];

  //trackersPaused: any = [];
  events: any = [];
  migraines: any = [];
  periods: any = [];
  theUser: any = [];

  constructor(private helpers: HelpersProvider, private storage: Storage, public afAuth: AngularFireAuth,
  private db: AngularFireDatabase, private ga: GoogleAnalytics) {
        this.afAuth.authState.subscribe(auth => {
          console.log('Subscribed to MyData *****');
          if (auth) {
          this.uid = auth.uid;
          this.theUser = this.db.object('/users/' + this.uid);

          //var theStart = moment().startOf('day');
          //var theEnd = moment().endOf('day');

          //this.eventsFBL = db.list('/events/'+auth.uid,{ query:{ orderByChild:'myDateTime', equalTo: 'Migraine'} });
          this.migrainesFBL = db.list('/events/'+auth.uid,{ query:{ orderByChild:'name', equalTo: 'Migraine'} });
          this.periodsFBL =  db.list('/events/'+auth.uid,{ query:{ orderByChild:'name', equalTo: 'Period'} });
          this.trackersFBL = db.list('/trackers/'+auth.uid); // , { query: { orderByChild: 'active', equalTo: true } });
          this.surveyAnswersFBL = db.list('/surveyanswers/'+auth.uid); // , { query: { orderByChild: 'active', equalTo: true } });

          // cast migraines   var theSub =
          this.migrainesFBL.subscribe((_items)=> {
            this.migraines = [];
              _items.forEach(item => {
                    this.migraines.push(item);
              });
            //theSub.unsubscribe();
          });

          // cast periods  var theSub2 =
          this.periodsFBL.subscribe((_items)=> {
            this.periods = [];
              _items.forEach(item => {
                    this.periods.push(item);
              });
            //theSub2.unsubscribe();
          });

          // cast trackers   var theSub5 =
          this.trackersFBL.subscribe((_items)=> {
              this.trackersActive = [];
              this.trackersAll = [];
                _items.forEach(item => {
                      this.trackersAll.push(item);
                      if (item.active) { this.trackersActive.push(item); }
                });
              //theSub5.unsubscribe();
          });

          // cast trackers   var theSub5 =
          this.surveyAnswersFBL.subscribe((_items)=> {
              this.surveyAnswers = [];
                _items.forEach(item => {
                      this.surveyAnswers.push(item);
                });
          });

          /* var theSub5 = theUser.subscribe((_user)=> {
             _user.forEach(user => {
               console.log('theUser: ', user);
               console.log('theUser period days flagged: ', user.periodDaysFlagged);
              });
            theSub5.unsubscribe();
          }); */
           //.update({
          //  "periodDaysFlagged": periodDaysFlagged,
          //  "periodNumCycles": periodNumCycles,
          //  "averageDaysInCycle": JSON.stringify(averageDaysInCycle)
          //});

        }; // if auth
      });
  }

  /* displayName(): string {
      return "BobbySue!";
  } */

  getMigraines() {
    /* cast migraines
    var theSub = this.migrainesFBL.subscribe((_items)=> {
      this.migraines = [];
        _items.forEach(item => {
              this.migraines.push(item);
        });
        theSub.unsubscribe();
    });*/
    return this.migraines;
  }

  getPeriods() {
    return this.periods;
}

  /* getTrackersActive() {
      /*  cast trackers
      this.trackersActive = [];
      var theSub4 = this.trackersFBL.subscribe((_items)=> {
          _items.forEach(item => { if (item.active) { this.trackersActive.push(item); } });
          theSub4.unsubscribe();
          console.log('get trackers active: this.trackersActive', this.trackersActive);
      }); * /
      return this.sortByName(this.trackersActive);
} */

  /* getTrackersPaused() {
    // cast trackers
    this.trackersPaused = [];
    var theSub4 = this.trackersFBL.subscribe((_items)=> {
        _items.forEach(item => { if (!item.active) { this.trackersPaused.push(item); } });
        theSub4.unsubscribe();
        console.log('get trackers paused: this.trackersPaused: ', this.trackersPaused);
    });
    return this.sortByName(this.trackersPaused);
  } */

  deleteTracker(theObj) {
      this.db.object('/trackers/'+this.uid+"/"+ theObj.$key).remove();
    //this.storage.get('trackersActive').then((val) => {
         //val.push(theObj);
         //for (var i = 0; i < this.trackersActive.length; ++i) {
        //   if (this.trackersActive[i].$key == theObj.$key) { this.trackersActive.splice(i,1); }
        // };

         //this.storage.set('trackersActive: ', this.trackersActive);
    // });
  }


  /* not needed. in home.ts now
  saveSurveyData(theData) {
      //var events2FBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: theName} });
      //var theSub = events2FBL.subscribe(_items => {
            //var timesTracked = 0;
            //_items.forEach(item => { if (item.name == theName) { timesTracked++; } })
            this.db.object('/users/'+this.uid+"/").update({ surveyAnswers: theData });

            // save to DB
      			//this.db.object($rootScope.URL + '/users/' + firebase.auth().currentUser.uid);
      			//ref.update({ surveyAnswers: theData });

            //console.log('times tracked: ', timesTracked);
            //theSub.unsubscribe();
      //});
  } */


  getTheUser() { return this.theUser; }

  makeANEvent(theName, theDateTime) {

  			// set image name to custom if it's not in the baselist
  			var imgname = "custom";
        var theType: string = "triggerEvent";
        var theUnit: string = "mg";
        var theTreatmentAmt: string = "100";
        var theTreatmentShowUnitAmount: boolean = true;

        // set imagename
  			if (this.containBoolFirebase(this.getBaseTriggers(), theName)) {
            var imgname: string = theName.toLowerCase().replace(/\s/g, '');
        }

              // adjust time if it's your period
              if (theName == "Period") {
                  //var daDate = new Date(theDateTime);
                  theDateTime.setHours(12,0,0,0);
                  //theDateTime = daDate.getTime();
              }

              this.trackersActive.forEach(item => {
                    if (item.name === theName && item.type == "treatmentEvent") { theType = "treatmentEvent"; }
                    if (item.name === theName) {
                      theUnit = item.treatment_unitType;
                      theTreatmentAmt = item.treatment_amount;
                      theTreatmentShowUnitAmount = item.treatment_showUnitAmount;
                    }
              });

              // set caffeine related variables
              var caf_related = "no";
              var caf_size = 0;
              var caf_mg = 0;
              var caf_mgPerUnit = 0;

              if (theName == "Coffee") { caf_size = 12; caf_mg = 150; caf_mgPerUnit = 12.5; caf_related = "yes"; }
              if (theName == "Latte") { caf_size = 12; caf_mg = 120; caf_mgPerUnit = 10; caf_related = "yes"; }
              if (theName == "Mocha") { caf_size = 12; caf_mg = 150; caf_mgPerUnit = 12.5; caf_related = "yes"; }
              if (theName == "Espresso") { caf_size = 1; caf_mg = 60; caf_mgPerUnit = 60; caf_related = "yes"; }
              if (theName == "Tea") { caf_size = 12; caf_mg = 80; caf_mgPerUnit = 6.6; caf_related = "yes"; }
              if (theName == "Chocolate") { caf_size = 2; caf_mg = 40; caf_mgPerUnit = 20; caf_related = "yes"; }
              if (theName == "Diet Soda Pop") { caf_size = 12; caf_mg = 40; caf_mgPerUnit = 3; caf_related = "yes"; }
              if (theName == "Caffeine") { caf_size = 0; caf_mg = 100; caf_mgPerUnit = 0; caf_related = "yes"; }
              if (theName == "Caffeine Pill") { caf_size = 0; caf_mg = 100; caf_mgPerUnit = 0; caf_related = "yes"; }
              if (theName == "Soda"|| theName == "Soda Pop" || theName == "Pop" || theName == "Cola" || theName == "Coke")
                      { caf_size = 12; caf_mg = 40; caf_mgPerUnit = 3.3; caf_related = "yes"; }

             this.db.list('/events/'+this.uid).push({
                "type": theType,
      					"name": theName,
      					//"uid": this.uid,
      					"myDateTime": theDateTime.getTime(),
      					"imgname": imgname,
      					"amount": 2,
                "caf_related": caf_related,
                "caf_size": caf_size,
                "caf_mg": caf_mg,
                "caf_mgPerUnit": caf_mgPerUnit,
                "durationHours": "04",
                "durationMinutes": "00",
                "treatmentsAssociated": "",
                "periodCycleDay": "0",
                "treatment_unitType": theUnit,
                "treatment_amount": theTreatmentAmt,
                "treatment_showUnitAmount": theTreatmentShowUnitAmount
  	      	});

}

                //console.log('returning. item: ', item);
                //console.log('returning. item.$key: ', item.key);
                /*var theItem = {
                //this.eventsFBL.push({
                //this.events.push({
                   "type": theType,
         					"name": theName,
         					"uid": userid,
         					"myDateTime": theDateTime.getTime(),
         					"imgname": imgname,
         					"amount": 2,
                   "caf_related": caf_related,
                   "caf_size": caf_size,
                   "caf_mg": caf_mg,
                   "caf_mgPerUnit": caf_mgPerUnit,
                   "durationHours": "04",
                   "durationMinutes": "00",
                   "treatmentsAssociated": "",
                   "periodCycleDay": "0",
                   "$key": item.key
                 };
                 //console.log('made item in event. callback: ', theItem);
                 //callback(theItem);
              }, () => { console.log('error'); }).catch((err) => { console.log('error: ', err);
            });*/

            //.then(() => {   // couldn't get this to work. now, call updatetreatments in print report
              //  if (theType == "treatmentEvent") {this.migraineUpdateTreatments() };
            //});
            //console.log('theEvent, ', theEvent);
            //var newRef = myDataRef.push(...);
            //var newID = theEvent.name();


            /*  cast events
            this.events = [];
            var theSub3 = this.eventsFBL.subscribe((_items)=> {
                _items.forEach(item => {
                        this.events.push(item);
                });
              // this.periods = this.sortByDate(this.periods);
              theSub3.unsubscribe();
            }); */

            // this.scoreUpdate_ Tracker(theName);

            //this.addToTimesTracked(theName);




/* This is where you make a tracker. I think this is the only place a tracker is made. Called from setup, your log and trackers. */
  makeATracker(timesTracked, theName, eventType, analyticsBlurb) {

      // does it exist?
      var exists = false;
      //var theSub = this.trackersFBL.subscribe((_items)=> {

      // does this exist (paused or unpaused)
      this.trackersAll.forEach(tracker => {
           //console.log('tracker:  ', tracker);
          // yes! exists.
          if (tracker.name.toLowerCase() == theName.toLowerCase()) {
              //console.log("exists! ", tracker.name);
              exists = true;
                // paused? activate!
               if (!tracker.active) {
                  this.db.object('/trackers/'+this.uid+"/"+tracker.$key).update({ active: true });
                  this.resetTimesTracked(theName,tracker.$key);
               }
           }
      });


      //console.log('done. exists? ', exists, " ", theName);
      if (!exists) {

            // -- analytics event make tracker function
            this.ga.trackEvent('Make Tracker', analyticsBlurb, theName);

            //  set image name
            var imgname = "custom";
            if (this.containBoolFirebase(this.getBaseTriggers(), theName)) {
                  var imgname: string = theName.toLowerCase().replace(/\s/g, '');
            }

            // CREATE THE TRACKER
            var theObj = {
                "type": eventType,
                "name": this.helpers.capitalizeMe(theName),
                //"uid": this.uid,
                "myDateTime": new Date().getTime(),
                "imgname": imgname,
                "timesTracked": timesTracked,
                "eventArray": "",
                "active": true,
                "windowHighestScoreSpot": 0,
                "windowHighestScoreType": 0,
                "windowHighestScore": 0,
                "simplePercent0to24Hrs": 0,
                "simplePercent0to48Hrs": 0,
                "simpleScore0to24HrsAdjusted": 0,
                "simpleScore0to48HrsAdjusted": 0,
                "highestHighestScore": 0,
                "highestHighestScoreType": 0,
                "treatment_unitType": 'mg',
                "treatment_amount": '100',
                "treatment_showUnitAmount": true
            };

            // add to db
            this.trackersFBL.push(theObj).then((snap) => {
                //console.log("adding! after: snap key: ", snap.key);
                //var newThing: any = ret; //this.db.object('/trackers/'+this.uid+"/"+tracker.$key).update({ active: true });
                //console.log("adding! after: theThing: ", theThing );
                this.resetTimesTracked(theName,snap.key);
            });
            }
          //  theSub.unsubscribe();
        //});
		}

    resetTimesTracked(theName, theKey) {
        var events2FBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: theName} });
        var theSub = events2FBL.subscribe(_items => {
              var timesTracked = 0;
              _items.forEach(item => { if (item.name == theName) { timesTracked++; } })
              this.db.object('/trackers/'+this.uid+"/"+theKey).update({ timesTracked: timesTracked });
              //console.log('times tracked: ', timesTracked);
              theSub.unsubscribe();
        });
    }

    /* don't need resetEvents_showUnitAmount(theName, boo) {
          var events2FBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: theName} });
          var theSub = events2FBL.subscribe(_items => {
                var timesTracked = 0;
                _items.forEach(item => {
                    item.update({ treatment_showUnitAmount: boo });
                })
                theSub.unsubscribe();
          });
    } */

      addToTimesTracked(theName) {
        //console.log('add to times trackedd: ', theName);
        // cast trackers
        //var theSub = this.trackersFBL.subscribe((_items)=> {
          this.trackersAll.forEach(item => {
              //console.log("item; ", item);
              if (item.name.toLowerCase() == theName.toLowerCase()) {
                 var ttNum: number = Number(item.timesTracked) + 1;
                 this.db.object('/trackers/'+this.uid+"/"+item.$key).update(
                 { timesTracked: ttNum.toString() });
             }
          });
          //theSub.unsubscribe();
        //});
      }

      subtractFromTimesTracked(theName) {
        //console.log('subtract times trackedd: ', theName);
        // cast trackers
        //var theSub = this.trackersFBL.subscribe((_items)=> {
            //this.trackers = [];
            this.trackersAll.forEach(item => {
              if (item.name.toLowerCase() == theName.toLowerCase()) {
                 var ttNum: number = Number(item.timesTracked) - 1;
                 if (ttNum < 0) { ttNum == 0; }
                 this.db.object('/trackers/'+this.uid+"/"+item.$key).update(
                 { timesTracked: ttNum.toString() });
             }
            });
        //  theSub.unsubscribe();
        //});
      }

    setEventTypeforTracker(theObj, eventType) {
        // update the actual tracker
        // var qRef = new Firebase($rootScope.URL + '/trackers/'+ firebase.auth().currentUser.uid + '/' + theObj.$id);
        // qRef.update({ type: eventType});

        // update the individual events of this tracker
        /* var ref = new Firebase($rootScope.URL + '/events/' + firebase.auth().currentUser.uid);
        var query = ref.orderByChild("name").equalTo(theObj.name);
        var eventsList = $firebaseArray(query).$loaded().then(function(data) {
            //console.log("got this: " + s(data));

            angular.forEach(data, function(event) {
                var qRef = new Firebase($rootScope.URL + '/events/'+ firebase.auth().currentUser.uid + '/' + event.$id);
                qRef.update({ type: eventType});
            });
        }); */
    }


/* SurveyAnswers */
      makeASurveyAnswer(theQuestion, theAnswer, theQuestionType) {

          // does it exist?
          var exists = false;
          //var theSub = this.trackersFBL.subscribe((_items)=> {

          // does this exist (paused or unpaused)
          this.surveyAnswers.forEach(tracker => {
               //console.log('tracker:  ', tracker);
              // yes! exists.
              if (tracker.question.toLowerCase() == theQuestion.toLowerCase()) {
                  //console.log("exists! ", tracker.name);
                  exists = true;
                    // paused? activate!
                   //if (!tracker.active) {
                   this.db.object('/surveyanswers/'+this.uid+"/"+tracker.$key).update({ answer: theAnswer });
                      //this.db.object('/trackers/'+this.uid+"/"+tracker.$key).update({ answer: theAnswer });
                      //this.resetTimesTracked(theName,tracker.$key);
                   //}
               }
          });


          //console.log('done. exists? ', exists, " ", theName);
          if (!exists) {

                // -- analytics event make tracker function
                this.ga.trackEvent('Make SurveyAnswer', theQuestion, theAnswer);

                // Create the survey answer
                var theObj = {
                    "surveyType": "home_survey",
                    "questionType": theQuestionType,
                    "question": theQuestion,
                    "answer": theAnswer,
                    "myDateTime": new Date().getTime(),
                    "active": true
                };

                // add to db
                this.surveyAnswersFBL.push(theObj).then((snap) => {
                    console.log("adding! after: snap key: ", snap.key);
                    //var newThing: any = ret; //this.db.object('/trackers/'+this.uid+"/"+tracker.$key).update({ active: true });
                    //console.log("adding! after: theThing: ", theThing );
                    //this.resetTimesTracked(theName,snap.key);
                });
                }
              //  theSub.unsubscribe();
            //});
    		}


    /*** initalize. This is called after login and register. ***/
    initMeClearDataFirst() {
            this.storage.set('dayToView', 0);
            this.storage.set('mostRecentMigraine', "none");
    }

    containBoolFirebase(arr, theName) {
    	// check theName against each item's name in the array
    	var theAnswer = false;
      arr.forEach(note => {
    	//angular.forEach(arr, function(note) {
            //console.log("note.name: " + note.name);
    		//console.log(note);
            if (note.name) {
                var nameTwo = note.name.replace('"',"");
                nameTwo = nameTwo.replace('"',"");
                if (nameTwo.toLowerCase() === theName.toLowerCase()) { theAnswer = true; }
            }
    	});
    	return theAnswer;
    }

scoreUpdate_Tracker(tracker) : any {

    var theName = tracker.name;
    //console.log("*** scoreUpdate_Tracker: " + theName);

    //this.resetTimesTracked(tracker.name, tracker.$key);

    if (theName == "Period") {
        this.scoreUpdate_Period();
    } else {

        var theTrigEvents: any = [];
        //var theMigs: any = [];
        var theTandM: any = [];
        //var daysWithTrig_noMig: any = [];
        //var daysWithTrig_MigAfterSameDay: any = [];
        //var daysWithTrig_MigAfterDayBefore: any = [];

        // cast events and migraines into arrays
        // theMigs - migs, but with info to pass along (? and an arrays of events that happen before)
        // theTandM - trigger events for this trigger and migraines, all in order by reverse time
        //var events = this.db.list('/events/'+this.uid);
        var events = this.db.list('/events/'+this.uid,{ query:{ orderByChild:'name', equalTo: theName} });
        var theSub4 = events.subscribe((_items)=> {
            console.log(" ");
            console.log("theSub4 Events for: ", theName);
            // reset timesTracked
            this.db.object('/trackers/'+this.uid+"/"+tracker.$key).update({ timesTracked: _items.length });
            //console.log('times tracked: ', _items.length);

            // make TandM array
            theTrigEvents = _items;
            theTandM = this.sortByDate(this.migraines.concat(_items));
            console.log("theTandM: ", this.s(theTandM[0]));

            // set vars
            var hHS = 0;


            // ** MIGRAINES **
            var eventsAndMigraines: any[] = []; //.concat(this.migraines);
            var eventsAndMigrainesSorted: any[] = []; //.concat(this.migraines);
            var justMigs: any = [];

            eventsAndMigrainesSorted = theTandM; //this.myData.sortByDate(eventsAndMigraines);

            var arrayOfDayObjects = [];
            var dayListArray = [];
            var currentDay: string = new Date().toDateString();//new Date(eventsAndMigrainesSorted[0].myDateTime).toDateString();
            var dayListArrayObj = {name: "", theDate: "", theDisplayDate: "", theEventArray: [], nextDayMig: false};


            // first, split the events into objects that are lists of a day and what happened that day
            for (var k=0;k<eventsAndMigrainesSorted.length;k++) {
                // new array? ok. put the current day to this item.
                //if (dayListArray.length === 1) {  }

                // same day - add it to the list.
                if (new Date(eventsAndMigrainesSorted[k].myDateTime).toDateString() === currentDay) {
                    dayListArray.push(eventsAndMigrainesSorted[k]);
                    dayListArrayObj.theDate = eventsAndMigrainesSorted[k].myDateTime;
                    // check for today and yestreday
                    var dDate = moment(eventsAndMigrainesSorted[k].myDateTime).format("MMM DD");
                    if (moment(new Date()).startOf('day').valueOf() == moment(eventsAndMigrainesSorted[k].myDateTime).startOf('day').valueOf()) {
                        dDate = "Today"; }
                    if (moment(new Date()).subtract(1,'day').startOf('day').valueOf() == moment(eventsAndMigrainesSorted[k].myDateTime).startOf('day').valueOf()) {
                            dDate = "Yesterday"; }
                    dayListArrayObj.theDisplayDate = dDate;
                    //if (moment(eventsAndMigrainesSorted[k].myDateTime).format("MMM dd"); )
                } else {
                    // new day
                    // put the current list into the object array.
                    dayListArrayObj.theEventArray = dayListArray;

                    //console.log("*** SETTING theDate ... eventsAndMigrainesSorted[k].myDateTime: " + new Date(eventsAndMigrainesSorted[k].myDateTime).toDateString());
                    dayListArrayObj.name = eventsAndMigrainesSorted[k].name;
                    //console.log("dayListArrayObj: " + s(dayListArrayObj));

                    arrayOfDayObjects.push(dayListArrayObj);
                    dayListArrayObj = { name: "", theDate: "", theDisplayDate: "", theEventArray: [], nextDayMig: false };

                    // start a new list.
                    dayListArray = [];
                    dayListArray.push(eventsAndMigrainesSorted[k]);
                    dayListArrayObj.theDate = eventsAndMigrainesSorted[k].myDateTime;
                    // check for today and yestreday
                    var dDate = moment(eventsAndMigrainesSorted[k].myDateTime).format("MMM DD");
                    if (moment(new Date()).startOf('day').valueOf() == moment(eventsAndMigrainesSorted[k].myDateTime).startOf('day').valueOf()) {
                        dDate = "Today"; }
                    if (moment(new Date()).subtract(1,'day').startOf('day').valueOf() == moment(eventsAndMigrainesSorted[k].myDateTime).startOf('day').valueOf()) {
                            dDate = "Yesterday"; }
                    dayListArrayObj.theDisplayDate = dDate;
                    currentDay = new Date(eventsAndMigrainesSorted[k].myDateTime).toDateString();
                }

                // if it's the last one, close that day
                if (Number(k + 1) == eventsAndMigrainesSorted.length) {
                    dayListArrayObj.theEventArray = dayListArray;
                    //if (eventsAndMigrainesSorted[k].name == "Migraine") { dayListArrayObj.hasMigraine = "yes"; }
                    //else { dayListArrayObj.hasMigraine = "no"; }
                    //dayListArrayObj.theDate = eventsAndMigrainesSorted[k].myDateTime;
                    dayListArrayObj.name = eventsAndMigrainesSorted[k].name;
                    //dayListArrayObj.theDate = eventsAndMigrainesSorted[k].myDateTime;
                    arrayOfDayObjects.push(dayListArrayObj);
                    dayListArrayObj = {name: "", theDate: "", theDisplayDate: "", theEventArray: [], nextDayMig: false };
                }
            }

            // second, remove 'just migraine' days. put single trigger days into their own array.
            var arrayOfDayObjects2 = [];

            for (var a=0;a<arrayOfDayObjects.length;a++) {
                if (arrayOfDayObjects[a].theEventArray.length > 1) {
                    // two or more items! add it.
                    arrayOfDayObjects2.push(arrayOfDayObjects[a]);
                } else {
                    // it's not a migraine, so put it in it's own array
                    if (arrayOfDayObjects[a].theEventArray.length > 0) {
                      // it is 1 item. if it's not a migraine, make a day object
                      if (arrayOfDayObjects[a].theEventArray[0].name != "Migraine") {
                        arrayOfDayObjects2.push(arrayOfDayObjects[a]);
                      }
                    }
                }
            }

            //console.log("arrayOfDayObjects2: " + s(arrayOfDayObjects2));
            // this.arrayOfDayObjects2 = arrayOfDayObjects2;
            //console.log('arrayOfDayObjects2: ', JSON.stringify(arrayOfDayObjects2));
            //console.log(" ");
            var arrayOfMigrainesRelatedToItems = [];
            var migraineRelatedObject = {arrayOfDayObjects: [], timeBetween: 0, hours: 0, minutes: 0};

            /* now, split that into two arrays - with migraines and without */
            var arrayOfDayObjects_withMigraine = [];
            var arrayOfDayObjects_noMigraine = [];
            for (var a=0;a<arrayOfDayObjects2.length;a++) {
                //console.log(" ");

                    // check each for any migraine events
                    var theEA = arrayOfDayObjects2[a].theEventArray;
                    var hasM = "no";
                    var migNum = 0;
                    for (var b=0;b<theEA.length;b++) {    // Is the migraine the first event? if so, don't say yes!
                        if(theEA[b].name == "Migraine" && b != 0) { hasM = "yes"; migNum = b; }
                    }

                    // put it in one array or the other
                    if (hasM == "yes") {

                        // this is the array with just the migraine days
                        migraineRelatedObject.arrayOfDayObjects = arrayOfDayObjects2[a];
                        //var endOfArrayNum = arrayOfDayObjects2[a].theEventArray.length-1;

                        // get time between and hours / minutes (between)
                        //var timeB = arrayOfDayObjects2[a].theEventArray[endOfArrayNum].myDateTime - arrayOfDayObjects2[a].theEventArray[0].myDateTime;
                        var t1 = moment(arrayOfDayObjects2[a].theEventArray[migNum].myDateTime).endOf('minute');
                        var t2 = moment(arrayOfDayObjects2[a].theEventArray[0].myDateTime).startOf('minute');
                        var timeB = (t1.diff(t2, 'minutes'));
                        //console.log('timeB: ', (timeB / 60000));
                        //console.log('timeB2: ', timeB2);
                        migraineRelatedObject.timeBetween = timeB * 60000;
                        var hours = 0;
                        var minutes = 0;
                        //var theMins = timeB / 60000;
                        hours = Math.trunc(timeB/60);
                        minutes = timeB % 60;
                        migraineRelatedObject.hours = hours;
                        migraineRelatedObject.minutes = minutes;
                        arrayOfDayObjects2[a].hours = hours;
                        arrayOfDayObjects2[a].minutes = minutes;

                        //console.log("*** migraineRelatedObject: " + JSON.stringify(migraineRelatedObject));
                        //console.log(" ");

                        // add
                        arrayOfDayObjects2[a].hasMigraine = "yes";

                        arrayOfDayObjects_withMigraine.push(arrayOfDayObjects2[a]);
                        //console.log("!! arrayOfDayObjects2[a]: " + s(arrayOfDayObjects2[a]));
                        //console.log("timeB Minutes: " + (timeB / 60000));
                        arrayOfMigrainesRelatedToItems.push(migraineRelatedObject);
                        migraineRelatedObject = {arrayOfDayObjects: [], timeBetween: 0, hours: 0, minutes: 0};
                    }
                    else {
                        arrayOfDayObjects2[a].hasMigraine = "no";

                        justMigs.forEach(mig => {
                          var thisTrigNextDayStart = moment(arrayOfDayObjects2[a].theEventArray[0].myDateTime).add(1,'day').startOf('day').valueOf();
                          var thisMigDayStart = moment(mig.myDateTime).startOf('day').valueOf();
                          if (thisTrigNextDayStart == thisMigDayStart) {
                              arrayOfDayObjects2[a].nextDayMig = true;
                              //console.log("arrayOfDayObjects2[a]: ", arrayOfDayObjects2[a]);
                              // get time between and hours / minutes (between)
                              var t1 = moment(mig.myDateTime).endOf('minute');
                              var t2 = moment(arrayOfDayObjects2[a].theEventArray[0].myDateTime).startOf('minute');
                              var timeB = (t1.diff(t2, 'minutes'));
                              arrayOfDayObjects2[a].hours = Math.trunc(timeB/60);
                              arrayOfDayObjects2[a].minutes = timeB % 60;
                            }
                        })
                        arrayOfDayObjects_noMigraine.push(arrayOfDayObjects2[a]);
                    }
                  }

            var arrayOfDayObjects_withMigraineFinal = this.sortByDate(arrayOfDayObjects_withMigraine).reverse();
            var arrayOfDayObjects_noMigraineFinal = this.sortByDate(arrayOfDayObjects_noMigraine).reverse();
            var allDays = arrayOfDayObjects_withMigraineFinal.concat(arrayOfDayObjects_noMigraineFinal);
            // this.arrayOfMigrainesRelatedToItems = arrayOfMigrainesRelatedToItems;
            //this.numTimesMigraines = arrayOfDayObjects_withMigraine.length;

            //console.log('*** ARRAY DONE: ---   this.arrayOfDayObjects_withMigraine: ', JSON.stringify(arrayOfDayObjects_withMigraineFinal));
            //console.log('*** ARRAY DONE: ---   this.arrayOfDayObjects_noMigraine: ', JSON.stringify(arrayOfDayObjects_noMigraineFinal));

            var numTrigsBeforeMigs = 0;

            // *** add in here so if the day is today or yesterday, it prints that in the interface
            /* // use this stuff. *** OR, make a new item in the array that is display datetime
                // set string to today
                this.tl_myDateString =  moment().add(this.dayToView, 'day').format("ddd, MMM DD");

                // if earlier year, add year to the string
                if (new Date(moment().add(this.dayToView, 'day').valueOf()).getFullYear() != new Date().getFullYear()) {
                  this.tl_myDateString = moment().add(this.dayToView, 'day').format("ddd, MMM DD YY");
                }

                // is it today or yesterday?
                if (this.dayToView == 0) { this.tl_myDateString = "Today"; }
                if (this.dayToView == -1) { this.tl_myDateString = "Yesterday"; }

              */
            for (var x=0;x<arrayOfDayObjects_withMigraine.length;x++) {
                numTrigsBeforeMigs = numTrigsBeforeMigs + arrayOfDayObjects_withMigraine[x].theEventArray.length;
            }

            numTrigsBeforeMigs = arrayOfDayObjects_withMigraine.length; // numTrigsBeforeMigs - arrayOfDayObjects_withMigraine.length;

            // this.numTimesMigraines = numTrigsBeforeMigs;


            //var score2Total = 0;
            //var score4Total = 0;
            //var score12Total = 0;
            //var score2 = 0;
            //var score4 = 0;
            //var score12 = 0;
            //var totalTrigsSameDayCount = 0; // this still includes any triggers after the migraine?
            //var currentMigTime = new Date(168171540000).getTime();  // first mig will be way in the past
            //var currentDayStart = new Date(168171540000).getTime(); // first trigger event will be way in the past
            //var noMigraineYet = true;
            //var trigsBPD = [];
            //var trigsSameDay = [];
            //var noMigCount = 0;
            //var withMigCount = 0;

            //var processedTrigs = [];
            //var thisTrig = { trigs:[],thisMig:[],sameDayMig:false,minsBetTandM:[] };
            //var currentDay_Start = new Date(168171540000).getTime();

            /*theTandM.forEach((tm, index) => {
                console.log("name: ", tm.name, " ", new Date(tm.myDateTime), " index: ", index);

                // it's not a migraine.
                if (tm.name != "Migraine") {
                    thisTrig.trigs.push(tm);
                    console.log("main loop. not a mig!");
                    //console.log("index + 1: ", index + 1);
                    console.log("theTandM[index + 1].name: ", theTandM[index + 1].name);

                    // next one IS a migraine. process it.
                    if (index < theTandM.length - 1) {
                    if (theTandM[index + 1].name == "Migraine") {
                       thisTrig.thisMig = theTandM[index + 1];
                       var mDayStart = moment(theTandM[index + 1].myDateTime).startOf('day').valueOf();

                       // go through the trigger array
                       var keepGoing = true;
                       thisTrig.trigs.forEach((t, i) => {
                         if (keepGoing) {
                          //console.log("          -- t: ", t.name, " ", new Date(t.myDateTime));
                          //console.log("          -- t mig start: ", new Date(theTandM[index + 1].myDateTime));
                          var tDayStart = moment(t.myDateTime).startOf('day').valueOf();
                          var tNextDayStart = moment(t.myDateTime).add(1,'day').startOf('day').valueOf();


                          // it is same or next day. wrap it up
                          if (tDayStart == mDayStart || tNextDayStart == mDayStart) {
                              var thisTrigDayStart = moment(tm.myDateTime).startOf('day').valueOf();
                              //var thisTrigNextDayStart = moment(tm.myDateTime).add(1,'day').startOf('day').valueOf();
                              var thisMigDayStart = moment(theTandM[index + 1].myDateTime).startOf('day').valueOf();
                              if (thisTrigDayStart == thisMigDayStart) { thisTrig.sameDayMig = true; }
                              //thisTrig.minsBetTandM.push((moment(tm.myDateTime).diff(theTandM[index + 1].myDateTime).valueOf() / 60000) * -1);
                              thisTrig.trigs.splice(0, i);

                                // process the mins between
                                thisTrig.trigs.forEach(thisT => {
                                  //console.log("pushing: moment(theTandM[index + 1].myDateTime).diff(moment(thisT.myDateTime), 'minutes'): ", moment(theTandM[index + 1].myDateTime).diff(moment(thisT.myDateTime), 'minutes'));
                                  thisTrig.minsBetTandM.push(moment(theTandM[index + 1].myDateTime).diff(moment(thisT.myDateTime), 'minutes'));
                                });
                              processedTrigs.push(thisTrig);
                              thisTrig = { trigs:[],thisMig:[],sameDayMig:false,minsBetTandM:[] }; // reset it
                              withMigCount++;
                              keepGoing = false;
                          } else {
                            // this t doesn't have a mig on day or next day
                            var aThisTrig = { trigs:[t],thisMig:[],sameDayMig:false,minsBetTandM:[]};
                            noMigCount++;
                            processedTrigs.push(aThisTrig);
                          }
                        }
                      });
                      }
                    } // it's not the last one
                  } // it's a migraine? no

                  // is it the lasts one and not a migraine? (if it's a mig, already processed.)
                  if (index == (theTandM.length - 1)) {
                      //console.log("LAST!");
                      if(tm.name != "Migraine") {
                          thisTrig.trigs.forEach(t => {
                            //console.log("t from last: ", JSON.stringify(t));
                              // make a new processed trig, no migraine
                              thisTrig = { trigs:[t],thisMig:[],sameDayMig:false, minsBetTandM:[] };
                              noMigCount++;
                              processedTrigs.push(thisTrig);
                          });
                      }
                  }
            }); */

            //console.log("*** Done! proccessedTrigs (Total Count): ", processedTrigs);
            //console.log("");
            //console.log("Trigger: ", processedTrigs[0].trigs[0].name, " tested: ", processedTrigs.length, " times.");
            //console.log("withMigCount: ", withMigCount);
            //console.log("noMigCount: ", noMigCount);

            var totalCount = allDays.length;
            var within2Hrs = 0;
            var within4Hrs = 0;
            var within12Hrs = 0;
            var within24Hrs = 0;
            var within48Hrs = 0;
            var between2and4 = 0;
            var between4and8 = 0;
            var between6and10 = 0;
            var between8and12 = 0;
            var between10and14 = 0;
            var between12and16 = 0;
            var between14and18 = 0;
            var between16and20 = 0;
            var between18and22 = 0;
            var between20and24 = 0;
            var between22and26 = 0;
            var between24and32 = 0; // after 24 hours, do 8 hour windows
            var between28and36 = 0;
            var between32and40 = 0;
            var between36and44 = 0;
            var between40and48 = 0;
            var between24and48 = 0;
            var ratio2Hrs = 0;
            var ratio4Hrs = 0;
            var ratio12Hrs = 0;
            var ratio24Hrs = 0;
            var ratio48Hrs = 0;
            var ratio2and4 = 0;
            var ratio4and8 = 0;
            var ratio6and10 = 0;
            var ratio8and12 = 0;
            var ratio10and14 = 0;
            var ratio12and16 = 0;
            var ratio14and18 = 0;
            var ratio16and20 = 0;
            var ratio18and22 = 0;
            var ratio20and24 = 0;
            var ratio22and26 = 0;
            var ratio24and32 = 0;
            var ratio28and36 = 0;
            var ratio32and40 = 0;
            var ratio36and44 = 0;
            var ratio40and48 = 0;
            var ratio24and48 = 0;
            var spikes:any = [];

            //console.log("");
            //console.log('going to start processedTrigs: ', theName);

            //processedTrigs.forEach((pTrig, index) => {
            allDays.forEach((theDay, index) => {
              //console.log('theDay: ', theDay);
              //console.log('theDay.theEventArray.timeBetween: ', theDay.theEventArray.timeBetween);
                //if (pTrig.minsBetTandM.length > 0) {
                if (theDay.hasMigraine == "yes") {

                    var aVal = (theDay.hours * 60) + theDay.minutes; //pTrig.minsBetTandM[pTrig.minsBetTandM.length - 1];
                    console.log("aVal: ", aVal);
                    //pTrig.minsBetTandM.forEach((aVal, i) => {
                    //console.log("hours between: ", aVal/60);

                    // spikes = type, totalNum, startingHour, length
                    if (aVal/60 <= 2) { within2Hrs++; ratio2Hrs = within2Hrs / totalCount; if (ratio2Hrs >= .5) { spikes.push(["within2Hrs",within2Hrs, 0, 2]) } }
                    if (aVal/60 <= 4) { within4Hrs++; ratio4Hrs = within4Hrs / totalCount; if (ratio4Hrs >= .5) { spikes.push(["within4Hrs",within4Hrs, 0, 4]) } }
                    if (aVal/60 <= 12) { within12Hrs++; ratio12Hrs = within12Hrs / totalCount; if (ratio12Hrs >= .55) {  } } //spikes.push(["within12Hrs",within12Hrs, 0, 12]) } }
                    if (aVal/60 <= 24) { within24Hrs++; ratio24Hrs = within24Hrs / totalCount; if (ratio24Hrs >= .7) {  } } //spikes.push(["within24Hrs",within24Hrs, 0, 24]) } }
                    if (aVal/60 <= 48) { within48Hrs++; ratio48Hrs = within48Hrs / totalCount; if (ratio48Hrs >= .8) {  } } //spikes.push(["within48Hrs",within48Hrs, 0, 48]) } }
                    if (aVal/60 >= 2 && aVal/60 <= 4) { between2and4++; ratio2and4 = between2and4 / totalCount; if (ratio2and4 >= .5) { spikes.push(["between2and4",between2and4, 2, 2]) } }
                    if (aVal/60 >= 4 && aVal/60 <= 8) { between4and8++; ratio4and8 = between4and8 / totalCount; if (ratio4and8 >= .55) { spikes.push(["between4and8",between4and8, 4, 4]) } }
                    if (aVal/60 >= 6 && aVal/60 <= 10) { between6and10++; ratio6and10 = between6and10 / totalCount; if (ratio6and10 > .6) { spikes.push(["between6and10",between6and10, 6, 4]) } }
                    if (aVal/60 >= 8 && aVal/60 <= 12) { between8and12++; ratio8and12 = between8and12 / totalCount; if (ratio8and12 > .6) { spikes.push(["between8and12",between8and12, 8, 4]) } }
                    if (aVal/60 >= 10 && aVal/60 <= 14) { between10and14++; ratio10and14 = between10and14 / totalCount; if (ratio10and14 > .6) { spikes.push(["between10and14",between10and14, 10, 4]) } }
                    if (aVal/60 >= 12 && aVal/60 <= 16) { between12and16++; ratio12and16 = between12and16 / totalCount; if (ratio12and16 >= .68) { spikes.push(["between12and16",between12and16, 12, 4]) } }
                    if (aVal/60 >= 14 && aVal/60 <= 18) { between14and18++; ratio14and18 = between14and18 / totalCount; if (ratio14and18 > .6) { spikes.push(["between14and18",between14and18, 14, 4]) } }
                    if (aVal/60 >= 16 && aVal/60 <= 20) { between16and20++; ratio16and20 = between16and20 / totalCount; if (ratio16and20 >= .68) { spikes.push(["between16and20",between16and20, 16, 4]) } }
                    if (aVal/60 >= 18 && aVal/60 <= 22) { between18and22++; ratio18and22 = between18and22 / totalCount; if (ratio18and22 > .6) { spikes.push(["between18and22",between18and22, 18, 4]) } }
                    if (aVal/60 >= 20 && aVal/60 <= 24) { between20and24++; ratio20and24 = between20and24 / totalCount; if (ratio20and24 >= .68) { spikes.push(["between20and24",between20and24, 20, 4]) } }
                    if (aVal/60 >= 22 && aVal/60 <= 26) { between22and26++; ratio22and26 = between22and26 / totalCount; if (ratio22and26 > .6) { spikes.push(["between22and26",between22and26, 22, 4]) } }
                    if (aVal/60 >= 24 && aVal/60 <= 32) { between24and32++; ratio24and32 = between24and32 / totalCount; if (ratio24and32 >= .68) { spikes.push(["between24and32",between24and32, 24, 8]) } }
                    if (aVal/60 >= 28 && aVal/60 <= 36) { between28and36++; ratio28and36 = between28and36 / totalCount; if (ratio28and36 >= .68) { spikes.push(["between28and36",between28and36, 28, 8]) } }
                    if (aVal/60 >= 32 && aVal/60 <= 40) { between32and40++; ratio32and40 = between32and40 / totalCount; if (ratio32and40 >= .68) { spikes.push(["between32and40",between32and40, 32, 8]) } }
                    if (aVal/60 >= 36 && aVal/60 <= 44) { between36and44++; ratio36and44 = between36and44 / totalCount; if (ratio36and44 >= .68) { spikes.push(["between36and44",between36and44, 36, 8]) } }
                    if (aVal/60 >= 40 && aVal/60 <= 48) { between40and48++; ratio40and48 = between40and48 / totalCount; if (ratio40and48 >= .68) { spikes.push(["between40and48",between40and48, 40, 8]) } }
                    if (aVal/60 >= 24 && aVal/60 <= 48) { between24and48++; ratio24and48 = between24and48 / totalCount; if (ratio24and48 >= .68) { spikes.push(["between24and48",between24and48, 24, 24]) } }
                //});
                /* if (pTrig.minsBetTandM.length == 0) {
                  // console.log("no mig");
                  noMigCount++;
                } else {
                  withMigCount++;
                } */
                }
            });

            // most important pattern is over 75% of the time, within 2 hours
            // then, over 75% of the time, within 2 hours
            // how correlated is it? (.75 * 1) * (24) = 16.5              // 0-2 hours, 75% of the time   2 hr window = 1
            // how correlated is it? (.75 * .75) * (24) = 13.5            // 0-4, 75% of the time       4 hr window = .75
            // how correlated is it? (.75 * .5) * (24) = 9                // 0-8, 75% of the time        8 hr window = .5
            // how correlated is it? (.75 * .75) * (24 - 4) = 11.25       // 4-8, 75% of the time        4 hr window = .75
            //console.log("")
            //console.log("spikes: ", JSON.stringify(spikes));
            var spikeScores = [];
            // spikes = type, totalNum, startingHour, length
            var finalScore = (ratio24Hrs * 100);  // / 2
            console.log("finalScore as ratio24hrs: ", finalScore);
            var highestScore = 0;
            var biggestScoreType: any = "within24Hours";
            var biggestScoreWindowStart = 0;
            var biggestScoreWindowEnd = 24;

            spikes.forEach((val) => {
                console.log("spike: ", val[0], " ratio: ", val[1] / totalCount);
                var newSpike = {correlationScore:0,totalNum:val[1],startingHour:val[2],windowLength:val[3], ratio:val[1]/totalCount, windowFactor: 1};
                //var windowFactor = 1;
                if (newSpike.windowLength == 4) { newSpike.windowFactor = .75 }
                if (newSpike.windowLength == 8) { newSpike.windowFactor = .5 }

                newSpike.correlationScore = (newSpike.windowFactor * (24 - val[3])) * newSpike.ratio * 6;
                if (newSpike.correlationScore > 100) { console.log("Score is over 100! It's ", newSpike.correlationScore); newSpike.correlationScore = 100; }
                spikeScores.push(newSpike);
                if(newSpike.correlationScore > highestScore) {
                    highestScore = newSpike.correlationScore;
                    biggestScoreType = val[0];
                    biggestScoreWindowStart = val[2];
                    biggestScoreWindowEnd = val[2] + val[3];
                }
                //console.log("spike Scored: ", JSON.stringify(newSpike));
            });
            // console.log("newSpikes: ", JSON.stringify(spikeScores));

            //console.log("score 2Hrs: ", ratio2Hrs * 100);
            //console.log("score 4Hrs: ", ratio4Hrs * 100);
            //console.log("score 24Hrs: ", (ratio24Hrs * 100) / 2);
            console.log('finalScore: ', finalScore, ' highestScore: ', highestScore);
            if (finalScore < highestScore) { finalScore = highestScore;  }

            hHS = finalScore;
            if (hHS > 100) { hHS = 100; }
            if (!hHS) { hHS = 0; }
            console.log('name: ', theName, ' highestHighestScore: ', hHS);

            //console.log("trackers active: ", JSON.stringify(this.trackersActive));

            this.trackersActive.forEach(value => {
                if (theName == value.name) {
                    // update in db
                    this.db.object("/trackers/"+this.uid+"/"+value.$key).update({
                        "highestHighestScore": Math.floor(hHS),
                        // "within24HoursScore": Math.floor((ratio24Hrs * 100) / 2),
                        "within24HoursScore": Math.floor(ratio24Hrs * 100),
                        "finalScoreType": biggestScoreType,
                        "finalScore": finalScore,
                        "clusterStart": biggestScoreWindowStart,
                        "clusterEnd": biggestScoreWindowEnd
                    }).then(ret => { return ret; });
                }
            });

        theSub4.unsubscribe();
        });

            //console.log("finalScore: ", finalScore);
            //console.log("biggestScoreType: ", biggestScoreType);
            //if (ratio24Hrs > .5)
                // cycled through the array of migraines and triggers - backwards in time.
                /* so, you'll get a migraine. then, the events preceeding it.
                theTandM.forEach((tm) => {
                  console.log("name: ", tm.name, "date: ", new Date(tm.myDateTime));

                  // migraine? reset the current migraine's time
                  if (tm.name == "Migraine") {
                    currentMigTime = tm.myDateTime;
                    if (!noMigraineYet) {
                      theMigs.push({ myDateTime: currentMigTime, trigsBeforeSameDay: trigsSameDay, trigsBeforePreviousDay: trigsBPD });
                    }
                    noMigraineYet = false;
                    trigsBPD = [];
                    trigsSameDay = [];
                  }

                  // it's not a migraine.
                  if (tm.name != "Migraine") {
                    console.log("not a migraine");
                    // no migraine yet
                    if (noMigraineYet) {
                        console.log("no migraine yet");
                        daysWithTrig_noMig.push(tm);
                    } else {

                        // check for windows
                        var amt =  moment(currentMigTime).diff(moment(tm.myDateTime), 'minutes');
                        var amtToEndOfDay = moment(tm.myDateTime).endOf('day').diff(moment(tm.myDateTime), 'minutes');
                        var amtToEndOfTomorrow = moment(tm.myDateTime).add(1,'day').endOf('day').diff(moment(tm.myDateTime), 'minutes');

                        //console.log('currentMigTime: ', new Date(currentMigTime), 'tm.myDateTime: ', new Date(tm.myDateTime));
                        //console.log('amt: ', amt);
                        //console.log('amtToEndOfTomorrow: ', amtToEndOfTomorrow);
                        //console.log('amtToEndOfToday: ', amtToEndOfDay);

                        // put this trigger into one of the arrays
                        // is this one on the same day as the migraine?
                        if (moment(tm.myDateTime).startOf('day').valueOf() != currentDayStart) {
                            // don't put it in if it's not a new day
                            // console.log('checking tm.myDateTime: ', new Date(moment(tm.myDateTime).startOf('day').valueOf()));
                            console.log('NEW!', moment(new Date(tm.myDateTime)).format('MM/DD, hh:mm'));

                            if (amt <= amtToEndOfTomorrow) {
                                if (amt <= amtToEndOfDay) {
                                  console.log('Same!');
                                  trigsSameDay.push(tm);
                                  daysWithTrig_MigAfterSameDay.push(tm);  // this has trigger events, same day
                                } else {
                                  console.log('Before!');
                                  trigsBPD.push(tm);
                                  daysWithTrig_MigAfterDayBefore.push(tm); // this has trigger events, day before
                                }
                            } else {
                                daysWithTrig_noMig.push(tm);
                            }
                            //console.log('daysWithTrig_MigAfterSameDay: ', daysWithTrig_MigAfterSameDay);
                            //console.log('daysWithTrig_MigAfterDayBefore: ', daysWithTrig_MigAfterDayBefore);
                            //console.log('daysWithTrig_noMig: ', daysWithTrig_noMig);
                            // put this as the current start, it's a new day
                            currentDayStart = moment(tm.myDateTime).startOf('day').valueOf();
                        } else {
                          // this trigger is from the same day as the trigger/mig that came before it.
                          // so, you have migraine, a trigger before, then this.
                          console.log('SKIP! ');
                          totalTrigsSameDayCount++;
                          trigsSameDay.push(tm);
                        }

                        if (amt < (48 * 60)) {
                          //mig.trigsBefore48.push(trig.myDateTime);
                        }
                        if (amt < (24 * 60)) {
                          //mig.trigsBefore24.push(trig.myDateTime);
                        }
                        if (amt < (12 * 60)) {
                          //mig.trigsBefore12.push(trig.myDateTime);
                          score12Total++;
                        }
                        if (amt < (4 * 60)) {
                          //mig.trigsBefore4.push(trig.myDateTime);
                          score4Total++;
                        }
                        if (amt < (2 * 60)) {
                          //mig.trigsBefore2.push(trig.myDateTime);
                          score2Total++;
                        }
                      }
                  }
                });

                console.log("daysWithTrig_noMig.length: ", daysWithTrig_noMig.length);
                daysWithTrig_noMig.forEach((trig) => {
                  console.log('it: ', new Date(trig.myDateTime));
                })
                console.log("daysWithTrig_MigAfterSameDay.length: ", daysWithTrig_MigAfterSameDay.length);
                console.log("daysWithTrig_MigAfterDayBefore.length: ", daysWithTrig_MigAfterDayBefore.length);

                // same day and next ratios
                var totalDays = daysWithTrig_noMig.length + daysWithTrig_MigAfterSameDay.length + daysWithTrig_MigAfterDayBefore.length;
                var ratio_Same = 100 * (daysWithTrig_MigAfterSameDay.length / totalDays);
                var ratio_SameAndNext = 100 * ((daysWithTrig_MigAfterSameDay.length + daysWithTrig_MigAfterDayBefore.length) / totalDays);

                var finalScoreBlended = Math.ceil(ratio_Same + (.1 * (ratio_SameAndNext - ratio_Same)));

                console.log('totalDays: ', totalDays);
                console.log('total trigs same day: ', totalTrigsSameDayCount);
                console.log('Same Day: ', daysWithTrig_MigAfterSameDay.length);
                console.log('Before Day: ', daysWithTrig_MigAfterDayBefore.length);
                console.log('ratioSame: ', ratio_Same);
                console.log('ratioSameAndNext: ', ratio_SameAndNext);
                console.log('finalScoreBlended: ', finalScoreBlended);
                // console.log('theMigs: ', JSON.stringify(theMigs));

                //daysWithTrig_MigAfterSameDay.push();
                //daysWithTrig_MigAfterDayBefore.push();
                //daysWithTrig_noMig.push();

                /* for each migraine
                if (theMigs.length > 0 && theTrigEvents.length > 0) {
                  theMigs.forEach((mig) => {
                      //console.log('mig.myDateTime: ', new Date(mig.myDateTime));
                      // put the events that are before this mig into arrays
                      theTrigEvents.forEach((trig) => {
                        if (trig.myDateTime > mig.myDateTime) {
                              //.console.log('trig.myDateTime: ', new Date(trig.myDateTime), 'mig.myDateTime: ', new Date(mig.myDateTime));
                              // check for windows
                              var amt = moment(trig.myDateTime).diff(moment(mig.myDateTime), 'hours');
                              //console.log('amt: ', amt);
                              if (amt < 48) {
                                mig.trigsBefore48.push(trig.myDateTime);
                              }
                              if (amt < 24) {
                                mig.trigsBefore24.push(trig.myDateTime);
                              }
                              if (amt < 12) {
                                mig.trigsBefore12.push(trig.myDateTime);
                                score12Total++;
                              }
                              if (amt < 4) {
                                mig.trigsBefore4.push(trig.myDateTime);
                                score4Total++;
                              }
                              if (amt < 2) {
                                mig.trigsBefore2.push(trig.myDateTime);
                                score2Total++;
                              }
                        }
                    });
                  }); * /
                   console.log('num of trig events: ', theTrigEvents.length);
                   console.log('score2Total: ', score2Total);
                  // console.log('score4Total: ', score4Total);
                  // console.log('score12Total: ', score12Total);

                  // total the number of times the trigger appears before a migraine, in different windows
                  // divide the total number of events of this trigger by the num that triggered a migraine
                  score2 = Math.round((score2Total/theTrigEvents.length) * 100);
                  score4 = Math.round((score4Total/theTrigEvents.length) * 100) * .9;
                  score12 = Math.round((score12Total/theTrigEvents.length) * 100) * .8;

                   console.log('score2: ', score2);
                   console.log('score4: ', score4);
                   console.log('score12: ', score12);
                   console.log('');

                   */

                    //ADD BACK IN -- obj.scoreUpdate_CompoundScores();

        }
  }

  scoreUpdate_Everything(callback)   //: any[] //FirebaseListObservable<any>
  {
        //console.log("Score Update Everything! *** ");

        // cast trackers
        this.trackersActive.forEach(item => {
            //console.log('calling tracker: ', item.name);
            if (item.name == "Period") { this.trackers.push(this.scoreUpdate_Tracker(item)); }
            if (item.timesTracked > 4 && item.name != "Period") {
                this.trackers.push(this.scoreUpdate_Tracker(item)  );
            }
        });
        //console.log("DONE");
        callback("ready");
    }


    /*  When migraine is entered, updated, or removed - add/adjust 'periodCycleDay' based on previous 'period' entry
           *   Make local array of migraines 0 - 45 days, and what the total is in each.
           *   When period is entered or removed - go back find previous period. Update all migrines after that until the current.
           *       If no period before, then count back to 28 days and use that.
           *       If migrine is not within a period cycle or 28 days before, then use -1
           *   When doing score update, pull each migraine for an array of migraines and what cycle day.
           *   See if there's a spike in % on a certain day.
           *   See if there's a spike in % on a 3 day period.
           *   Store period info in a new data thing 'PeriodScoring' that has an array with the spike days { day of cycle and type }
           */

   		scoreUpdate_Period() {
               console.log("scoreUpdate_Period ************ ");
               //var migArray: any[] = this.migraines; //JSON.parse(window.localStorage["Migraines"]);

               //console.log("migArray: " + s(migArray));

               //var numOfMigraines = migArray.length;
               var averageDaysInCycle = 0;
               var periodNumCycles = 0;
               //var periodFlagThreshold = 70;
               var periodDaysFlagged = [];
               //var highestInPeriodArray_DaysAfter = 0;

               // clean out period days array
               var periodArray_DaysBefore = [0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0];

               // clean out period days after
               var periodArray_DaysAfter = [0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0];

               // clean out 3 day total
               var after_3DayTotal = [0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0,0,0,0,0,0,
                                      0,0,0,0,0];

               // clean out 5 day total (this is the running totals for a 5 day span)
               var after_5DayTotal = [];

               var periodsAndMigraines: any[] = []; //.concat(this.migraines);

               this.migraines.forEach(item =>  {
                 periodsAndMigraines.push(item);
               });

               this.periods.forEach(item =>  {
                 periodsAndMigraines.push(item);
               });

               periodsAndMigraines = this.sortByDate(periodsAndMigraines);

                 var previousPeriodDateTime = -1;    // this means there is no period yet.
                 var migraineGroup = [];

                 // for migraines, how many days after previous period is this migraine?
                 periodsAndMigraines.forEach(event => {

                     // console.log("***** event: " + event.name + " time: " + new Date(event.myDateTime));

                     // set the periodArray_DaysAfter
                     if (event.name == "Migraine") {
                        //console.log("another period. ", new Date(event.myDateTime));
                         if (previousPeriodDateTime != -1) {
                           //console.log("setting for: ", new Date(event.myDateTime));
                             // get period day
                             var lengthOfTime = event.myDateTime - previousPeriodDateTime;
                             var daysOfTime = Math.floor(lengthOfTime / 86400000);
                             if (daysOfTime < 44 && daysOfTime >= 0) {
                                 periodArray_DaysAfter[daysOfTime] = periodArray_DaysAfter[daysOfTime] + 1;
                             }
                             migraineGroup.push(event);
                             // console.log("setting periodCycleDay: " + (daysOfTime + 1));

                             // save to DB - this migraine's periodCycleDay ?
                             var pcd = (daysOfTime + 1);
                             this.db.object('/events/' + this.uid+"/"+event.$key).update({ periodCycleDay: pcd });
                         } else {
                             this.db.object('/events/' + this.uid+"/"+event.$key).update({ periodCycleDay: 0 });
                         }
                     }

                     if (event.name == "Period") {
                         periodNumCycles = periodNumCycles + 1;
                         var daysOfCycle = 0;
                         if (previousPeriodDateTime != -1) {
                             var daysOfCycle = Math.floor((event.myDateTime - previousPeriodDateTime) / 86400000);
                             this.db.object('/events/' + this.uid+"/"+event.$key).update({ periodCycleDay: daysOfCycle });
                         } else {
                             //var daysOfCycle = 28;
                             daysOfCycle = 0;
                             this.db.object('/events/' + this.uid+"/"+event.$key).update({ periodCycleDay: 0 });
                         }

                         // console.log('befre: average days in cycle: ', averageDaysInCycle);
                         // console.log('befre: num cycles: ', periodNumCycles);
                         if (periodNumCycles > 1) {   // 1 is the second time through
                           // period num cycles - the first isn't counted. that's why 2 and 1 below, not 1 and 0
                           averageDaysInCycle = ((averageDaysInCycle * (periodNumCycles - 2)) + daysOfCycle) / (periodNumCycles - 1);
                        }

                        // console.log('daysOfCycle: ', daysOfCycle);
                        // console.log('averageDaysInCycle: ', averageDaysInCycle);
                         //console.log("SETTING averageDaysInCycle: *** " + averageDaysInCycle);
                         if (daysOfCycle > 14) {         // this keeps it from that weird bug where it's not putting in the array right
                              migraineGroup.forEach(event2 => {
                             //angular.forEach(migraineGroup, function(event2, keys2) {
                                 var daysBefore = Math.floor((event.myDateTime - event2.myDateTime) / 86400000);
                                 //console.log("Period migraine group - daysBefore: " + daysBefore);

                                 // we are only keeping 45 cycle days. if before that, don't record (44? not sure if right, good enough)
                                 if (daysBefore < 44 && daysBefore > 0) { periodArray_DaysBefore[daysBefore] = periodArray_DaysBefore[daysBefore] + 1; }
                             });
                         }

                         // ADD! Do another cycle at the end if the last one isn't a period !******

                         // reset things
                         previousPeriodDateTime = event.myDateTime;
                         migraineGroup = [];
                     }
                 });

                 // update in db
                 //var qRef = new Firebase($rootScope.URL + '/users/' + firebase.auth().currentUser.uid + '/');
                 //qRef.update({ 'periodArray_DaysBefore': periodArray_DaysBefore });
                 //window.localStorage['periodArray_DaysBefore'] = periodArray_DaysBefore;
                 //qRef.update({ 'periodArray_DaysAfter': periodArray_DaysAfter });
                 //window.localStorage['periodArray_DaysAfter'] = periodArray_DaysAfter;

                 // calculate 3 day scores into Array
                 for(var i = 1; i < 44; i += 1) {
				            after_3DayTotal[i] = periodArray_DaysAfter[i-1] + periodArray_DaysAfter[i] + periodArray_DaysAfter[i+1];
				         }

                 // calculate 5 day scores into Array
                 for(var i = 2; i < 43; i += 1) {
				             after_5DayTotal[i] = periodArray_DaysAfter[i-2] + periodArray_DaysAfter[i-1] + periodArray_DaysAfter[i] + periodArray_DaysAfter[i+1] + periodArray_DaysAfter[i+2];
				         }

                 // OLD WAY -- calculate percentages based on 5-day total. this takes too many periods.
                 /** periodDaysFlagged = [];
                 for(var i = 1; i < 44; i += 1) {
				               var percent = (after_5DayTotal[i] / periodNumCycles) * 100;
                   console.log("num: " + i + " percent: " + percent);
                   if (percent >= periodFlagThreshold) {
                         //var aFlag = {dayAfter: i, score: percent};
                         //var pdn = i + 1;
                         periodDaysFlagged.push({periodDayNum: i, score: percent, highestScore: percent, timesTracked: periodNumCycles});
                   }
				               } */

                 // Did we get a migraine on this day more than half the time?
                 periodDaysFlagged = [];
                 for(var i = 0; i < 44; i ++) {
                     // console.log("periodNumCycles: " + periodNumCycles + " " + "periodArray_DaysAfter[i]: " + periodArray_DaysAfter[i] + "  i: " + i);
                     var ratio = (periodArray_DaysAfter[i] / periodNumCycles) * 100;
                     //console.log("ratio: " + ratio);
                     if (periodNumCycles > 1 && ratio > 50) {
                       //console.log("ADDING i: " + (i + 1));
                       periodDaysFlagged.push({periodDayNum: (i + 1), timesTracked: periodNumCycles});
                     }
				          }

                 /*console.log("periodDaysFlagged: " + s(periodDaysFlagged));
                 console.log("num of cycles periodNumCycles: " + periodNumCycles);
                 console.log("averageDaysInCycle: " + averageDaysInCycle);
                 console.log("periodArray_DaysAfter: " + periodArray_DaysAfter);
                 console.log("periodArray_DaysBefore: " + periodArray_DaysBefore);
                 console.log("after_3DayTotal: " + after_3DayTotal);
                 console.log("after_5DayTotal: " + after_5DayTotal); */

                 console.log('averageDaysInCycle 1');
                 this.db.object('/users/' + this.uid).update({
                   "periodDaysFlagged": periodDaysFlagged,
                   "periodNumCycles": periodNumCycles,
                   //"averageDaysInCycle": JSON.stringify(averageDaysInCycle)
                   "averageDaysInCycle": averageDaysInCycle
                 });
                 console.log('averageDaysInCycle 2');

                 this.storage.set("periodDaysFlagged", periodDaysFlagged);
                 this.storage.set("periodNumCycles", periodNumCycles);
                 this.storage.set("averageDaysInCycle", averageDaysInCycle);
                 //this.storage.set("averageDaysInCycle", JSON.stringify(averageDaysInCycle));
                 console.log('averageDaysInCycle 2');
                 /* qRef.update({ "periodDaysFlagged": periodDaysFlagged });
                 window.localStorage["periodDaysFlagged"] = s(periodDaysFlagged);

                 qRef.update({ "periodNumCycles": periodNumCycles });
                 window.localStorage["periodNumCycles"] = periodNumCycles;

                 qRef.update({ "after_3DayTotal": s(after_3DayTotal) });
                 window.localStorage["after_3DayTotal"] = after_3DayTotal;

                 qRef.update({ "after_5DayTotal": s(after_5DayTotal) });
                 window.localStorage["after_5DayTotal"] = after_5DayTotal;

                 qRef.update({ "averageDaysInCycle": s(averageDaysInCycle) });
                 window.localStorage["averageDaysInCycle"] = averageDaysInCycle; */


                 // update tracker in db
                 //console.log('periodDaysFlagged.length: ', periodDaysFlagged.length);
                 var hhS = 0;
                 if (periodDaysFlagged.length == 1) { hhS = 40; }
                 if (periodDaysFlagged.length == 2) { hhS = 60; }
                 if (periodDaysFlagged.length == 3) { hhS = 80; }
                 if (periodDaysFlagged.length >= 5) { hhS = 100; }
                 //console.log('hhs: ', hhS);

                 var thePeriodTracker = this.db.list("/trackers/"+this.uid, {
                   query: {orderByChild:"name", equalTo:"Period"}
                 });

                 //console.log('period setting hhS: ', hhS);
                 var theSub = thePeriodTracker.subscribe((_items)=> {
                     _items.forEach(item => {
                       //console.log('period item key: ', item.$key);
                       this.db.object("/trackers/"+this.uid+"/"+item.$key).update({
                           "highestHighestScore": hhS
                       });
                     });
                     theSub.unsubscribe();
                 });



	    // reload migraines
	    /* var qTT = $firebaseArray(new Firebase($rootScope.URL + '/events/' + firebase.auth().currentUser.uid).orderByChild("name").equalTo("Migraine"));
	    qTT.$loaded().then(function(data) {

             // set list of migraines and # migraineslogged
             if (data.length != 0) {
                 window.localStorage["Migraines"] = s(data);
                 window.localStorage["migrainesLogged"] = data.length;
             } else {
                 window.localStorage["Migraines"] = "[]";
                 window.localStorage["migrainesLogged"] = data.length;
             }

             // set last migraine
             var migrainesSorted = $filter('orderBy')(data, "myDateTime");
             if (migrainesSorted.length != 0 ) {
                 window.localStorage["mostRecentMigraine"] = s(migrainesSorted[migrainesSorted.length - 1]);
             } else {
                 window.localStorage["mostRecentMigraine"] = "none";
             }
	    }); */


               //});
}

/* migraineUpdateTreatments() {
          console.log("*** FUNCTION: migraineUpdateTreatments");
          // get list of migraines
          // var mArray = this.migraines;

          // for each migraine
         this.migraines.forEach( migEvent => {

                  // get start and end for query
                  var theStart = moment(migEvent.myDateTime).startOf('day');
                  var theEnd = moment(migEvent.myDateTime).endOf('day');

                  // query - all events on x day
                  var daysEvents: any = [];
                  daysEvents = this.db.list('/events/'+this.uid, {
                    query: { orderByChild: 'myDateTime', startAt: theStart.valueOf(), endAt: theEnd.valueOf() }
                  });

                  // go through events on x day
                  var daysEvents2: any = [];
                  var theSub = daysEvents.subscribe((_items)=> {
                      _items.forEach(item => { daysEvents2.push(item); });
                      var newTA: any = "";
                      var taCounter = 0
                      // console.log('RESETTING newTA');
                      // subscribe to trckers
                      //this.trackers.forEach( tracker => {
                        //var theSub2 = this.trackers.subscribe((_items2)=> {

                          // cycle through that day's events
                          daysEvents2.forEach( event => {
                             this.trackersActive.forEach(tracker => {
                                console.log("checking tracker: " + tracker.name, " type: ", tracker.type);
                                if (tracker.type == "treatmentEvent" && tracker.name === event.name) {
                                    if (taCounter >= 1) { newTA = newTA + ", " }
                                    newTA = newTA + moment(event.myDateTime).format('h:mma').toString() + " " + event.name;
                                    taCounter++;
                                }
                            });
                            //theSub2.unsubscribe();
                        //});

                      // console.log('SETTING TREATMENTS JSON.stringify(newTA): ', newTA);
                      this.db.object("/events/"+this.uid+"/"+migEvent.$key).update({ treatmentsAssociated: newTA });

                      }); // sub trackers
                      console.log('Migraine Update Treatments Done', );
                      theSub.unsubscribe();
                   }); // sub event

            });
            //}); // end each migraine
  } */

getEventsDayOfBefore(aDateTime) {
      // get start and end
      //var theStart = moment(aDateTime).subtract(1,'day').startOf('day');
      //var theEnd = moment(aDateTime).endOf('day');

      // go through events
      var events2: any = [];
      /*     this.events.forEach(item => {
              if(item.myDateTime > theStart && item.myDateTime < theEnd) {  events2.push(item);  }
          }); */ // fix
      return this.sortByDate(events2);
 }

 sortByName(arr) {
   var newArr: any[] = [];
   newArr = arr.sort(function(a, b) {
       if (a.name > b.name) { return 1 };
       if (a.name < b.name) { return -1 };
       return 0;
     });
     return newArr;
 }

 sortByDate(arr) {
  var newArr: any[] = [];
  newArr = arr.sort(function(a, b) {
      if (a.myDateTime > b.myDateTime) { return 1 };
      if (a.myDateTime < b.myDateTime) { return -1 };
      return 0;
    });
    return newArr;
}

sortByDateReverse(arr) {
  var newArr: any[] = [];
  newArr = arr.sort(function(a, b) {
      if (a.myDateTime > b.myDateTime) { return -1 };
      if (a.myDateTime < b.myDateTime) { return 1 };
      return 0;
    });
    return newArr;
}

sortByHiHiScore(arr) {
  var newArr: any[] = [];
  newArr = arr.sort(function(a, b) {
      if (a.highestHighestScore > b.highestHighestScore) { return -1 };
      if (a.highestHighestScore < b.highestHighestScore) { return 1 };
      return 0;
    });
    return newArr;
}

sortByTimesTracked(arr) {
  var newArr: any[] = [];
  newArr = arr.sort(function(a, b) {
      if (a.timesTracked > b.timesTracked) { return -1 };
      if (a.timesTracked < b.timesTracked) { return 1 };
      return 0;
    });
    return newArr;
}

s(whatitis) {
  return JSON.stringify(whatitis);
}
// encoder - https://www.base64-image.de/

getLogo_mi() {
		return 'data:image/png;base64,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';
  }


getLogo_justwords() {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAA8CAIAAAAfeN+wAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4RDdBODE5NjVEMjE2ODExODIyQUNCRUZDRkFCRDA3NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4MDFEOTJGRTFFQzIxMUU3ODgwMkNDREI0QUE4RDk2OCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4MDFEOTJGRDFFQzIxMUU3ODgwMkNDREI0QUE4RDk2OCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEQ3QTgxOTY1RDIxNjgxMTgyMkFDQkVGQ0ZBQkQwNzciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEQ3QTgxOTY1RDIxNjgxMTgyMkFDQkVGQ0ZBQkQwNzciLz4gPC9yZGY6RGVzY3Jp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';
		}

    getBaseTreatments() {
      var theVal: any[];
      theVal = [{
        "createdAt" : "2015-10-11T05:15:37.161Z",
        "imgname" : "excedrinmigraine",
        "name" : "Excedrin Migraine",
        "objectId" : "5tQGwK6O4u",
        "rank" : 4,
        "updatedAt" : "2015-10-11T05:16:16.655Z"}, {
        "createdAt" : "2015-10-11T05:15:15.497Z",
        "imgname" : "lowlightenvironment",
        "name" : "Low Light Environment",
        "objectId" : "CBqQzReSGm",
        "rank" : 5,
        "updatedAt" : "2015-10-11T05:16:22.613Z"}, {
        "createdAt" : "2015-10-11T05:14:53.638Z",
        "imgname" : "relpax",
        "name" : "Relpax",
        "objectId" : "E7IaFULCOt",
        "rank" : 2,
        "updatedAt" : "2015-10-11T05:16:10.537Z"}, {
        "createdAt" : "2015-10-11T05:14:58.978Z",
        "imgname" : "aleve",
        "name" : "Aleve",
        "objectId" : "E96RXIAUcs",
        "rank" : 3,
        "updatedAt" : "2015-10-11T05:16:12.625Z"}, {
        "createdAt" : "2015-10-11T05:15:30.524Z",
        "imgname" : "massage",
        "name" : "Shoulder Massage",
        "objectId" : "Q9EFrV8RAp",
        "rank" : 6,
        "updatedAt" : "2015-10-12T03:46:35.413Z"}, {"createdAt" : "2015-10-11T05:14:46.349Z","imgname" : "imitrex","name" : "Imitrex","objectId" : "jFxJXlYUhs","rank" : 1,"updatedAt" : "2015-10-11T05:16:06.300Z"}, {"imgname" : "magnesium","name" : "Magnesium"}, {"imgname" : "treatment","name" : "Excedrin"}, {"imgname" : "treatment","name" : "Aspirin"},
        {"imgname" : "treatment","name" : "Sumatriptan"} ];
        return theVal;
}


    getBaseTriggers() {
      var theVal: any[];
      theVal = [ {
        "createdAt" : "2015-10-17T00:34:44.736Z",
        "description" : "Saurkraut can be a trigger by itself or cause migraines from lactic acid or another component.",
        "imgname" : "saurkraut",
        "name" : "Saurkraut",
        "objectId" : "185PXs40dM",
        "rank" : 39,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:24:15.045Z"
      }, {
        "createdAt" : "2015-08-08T21:33:01.294Z",
        "description" : "Skipping a meal may cause a migraine. Mark this when you go significantly longer than usual without eating.",
        "imgname" : "skippedmeal",
        "name" : "Skipped Meal",
        "objectId" : "1XayQrIbqH",
        "rank" : 15,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:41:25.681Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.509Z",
        "description" : "",
        "imgname" : "stressevent",
        "name" : "Stress Event",
        "objectId" : "4ar1pwg6FY",
        "rank" : 32,
        "triggerType" : "event",
        "updatedAt" : "2015-10-22T02:34:12.994Z"
      }, {
        "createdAt" : "2015-10-17T00:35:36.575Z",
        "description" : "Common hard (aged) cheeses includes: Blue, Cheddar, Feta, Mozzarella, Parmesan, Swiss. All hard cheeses are aged cheese.",
        "imgname" : "hardcheese",
        "name" : "Hard Cheese",
        "objectId" : "7KtRNm5qAm",
        "rank" : 40,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:43:59.020Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.505Z",
        "description" : "",
        "imgname" : "sausage",
        "name" : "Sausage",
        "objectId" : "7jPrVkcBu3",
        "rank" : 9,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:37:00.203Z"
      }, {
        "createdAt" : "2015-08-08T21:33:50.986Z",
        "description" : "",
        "imgname" : "bread",
        "name" : "Bread",
        "objectId" : "9DAFPTPk8p",
        "rank" : 30,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:46:33.052Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.504Z",
        "description" : "Soft cheese exmamples: brie, boursin, feta, farmer's cheese, soft goat cheese.",
        "imgname" : "softcheese",
        "name" : "Soft Cheese",
        "objectId" : "9cMuM54M5X",
        "rank" : 6,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:38:34.697Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.510Z",
        "description" : "Sleep time changes can be tricky. Any time when you shift sleep later or earlier than usual, mark this trigger.",
        "imgname" : "sleeptimechange",
        "name" : "Sleep Time Change",
        "objectId" : "CkCAZYpSvv",
        "rank" : 23,
        "triggerType" : "bodyState",
        "updatedAt" : "2015-10-22T02:33:09.537Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.507Z",
        "description" : "",
        "imgname" : "citrusfruit",
        "name" : "Citrus Fruit",
        "objectId" : "CmBk3WUHlW",
        "rank" : 16,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:36:15.140Z"
      }, {
        "createdAt" : "2015-10-17T00:38:33.774Z",
        "description" : "Strenuous exercise includes activities like walking and gardening. If you would like to track separate exercise activities, make a custom trigger for each.",
        "imgname" : "lightexercise",
        "name" : "Light Exercise",
        "objectId" : "CnI1Yyjrnx",
        "rank" : 44,
        "triggerType" : "exercise",
        "updatedAt" : "2015-10-22T03:16:28.703Z"
      }, {
        "createdAt" : "2015-10-17T00:39:26.440Z",
        "description" : "Low quality sleep may be insomnia or not enough sleep. If you'd like to track a more specific sleep trigger, simply enter a custom trigger.",
        "imgname" : "lowqualitysleep",
        "name" : "Low Sleep Quality",
        "objectId" : "E5uRzFiUE6",
        "rank" : 46,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:17:49.782Z"
      }, {
        "createdAt" : "2015-10-17T00:32:51.893Z",
        "description" : "Mark this when you eat any item that contains wheat. You may need to track the same food twice. For example, 'Bread' and 'Wheat.'",
        "imgname" : "wheat",
        "name" : "Wheat",
        "objectId" : "EJJHr7SkUI",
        "rank" : 36,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:24:59.815Z"
      }, {
        "createdAt" : "2015-08-08T21:16:39.755Z",
        "description" : "Soda pop may cause migraines by itself or because it contains caffeine. If you drink non-caffeinated soda, please make a custom trigger for non-caffeinated soda.",
        "imgname" : "sodapop",
        "name" : "Soda Pop",
        "objectId" : "FBGtUG9NGc",
        "rank" : 3,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:29:07.641Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.509Z",
        "description" : "One way to tell if you are dehydrated is to check your pee color. A quick google will give you plenty of information. Mark this trigger when your urine is a darker color than normal.",
        "imgname" : "dehydration",
        "name" : "Dehydration",
        "objectId" : "GGInVcrSrB",
        "rank" : 41,
        "triggerType" : "bodyState",
        "updatedAt" : "2015-10-22T02:35:17.532Z"
      }, {
        "createdAt" : "2015-10-17T00:39:59.288Z",
        "description" : "To track your period, record it on the first day of your cycle. Do not record it on all days you have your period, only the first day.",
        "imgname" : "period",
        "name" : "Period",
        "objectId" : "ISzIxl10ca",
        "rank" : 48,
        "triggerType" : "other",
        "updatedAt" : "2015-11-28T22:52:25.454Z"
      }, {
        "createdAt" : "2015-10-17T00:39:40.773Z",
        "description" : "Sex is a possible migraine trigger. We're sorry to tell you if you didn't already know. What a shame.",
        "imgname" : "sex",
        "name" : "Sex",
        "objectId" : "M02Y33gQ2y",
        "rank" : 47,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:42:14.621Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.514Z",
        "description" : "",
        "imgname" : "fatigue",
        "name" : "Fatigue",
        "objectId" : "MI3n0yXu1p",
        "rank" : 27,
        "triggerType" : "other",
        "updatedAt" : "2015-10-30T03:47:16.140Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.503Z",
        "description" : "",
        "imgname" : "beer",
        "name" : "Beer",
        "objectId" : "MPgH7NXKzt",
        "rank" : 22,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:46:44.738Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.507Z",
        "description" : "",
        "imgname" : "chocolate",
        "name" : "Chocolate",
        "objectId" : "NEBNVXTt85",
        "rank" : 5,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:36:39.034Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.513Z",
        "description" : "Record this any time you have canned food. You may need to record a food twice if you are tracking both that food and canned foods in general. For example, canned beans, enter 'Beans' and 'Canned Food.'",
        "imgname" : "cannedfood",
        "name" : "Canned Food",
        "objectId" : "NPspOnO8Go",
        "rank" : 24,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:47:04.149Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.513Z",
        "description" : "",
        "imgname" : "whitewine",
        "name" : "White Wine",
        "objectId" : "NY7eYWUSLQ",
        "rank" : 20,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:29:52.438Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.504Z",
        "description" : "",
        "imgname" : "liquor",
        "name" : "Liquor",
        "objectId" : "NnCZlpnDrJ",
        "rank" : 21,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:38:38.684Z"
      }, {
        "createdAt" : "2015-08-08T21:35:42.658Z",
        "description" : "",
        "imgname" : "soysauce",
        "name" : "Soy Sauce",
        "objectId" : "ONkQUV91cf",
        "rank" : 25,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:39:41.163Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.512Z",
        "description" : "",
        "imgname" : "planeflight",
        "name" : "Plane Flight",
        "objectId" : "QlOS2ndlTi",
        "rank" : 18,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:31:28.705Z"
      }, {
        "createdAt" : "2015-10-17T00:38:00.481Z",
        "description" : "This tracker includes all artificial sweeteners. If you would like to track an individual sweetener, please create a tracker for that.",
        "imgname" : "artificialsweetener",
        "name" : "Artificial Sweetener",
        "objectId" : "SXnuXntq2S",
        "rank" : 43,
        "triggerType" : "foodcomponent",
        "updatedAt" : "2015-10-30T03:19:09.661Z"
      }, {
        "createdAt" : "2015-08-08T21:30:18.131Z",
        "description" : "Pickles may cause migraines by themselves or because you are sensitive to fermented foods. ",
        "imgname" : "pickles",
        "name" : "Pickles",
        "objectId" : "Sva40adwvU",
        "rank" : 8,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:27:24.984Z"
      }, {
        "createdAt" : "2015-08-08T21:31:44.634Z",
        "description" : "",
        "imgname" : "perfume",
        "name" : "Perfume",
        "objectId" : "VqrtCVVVef",
        "rank" : 12,
        "triggerType" : "smell",
        "updatedAt" : "2015-10-22T02:26:03.374Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.512Z",
        "description" : "",
        "imgname" : "smoke",
        "name" : "Smoke",
        "objectId" : "W06Z3wLwtT",
        "rank" : 17,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:32:00.284Z"
      }, {
        "createdAt" : "2015-10-17T00:34:22.713Z",
        "description" : "",
        "imgname" : "olives",
        "name" : "Olives",
        "objectId" : "WEo0I65aPM",
        "rank" : 38,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:24:28.655Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.502Z",
        "description" : "",
        "imgname" : "redwine",
        "name" : "Red Wine",
        "objectId" : "Z6n9LMYJFk",
        "rank" : 19,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:38:58.548Z"
      }, {
        "createdAt" : "2015-10-17T00:38:59.492Z",
        "description" : "Strenuous exercise includes activities like gym workouts and weight lifting. If you would like to track different exercises, add a custom trigger for each.",
        "imgname" : "strenuousexercise",
        "name" : "Strenuous Exercise",
        "objectId" : "ZikExwlSrO",
        "rank" : 45,
        "triggerType" : "exercise",
        "updatedAt" : "2015-10-22T03:15:55.895Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.511Z",
        "description" : "",
        "imgname" : "milk",
        "name" : "Milk",
        "objectId" : "b33q1vZ102",
        "rank" : 11,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:32:17.653Z"
      }, {
        "createdAt" : "2015-08-08T21:31:28.676Z",
        "description" : "Hot dogs may cause migraines by themselves or because they contain components that may cause a migraine.",
        "imgname" : "hotdog",
        "name" : "Hot Dog",
        "objectId" : "eT3RY03B2h",
        "rank" : 10,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:26:46.859Z"
      }, {
        "createdAt" : "2015-10-17T00:33:48.645Z",
        "description" : "If you want to track a specific food containing soy and soy itself, enter both. For example, 'Tofu' and 'Soy.'",
        "imgname" : "soy",
        "name" : "Soy",
        "objectId" : "fpKGD2cKru",
        "rank" : 37,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:24:37.635Z"
      }, {
        "createdAt" : "2015-08-08T21:30:15.563Z",
        "description" : "",
        "imgname" : "saltyfood",
        "name" : "Salty Food",
        "objectId" : "i2j77yEm1x",
        "rank" : 7,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:27:35.283Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.514Z",
        "description" : "Tofu may cause migraines by itself. Or, you may be sensitive to soy. You may want to track both and see which scores higher.",
        "imgname" : "tofu",
        "name" : "Tofu",
        "objectId" : "ikDBlnuGlq",
        "rank" : 26,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:30:55.352Z"
      }, {
        "createdAt" : "2015-08-08T21:32:42.824Z",
        "description" : "",
        "imgname" : "eyestrain",
        "name" : "Eyestrain",
        "objectId" : "j9UuwrXH0e",
        "rank" : 14,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:41:38.149Z"
      }, {
        "createdAt" : "2015-08-08T21:29:51.585Z",
        "description" : "Diet soda pop may cause migraines by itself or because it contains caffeine. If you drink non-caffeinated diet soda, please make a custom trigger for non-caffeinated diet soda.",
        "imgname" : "dietsodapop",
        "name" : "Diet Soda Pop",
        "objectId" : "mSwbYuWyAs",
        "rank" : 4,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:47:48.912Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.505Z",
        "description" : "Coffee may cause migraines by itself or because of caffeine. Caffeine will recorded when you record coffee. If you want to track decaf coffee, track that as a different trigger.",
        "imgname" : "coffee",
        "name" : "Coffee",
        "objectId" : "om0NwD4pns",
        "rank" : 1,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:38:30.045Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.506Z",
        "description" : "Tea may cause migraines for some people by itself or because it contains caffeine. Caffeine will be recorded when you record tea.",
        "imgname" : "tea",
        "name" : "Tea",
        "objectId" : "omgnJ2lUpx",
        "rank" : 2,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:36:45.914Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.511Z",
        "description" : "",
        "imgname" : "msg",
        "name" : "MSG",
        "objectId" : "sWpfKOfrPs",
        "rank" : 46,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:32:23.526Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.508Z",
        "description" : "If you would like to track different types of smoked foods, you can make custom triggers for each.",
        "imgname" : "smokedfood",
        "name" : "Smoked Food",
        "objectId" : "srL6Rjm0mU",
        "rank" : 29,
        "triggerType" : "food",
        "updatedAt" : "2015-10-22T02:35:47.743Z"
      }, {
        "createdAt" : "2015-08-08T21:32:15.084Z",
        "description" : "",
        "imgname" : "exercise",
        "name" : "Exercise",
        "objectId" : "tEEbZ8D8z1",
        "rank" : 13,
        "triggerType" : "exercise",
        "updatedAt" : "2015-10-22T02:41:49.584Z"
      }, {
        "createdAt" : "2015-10-17T00:36:27.010Z",
        "description" : "Many types of loud noise may trigger a migraine. If you would like to track different loud noises, create a custom trigger for each. ",
        "imgname" : "loudnoise",
        "name" : "Loud Noise",
        "objectId" : "tVjPUHCEVk",
        "rank" : 42,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:20:43.602Z"
      }, {
        "createdAt" : "2015-04-18T17:10:22.508Z",
        "description" : "",
        "imgname" : "brightlight",
        "name" : "Bright Light",
        "objectId" : "wgpYWzsZh2",
        "rank" : 28,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:36:03.220Z"
      }, {
        "createdAt" : "2015-09-21T23:15:51.472Z",
        "description" : "",
        "imgname" : "insomnia",
        "name" : "Insomnia",
        "objectId" : "wp9o6MVRJ8",
        "rank" : 34,
        "triggerType" : "other",
        "updatedAt" : "2015-10-22T02:39:04.734Z"
      }, {
        "createdAt" : "2015-10-17T00:35:58.438Z",
        "description" : "Most common preserved meats: Pepperoni, Cold Cuts, Bacon, Sausage, Hot Dogs. Preserved meats contain nitrites (nitrates). To specifically track a nitrate-free meat, please create a separate tracker for that.",
        "imgname" : "agedmeat",
        "name" : "Aged Meat",
        "objectId" : "xP8mSk9neA",
        "rank" : 41,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:46:21.870Z"
      }, {
        "createdAt" : "2015-10-17T00:30:41.096Z",
        "description" : "",
        "imgname" : "caffeinepill",
        "name" : "Caffeine Pill",
        "objectId" : "yzlPDjSpmy",
        "rank" : 35,
        "triggerType" : "food",
        "updatedAt" : "2015-10-30T03:46:54.181Z"
      }, {
        "createdAt" : "2015-10-17T00:00:00.096Z",
        "description" : "Magnesium is important for headache health.",
        "imgname" : "pill",
        "name" : "Magnesium",
        "objectId" : "yzlPDjSgma",
        "rank" : 48,
        "triggerType" : "pill"
      } ];

      return theVal;
    }



}

// OLD simple score stuff from scoreUpdate_ Tracker
  //var hHS = score12;
  //if (score4 > hHS) { hHS = score4 }
  //if (score2 > hHS) { hHS = score2 }

    // console.log("theMigs: " + JSON.stringify(theMigs));
    //console.log("hHS: " + hHS);

  /*
    * Theory here: Make 3 arrays. Contain info for 2, 4 and 8 hour windows, for 48 hours.
    * The numbers in the arrays are how many times in the x hours following that hour the trigger event appeared.
    * Figuring that the smaller the window, the more important the result, modify accordingly for figuring out the
    * scoring for the most important window.
    * Store in the DB the most important spike with when it is and how big the window.
    */

    /* 2 HOUR TOTALS
    // cycle through the times before migraines and see where it spikes.
    var oHM = 3600000; // one Hour Miliseconds oHM

    var twoHourWindowTotals = [];
    var twoHourBiggestScore = 0;
    var twoBiggestScoreSpot = 0;
    var twoHourTotalMigsAssoc = [];
    var twoHourBiggestScoreNoDups = 0;
    var twoBiggestScoreSpotNoDups = 0;
    var totalCountForClusters = 0;

    // check for 2 hour window, going from start to 48 hours
    for (var i=0;i<46;i++) {
        var windowStart = oHM * i;
        var windowEnd = oHM * (i+2);
        var score = 0;
        var scoreNoDups = 0;
        var migsAssocArray = [];


        // loop through each in the array of times before migraines
        // (all events, each one's miliseconds before a migraine)
        for (var j=0;j<timesBeforeMigs.length;j++) {
            // if it's in the window, do stuff
            if (timesBeforeMigs[j].tt >= windowStart && timesBeforeMigs[j].tt < windowEnd) {
                score = score + 1;

                // check to see if the migraine that this is associated with it already has been scored.
                // if not, then it's a new cluster.
                var foundIt = false;
                for (var x=0;x<migsAssocArray.length;x++) {
                    if (timesBeforeMigs[j].migAssociated == migsAssocArray[x]) { foundIt = true; }
                }
                //console.log("foundit: " + foundIt + " migsAssocArray[x]: " + timesBeforeMigs[j].migAssociated);
                if (foundIt == false) { scoreNoDups = scoreNoDups + 1; totalCountForClusters = totalCountForClusters + 1; }
                migsAssocArray.push(timesBeforeMigs[j].migAssociated);
            }
            console.log("end migsAssocArray: " + JSON.stringify(migsAssocArray));
        }

        twoHourWindowTotals.push(score);
        twoHourTotalMigsAssoc.push(scoreNoDups);
        if (score > twoHourBiggestScore) { twoHourBiggestScore = score; twoBiggestScoreSpot = i; }
        if (scoreNoDups > twoHourBiggestScoreNoDups) { twoHourBiggestScoreNoDups = scoreNoDups; twoBiggestScoreSpotNoDups = i; }
    }
    */
    //console.log("timesBeforeMigs[0].migAssociated: " + JSON.stringify(timesBeforeMigs[0].migAssociated));

    /* 4 HOUR TOTALS, 8 HOUR TOTALS
    // this is checking each 4 hour window, back for 46 hours
    var fourHourWindowTotals = [];
    var fourHourBiggestScore = 0;
    var fourBiggestScoreSpot = 0;
    for (var i=0;i<46;i++) {
        var windowStart = oHM * i;
        var windowEnd = oHM * (i+4);
        var score = 0;
        for (var j=0;j<timesBeforeMigs.length;j++) {
            if (timesBeforeMigs[j].tt >= windowStart && timesBeforeMigs[j].tt < windowEnd) {
              score = score + 1;
            }
        }
        fourHourWindowTotals.push(score);
        // check if this score is bigger than the current biggest score
        if (score > fourHourBiggestScore) { fourHourBiggestScore = score; fourBiggestScoreSpot = i; }
    }

    var eightHourWindowTotals = [];
    var eightHourBiggestScore = 0;
    var eightBiggestScoreSpot = 0;
    for (var i=0;i<46;i++) {
        var windowStart = oHM * i;
        var windowEnd = oHM * (i+8);
        var score = 0;
        for (var j=0;j<timesBeforeMigs.length;j++) {
            if (timesBeforeMigs[j].tt >= windowStart && timesBeforeMigs[j].tt < windowEnd) {
              score = score + 1;
            }
        }
        eightHourWindowTotals.push(score);
        if (score > eightHourBiggestScore) { eightHourBiggestScore = score; eightBiggestScoreSpot = i; }
    }

    var twoHourPercent_Relative = Math.round((twoHourBiggestScore/numOfEventsOfThis) * 100) * 1;
    var fourHourPercent_Relative = Math.round((fourHourBiggestScore/numOfEventsOfThis) * 100) * .75;
    var eightHourPercent_Relative = Math.round((eightHourBiggestScore/numOfEventsOfThis) * 100) * .5;

    var windowHighestScore = twoHourPercent_Relative;
    var windowHighestScoreType = "twoHourWindow";
    var windowHighestScoreSpot = twoBiggestScoreSpot;
    if (windowHighestScore < fourHourPercent_Relative) {
        windowHighestScore = fourHourPercent_Relative;
        windowHighestScoreType = "fourHourWindow";
        windowHighestScoreSpot = fourBiggestScoreSpot;
    };
    if (windowHighestScore < eightHourPercent_Relative) {
        windowHighestScore = eightHourPercent_Relative;
        windowHighestScoreType = "eightHourWindow";
        windowHighestScoreSpot = fourBiggestScoreSpot;
    };
    */

    /*    simple score
    var numTimes_0to24Hrs = 0;
    var numTimes_0to48Hrs = 0;

    var numTimes_0to2Hrs = 0;
    var numTimes_2to4Hrs = 0;
    var numTimes_4to8Hrs = 0;
    var numTimes_8to12Hrs = 0;
    var numTimes_12to24Hrs = 0;
    var numTimes_24to48Hrs = 0;
    var simpleScore0to2Hrs = 0;
    var simpleScore2to4Hrs = 0;
    var simpleScore4to8Hrs = 0;

    // find how many times this has happened before a migraine
    // was - angular.forEach(data, function(event, keys) {
   trigEvents.forEach(event => { // WAS 'data'
        // was -angular.forEach(migArray, function(migEvent, migKeys) {
        this.migraines.forEach(migEvent => {  // WAS 'migArray'
            // was it within a time window before?
            var aB = migEvent.myDateTime - event.myDateTime; //amountBefore in hours (amount event is before the migraine)
            //console.log("diff hours:" + aB / oHM + " name: " + migEvent.name + " event: " + event.myDateTime);

            if (aB >= 0 && aB < 24 * oHM)       { numTimes_0to24Hrs = numTimes_0to24Hrs + 1; }
            if (aB >= 0 && aB < 48 * oHM)       { numTimes_0to48Hrs = numTimes_0to48Hrs + 1; }
        });
    });

    var simplePercent0to24Hrs = 0;
    var simplePercent0to48Hrs = 0;

    if (numTimes_0to24Hrs != 0) { simplePercent0to24Hrs = Math.round((numTimes_0to24Hrs/numOfEventsOfThis) * 100); }
    if (numTimes_0to48Hrs != 0) { simplePercent0to48Hrs = Math.round((numTimes_0to48Hrs/numOfEventsOfThis) * 100); }

    var simpleScore0to24HrsAdjusted = 0;
    var relativeReducer0to24 = .75; // this makes it so that when you compare 2 hrs to 24 hours, it's apples to apples
    if (numTimes_0to24Hrs != 0) { simpleScore0to24HrsAdjusted = Math.round(((numTimes_0to24Hrs/numOfEventsOfThis) * 100) * relativeReducer0to24); }

    var simpleScore0to48HrsAdjusted = 0;
    var relativeReducer0to48 = .5; // this makes it so that when you compare 2 hrs to 48 hours, it's apples to apples
    if (numTimes_0to48Hrs != 0) { simpleScore0to48HrsAdjusted = Math.round(((numTimes_0to48Hrs/numOfEventsOfThis) * 100) * relativeReducer0to48); }


       END simple score   */

    /* highestHighestScore (0to24, 0to48, windowHighest - what's REALLY the highest score?)
    var highestHighestScore = simpleScore0to24HrsAdjusted;
    var highestHighestScoreType = "simpleScore0to24HrsAdjusted";
    if (windowHighestScore > simpleScore0to24HrsAdjusted) {
        highestHighestScore = windowHighestScore;
        highestHighestScoreType = windowHighestScoreType;
      }

    if (simpleScore0to48HrsAdjusted > highestHighestScore) {
        highestHighestScore = simpleScore0to48HrsAdjusted;
        highestHighestScoreType = "simpleScore0to48HrsAdjusted";
      }

    console.log("highestHighestScore: " + highestHighestScore);
    console.log("highestHighestScoreType: " + highestHighestScoreType);
    console.log(" "); */

    // adjust - if highestHighestScore greater than 100, make it 100.

    //if (highestHighestScore > 100) {  highestHighestScore = 100;  }

    // update in db
    //var aRef = $firebaseArray(new Firebase($rootScope.URL + '/trackers/' + firebase.auth().currentUser.uid).orderByChild("active").equalTo(true));
    //aRef.$loaded().then(function(data) {
