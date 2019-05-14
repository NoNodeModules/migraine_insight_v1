import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
import moment from 'moment'; // moment
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

// Pages
//import { ResultsMainPage } from '../results-main/results-main';
import { ResultsExplorerPage } from '../results-explorer/results-explorer';
import { ResultsMainPage } from '../results-main/results-main';

//@IonicPage()
@Component({ selector: 'page-results-detail', templateUrl: 'results-detail.html' })
export class ResultsDetailPage {

    context:CanvasRenderingContext2D;
    @ViewChild("canvasDetail") myCanvas;

    uid: any;
    myName: string;
    myNameLowerCase: string = "";
    myScore: string;
    tracker: any;
    numTimesMessage: any;
    numTimesMigraines: any;
    numTimesMigraines24: any;
    events: FirebaseListObservable<any>;
    // migraines: FirebaseListObservable<any>;
    arrayOfDayObjects2: any[] = [];
    arrayOfDayObjects_withMigraine: any[] = [];
    arrayOfDayObjects_noMigraine: any[] = [];
    arrayOfMigrainesRelatedToItems: any[] = [];
    canvas: any;
    c: any;
    scoreExpHide: boolean = true;
    loading: any;
    my24Score: any = "";
    scoreType: boolean = false;
    clusterStart: any = 0;
    clusterEnd: any = 0;
    clusterScore: any = 0;
    rawScore: any = 0;
    theItem: any = [];
    public unregisterBackButtonAction: any;
      //myNameMsg: string;

    constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
    public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
    private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
    private alertCtrl: AlertController, public platform: Platform) {

      // add loader
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
      content: 'Loading', spinner: 'bubbles' });
      this.loading.present();

      // -- analytics trackView
      this.ga.trackView('Results - Detail');

      this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;

            this.storage.get("currentTracker").then((val) => {
                this.theItem = JSON.parse(val);
                val = JSON.parse(val);
                this.myName = val.name;
                this.myNameLowerCase = val.name.toLowerCase();
                this.tracker = val;
                this.myScore = val.highestHighestScore;
                this.numTimesMessage = val.timesTracked;
                //this.my24Score = val.within24HoursScore;
                //this.scoreType = val.finalScoreType;
                this.numTimesMigraines = "";
                //this.clusterStart = val.clusterStart;
                //this.clusterEnd =  val.clusterEnd;

                //"highestHighestScore": Math.floor(hHS),
                //"within24HoursScore": ratio24Hrs * 100,
                //"finalScoreType": biggestScoreType,
                //"finalScore": finalScore

                // query
                this.events = db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: this.myName} });

                this.makeChart();
                this.loading.dismiss();
            });
      });
    }

ngAfterViewInit() {}

goToExplorer() {
  this.navCtrl.push(ResultsExplorerPage);
}

makeChart() {

  var midChartY = 40;

  // how to do this - https://www.html5rocks.com/en/tutorials/canvas/hidpi/
  var can1 = this.myCanvas.nativeElement;
  var ratio = window.devicePixelRatio;
  var oldWidth = 320; // can1.width; // + 20;
  can1.width = oldWidth * ratio;
  can1.height = 75 * ratio;
  can1.style.width = oldWidth + 'px';
  can1.style.height = 75 + 'px';
  var context = can1.getContext('2d');
  context.scale(ratio, ratio);
  this.c = context;

  // vars
  var leftEdge = 30;
  var circleSize = 9;

  // draw box
  var boxX = 10;
  var boxY = 0;
  this.c.strokeStyle = "#fff";
  this.c.fillStyle = "white";
  this.helpers.roundedRect(this.c, boxX, boxY, 300, 65, 15, 'FD', true);

  // set things
  this.c.fillStyle = "#3f90a1"; //this.darkAquaColor;
  this.c.strokeStyle = "#6cb4dc";
  this.c.lineWidth = .5;

  // draw 24 hour line
  this.c.beginPath();
  this.c.moveTo(160,25);
  this.c.lineTo(160,60);
  this.c.stroke();

  // draw 24 hour line
  this.c.beginPath();
  this.c.moveTo(290,25);
  this.c.lineTo(290,60);
  this.c.stroke();

  // draw circle
  this.c.fillStyle = "#6cb4dc"; //this.blueColor;
  this.c.strokeStyle = "#6cb4dc";
  this.c.beginPath();
  this.c.arc(32, midChartY, circleSize, 0, 20, false);
  this.c.fill();
  //this.c.stroke();

  // text label of name
  this.c.font = "12px VagBold";

  /*  We have a new selection! Load the data for this page. And, store data for explorer page to localStorage.  */

      var theName = "img/meter/meter_50.png";
      if (parseInt(this.myScore) >= 0)  { theName = "img/meter/meter_0.png"; }
      if (parseInt(this.myScore) >= 5)  { theName = "img/meter/meter_5.png"; }
      if (parseInt(this.myScore) >= 10) { theName = "img/meter/meter_10.png"; }
      if (parseInt(this.myScore) >= 25) { theName = "img/meter/meter_25.png"; }
      if (parseInt(this.myScore) >= 35) { theName = "img/meter/meter_35.png"; }
      if (parseInt(this.myScore) >= 45) { theName = "img/meter/meter_45.png"; }
      if (parseInt(this.myScore) >= 48) { theName = "img/meter/meter_48.png"; }
      if (parseInt(this.myScore) >= 50) { theName = "img/meter/meter_50.png"; }
      if (parseInt(this.myScore) >= 52) { theName = "img/meter/meter_52.png"; }
      if (parseInt(this.myScore) >= 55) { theName = "img/meter/meter_55.png"; }
      if (parseInt(this.myScore) >= 65) { theName = "img/meter/meter_65.png"; }
      if (parseInt(this.myScore) >= 75) { theName = "img/meter/meter_75.png"; }
      if (parseInt(this.myScore) >= 75) { theName = "img/meter/meter_80.png"; }
      if (parseInt(this.myScore) >= 90) { theName = "img/meter/meter_90.png"; }
      if (parseInt(this.myScore) >= 95) { theName = "img/meter/meter_95.png"; }
      if (parseInt(this.myScore) >= 100) { theName = "img/meter/meter_100.png"; }

      var theElem: any = document.getElementById("mainImgDetail");
      theElem.src = theName;

      // ** MIGRAINES **
      var eventsAndMigraines: any[] = []; //.concat(this.migraines);
      var eventsAndMigrainesSorted: any[] = []; //.concat(this.migraines);
      var justMigs: any = [];
      //var hasMigs: boolean = false;
      var theSub = this.events.subscribe((_items)=> {

          _items.forEach(item => {
              //console.log('events item: ', item);
              eventsAndMigraines.push(item);
          });

          this.myData.getMigraines().forEach(item => {
            //console.log('migraines on chart item: ', item);
            eventsAndMigraines.push(item);
            justMigs.push(item);
            //hasMigs = true;
          });

          //console.log("hasMigs: ", hasMigs);

          eventsAndMigrainesSorted = this.myData.sortByDate(eventsAndMigraines);

          //console.log('*** -- eventsAndMigrainesSorted: ', JSON.stringify(eventsAndMigrainesSorted));
          // was var eventsAndMigraines = this.evns.concat(data);
          //was var eventsAndMigrainesSorted = $filter('orderBy')(eventsAndMigraines, "myDateTime");

          // make an array of the miliseconds before the next migraine for each event
          //var timesBeforeMigs = [];
          // var migAssociated = 0;

          // we want to make an array of triggers and their associated migraines.
          //var startNew = "yes";
          //var currentTriggerTime = 0;
          //var arrayOfEventDays = [];
          //var arrayOfEventDays_noMigraine = [];
          //var arrayOfEventDays_withMigraine = [];
          //var theEventArray = [];

          //var currentDay = "";
          //var myDay = new Object();
          //var triggerWasFoundForThisGroup = "no";
          //var detail_NUMmigrainesAfterItem_sameDay = 0;

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
          this.arrayOfDayObjects2 = arrayOfDayObjects2;
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

          this.arrayOfDayObjects_withMigraine = this.myData.sortByDate(arrayOfDayObjects_withMigraine).reverse();
          this.arrayOfDayObjects_noMigraine = this.myData.sortByDate(arrayOfDayObjects_noMigraine).reverse();
          this.arrayOfMigrainesRelatedToItems = arrayOfMigrainesRelatedToItems;
          //this.numTimesMigraines = arrayOfDayObjects_withMigraine.length;

          //console.log('*** ARRAY DONE: ---   this.arrayOfDayObjects_withMigraine: ', JSON.stringify(this.arrayOfDayObjects_withMigraine));

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

          this.numTimesMigraines = numTrigsBeforeMigs;

          //console.log("numTrigsBeforeMigs: " + numTrigsBeforeMigs);

          //console.log('arrayOfMigrainesRelatedToItems: ', JSON.stringify(arrayOfMigrainesRelatedToItems));
          //console.log(" ");

          //console.log("this.arrayOfDayObjects_noMigraine: " + s(this.arrayOfDayObjects_noMigraine));


          if (arrayOfMigrainesRelatedToItems.length == 0) {
              this.c.font = "bold 18px Arial";
              this.c.fillStyle = "rgb(236,190,190)";
              this.c.fillText("No Migraines in 12 Hours", 58, midChartY + 6);
          }

          for (var a=0;a<arrayOfMigrainesRelatedToItems.length;a++) {
              //console.log("arrayOfMigrainesRelatedToItems[a].timeBetween: ", arrayOfMigrainesRelatedToItems[a].timeBetween);

              // limit to 12 hours
              if (arrayOfMigrainesRelatedToItems[a].timeBetween < 12 * 3600000) {
                  var myX = ((arrayOfMigrainesRelatedToItems[a].timeBetween * .001 / 331) * 2); // the * 2 makes it 12 hours instead of 24
                  //console.log("myX: " + myX);

                  // draw the migraine circles
                  this.c.fillStyle = "#ee4951";
                  this.c.beginPath();
                  this.c.arc((myX + leftEdge), midChartY, circleSize, 0, 20, false);
                  this.c.fill();

                  // text
                  var adjuster = -3;
                  if (a+1 == 1) { adjuster = -2; }
                  if (a+1 == 2) { adjuster = -3; }
                  if (a+1 == 4) { adjuster = -4; }
                  if (a+1 == 7) { adjuster = -3; }
                  if (a+1 >= 10) { adjuster = -6; }
                  this.c.font = "12px VagBold";
                  this.c.fillStyle = "#fff";
                  this.c.fillText((a+1).toString(), (myX + leftEdge + adjuster), midChartY + 4);

                  //console.log("arrayOfMigrainesRelatedToItems.timeBetween: " + arrayOfMigrainesRelatedToItems[a].timeBetween);
            }
          }
    //  });
    //});
    //theSub2.unsubscribe();
    theSub.unsubscribe();
});
//});
}

/* Android Leaving Code */
// public unregisterBackButtonAction: any; , public platform: Platform
ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
private customHandleBackButton(): void { this.navCtrl.setRoot(ResultsMainPage); }
/* END Android Leaving Code */

}
