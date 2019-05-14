import { Component } from '@angular/core';
//import { Observable } from 'rxjs/Observable';
import { NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
//import firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
// import { Ng2OrderModule } from 'ng2-order-pipe';

// Pages
import { ResultsDetailPage } from '../results-detail/results-detail';
import { ResultsPeriodPage } from '../results-period/results-period';
import { ResultsExplorerPage } from '../results-explorer/results-explorer';
import { YourLogPage } from '../your-log/your-log';

// @IonicPage()
@Component({ selector: 'page-results-main', templateUrl: 'results-main.html' })
export class ResultsMainPage {

    uid: any;
    myName: string;
    trackersActive: FirebaseListObservable<any>;
    theList: any = [];
    theListNotEnoughData: any = [];
    //trackers2: any;
    treatmentTrackers: any[];
    baseList: any[];
    theInput: string;
    o1Hide: boolean = true;
    pausedListNotEmpty: boolean = false;
    loading: any;
    hideNoResultsMessage: boolean = true;
    order: string = 'name';
    public unregisterBackButtonAction: any;

    constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
    public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
    private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
    private alertCtrl: AlertController, public platform: Platform) {

      // add loader
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
      content: 'Creating Your Results', spinner: 'bubbles' });
      this.loading.present();

      this.navCtrl.swipeBackEnabled = false;


      // -- analytics trackView
      this.ga.trackView('Results - Main');

      this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;

          //update stuff
          console.log("calling update everything!");
          this.myData.scoreUpdate_Everything(response => {
                console.log("response update everything! ", response);
            //});
            this.trackersActive = db.list('/trackers/'+auth.uid, { query: { orderByChild: 'active', equalTo: true } });

          // cast trackers
        /*  var theSub = this.trackersFBL.subscribe((_items)=> {
              this.trackers = [];
              _items.forEach(item => {
                    this.trackers.push(item);
              });
            theSub.unsubscribe();
          });*/

          //var theSub = this.trackersActive.subscribe((_items)=> {
          //this.trackers2 = [];
          //this.theListNotEnoughData = [];

          var theSub = this.trackersActive.subscribe((_items)=> {
            this.theList = [];
            this.theListNotEnoughData = [];

            _items.forEach(item => {
                // it's a tracker tracked more than 4 times, but not period
                if (item.type == "triggerEvent" && item.timesTracked > 4 && item.name != "Period") {
                  this.theList.push(item) }
                // it's the period tracker, 1 or more times tracked.
                if (item.type == "triggerEvent" && item.timesTracked >= 1 && item.name == "Period") {
                  this.theList.push(item) }
                // it's a tracker tracked less than 4 times, not period
                if (item.type == "triggerEvent" && item.timesTracked <= 4 && item.name != "Period") {
                  this.theListNotEnoughData.push(item) }
                // it's the period tracker, 0 times tracked
                if (item.type == "triggerEvent" && item.timesTracked < 1 && item.name == "Period") {
                  this.theListNotEnoughData.push(item) }
            });

            if (this.theList.length == 0) { this.hideNoResultsMessage = false; }
            this.theList = myData.sortByHiHiScore(this.theList);
            this.theListNotEnoughData = myData.sortByTimesTracked(this.theListNotEnoughData);

            this.loading.dismiss();
            this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
            content: 'Creating Your Results', spinner: 'bubbles' });

            //theSub.unsubscribe(); // add this in and it doesn't update right when you remove a triger from your log
            });
          });
      });
    }

    pick(tracker) {
        this.storage.set("currentTracker" , JSON.stringify(tracker));
        if (tracker.name == "Period") {
            this.navCtrl.push(ResultsPeriodPage) //setRoot(ResultsPeriodPage); //$state.go('app.resultsPeriod', {reload: true});
        } else {
            this.navCtrl.push(ResultsDetailPage);   //$state.go('app.resultsDetail', {reload: true});
        }
	   }

     goToExplorer() {
       this.navCtrl.push(ResultsExplorerPage);
     }

  ionViewWillEnter() {
    // reset currentTracker to none
    this.storage.set("currentTracker", "");
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
