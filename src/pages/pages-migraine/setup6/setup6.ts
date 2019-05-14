import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup7Page } from '../setup7/setup7';

@IonicPage()
@Component({ selector: 'page-setup6', templateUrl: 'setup6.html', })
export class Setup6Page {

  // Variables
  period: boolean = true;
  uid: any;

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController, private storage: Storage,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 6");
  }

  goTo() {
    // save to db
    if (this.period) { this.myData.makeATracker(0, 'Period', 'triggerEvent','Add - Setup'); }

    // go to page
    this.navCtrl.setRoot(Setup7Page);
  }
}
