import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup6Page } from '../setup6/setup6';

@IonicPage()
@Component({ selector: 'page-setup5', templateUrl: 'setup5.html', })
export class Setup5Page {

  // Variables
  overlay1: boolean = false;
  noCaf: boolean = true;
  on1: boolean = false;
  on2: boolean = false;
  on3: boolean = false;
  on4: boolean = false;
  on5: boolean = false;
  on6: boolean = false;
  on7: boolean = false;
  uid: any;

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController, private storage: Storage,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 5");
  }

  goTo() {
    // save to db
    if (this.on1) { this.myData.makeATracker(0, 'Loud Noise', 'triggerEvent','Add - Setup'); }
    if (this.on2) { this.myData.makeATracker(0, 'Plane Flight', 'triggerEvent','Add - Setup'); }
    if (this.on3) { this.myData.makeATracker(0, 'Sex', 'triggerEvent','Add - Setup'); }
    if (this.on4) { this.myData.makeATracker(0, 'Light Exercise', 'triggerEvent','Add - Setup'); }
    if (this.on5) { this.myData.makeATracker(0, 'Strenuous Exercise', 'triggerEvent','Add - Setup'); }
    if (this.on6) { this.myData.makeATracker(0, 'Insomnia', 'triggerEvent','Add - Setup'); }
    if (this.on7) { this.myData.makeATracker(0, 'Excessive Sleep', 'triggerEvent','Add - Setup'); }

    // go to page
    this.navCtrl.setRoot(Setup6Page);
  }

  pickTrigger(num) {
      // toggle tile
      if (num == 1) { if (this.on1) { this.on1 = false; } else { this.on1 = true; } }
      if (num == 2) { if (this.on2) { this.on2 = false; } else { this.on2 = true; } }
      if (num == 3) { if (this.on3) { this.on3 = false; } else { this.on3 = true; } }
      if (num == 4) { if (this.on4) { this.on4 = false; } else { this.on4 = true; } }
      if (num == 5) { if (this.on5) { this.on5 = false; } else { this.on5 = true; } }
      if (num == 6) { if (this.on6) { this.on6 = false; } else { this.on6 = true; } }
      if (num == 7) { if (this.on7) { this.on7 = false; } else { this.on7 = true; } }

      // turn off top tile if any are on below
      if (!this.on1 || !this.on2 || !this.on3 || !this.on4 || !this.on5 || !this.on6 || !this.on7) { this.noCaf = true; }
      if (this.on1 || this.on2 || this.on3 || this.on4 || this.on5 || this.on6 || this.on7) { this.noCaf = false; }
  }
}
