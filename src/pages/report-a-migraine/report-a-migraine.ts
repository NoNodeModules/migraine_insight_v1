import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
import moment from 'moment';
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

// Pages
import { YourLogPage } from '../your-log/your-log';


@IonicPage()
@Component({ selector: 'page-report-a-migraine', templateUrl: 'report-a-migraine.html', })
export class ReportAMigrainePage {

  stubList: any = [];
  uid: any;
  dayToView: number;

  migObj: any = {};
  myNotes: string;

  theDate: Date;
  theDateString: string;
  startTime: Date;
  mySymptoms: string;
  events: any;
  exists: boolean = false;
  sev0On: boolean = false;
  sev1On: boolean = false;
  sev2On: boolean = false;
  sev3On: boolean = true;
  sev4On: boolean = false;
  sev5On: boolean = false;
  sev6On: boolean = false;
  sev7On: boolean = false;
  sev8On: boolean = true;
  sev9On: boolean = false;
  sev10On: boolean = false;
  //currentDayToView: any;
  loading: any;
  public unregisterBackButtonAction: any;

  constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
  public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
  private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
  private alertCtrl: AlertController, private keyboard: Keyboard, public platform: Platform) {

    // add loader
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    this.loading.present();

      // this is to get the scrolling fix working. must have one item on the list for it
      this.stubList.push("one");

      // -- analytics trackView
      this.ga.trackView('Report a Migraine');

      this.afAuth.authState.subscribe(auth => {

         this.uid = auth.uid;

         // this fixes the bug where it's keeping the old day to view if you close the app on this page
         // you load currentDayToView when you nav from this page - later
         //storage.get('dayToView').then((val) => {
            // this.currentDayToView = val;
            // this.storage.set("dayToView", 0);
          //});


        });
  }

  ionViewDidEnter() {

    this.initializeBackButtonCustomHandler();

    // get day to view
    this.storage.get('dayToView').then((val) => {
       this.dayToView = val;
       // set default migraine object
       this.migObj = {
            "type": "migraineEvent",
            "name": "Migraine",
            "uid": this.uid,
            "myDateTime": moment().add(this.dayToView, 'day').valueOf(),
            "imgname": "migraine",
            "amount": "5",
            "caf_related": "no",
            "caf_size": "no",
            "caf_mg": "no",
            "caf_mgPerUnit": "no",
            "durationHours": "04",
            "durationMinutes": "00",
            "treatmentsAssociated": "",
            "periodCycleDay": "0",
            "symptoms": "",
            "notes": ""
        };

        this.updateSev("5");

       // set default migraine object
       //this.migObj.myDateTime = moment().add(this.dayToView, 'day').valueOf();

       // set start time
       this.startTime = new Date(moment().add(this.dayToView, 'day').valueOf());

       // set date string
       this.theDateString = "Today";

       // yesterday
       if (val == -1) { this.theDateString = "Yesterday"; }

       // before today or yesterday
       if (val != 0 && val != 1) {
         this.theDateString = moment().add(this.dayToView, 'day').startOf('day').format('MMM DD').toString();
       }

       // get start and end for query
       var theStart = moment().add(this.dayToView, 'day').startOf('day');
       var theEnd = moment().add(this.dayToView, 'day').endOf('day');

       // query events
       this.events = this.db.list('/events/'+this.uid, {
         query: { orderByChild: 'myDateTime', startAt: theStart.valueOf(), endAt: theEnd.valueOf() }
       });

       // get migraine object that exists
       var theSub = this.events.subscribe((_items)=> {
           _items.forEach(item => {
               if (item.name == "Migraine") {
                 this.migObj = item;
                 var theamt = item.amount * 2;
                 this.startTime = new Date(item.myDateTime);
                 this.updateSev(JSON.stringify(theamt));
                 this.exists = true;
               }
           })
           theSub.unsubscribe();
       });

       if (this.loading) { this.loading.dismiss(); this.loading = null; }
       });
  }

  deleteMe() {
      console.log("delte migraine. day to view: ", this.dayToView);
      if (this.dayToView == 0) { this.storage.set("todayHasMigraine", false); }
      let alert = this.alertCtrl.create({
        //title: 'Migraine',
        message: 'Do you want to delete this migraine?',
        buttons: [ {
          text: 'No', role: 'cancel', handler: () => {
          } },
        {
          text: 'Yes', handler: () => {
            // add loader
            //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
            //this.loading.present();

            this.db.object('/events/'+this.uid+"/"+this.migObj.$key).remove();
            //this.storage.set("dayToView", this.currentDayToView);
            //this.myData.scoreUpdate_Period();

            //if (this.loading) { this.loading.dismiss(); this.loading = null; }
            this.navCtrl.setRoot(YourLogPage);
          } } ] });
      alert.present();
  }

  updateSev(num) {
      console.log('update Sev! num: ', num);
      this.migObj.amount = num;
      if (num == 0) { this.sev0On = true; } else { this.sev0On = false; }
      if (num == 1) { this.sev1On = true; } else { this.sev1On = false; }
      if (num == 2) { this.sev2On = true; } else { this.sev2On = false; }
      if (num == 3) { this.sev3On = true; } else { this.sev3On = false; }
      if (num == 4) { this.sev4On = true; } else { this.sev4On = false; }
      if (num == 5) { this.sev5On = true; } else { this.sev5On = false; }
      if (num == 6) { this.sev6On = true; } else { this.sev6On = false; }
      if (num == 7) { this.sev7On = true; } else { this.sev7On = false; }
      if (num == 8) { this.sev8On = true; } else { this.sev8On = false; }
      if (num == 9) { this.sev9On = true; } else { this.sev9On = false; }
      if (num == 10) { this.sev10On = true; } else { this.sev10On = false; }
      console.log('update Sev! num: ', num);
  }

  changeTime() {
    var theVal: any = document.getElementById('startTime');
    var theValString: string = theVal.value.substr(0,10);

    if (theValString) {
        var theValArray: any = theValString.split(':');
        var newTime: Date = new Date(moment().add(this.dayToView + 0, 'day').valueOf());
        newTime.setHours(theValArray[0],theValArray[1],0,0);
        // console.log("*** this.theDT 1: ", this.theDT);
        this.startTime = newTime;
        this.migObj.myDateTime = this.startTime.getTime();
    } else {
      let toast = this.toastCtrl.create({
          message: 'You must have a time.',
          duration: 1500, position: 'middle' });
      toast.present();
      return;
    }
  }


  touchDate() {
        let toast = this.toastCtrl.create({
            message: 'To change a migraine on a different date, go to the day of the migraine on Your Log.',
            duration: 2500, position: 'middle' });
        toast.present();
        return;
    }
    //console.log("** changeTime_timeInput **: ", theValString);
  /* was -  var theValArray: any = theValString.split(':');

    var newTime: Date = new Date(moment().add(this.dayToView + 0, 'day').valueOf());
    newTime.setHours(theValArray[0],theValArray[1],0,0);

    // console.log("*** this.theDT 1: ", this.theDT);
    this.startTime = newTime;
    this.migObj.myDateTime = this.startTime.getTime();
    //this.theDate = new Date(this.theDate);
    //this.theDateString = this.theDate.toString();
    //this.theDateString = new Date(this.theDate).toString();
    // console.log("*** this.theDT: ", this.theDT); */


  stopProp(event) {
    event.stopPropagation();
  }

  done() {
    // add loader
    //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    //this.loading.present();

      // save to DB
      this.migObj.myDateTime = this.startTime.getTime();

      // set amount
      this.migObj.amount = this.migObj.amount * 0.5;
      console.log('done. amount: ', this.migObj.amount);

      var isNumber =  /^\d+$/.test(this.migObj.durationHours);
      var isNumber2 =  /^\d+$/.test(this.migObj.durationMinutes);

      if (!isNumber || !isNumber2) {
        let alert = this.alertCtrl.create({
          title: 'Oops', message: 'Duration has to be numbers only.',
          buttons: [ {
            text: 'Ok', role: 'cancel', handler: () => {
            } } ] });
        alert.present();
        return;
      }

      //this.myData.migraineUpdateTreatments();

      if (this.exists) {
        this.db.object('/events/'+this.uid+"/"+this.migObj.$key).update( this.migObj );
        //this.storage.set("dayToView", this.currentDayToView);
        console.log('leaving report a migraine. exists. daytoview: ', this.dayToView);
        //this.myData.scoreUpdate_Period();
        this.navCtrl.setRoot(YourLogPage);
      } else {
        console.log("delte migraine. day to view: ", this.dayToView);
        if (this.dayToView == 0) { this.storage.set("todayHasMigraine", true); }
        this.events.push(this.migObj);
        //this.storage.set("dayToView", this.currentDayToView);
        console.log('leaving report a migraine. daytoview: ', this.dayToView);
        //this.myData.scoreUpdate_Period();
        this.navCtrl.setRoot(YourLogPage);
      }
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  // above - ionViewDidEnter() {  }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
