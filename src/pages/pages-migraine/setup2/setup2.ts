import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup3Page } from '../setup3/setup3';

@IonicPage()
@Component({ selector: 'page-setup2', templateUrl: 'setup2.html', })
export class Setup2Page {

  // Variables
  overlay1: boolean = false;
  noCaf: boolean = true;
  on1: boolean = false;
  on2: boolean = false;
  on3: boolean = false;
  on4: boolean = false;
  on5: boolean = false;
  uid: any;

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController, private storage: Storage,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 2");
  }

  goTo() {
    // save to db
    console.log('setup 2. goto: this.uid: ');
    if (this.on1) { this.myData.makeATracker(0, 'Coffee', 'triggerEvent','Add - Setup'); }
    if (this.on2) { this.myData.makeATracker(0, 'Tea', 'triggerEvent','Add - Setup'); }
    if (this.on3) { this.myData.makeATracker(0, 'Chocolate', 'triggerEvent','Add - Setup'); }
    if (this.on4) { this.myData.makeATracker(0, 'Soda Pop', 'triggerEvent','Add - Setup'); }
    if (this.on5) { this.myData.makeATracker(0, 'Diet Soda Pop', 'triggerEvent','Add - Setup'); }

    // go to page
    this.navCtrl.setRoot(Setup3Page);
  }

  pickTrigger(num) {
      // toggle tile
      if (num == 1) { if (this.on1) { this.on1 = false; } else { this.on1 = true; } }
      if (num == 2) { if (this.on2) { this.on2 = false; } else { this.on2 = true; } }
      if (num == 3) { if (this.on3) { this.on3 = false; } else { this.on3 = true; } }
      if (num == 4) { if (this.on4) { this.on4 = false; } else { this.on4 = true; } }
      if (num == 5) { if (this.on5) { this.on5 = false; } else { this.on5 = true; } }

      // turn off top tile if any are on below
      this.noCaf = false;
      //if (!this.on1 || !this.on2 || !this.on3 || !this.on4 || !this.on5) { this.noCaf = true; }
      if (!this.on1 && !this.on2 && !this.on3 && !this.on4 && !this.on5) { this.noCaf = true; }
  }

  noCaffeine() {
      // turn off tiles and turn on top tile
      this.on1 = false;
      this.on2 = false;
      this.on3 = false;
      this.on4 = false;
      this.on5 = false;
      this.noCaf = true;
  }
}
