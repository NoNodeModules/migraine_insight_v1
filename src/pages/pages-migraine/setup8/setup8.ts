import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../../providers/helpers/helpers';  // Helpers
import { StatusBar } from '@ionic-native/status-bar'; // Status bar
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard

import { MenuComponent } from "../../../app/menu.component";
import { TabsPage } from '../../tabs/tabs';

// Pages
import { YourLogPage } from '../../your-log/your-log';

// ***** Page ***** //
@IonicPage()
@Component({  selector: 'page-setup8', templateUrl: 'setup8.html'  })
export class Setup8Page {

  uid: any;
  trackers: FirebaseListObservable<any>;
  theInput: string;
  currentObject: any;
  o1hide: boolean = true;
  oCalHide: boolean = true;
  o3hide: boolean = true;
  o4hide: boolean = true;
  oAddTriggersHide: boolean = true;
  currentObjectType: string;

  constructor(private statusBar: StatusBar, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
  private myData: MyDataProvider, private helpers: HelpersProvider,
  private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
  private keyboard: Keyboard, ) {
      this.afAuth.authState.subscribe(auth => { if (auth) {
        this.uid = auth.uid;
        this.trackers = db.list('/trackers/'+this.uid, { query: { orderByChild: 'name' } });
      }
      });

      this.o1hide = true;
      this.oCalHide = true;
      this.o3hide = true;
      this.oAddTriggersHide = true;
      this.currentObjectType = "triggerEvent";
      this.statusBar.backgroundColorByHexString("#6ac2f2");

  }

  ionViewDidLoad() {
    // -- analytics trackView
    this.ga.trackView("Setup 8");
  }

  openAddTrigger() {
    this.currentObjectType = "triggerEvent";
    this.oAddTriggersHide = false;
  }

  openAddTreatment() {
    this.currentObjectType = "treatmentEvent";
    this.oAddTriggersHide = false;
  }

  openAddSymptom() {
    this.currentObjectType = "symptomEvent";
    this.oAddTriggersHide = false;
  }

  addTriggerTrackerFromInput() {
    // empty or special chars - get outta here
    if (!this.theInput) { return; }
    if (this.theInput == "" || this.theInput == " ") { return; }
    if (this.helpers.containsSpecialChars(this.theInput)) {
      this.o3hide = false;
      return;
    }

		// split into and and comma separated terms
		var splitArray = this.theInput.split(" and ");
		var newSplitArray = [];
		for (var i in splitArray) { newSplitArray = newSplitArray.concat(splitArray[i].split(",")); }
		splitArray = newSplitArray;

		for (var i in splitArray) {
		    var theName = this.helpers.firstUpperEachWord(splitArray[i].trim().toLowerCase());
        if (theName == "" || theName == " ") {} else {

            var theAnswer: boolean = false;

            //var contains = this.helpers.containBool(this.trackers, theName);
            // Correct for CONTAINS functionality containBool
            var trackersSub: any = this.db.list(('/trackers/'+this.uid), { preserveSnapshot: true})
              .subscribe(snapshots=>{
              snapshots.forEach(snapshot => {
                    //console.log('thevar: ', snapshot.val().name.toLowerCase());
                    if (snapshot.val().name.toLowerCase() === theName.toLowerCase()) { theAnswer = true; }
                  });
              })
            trackersSub.unsubscribe();

            if (!theAnswer) {
                // save to db
                this.myData.makeATracker(0, theName, this.currentObjectType,'Add - Setup End Input');

                // -- analytics trackevent
                //this.ga.trackEvent('Make Tracker', 'Add - Setup End Input', theName);
            }
      }
    }
    this.theInput = "";
  }

  pickTriggerOpenOverlay(theItem) {
    this.currentObject = theItem;
    this.oCalHide = false;
  }

  deleteTracker_YES() {

    // -- analytics event delete tracker
    this.ga.trackEvent('Delete Tracker', this.currentObject.name);

    // remove from DBs
    this.trackers.remove(this.currentObject.$key);
  }

  setupDone() {
    // save to DB
    this.db.object('/users/' + this.uid).update({ setupDone: "yes" });

    // go to page
    //this.statusBar.backgroundColorByHexString("#eff6fb");
    //this.statusBar.styleLightContent();
    this.statusBar.backgroundColorByHexString("#6cb4dc");
    this.ga.trackEvent("Setup", "Setup Done");
    //this.navCtrl.setRoot(YourLogPage);
    //this.navCtrl.push(MenuComponent);
    this.navCtrl.push(TabsPage);
    //this.navCtrl.pop();
  }
}
