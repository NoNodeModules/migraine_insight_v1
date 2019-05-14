import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
//import firebase from 'firebase';  // Firebase
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup8Page } from '../setup8/setup8';

@IonicPage()
@Component({ selector: 'page-setup7', templateUrl: 'setup7.html', })
export class Setup7Page {

  // Variables
  mag: boolean = true;
  uid: any;

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 7");
  }

  goTo() {
    // save to db
    if (this.mag) { this.myData.makeATracker(0, 'Magnesium', 'treatmentEvent','Add - Setup'); }

    // go to page
    this.navCtrl.setRoot(Setup8Page);
  }
}
