// REFERENCE - http://definitelytyped.org/docs/angularfire--angularfire/interfaces/angularfireauth.html
// REFERENCE - https://github.com/angular/angularfire2/blob/master/docs/3-retrieving-data-as-lists.md
import { Component } from '@angular/core';        // Core
import { NavController, ToastController, LoadingController, ViewController, Platform } from 'ionic-angular';  // Page
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../providers/my-data/my-data'; // MyData
import { Storage } from '@ionic/storage'; // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // Helpers
import moment from 'moment'; // moment
import { AlertController } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';  // StatusBar

// Pages
import { RegisterPage } from '../register/register'
import { ReportAMigrainePage } from '../report-a-migraine/report-a-migraine';
import { ResultsMainPage } from '../results-main/results-main';
import { LoginComponent } from "../../app/login/login.component";

@Component({ selector: 'page-your-log', templateUrl: 'your-log.html' })
export class YourLogPage {
  @ViewChild(Content) content: Content;

  uid: any;
  trackersActiveFLO: FirebaseListObservable<any>;
  eventsFLO: FirebaseListObservable<any>;
  //eventsArray: any[] = [];
  public eventsArray: any[]=[]; // This is an attempt to fix the error that comes up when you change pages virtualscroll typeerror
  eventsArrayMonth: any[] = [];
  trackers: any = []; //FirebaseListObservable<any>;
  // trackers2: any[] = [];
  events: FirebaseListObservable<any>;

  //events: any = [];
  currentObject: any = {"name": ""};
  oInfoHide: boolean = true;
  oCalHide: boolean = true;
  oStatshide: boolean = true;
  amtExpHide: boolean = true;
  eventsHasMigraine: boolean = false;
  remainder: number;
  filler1Show: boolean = false;
  filler2Show: boolean = false;
  trackingPeriod: boolean = false;
  dayToView: number = 0;
  mainMessage: string = "What would you like to log?";
  tl_myDateString: any;
  currentTimesTrackedMessage: any;
  input1: string;
  tileSquareTime: any;

  // time
  theDTString: string;
  theDT: Date;
  myDateTimeOverlay: any;
  myDateTimeOverlayString: string;

  hideSuggestionNoTriggers: boolean;
  hideMainMessage: boolean = false;
  overlayDate: any;
  rightArrowDim: boolean = false;
  leftArrowDim: boolean = false;

  registrationDate: Date;

  // progress vars
  daysLogged: any;
  avgTimeBetweenMigraines_Days: any;
  avgTimeBetweenMigraines_Hours: any;
  dayOfWeekMostMigraines: any;
  mostRecentMigraine_dayssince: any;
  mostRecentPeriod_days: any;
  loading: any;
  tomorrowEvents: any = [];
  yesterdayEvents: any = [];
  maxPickerDate: string;
  currentMonthYear: string = "000000";
  public unregisterBackButtonAction: any;
  onWeb: boolean = false;

  constructor(public statusBar: StatusBar, public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController,
  public toastCtrl: ToastController, private myData: MyDataProvider, private helpers: HelpersProvider,
  private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
  private alertCtrl: AlertController, private viewCtrl: ViewController, public platform: Platform) {

      document.addEventListener('resume', () => {
          this.theDT = new Date(moment().add(this.dayToView, 'day').valueOf());
          this.theDTString = this.theDT.toString();
      });

    //console.log("start your log construct");
    this.statusBar.backgroundColorByHexString("#6cb4dc"); // todo remove, take out later so this isn't happening all the time?

    this.afAuth.authState.subscribe(auth => {
    if (!auth) {
        console.log("loading your log. NO AUTH. oops.");
        //this.navCtrl.setRoot(LoginComponent);
        /* this.navCtrl.push(LoginComponent).then(() => {
          const index = this.navCtrl.getActive().index;
          this.navCtrl.remove(0, index);
        }); */
        //window.location.reload();
    } else {

    this.uid = auth.uid;
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 30000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });

    // set things
    this.input1 = "";
    this.overlayDate =  moment().format().toString(); //new Date().toString();
    this.maxPickerDate = new Date().getFullYear().toString() + "-12-31"; //moment().format("YYYY-MM-DD").toString();
    //console.log('this.maxPickerDate: ', this.maxPickerDate);

    // get trackers
    var eet = this.db.list('/trackers/'+this.uid, { query: { orderByChild: 'active', equalTo: true } })
    .subscribe(sub => {
          //console.log('init of your log. subscribed and changed tracker: ', sub);
          var trackerCount = 1; // the 1 is for the migraine tile
          var newList = [];
          sub.forEach(item => {
              newList.push(item);
              if (item.active == true) { trackerCount++; }
              if (item.name == "Period") { this.trackingPeriod = true; }
          });
          this.trackers = this.myData.sortByName(newList);

          var remainder: any = (trackerCount % 3);

          // set remainder tiles
          this.filler1Show = false;
          this.filler2Show = false;
          if (remainder == 1) {
              this.filler1Show = true;
              this.filler2Show = true;
          }
          if (remainder == 2) {
              this.filler1Show = true;
          }

          this.hideSuggestionNoTriggers = true;
          //eet.unsubscribe();      // DON'T UNDO - it won't update the list on the page when you add one
      });

      // set day to view
      this.storage.get('dayToView').then((val) => {

          // load today
          this.dayToView = val;
          //console.log('init: day to view: ', this.dayToView);

          this.storage.get('registrationDate').then((val) => {
              var tzOffset = new Date().getTimezoneOffset()/60;
              this.registrationDate = new Date(moment.utc(val).add(tzOffset,'hours').format());
              this.resetPanel(0, true, false, false); //num, resetTime, resetTiles, loadEvents
          });

          // set date and date string
          //var regDate =
          //var tzOffset = new Date().getTimezoneOffset()/60;
          this.theDT = new Date(moment().add(this.dayToView, 'day').valueOf());
          this.theDTString = this.theDT.toString();

          // start and end of this month
          var theStart: Date = new Date(moment().add(this.dayToView, 'day').startOf('month').valueOf());
          var theEnd: Date = new Date(moment().add(this.dayToView, 'day').endOf('month').valueOf());
          this.currentMonthYear = theStart.getMonth().toString() + theStart.getFullYear().toString();
          //console.log('theStart: ', theStart);
          //console.log('theEnd: ', theEnd);
          //console.log('setting this.currentMonthYear: ', this.currentMonthYear);

          //console.log("init time. load events"); // ** HERE's THE CODE TOREPLACE ****
          // add - this.loadEvents();


          // was -- this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 30000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
          this.loading.present().then(ret => {
                this.db.list('/events/'+this.uid, { query: {
                  orderByChild: 'myDateTime',
                  startAt: theStart.getTime(),
                  endAt: theEnd.getTime()
                }}).subscribe(ret =>
                  {
                    //console.log('subscribe triggered! evernts: ', ret);
                    this.eventsArrayMonth = ret;
                    this.filterEventsForDay(new Date(moment().add(this.dayToView, 'day').valueOf()));

                    //console.log('this.eventsArray: ', this.eventsArray);
                    //console.log('this.eventsArray length: ', this.eventsArray.length);
                    if (this.loading) {
                        this.loading.dismiss();
                        this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
                        spinner: 'bubbles' });
                      }
                  });
                });
                //console.log("load events calling it");
                //this.loadEvents();
        });
    }
    });

    // mobile web version changes
    /*  storage.get('onWeb').then((val) => {
      console.log("MENU onWeb: ", val);
      if (val == "true") { this.onWeb = true; }
    }); */

     if (document.URL.startsWith('http')) {
       console.log("MENU onWeb: true");
       this.onWeb = true;
     }
  }

  swipeEvent(e) {
    if(e.direction == '2'){
        //this.forwardOneDay();
        //this.content.scrollToTop();
    }
    else if(e.direction == '4'){
        //this.backOneDay();
        //this.content.scrollToTop();
    }
  }

  filterEventsForDay(theDate) {
      var newEvents = []
      var theStart = new Date(moment(theDate.getTime()).startOf('day').valueOf()).getTime();
      var theEnd = new Date(moment(theDate.getTime()).endOf('day').valueOf()).getTime();
      //console.log('filter: theStart: ', new Date(theStart));
      //console.log('filter: theEnd: ', new Date(theEnd));

      this.eventsHasMigraine = false;

      this.eventsArrayMonth.forEach(event => {
        //console.log('event.myDateTime: ', event.name, " date: ", event.myDateTime +
        //  ' start: ', theStart, " end: ", theEnd);
        if (event.myDateTime >= theStart && event.myDateTime <= theEnd) {
            //console.log('IN!');
            newEvents.push(event);
            if (event.name == "Migraine") { this.eventsHasMigraine = true; }
        }
      });
      this.eventsArray = newEvents;
      this.storage.set("todayHasMigraine", this.eventsHasMigraine);
    }

  loadEvents() {
    //console.log("loading events! day to view: " + this.dayToView);
    var theStart: Date = new Date(moment().add(this.dayToView, 'day').startOf('day').valueOf());
    var theMonthYear = theStart.getMonth().toString() + theStart.getFullYear().toString();
    // console.log('theMonthYear: ', theMonthYear);

    if (this.currentMonthYear == theMonthYear) {
      // same month, so filter date events
      this.filterEventsForDay(theStart);
    } else {
      // reload query
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
      spinner: 'bubbles' });

      this.loading.present().then(ret => {

      // start and end of this month
      var monthStart: Date = new Date(moment().add(this.dayToView, 'day').startOf('month').valueOf());
      var monthEnd: Date = new Date(moment().add(this.dayToView, 'day').endOf('month').valueOf());

      this.currentMonthYear = theMonthYear;
      // console.log('reload month! s: ', monthStart);
      // console.log('reload month! e: ', monthEnd);

      //ref.child('teams').orderByChild('highSortTotalValue').on(...

      this.db.list('/events/'+this.uid+"/", { query: {
        orderByChild: 'myDateTime',
        startAt: monthStart.getTime(),
        endAt: monthEnd.getTime()
      }}).subscribe(ret =>
        {
          //console.log('subscribe triggered! evernts: ', JSON.stringify(ret));
          this.eventsArrayMonth = ret;
          this.filterEventsForDay(new Date(moment().add(this.dayToView, 'day').valueOf()));
          this.loading.dismiss();
          this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
          spinner: 'bubbles' });
        });
      //}

      });
    }
    /* console.log('theStart: ', theStart);
    console.log('theEnd: ', theEnd);

    this.db.list('/events/'+this.uid, { query: {
      orderByChild: 'myDateTime',
      startAt: theStart.getTime(),
      endAt: theEnd.getTime()
    }}).subscribe(ret => this.eventsArray = ret);
    */

    /* var theStart: Date = new Date(moment().add(this.dayToView, 'day').startOf('day').valueOf());
    var theEnd: Date = new Date(moment().add(this.dayToView, 'day').endOf('day').valueOf());

    console.log('theStart: ', theStart);
    console.log('theEnd: ', theEnd);

    this.query$ = {
      orderByChild: 'myDateTime',
      startAt: theStart.getTime(),
      endAt: theEnd.getTime()
    };

    this.events.subscribe(events => {
        console.log('events: ', events);
        events.forEach(event => {
          console.log('event: ', event);
        });
        // update fullcalendar component with events
    }); */

    //this.filterByPeriod(theStart, theEnd);

    //this.events = this.db.list('/events/'+this.uid, { query: { orderByChild: 'myDateTime', startAt: theStart.valueOf(), endAt: theEnd.valueOf() }});

    /*var one = this.events.subscribe(sub => {

      console.log('events setting. sub', sub);
      this.eventsArray = [];

      // set migraine tile on or off
      this.eventsHasMigraine = false;
      sub.forEach(item => {
          console.log('item.name: ', item.name);
          this.eventsArray.push(item);
          if (item.name == "Migraine") { this.eventsHasMigraine = true; }
      });

      // set main message on or off
      if (this.eventsArray.length < 1) { this.hideMainMessage = false; } else { this.hideMainMessage = true; }

      console.log('events set! eventsArray: ',this.eventsArray);

      / * console.log('sub.length: ', sub.length);
      sub.forEach(item => {
        console.log('this.eventsFLO sub: ',  item);
      }); * /
      //
      one.unsubscribe();
    }); */


    /*  WITH USING storage
    // can we get this from storage?
    //var todayDate = new Date(moment.utc().add(new Date().getTimezoneOffset()/60,'hours').format('MMDDYYYYhhmm'));
    var aDateString = moment().add(this.dayToView, 'day').format('MMDDYYYY');

    //var theStart = moment().add(this.dayToView, 'day').startOf('day');
    //console.log('todayDate: ', aDateString + '_day');
    console.log(' ');
    console.log('load events for aDateString: ', aDateString);

    this.storage.get(aDateString).then((val) => {

        this.eventsArray = [];

        if (val) {
            // set the events array
            this.eventsArray = val;
            console.log('exists in storage: ' + aDateString + ' val: ', val);
            //this.loading.dismiss();
            //if (val.length >= 1) { this.eventsArray = val; } else { this.eventsArray = []; }
            console.log('this.events.length: ', this.eventsArray.length);

            // reset yesterday and tomorrow
            this.resetYesterdayTomorrow();

            // set main message on or off
            if (this.eventsArray.length < 1) { this.hideMainMessage = false; } else { this.hideMainMessage = true; }

            // set migraine tile on or off
            this.eventsHasMigraine = false;
            val.forEach(item => {  if (item.name == "Migraine") { this.eventsHasMigraine = true; }  });

        } else {

            console.log('doesnt exist - load from DB');
            this.loadEventsFromDB();
            this.resetYesterdayTomorrow();
        }
    });  */

  }


  openStats() {

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
        // migs.unsubscribe()
    // });



        /* myResults.get_dayOfWeekMostMigraines( function(dayOfWeek) {
                $scope.dayOfWeekMostMigraines = dayOfWeek;
        }); */

        // most recent migraine
        //myData.refreshLocalStorage_withCallback(function() {});

        // MOST RECENT MIGRAINE
        /* var mrm = window.localStorage["mostRecentMigraine"];
        if (mrm === "none") {
            $scope.mostRecentMigraine_dayssince = 0;
            $scope.mostRecentMigraine_hourssince = 0;
        } else {
            mrm = JSON.parse(mrm);
            var migTime = new Date(mrm.myDateTime);
            migTime.setHours(0,0,0,0); // so it doesn't just do # of 24-hour periods, but by date.

            var today = new Date();
            var hoursSinceLastMig = ((today.getTime() - migTime.getTime()) / 3600000);
            $scope.mostRecentMigraine_dayssince = Math.floor(hoursSinceLastMig / 24);
            $scope.mostRecentMigraine_hourssince = Math.floor(hoursSinceLastMig % 24);
        }

        // load periods
        var qTT = $firebaseArray(new Firebase($rootScope.URL + '/events/' + firebase.auth().currentUser.uid).orderByChild("name").equalTo("Period"));
        qTT.$loaded().then(function(data) {

            window.localStorage["Periods"] = s(data);

            // set last period
            var periodsSorted = $filter('orderBy')(data, "myDateTime");
            if (periodsSorted.length != 0 ) {
                window.localStorage["mostRecentPeriod"] = s(periodsSorted[periodsSorted.length - 1]);
            } else {
                window.localStorage["mostRecentPeriod"] = "none";
            }


            var mrp = window.localStorage["mostRecentPeriod"];
            if (mrp === "none") {
                $scope.mostRecentPeriod_days = 0;
            } else {
                mrp = JSON.parse(mrp);
                var periodTime = new Date(mrp.myDateTime);
                var today = new Date();
                var hoursSinceLastPeriod = ((today.getTime() - periodTime.getTime()) / 3600000);
                $scope.mostRecentPeriod_days = Math.floor(hoursSinceLastPeriod / 24) + 1;
            }

        }); */
  }

  closeCalendarOverlay() {
      console.log("Close Calendar Overlay ******");
      // set var to reset time or not
      ////var resetPanelTime: boolean = true;

      // get date from calendar overlay picker
      //var oDate: any = moment(this.overlayDate);

      // don't need to offset the local stuffvar tzOffset = new Date().getTimezoneOffset()/60;
      var oDate: any = moment(this.overlayDate);   //moment.utc(this.overlayDate).add(tzOffset,'hours') ;

      // is it after today?
      if (oDate.isAfter(moment(new Date()))) {
        let toast = this.toastCtrl.create({
            message: 'That is a date in the future.',
            duration: 2500, position: 'middle' });
        toast.present();
      //  resetPanelTime = false;
        return;
      }

      // is it before registration?
      if (oDate.isBefore(moment(this.registrationDate).startOf('day'))) {
        // console.log('reg date before');
        let toast = this.toastCtrl.create({
            message: 'That is from before you registered on ' + moment(this.registrationDate).format('MMM DD, YYYY') + '.',
            duration: 2500, position: 'middle' });
        toast.present();
        //resetPanelTime = false;
        return;
      }

      // it's valid - so we're going to do it
      var diffInDays = moment(oDate).diff(moment().endOf('day'), 'days');
      //if (resetPanelTime) { // fix don't need this resetpaneltime, you 'return' on thigns above

          // set new day to go to
          this.dayToView = diffInDays;

          // we don't want to keep yesterday and tomorrow data
          this.yesterdayEvents = [];
          this.tomorrowEvents = [];

          // go to that day
          this.resetPanel(0, true, true, true);  //num, resetTime, resetTiles, loadEvents
      //}

      // hide this overlay
      this.oCalHide = true;
  	}

changeTime_InputPanel() {
  var theVal: any = document.getElementById('timeBtn');
  var theValString: string = theVal.value.substr(0,10);
  if (theValString) {
      // console.log("** changeTime_timeInput **: ", theValString);
      var theValArray: any = theValString.split(':');
      this.theDT.setHours(theValArray[0],theValArray[1],0,0);
      this.theDT = new Date(this.theDT);
  } else {
    let toast = this.toastCtrl.create({
        message: 'You must have a time.',
        duration: 1500, position: 'middle' });
    toast.present();
    return;
  }
  // console.log("*** this.theDT: ", this.theDT);
}

changeTime_Overlay() {
  var theVal: any = document.getElementById('timeBtn');
  var theValString: string = theVal.value.substr(0,10);
  if (!theValString) {
    let toast = this.toastCtrl.create({
        message: 'You must have a time.',
        duration: 1500, position: 'middle' });
    toast.present();
    return;
  }
}

// num is how far forward or back to go
resetPanel(num, resetTime, resetTiles, loadEvents) {
    // console.log('');
    // console.log('reset panel');

    // set day to view based on theNum
    this.dayToView = this.dayToView + num;

    // make stuff happen
    if (loadEvents) { this.loadEvents(); } // else { this.loading.dismiss(); }
    this.setArrows(); // throws error?
    this.setMyDate();
    this.input1 = "";

    // reset theDT
    if (resetTime) {
        this.theDT = new Date(moment().add(this.dayToView, 'day').valueOf());
        this.theDTString = new Date(moment().add(this.dayToView, 'day').valueOf()).toString();
    }

    // turn off tiles// get all tiles
    var tiles = document.getElementsByClassName("imaTile");

    // for each tile, turn on / off to match input 1
    if (resetTiles) {
        for (var x=0;x<tiles.length;x++) {
           if (this.input1.toLowerCase().indexOf(tiles[x].id.toLowerCase()) == -1) {
             // -1, not there
             //console.log('tiles[x].id.toLowerCase(): ', tiles[x].id.toLowerCase());
             this.turnOffTile(tiles[x].id);
           } else {
             this.turnOnTile(tiles[x].id);
           }
        }
    }

	}

forwardOneDay() {
    // console.log('forward on day this.loading: ', this.loading);

    // add loader
    //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    //this.loading.present();

    // can't go beyond today?
		if (this.dayToView < 0) {
        this.resetPanel(1, true, true, true);
       //this.forwardOneDayFinish();
    }
}

forwardOneDayFinish() {
//  this.resetPanel(1, true, true, true);  //num, resetTime, resetTiles, loadEvents

  /*
  if (this.tomorrowEvents) {
      //this.eventsArray = [];
      this.eventsArray = this.tomorrowEvents;
      console.log('tomorrow is there! this.tomorrowEvents: ', JSON.stringify(this.tomorrowEvents));
      if (this.eventsArray.length < 1) { this.hideMainMessage = false; }
      else { this.hideMainMessage = true; }
      this.eventsHasMigraine = false;
      this.eventsArray.forEach(item => {  if (item.name == "Migraine") { this.eventsHasMigraine = true; }  });
      this.resetPanel(1, true, true, false);  //num, resetTime, resetTiles, loadEvents
      this.resetYesterdayTomorrow();
  } else {
      console.log('tomorrow is not there!');
      this.resetPanel(1, true, true, true);  //num, resetTime, resetTiles, loadEvents
  } */
}

backOneDay() {
      var newDate = moment().add(this.dayToView - 1, 'day');
      var rDate = moment(new Date(this.registrationDate)).startOf('day');

      if (newDate.isAfter(rDate)) {
          this.resetPanel(-1, true, true, true);
      }
        /*
          if (this.yesterdayEvents) {
              this.loading.dismiss();
              this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
              spinner: 'bubbles' });
              //this.eventsArray = [];
              this.eventsArray = this.yesterdayEvents;
              console.log('yesterday is there! this.yesterdayEvents: ', this.yesterdayEvents);
              if (this.eventsArray.length < 1) { this.hideMainMessage = false; }
              else { this.hideMainMessage = true; }
              this.eventsHasMigraine = false;
              this.eventsArray.forEach(item => {  if (item.name == "Migraine") { this.eventsHasMigraine = true; }  });
              this.resetPanel(-1, true, true, false);  //num, resetTime, resetTiles, loadEvents
              this.resetYesterdayTomorrow();
          } else { */
              //this.loading.present().then(ret => {
              //  console.log('yesterday is not there!');
                //this.resetPanel(-1, true, true, true);  //num, resetTime, resetTiles, loadEvents
              //}
              //);
        //  }
      //}
}

back10Mins() {
        var newTime = moment(this.theDT.getTime()).subtract(10,'minutes');
        this.tileSquareTime = newTime;
        this.theDT = new Date(newTime.valueOf());
        this.theDTString = new Date(newTime.valueOf()).toString();
	}

back1Hour() {
      //$event.stopPropagation();
      var newTime = moment(this.theDT.getTime()).subtract(1,'hours');
      this.tileSquareTime = newTime;
      this.theDT = new Date(newTime.valueOf());
      this.theDTString = new Date(newTime.valueOf()).toString();
}

changeTimeInput($event) {
  var theVal: any = document.getElementById('timeBtn');
  var theValString: string = theVal.value.substr(0,10);
  var theValArray: any = theValString.split(':');
  this.theDT.setHours(theValArray[0],theValArray[1],0,0);
  this.theDT = new Date(this.theDT);
  console.log("this.theDT: ", this.theDT);
}

closeOverlay($event) {
    $event.stopPropagation();

    var theVal: any = document.getElementById('timeBtnOverlay');
    var theValString: string = theVal.value.substr(0,10);
    var theValArray: any = theValString.split(':');

    if (!theValString) {
      let toast = this.toastCtrl.create({
          message: 'You must have a time.',
          duration: 1500, position: 'middle' });
      toast.present();
      return;
    }

    this.myDateTimeOverlay.setHours(theValArray[0],theValArray[1],0,0);
    this.myDateTimeOverlay = new Date(this.myDateTimeOverlay);
    this.myDateTimeOverlayString = new Date(this.myDateTimeOverlay).toString();

    // save to DB
    this.db.object('/events/'+this.uid+"/"+this.currentObject.$key).update(
      { myDateTime: this.myDateTimeOverlay.getTime(), amount: this.currentObject.amount, treatment_amount: this.currentObject.treatment_amount });
	}

addTriggerFromInput() {
      //console.log('0: this.input1: ',  this.input1);

      // empty?
      if (!this.input1) { console.log('input1 empty'); return; }
      if (this.input1 == "" || this.input1 == " ") { console.log('input1 blank'); return; }


      //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
      //spinner: 'bubbles' });
      this.loading.present().then(ret => {

      // migraine? show overlay, return
      if (this.input1.toLowerCase().indexOf('migraine') > -1) {
        let alert = this.alertCtrl.create({
          //title: 'Migraine',
          message: 'Do you want to add a migraine?',
          buttons: [ {
            text: 'No', role: 'cancel', handler: () => {
              this.input1 = "";
              this.processTextChange();
            } },
          {
            text: 'Yes', handler: () => {
              //console.log('Yes');
              //console.log('dayToView leaving yourlog: ', this.dayToView);
              this.storage.set("dayToView", this.dayToView);
              this.navCtrl.setRoot(ReportAMigrainePage);
            } } ] });
        alert.present();
        this.loading.dismiss();
        this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: false, content: 'Loading',
        spinner: 'bubbles' });
        return;
      }

      // get the right input
      var theTimeString: string = this.getTimeFromString(this.input1.trim());
      var theValue = this.stringWithoutTime(this.input1.trim());
      //console.log('this.input1: ', );
      //console.log("theTimeString returned: " + theTimeString);
      //console.log("theValue returned: " + theValue);

      if (theTimeString != "notset") {
          this.theDT = new Date(theTimeString);
      }
      // TO DO - if the time is in the input, set that.

      // split into and and comma separated terms
      // split by "and"
      var splitArray: Array<string> = theValue.toLowerCase().split(" and ");
  		var newSplitArray: Array<string> = [];

      // split by ","
      splitArray.forEach(sA => { sA = sA.trim(); newSplitArray = newSplitArray.concat(sA.split(",")); });
      console.log("your log 782 before json.stringify");
      splitArray = JSON.parse(JSON.stringify(newSplitArray));


      /* OLD WAY var splitArray = theValue.split(" and ");
      var newSplitArray = [];
      for (var i in splitArray) {
          newSplitArray = newSplitArray.concat(splitArray[i].split(","));
      }
      splitArray = newSplitArray; */


      // for the items, now process them.
      for (var i in splitArray) {

          // get name
          var theName = this.helpers.firstUpperEachWord(splitArray[i].trim().toLowerCase());
          console.log('adding: ', theName, "splitArray[i]: ", splitArray[i]);

          // empty? return
          if (theName == "" || theName == " ") { return; }

          // get all tiles
          var tiles = document.getElementsByClassName("imaTile");

          var exists: boolean = false;
          // for each tile, turn on / off to match input 1
          for (var x=0;x<tiles.length;x++) {
             if (theName.toLowerCase() === tiles[x].id.toLowerCase()) { // -1, not there
               exists = true;
             }
          }

          //console.log('exists 2: ', exists);
          if (exists) {

            // make event
            var eventTime;
            if (theTimeString == 'notset') { eventTime = theTimeString; }

            // make it so!
            //console.log('making an event. name: ', theName, '  this.theDT:  ', this.theDT);

            if (theName.toLowerCase() == "period") {
                this.myData.makeATracker(1, theName, 'triggerEvent', 'Add - Your Log');
                this.addPeriod();
                this.loading.dismiss();
                this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
                spinner: 'bubbles' });
                return;
            } else {
                console.log("event name: ", theName);
                this.myData.makeANEvent(theName, this.theDT);
                this.myData.addToTimesTracked(theName);
            }
            //this.setScrollPosition();
            this.hideMainMessage = true;
          } else {

            // not an existing tracker
            let alert = this.alertCtrl.create({
              message: 'You are not tracking ' + theName + ', would you like to add it?',
              buttons: [
                {
                  text: 'No',
                  role: 'cancel',
                  handler: () => { }
                },
                {
                  text: 'Yes',
                  handler: () => {

                    if (theName.toLowerCase() == "period") {
                        this.myData.makeATracker(1, theName, 'triggerEvent', 'Add - Your Log');
                        this.addPeriod();
                        this.loading.dismiss();
                        this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: false, content: 'Loading',
                        spinner: 'bubbles' });
                        return;
                    } else {
                        console.log("making tracker: ", theName);
                        this.myData.makeATracker(1, theName, 'triggerEvent', 'Add - Your Log');
                        this.myData.makeANEvent(theName, this.theDT);
                    }
                    //this.setScrollPosition();
                    this.hideMainMessage = true;
                    this.input1 = "";
                  }
                }
              ]
            });
            alert.present();
            this.input1 = "";
            this.loading.dismiss();
            this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
            spinner: 'bubbles' });
            return;
          }
      }
      this.resetPanel(0, false, true, false);  //num, resetTime, resetTiles, loadEvents
    });
      // reset
      //this.loading.dismiss();
      //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
      //spinner: 'bubbles' });
  }

addPeriod() {
  console.log('Add Period');

  var isWithin5Days = false;
  var now: any = this.theDT;

  var periodArray = this.db.list('/events/'+this.uid, {
    query: { orderByChild: 'name', equalTo: 'Period' }
  });

  var theSub = periodArray.subscribe(snapshots => {
      var periodDate = new Date().getTime;
      snapshots.forEach(item => {
        var periodTime: any = item.myDateTime;
        var tenDaysMilis: any = 86400000 * 5;
        //console.log('periodTime: ', new Date(periodTime));
        //console.log('now: ', now);
        if(periodTime < now && (periodTime + tenDaysMilis) > now) { isWithin5Days = true; periodDate = item.myDateTime; }
        if(periodTime > now && (periodTime - tenDaysMilis) < now) { isWithin5Days = true; periodDate = item.myDateTime; }
      });

      //console.log('isWithin5Days: ', isWithin5Days);
      var periodDateString = moment(periodDate).format("MMM DD");
      //console.log("periodDateString: ", periodDateString);
      if (isWithin5Days) {
        let alert = this.alertCtrl.create({
          message: 'You have another period recorded within 5 days of this, on ' + periodDateString + '. You only need to enter your period on the first day of your cycle.',
          buttons: [ {
            text: 'Ok', role: 'cancel', handler: () => {
            } } ] });
        alert.present();
      } else {
        //var me = this;
        this.myData.makeANEvent('Period', this.theDT);
        this.myData.addToTimesTracked('Period');
         //, function(val) {
            //console.log('added successfully 2. val key: ', val);
            //me.loadEvents();
          //});
        //this.myData.addToTimesTracked('Period');
      }

      this.resetPanel(0, true, true, false);  //num, resetTime, resetTiles, loadEvents
      theSub.unsubscribe();
    });
}

chooseAmt($event, num) {
    $event.stopPropagation();
    this.currentObject.amount = num;
}

deleteMe() {
    //console.log("deleting. this.currentObject: ", this.currentObject);
    //console.log("deleting. this.currentObject key: ", this.currentObject.$key);
    //this.myData.subtractFromTimesTracked(this.currentObject.name);

    /* for (var n=0;n<this.events.length;n++) {
      if (this.events[n].$key == this.currentObject.$key) { this.events.splice(n,1); }
    } */
    this.loading.present().then(ret => {
        this.db.object('/events/'+this.uid+"/"+this.currentObject.$key).remove().then((item) => {
          this.loading.dismiss();
          this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
          spinner: 'bubbles' });
            //console.log('the removed item: ', item);
            this.myData.subtractFromTimesTracked(this.currentObject.name);
            // this.loadEvents(); doesn't help
            //this.content.scrollToTop(); //doesn't help?
          }, () => { console.log('error'); }).catch((err) => { console.log('error: ', err);
        });

        /* var i = 0;
        this.eventsArray.forEach(item => {
            if (item.$key == this.currentObject.$key) { this.eventsArray.splice(i,1); this.content.scrollToTop(); }
            i++;
        }); */
    });
}

processTextChange() {

    // garbage? remove it
    if (this.input1 == " " || this.input1 == ",") {
        this.input1 = "";
    }

    // empty? get outta here - DON'T DO THIS. Breaks the add migraine? no. scenario
    //if (this.input1 == "") { return; }

    // get the time from input 1
    var timeFromInput = this.getTimeFromString(this.input1.trim());

    // get the input without time
    var theValue = this.stringWithoutTime(this.input1.trim());

    // set time
    if (timeFromInput != 'notset') {  this.tileSquareTime = new Date(timeFromInput);  }

    //console.log('theValue: ', theValue);
    var splitArray = theValue.split(" And ");
    var newSplitArray = [];
    for (var i in splitArray) {
      //console.log('splitArray[i]: ', splitArray[i]);
      newSplitArray = newSplitArray.concat(splitArray[i].split(","));
    }
    splitArray = newSplitArray;
    //console.log('split Array: ', JSON.stringify(splitArray));

    // get all tiles
    var tiles = document.getElementsByClassName("imaTile");

    // for each tile, turn on / off to match input 1
    for (var z=0;z<tiles.length;z++) {
        var turnedOn = false;
        for (var x=0;x<splitArray.length;x++) {
           if (splitArray[x].trim().toLowerCase() != "") {
                // if it's in the tiles, turn it on
               if (tiles[z].id.toLowerCase() == splitArray[x].trim().toLowerCase()) {
                 // console.log("1: ", splitArray[x].trim().toLowerCase(), " 2: ", tiles[z].id.toLowerCase(), " ON");
                 this.turnOnTile(tiles[z].id);
                 turnedOn = true;
             }
           }
        }
        // it's not there. turn it off
        if (!turnedOn) { this.turnOffTile(tiles[z].id); }
    }

    // for each tile, turn on / off to match input 1
    /*for (var x=0;x<tiles.length;x++) {
       if (this.input1.toLowerCase().indexOf(tiles[x].id.toLowerCase()) == -1) { // -1, not there
         this.turnOffTile(tiles[x].id);
       } else {
         this.turnOnTile(tiles[x].id);
       }
    } */
}

turnOnTile(trig) {
  // trig.toUpperCase(); //capitalizeMe(trig);
  //console.log("***** turn on: ", trig);
  var parentDiv = document.getElementById(trig);
  //console.log('parentDiv: ', parentDiv);
  if (parentDiv !== null) {
      // turn on
      //var parentDiv = document.getElementById(trig);
      parentDiv.className = "tileGreen imaTile";
      //console.log('2 parentDiv: ', parentDiv);
      parentDiv.querySelector('#timeTag').className = "showMe";
      //console.log('3 parentDiv: ', parentDiv);
      parentDiv.querySelector('#tileImg').className = "hideMe";
    }
}

turnOffTile(trig) {
    //console.log("turn off: ", trig);
    //trig.toUpperCase(); //capitalizeMe(trig);
    var parentDiv = document.getElementById(trig);
    //console.log('parentDiv: ', parentDiv);
    if (parentDiv !== null) {
        //console.log('2 parentDiv: ', parentDiv);
        if (parentDiv !== null) { parentDiv.querySelector('#timeTag').className = "hideMe"; }
        if (parentDiv !== null) { parentDiv.querySelector('#tileImg').className = "showMe"; }
        if (parentDiv !== null) { parentDiv.querySelector('#tileWordsInner').className = "tileWordsInner"; }
        if (parentDiv !== null) { parentDiv.className = "tileBlue imaTile"; }
  }
}

selectMe(trig, $event) {
    //console.log('$event: ', $event);
    //console.log('$event.type: ', $event.type);
    // if ($event.type == "click") {
		//var currentPart = $event.currentTarget.id;
		//var pDiv = $event.currentTarget.parentNode;

    // it's off
    if ($event.currentTarget.className.indexOf("tileBlue") > -1) {
      this.turnOnTile(trig.name);

      // adjust input
      if (this.input1 == "" || this.input1 == " ") {
        // was empty, just add name
        this.input1 = trig.name;
      } else {
          if (this.input1.toLowerCase().indexOf(trig.name) == -1) {
              // add name
              this.input1 = this.input1 + ", " + trig.name;
          }
      }

    // it's on
    } else {
      this.turnOffTile(trig.name);

      // adjust input
      var theString = this.input1;
      theString = theString.replace(", " + trig.name, "");
      theString = theString.replace(trig.name + ", ", "");
      theString = theString.replace(trig.name, "");
      this.input1 = theString;
      if (theString == ", " || theString == " ") { this.input1 = ""; }

    }

    }
		//var currentClassName = pDiv.querySelector('#timeTag').className;

		// check in currentObjs and set time
		//for(var i = 0; i < $scope.triggerTrackers_Active.length; i += 1) {
    /* for (var tracker in this.trackers) {
		    if(trig.name === tracker.name) {
			       trig.myDateTime = new Date(this.theTime);
		    }
    }

		if (currentClassName.indexOf("hideMe") > -1) {

            $scope.turnOnTile(theName, imgName);

            // add to input 2
            if (document.getElementById("at_input").value == "") { // input is blank
                document.getElementById("at_input").value = document.getElementById("at_input").value + " " + theName;
            } else {
                // input isn't blank. check to see if the value is in there to avoid dupes (when someone types in a name)
                //console.log("document.getElementById('at_input').value.indexOf(theName): " + document.getElementById("at_input").value.indexOf(theName) + " the name: " + theName);
                if (document.getElementById("at_input").value.indexOf(theName) == -1) {

                    // check if it starts with a #
                    document.getElementById("at_input").value = document.getElementById("at_input").value + ", " + theName;
                }
            }


		} else {
			  $scope.turnOffTile(theName);

              // remove from input field
              //console.log("removing: " + theName + " from: " + document.getElementById("at_input").value);
              var theString = document.getElementById("at_input").value;
              theString = theString.replace(", " + theName, "");
              theString = theString.replace(theName + ", ", "");
              theString = theString.replace(theName, "");
              document.getElementById("at_input").value = theString;
              if (theString == ", " || theString == " ") { document.getElementById("at_input").value = ""; }
              //console.log("theString: " + theString);
		} */
    //}


  getTimeFromString(theString) {    // fi x todo - maybe? why do we have window.localstorage here?

      theString = theString.toLowerCase();
      var theTime = new Date(new Date().getTime() + ((86400000) * window.localStorage['dayToView']));
      var AMPM = "none";
      var noon = "none";
      var hasTime = false;

      if (theString.toLowerCase().indexOf("am") > -1) {  AMPM = "am"; hasTime = true;  }
      if (theString.toLowerCase().indexOf("pm") > -1) {  AMPM = "pm"; hasTime = true; }

      // check for noon
      if (theString.toLowerCase().indexOf("noon") > -1) {
          noon = "noon";
          hasTime = true;

          // set the time
          var theDateTime = new Date(new Date().getTime() + ((86400000) * window.localStorage['dayToView']));
          theTime.setHours(12);
          theTime.setMinutes(0);
          hasTime = true;
      } else {

          // not noon! look into ampm
          // split into and and comma separated terms
          var splitArray = theString.split(" and ");
          var newSplitArray = [];
          for (var i in splitArray) { newSplitArray = newSplitArray.concat(splitArray[i].split(",")); }
          splitArray = newSplitArray;

          //console.log("splitArray:" + splitArray);
          //console.log("hasTime:" + hasTime);
          //console.log("ampm:" + AMPM);
          //console.log("noon:" + noon);

          // find the time element
          for (var i in splitArray) {
              if (splitArray[i].toLowerCase().indexOf("am") > -1 || splitArray[i].toLowerCase().indexOf("pm") > -1) {

                  // need to check for: beer 8am. if so, need to just take out the 8am. new loop over this!
                  var theSubArray = splitArray[i].split(" ");
                  for (var x in theSubArray) {
                      if (theSubArray[x].toLowerCase().indexOf("am") > -1 || theSubArray[x].toLowerCase().indexOf("pm") > -1) {
                          //theSubArray.splice(x,1);

                          // put the time into the basket
                          var firstPart = theSubArray[x].trim().split(' ');
                          //var theTimePart = "";
                          var hours = 0;
                          var minutes = 0;
                          var newTime = firstPart[0].toString();
                          newTime = newTime.replace('am','');
                          newTime = newTime.replace('pm','');

                          var theTimeParts = newTime.split(':');
                          console.log("theTimeParts: " + theTimeParts);
                          hours = theTimeParts[0];
                          console.log("hours: " + hours);
                          minutes = 0;
                          if (theTimeParts[1]) { minutes = theTimeParts[1]; }
                          //console.log("minutes: " + minutes);

                          // set the time
                          var theDateTime = new Date(new Date().getTime() + ((86400000) * window.localStorage['dayToView']));
                          var timeNotSet = true;
                          if (AMPM == "am" && hours == 12) { hours = 0; timeNotSet = false; }
                          if (AMPM == "pm" && hours == 12) { hours = 12; timeNotSet = false; }
                          if (AMPM == "pm" && timeNotSet) { hours = Number(hours) + 12; }

                          theTime.setHours(hours);
                          theTime.setMinutes(minutes);
                          hasTime = true;
                          //console.log("theTime: " + theTime);
                      }
                  }
              }
          }
      }
      var theTimeString = theTime.toString();
      if (! hasTime) { theTimeString = 'notset'; }
      return theTimeString;
  }

  stringWithoutTime(theString) {
          theString = theString.toLowerCase();
          var theNewString = theString.toLowerCase();

          //var AMPM = "none";
          //var noon = "none";
          var hasTime = false;

          //if (theString.toLowerCase().indexOf("am") > -1) {  AMPM = "am"; hasTime = true; }
          //if (theString.toLowerCase().indexOf("pm") > -1) {  AMPM = "pm"; hasTime = true; }

          if (theString.indexOf("noon") > -1) {
              var hasTime = true;
              theNewString = theString.replace('noon','');
          }

          // split into and and comma separated terms
          var splitArray = theString.split(" and ");
          var newSplitArray = [];
          for (var i in splitArray) { newSplitArray = newSplitArray.concat(splitArray[i].split(",")); }
          splitArray = newSplitArray;

          // find the am/pm time element
          for (var i in splitArray) {
              if (splitArray[i].toLowerCase().indexOf("am") > -1 || splitArray[i].toLowerCase().indexOf("pm") > -1) {
                  //console.log("splitArray[i]:" + splitArray[i]);

                  // need to check for: 8am Coffee (no comma). if so, need to just take out the 8am. new loop over this!
                  var theSubArray = splitArray[i].split(" ");
                  for (var x in theSubArray) {
                      if (theSubArray[x].toLowerCase().indexOf("am") > -1 || theSubArray[x].toLowerCase().indexOf("pm") > -1) {
                          theSubArray.splice(x,1);
                      }
                  }
                  splitArray[i] = theSubArray;
                  theNewString = splitArray.join();
                  //console.log("theNewString:" + theNewString);
              }
          }

          theNewString = theNewString.trim();
          //console.log("1 theNewString: " + theNewString);
          if (theNewString.charAt(0) == ",") {  theNewString = theNewString.slice(1, theNewString.length);  }
          theNewString = theNewString.trim();
          theNewString = this.helpers.firstUpperEachWord(theNewString);
          // console.log("2 theNewString: " + theNewString);

          return theNewString;
      }

  selectMigraine() {

    console.log('this.eventsHasMigraine: ', this.eventsHasMigraine);
    // already have migraine
    if (this.eventsHasMigraine) {
      let alert = this.alertCtrl.create({
        title: 'Migraine', message: 'You can only add one migraine per day.',
        buttons: [ {
          text: 'Ok', role: 'cancel', handler: () => {
          } } ] });
      alert.present();
      return;
    }

    let alert = this.alertCtrl.create({
      //title: 'Migraine',
      message: 'Do you want to add a migraine?',
      cssClass: 'alertPopup',
      buttons: [ {
        text: 'No', role: 'cancel', handler: () => {
          this.input1 = "";
          this.processTextChange();
        } },
      {
        text: 'Yes', handler: () => {
          console.log('dayToView leaving yourlog: ', this.dayToView);
          this.storage.set("dayToView", this.dayToView);
          this.navCtrl.setRoot(ReportAMigrainePage);
        } } ] });
     alert.present();
  }

  setScrollPosition() {
        /* if ($scope.events.length > 2) {
          var numOnList = 0;
          angular.forEach($scope.events, function(event, key) {
              if(new Date(event.myDateTime).getTime() > $scope.theTime.getTime()) {
                  numOnList = numOnList + 1;
              }
          }); */

          // turn off all tiles
          var tiles = document.getElementsByClassName("imanEvent");
          //var theTiles: any[] = [];
          // for (var k=0;k<tiles.length;k++) { theTiles.push(tiles[k].id); }

          //console.log("numOnList: " + numOnList);

          // scroll to
          var scrollToAmt = (tiles.length * 63) + 45;
          console.log('scrollToAmt: ', scrollToAmt);
          this.content.scrollTo(0, scrollToAmt, 40);

          //$ionicScrollDelegate.scrollTo(0, scrollToAmt, false);
          //this.content.scrollToTop();
  }


  openInfoOverlay(thisEvent, theKey) {

      //this.content.scrollToTop();

      if (thisEvent.name == "Migraine") {
        this.storage.set("dayToView", this.dayToView);
        this.navCtrl.setRoot(ReportAMigrainePage);
        return;
      }

      console.log('open overlay. setting this event: ', thisEvent);
      //console.log('open overlay. theKey: ', theKey);

  		// put overlay variables into scope
      this.currentObject = thisEvent;
      this.oInfoHide = false;
      this.myDateTimeOverlay = new Date(thisEvent.myDateTime);
      this.myDateTimeOverlayString = new Date(thisEvent.myDateTime).toString();

      //var a = this.trackers.subscribe(sub => {
      this.currentTimesTrackedMessage = "The " + thisEvent.name + " tracker is paused or has been deleted.";
          this.trackers.forEach(item => {
            //console.log('item: ', item);
            if (item.name == thisEvent.name) {
                // set current times tracked message
                if (Number(item.timesTracked) == 1) {
                    this.currentTimesTrackedMessage = thisEvent.name + " has been tracked "
                    + item.timesTracked + " time.";
                } else {
                    this.currentTimesTrackedMessage = thisEvent.name + " has been tracked "
                    + item.timesTracked + " times.";
                }

              }
          });
          //a.unsubscribe();
      //});

      /* caffeine vars - fi x todo later */
      /* treatment message? don't need. maybe later */
  	}

setMyDate() {

    // set string to today
    this.tl_myDateString =  moment().add(this.dayToView, 'day').format("ddd, MMM DD");

    // if earlier year, add year to the string
    if (new Date(moment().add(this.dayToView, 'day').valueOf()).getFullYear() != new Date().getFullYear()) {
      this.tl_myDateString = moment().add(this.dayToView, 'day').format("ddd, MMM DD YY");
    }

    // is it today or yesterday?
    if (this.dayToView == 0) { this.tl_myDateString = "Today"; }
    if (this.dayToView == -1) { this.tl_myDateString = "Yesterday"; }
  }

  setArrows() {
    //console.log('setarrows');
    //console.log('set arrows dayToView: ', this.dayToView);
    //console.log('new Date(this.registrationDate): ', new Date(this.registrationDate));

    // right arrow - beyond today?
    if (this.dayToView == 0) { this.rightArrowDim = true;
    } else { this.rightArrowDim = false; }

    // left arrow - is this date -1 after reg date? then, on.
    var newDate = moment().add(this.dayToView - 1, 'day');
    var rDate = moment(new Date(this.registrationDate)).startOf('day');
    //console.log('set arrows newDate: ', newDate);
    //console.log('set arrows rDate: ', rDate);
    if (newDate.isAfter(rDate)) {
        this.leftArrowDim = false;
      } else {  // turn it off
        this.leftArrowDim = true;
    }
  }

  goToToday() {
        // reset day to 0
        this.dayToView = 0;
        this.storage.set("dayToView", this.dayToView);

        // reload panel with the new DTV, not going back/fwd = 0
        this.resetPanel(0, true, true, true);

        // hide overlay
        this.oCalHide = true;
  }

  goToResults() {
    this.storage.set("dayToView", 0);
    this.navCtrl.push(ResultsMainPage);
   }

  /* Android Leaving Code */
  ionViewDidEnter() {
      this.initializeBackButtonCustomHandler();

      // -- analytics trackView
      this.ga.trackView("Your Log");
  }

  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.platform.exitApp(); } //this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
