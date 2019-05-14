import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, Platform} from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
//import moment from 'moment'; // moment
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

// Pages
import { ResultsExplorerPage } from '../results-explorer/results-explorer';
import { ResultsMainPage } from '../results-main/results-main';

//@IonicPage()
@Component({ selector: 'page-results-period', templateUrl: 'results-period.html' })
export class ResultsPeriodPage {

    uid: any;
    myName: string;
    myNameLowerCase: string = "";
    myScore: string;
    tracker: any;
    numTimesMessage: any;
    numTimesMigraines: any;
    eventsFBL: FirebaseListObservable<any>;
    events: any[] = [];
    migrainesFBL: FirebaseListObservable<any>;
    migraines: any[] = [];
    arrayOfDayObjects2: any[] = [];
    arrayOfDayObjects_withMigraine: any[] = [];
    arrayOfDayObjects_noMigraine: any[] = [];
    arrayOfMigrainesRelatedToItems: any[] = [];
    canvas: any;
    c: any;
    periodLengthMessage: string = "";
    periodResultsMessage: string = "";
    loading: any;
    public unregisterBackButtonAction: any;

    constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
    public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
    private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
    private alertCtrl: AlertController, public platform: Platform) {

      // add loader
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
      content: 'Loading', spinner: 'bubbles' });
      this.loading.present();

      // -- analytics trackView
      this.ga.trackView('Results - Period');

      this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;

            this.storage.get("currentTracker").then((val) => {
                val = JSON.parse(val);
                this.myName = val.name;
                this.myNameLowerCase = val.name.toLowerCase();
                this.tracker = val;
                this.myScore = val.highestHighestScore;
                this.numTimesMessage = val.timesTracked;
                this.numTimesMigraines = "";

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

                //console.log("this.myScore: " + this.myScore);
                //console.log("theName: " + theName);
                var theElem: any = document.getElementById("mainImgDetail_Period");
                theElem.src = theName;

                //var migrainez = db.list('/events/'+auth.uid,{ query:{ orderByChild:'name', equalTo: 'Migraine'} });
                //var periodz =  db.list('/events/'+auth.uid,{ query:{ orderByChild:'name', equalTo: 'Period'} });

                  // make events = sorted list of periods and migraines
                 this.events = this.myData.getPeriods();
                 this.migraines = this.myData.getMigraines();
                 this.events = this.events.concat(this.migraines);
                 this.events = myData.sortByDate(this.events);

                 // remove migraines that appear before first period entry
                 var counter = 0;
                 this.events.forEach (item => {
                   console.log('item: ', item.name);
                   if (item.name == "Period") { this.events = this.events.splice(counter, this.events.length); return; }
                   counter++;
                 });

                //this.events = myData.sortByDateReverse(this.events);

                var theUser = this.myData.getTheUser();
                theUser.subscribe(snapshot => {
                    // console.log('theUser: ', snapshot.periodNumCycles);
                    //console.log('theUser: ', JSON.stringify(snapshot.periodDaysFlagged));
                       //console.log('Snapshot type result: ' + snapshot[type]);
                       //yourFunction(snapshot.requests);

                // average cycle length message
                if (snapshot.averageDaysInCycle && snapshot.averageDaysInCycle > 0) {
                  this.periodLengthMessage = "Your cycle average: " + parseFloat(snapshot.averageDaysInCycle).toFixed(1) + " days";
                } else {
                  this.periodLengthMessage = "";
                }

                // period days flagged message
                //if (snapshot.periodDaysFlagged.length == 0) {
                    this.periodResultsMessage = "There are no specific cycle days with an increase in migraines." //" Track 3 or more periods to get good data on significant cycle days.";
                //}

                if (snapshot.periodDaysFlagged) {
                    if (snapshot.periodDaysFlagged.length == 1) {
                        this.periodResultsMessage = "You get more migraines on day " + snapshot.periodDaysFlagged[0].periodDayNum + " of your cycle.";
                    }

                    if (snapshot.periodDaysFlagged.length > 1) {
                        var numSection = ""
                        for (var i in snapshot.periodDaysFlagged) {
                            numSection = numSection + snapshot.periodDaysFlagged[i].periodDayNum;
                            if (Number(i) < (snapshot.periodDaysFlagged.length - 2)) { numSection = numSection + ", "; }
                            if (Number(i) == (snapshot.periodDaysFlagged.length - 2)) { numSection = numSection + " and "; }
                        }
                        this.periodResultsMessage = "You get more migraines on days " + numSection + " of your cycle.";
                    }
                }
                this.loading.dismiss();
              });

            });
      });
    }

    ngAfterViewInit() {}

    goToExplorer() {
      this.navCtrl.push(ResultsExplorerPage);
    }

  ionViewDidLoad() {}

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(ResultsMainPage); }
  /* END Android Leaving Code */

}
