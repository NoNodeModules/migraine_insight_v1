import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { MyDataProvider } from '../../../providers/my-data/my-data'; // MyData
import { Setup4Page } from '../setup4/setup4';

@IonicPage()
@Component({ selector: 'page-setup3', templateUrl: 'setup3.html', })
export class Setup3Page {

  // Variables
  overlay1: boolean = false;
  noAl: boolean = true;
  uid: any;
  triggerList: any[];

  // Constructor
  constructor(private ga: GoogleAnalytics, public navCtrl: NavController, private storage: Storage,
  public toastCtrl: ToastController, public navParams: NavParams, db: AngularFireDatabase,
  public afAuth: AngularFireAuth, private myData: MyDataProvider) {
      this.afAuth.authState.subscribe(auth => { if (auth) { this.uid = auth.uid; } });

      this.triggerList = [
    		{ "name": "Beer", "onoff": false },
        { "name": "White Wine", "onoff": false },
    		{ "name": "Red Wine", "onoff": false },
    		{ "name": "Liquor", "onoff": false }
  	];
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 3");
  }

  goTo() {
      // save to db
      this.triggerList.forEach(trig => {
            if (trig.onoff) {
                this.myData.makeATracker(0, trig.name, 'triggerEvent','Add - Setup');
            }
      });
      // go to page
      this.navCtrl.setRoot(Setup4Page);
  }

  pickTrigger(trig) {
      // console.log('thevar: ', trig);
      if (trig.onoff) { trig.onoff = false; } else { trig.onoff = true; }
      this.noAl = false;
      var countOfTrig: number = 0;
      this.triggerList.forEach(trig => { if (trig.onoff == true) { countOfTrig++; } });
      if (countOfTrig == 0) { this.noAl = true; }
  }

  noAlcohol() {
      // turn off tiles and turn on top tile
      this.triggerList.forEach(trig => { trig.onoff = false; });
      this.noAl = true;
  }

}
