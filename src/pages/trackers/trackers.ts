import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
//import { MyAlphabetizeComponent } from '../../app/pipes/my-alphabetize';

import { YourLogPage } from '../your-log/your-log'

// ***** Page ***** //
@IonicPage()
@Component({  selector: 'page-trackers', templateUrl: 'trackers.html' })
export class TrackersPage {

  uid: any;
  myName: string;
  trackersActiveFLO: FirebaseListObservable<any>;
  trackersPausedFLO: FirebaseListObservable<any>;
  trackersPaused: any = [];
  trackersActive: any = [];
  treatmentTrackers: any[];
  baseList: any[];
  theInput: string;
  public addForm;
  currentObject: any = {"name": "", "type": "triggerType","treatment_unitType":"mg","treatment_amount":"100", "treatment_showUnitAmount":true};
  currentObjectType: string;
  currentObjectUnitType: string;
  currentObjectTreatmentAmount: string;
  //treatmentShowAmt = true;
  o1Hide: boolean = true;
  loading: any;
  loadingIsOn: boolean = false;
  pausedListNotEmpty: boolean = false;
  mainListNotEmpty: boolean = false;
  public unregisterBackButtonAction: any;

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public toastCtrl: ToastController,
  public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
  private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
  private alertCtrl: AlertController, public platform: Platform) {

    // add loader
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
    content: 'Loading', spinner: 'bubbles' });
    this.loadingIsOn = true;
    this.loading.present();

    this.currentObjectType = "triggerType";
    this.currentObjectUnitType = "100";
    this.currentObjectTreatmentAmount = "mg";

    this.addForm = formBuilder.group({ theInput: [] });

    this.afAuth.authState.subscribe(auth => {

        this.uid = auth.uid;

        this.trackersActiveFLO = db.list('/trackers/'+this.uid, { query: { orderByChild: 'active', equalTo: true } });
        this.trackersPausedFLO = db.list('/trackers/'+this.uid, { query: { orderByChild: 'active', equalTo: false } });
        this.trackersPausedFLO.subscribe(sub => {
            this.trackersPaused = this.myData.sortByName(sub);
            this.pausedListNotEmpty = sub.length >= 1;
            //console.log('p sub.length', sub.length);
            //console.log('this.pausedListNotEmpty', this.pausedListNotEmpty);
        });
        this.trackersActiveFLO.subscribe(sub => {
          this.trackersActive = this.myData.sortByName(sub);
          this.mainListNotEmpty = sub.length >= 1;
          //console.log('m sub.length', sub.length);
          //console.log('this.mListNotEmpty', this.mainListNotEmpty);
        });


        //this.trackersActive = this.myData.getTrackersActive();

        // query
        //this.trackersPaused = this.myData.getTrackersPaused();


        //console.log('this.trackersPaused: ', this.trackersPaused);
        //console.log('this.trackersActive: ', this.trackersActive);``
        //db.list('/trackers/'+this.uid, {
        //    query: { orderByChild: 'active', equalTo: false }
        //});

        /* this.trackersPaused.subscribe(sub => {
            this.pausedListNotEmpty = sub.length > 0;
        }); */

        if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); }
    });
  }


onPageWillLeave() {
  console.log('** leaving trackers **');
}

  deleteTracker() {
      let alert = this.alertCtrl.create({
        //title: 'Tracker',
        message: 'Do you want to delete this tracker?',
        buttons: [ {
          text: 'No', role: 'cancel', handler: () => {
          } },
        {
          text: 'Yes', handler: () => {
            // add loader
            //this.db.object('/trackers/'+this.uid+"/"+this.currentObject.$key).remove();
            this.myData.deleteTracker(this.currentObject);
            this.o1Hide = true;
          } } ] });
      alert.present();
  }

  turnOnTreatmentAmt() {
      this.currentObject.treatment_showUnitAmount = true;
  }

  turnOffTreatmentAmt() {
      this.currentObject.treatment_showUnitAmount = false;
  }

  closePTOverlay($event) {
      // console.log("trigger type: ", this.currentObjectType);
      // console.log("currentobjet: ", this.currentObject);
      this.currentObject.type = this.currentObjectType;

      //this.currentObject.treatment_amount = this.currentObjectTreatmentAmount;
      //this.currentObject.treatment_unitType = this.currentObjectUnitType;

      //if (this.currentObjectType == "treatmentEvent") { this.myData.migraineUpdateTreatments(); }

      // update tracker - WORKED 1.0
      //this.db.object('/trackers/'+this.uid+"/"+this.currentObject.$key).update(
      //  { type: this.currentObject.type });
      //console.log("this.currentObject.treatment_unitType: ", this.currentObject.treatment_unitType);

      // new for adding treatment amount and unit type
      this.db.object('/trackers/'+this.uid+"/"+this.currentObject.$key).update(
        { type: this.currentObject.type, treatment_amount: this.currentObject.treatment_amount, treatment_unitType: this.currentObject.treatment_unitType, treatment_showUnitAmount: this.currentObject.treatment_showUnitAmount });

      // update all events with this tracker
      var ev2 = this.db.list('/events/'+this.uid, {
        query: { orderByChild: 'name', equalTo: this.currentObject.name }
      });

      // cycle through and change the events *****
      var subev2 = ev2.subscribe((_items)=> {
            _items.forEach(item => {
                //console.log("updating type: ", item.name, " type: ", this.currentObject.type);
                this.db.object('/events/'+this.uid+"/"+item.$key)
                .update({ type: this.currentObject.type, treatment_showUnitAmount: this.currentObject.treatment_showUnitAmount });
            });
            subev2.unsubscribe();
      });
  }

pauseTracking() {

    console.log(':this.currentObject.$key: ', this.currentObject.$key);
    //this.currentObject.active = false;

    // -- analytics event pause tracker
    // if (typeof analytics !== 'undefined') {  analytics.trackEvent('Pause Tracker', 'Pause - Your Trackers', $scope.currentObj.name); }
    this.db.object('/trackers/'+this.uid+"/"+this.currentObject.$key).update( { active: false } );

    this.trackersPausedFLO.subscribe(sub => { this.pausedListNotEmpty = sub.length > 0; });
    this.trackersActiveFLO.subscribe(sub => { this.mainListNotEmpty = sub.length > 0; });

    //this.trackersPausedFLO.subscribe(sub => { this.pausedListNotEmpty = sub.length > 0; });
    //this.trackersActiveFLO.subscribe(sub => { this.mainListNotEmpty = sub.length > 0; });

    // works - .then(result => {
      //this.trackersPaused = this.myData.getTrackersPaused();
      //this.trackersActive = this.myData.getTrackersActive();
      //console.log('this.trackersPaused: ', this.trackersPaused);
      //console.log('this.trackersActive: ', this.trackersActive);
    //});

    /* this.trackersPaused.subscribe(sub => {
        this.pausedListNotEmpty = sub.length > 0;
    }); */

    this.o1Hide = true;
	}

  pickTriggerTA(trig) {
      console.log('trig: ', trig);
      this.currentObject = trig;
      this.currentObjectType = trig.type;
      this.currentObjectTreatmentAmount = trig.treatment_amount;
      this.currentObjectUnitType= trig.treatment_unitType;
      //this.treatmentShowAmt = trig.treatment_showUnitAmount;
      this.o1Hide = false;
  }

	addFromInput() {
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    this.loadingIsOn = true;
    this.loading.present();
    console.log("this.theInput: ", this.theInput);

    if (!this.theInput) { if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); } return; }

		// special chars? No way, loooser!
    if (this.helpers.containsSpecialChars(this.theInput)) {
        let toast = this.toastCtrl.create({
            message: 'Input not valid. You may not use special characters.',
            duration: 3000,
            position: 'middle'
          });
          toast.present();
          if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); }
          return;
    }

    // split by "and"
    var splitArray: Array<string> = this.theInput.toLowerCase().split(" and ");
		var newSplitArray: Array<string> = [];

    // split by ","
    splitArray.forEach(sA => { sA = sA.trim(); newSplitArray = newSplitArray.concat(sA.split(",")); });
    splitArray = JSON.parse(JSON.stringify(newSplitArray));

    // get the current names (this is faster and cleaner than going to the DB)
    //var arrayOfNames: any[] = [];
    //var tiles = document.getElementsByClassName("imaTrackerTP");
    //var theTiles: any[] = [];
    //for (var k=0;k<tiles.length;k++) { arrayOfNames.push(tiles[k].id); }

    // cycle through the array of names
    var counter = 0;
		for (var i in splitArray) {

        // get the name
        var theName = this.helpers.firstUpperEachWord(splitArray[i].trim().toLowerCase());

        if (theName == "" || theName == " ") { this.theInput = ""; if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); } return; }

        // console.log('counter: ', counter);
        // check for dupes
        for(var b = 0; b < counter; b++) {
          //console.log('theName: ', theName, " checking: ", splitArray[b].trim().toLowerCase());
          if (theName.trim().toLowerCase() == splitArray[b].trim().toLowerCase()) { this.theInput = ""; if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); } return; }
        }

        /* is it in the array of names?
        var trackerExists: boolean = false;
        var one = this.trackersActiveFLO.subscribe((_items)=> {
             _items.forEach(item => {
                  console.log('checking: ', item.name, "    ", theName);
                   if (item.name.toLowerCase() == theName.toLowerCase()) { console.log('exists!!'); trackerExists = true; }
               })
              one.unsubscribe();
        });
        var two = this.trackersPausedFLO.subscribe((_items)=> {
             _items.forEach(item => {
               console.log('checking: ', item.name);
                   if (item.name.toLowerCase() == theName.toLowerCase()) { trackerExists = true; }
               })
              two.unsubscribe();
        }); */

        var trackerExists: boolean = false;
        var arrayOfNames = document.getElementsByClassName("imaTrackerTP");
        for (var n=0;n<arrayOfNames.length;n++) {
            console.log('checking: ', arrayOfNames[n].id, "    ", theName);
          if (arrayOfNames[n].id) {
            if (arrayOfNames[n].id.toLowerCase() === theName.toLowerCase()) { trackerExists = true; }
          } else { console.log("BROKEN DATA! trackers.ts 247"); }
        }

        console.log('trackerExists: ', trackerExists);
        // console.log('names: ', JSON.stringify(arrayOfNames));

        // yes. exists! error msg
        if (trackerExists) {
            console.log('exists: ** 2 ** ');
            if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); }
            let alert = this.alertCtrl.create({
              title: 'Exists', message: theName + ' is already listed. It may be on the paused items list below the main list.',
              buttons: [ {
                text: 'Ok', role: 'cancel', handler: () => {
                  } } ] });
            alert.present();
        } else {
            // no. doesn't exist - create object
            this.myData.makeATracker(0, theName, 'triggerEvent', 'Your Trackers - From Input');
            //this.trackers2 = this.myData.sortByName(this.trackers2);
            //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
            console.log('** 3 **', this.loadingIsOn);
            if (this.loadingIsOn) { this.loadingIsOn = false; this.loading.dismiss(); }
        }
        counter++;
      }

			// reset the input
			this.theInput = "";
	}

  // -- Function: pickTrigger
	//  $scope.pickTrigger = function($event, theName, theKey) {
  pickTriggerPaused(trig) {

    let alert = this.alertCtrl.create({
      //title: 'Paused',
      message: 'Do you want to unpause this tracker?',
      buttons: [ {
        text: 'No', role: 'cancel', handler: () => {
          } },
      {
        text: 'Yes', handler: () => {
          // make it active
          this.db.object('/trackers/'+this.uid+"/"+trig.$key).update({ active: true })
          .then( ret =>
              {  this.myData.resetTimesTracked(trig.name, trig.$key);
                this.trackersPausedFLO.subscribe(sub => { this.pausedListNotEmpty = sub.length > 0; });
                this.trackersActiveFLO.subscribe(sub => { this.mainListNotEmpty = sub.length > 0; });
              });

        } } ] });
        alert.present();
	}

    ionViewDidLoad() {
    }

    /* Android Leaving Code */
    // public unregisterBackButtonAction: any; , public platform: Platform
    ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
    ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
    public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
    private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
    /* END Android Leaving Code */

}
