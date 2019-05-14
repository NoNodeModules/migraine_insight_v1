import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup5Page } from '../setup5/setup5';

@IonicPage()
@Component({ selector: 'page-setup4', templateUrl: 'setup4.html', })
export class Setup4Page {

  // Variables
  overlay1: boolean = false;
  on1: boolean = false;
  on2: boolean = false;
  on3: boolean = false;
  on4: boolean = false;
  on5: boolean = false;
  on6: boolean = false;
  on7: boolean = false;
  on8: boolean = false;
  uid: any;
  triggerList: any[];
  o1hide = true;

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController, private storage: Storage,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });

      this.triggerList = [
    		{ "name": "Soft Cheese", "onoff": false },
        { "name": "Hard Cheese", "onoff": false },
    		{ "name": "Milk", "onoff": false },
    		{ "name": "Salty Food", "onoff": true },
    		{ "name": "Smoked Food", "onoff": false },
    		{ "name": "Citrus Fruit", "onoff": false },
        { "name": "MSG", "onoff": false },
    		{ "name": "Artificial Sweetener", "onoff": false}
  	];
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 4");
  }

  goTo() {
    // save to db
    if (this.on1) { this.myData.makeATracker(0, 'Soft Cheese', 'triggerEvent','Add - Setup'); }
    if (this.on2) { this.myData.makeATracker(0, 'Hard Cheese', 'triggerEvent','Add - Setup'); }
    if (this.on3) { this.myData.makeATracker(0, 'Milk', 'triggerEvent','Add - Setup'); }
    if (this.on4) { this.myData.makeATracker(0, 'Citrus Fruit', 'triggerEvent','Add - Setup'); }
    if (this.on5) { this.myData.makeATracker(0, 'MSG', 'triggerEvent','Add - Setup'); }
    if (this.on6) { this.myData.makeATracker(0, 'Artifical Sweetner', 'triggerEvent','Add - Setup'); }
    if (this.on7) { this.myData.makeATracker(0, 'Salty Food', 'triggerEvent','Add - Setup'); }
    if (this.on8) { this.myData.makeATracker(0, 'Smoked Food', 'triggerEvent','Add - Setup'); }

    // go to page
    this.navCtrl.setRoot(Setup5Page);
  }

  pickTrigger(num) {
      if (num == 1) { if (this.on1) { this.on1 = false; } else { this.on1 = true; } }
      if (num == 2) { if (this.on2) { this.on2 = false; } else { this.on2 = true; } }
      if (num == 3) { if (this.on3) { this.on3 = false; } else { this.on3 = true; } }
      if (num == 4) { if (this.on4) { this.on4 = false; } else { this.on4 = true; } }
      if (num == 5) { if (this.on5) { this.on5 = false; } else { this.on5 = true; } }
      if (num == 6) { if (this.on6) { this.on6 = false; } else { this.on6 = true; } }
      if (num == 7) { if (this.on7) { this.on7 = false; } else { this.on7 = true; } }
      if (num == 8) { if (this.on8) { this.on8 = false; } else { this.on8 = true; } }
  }
}
