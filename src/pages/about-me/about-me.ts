import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from 'ionic-angular';
import { ResetpwdPage } from '../resetpwd/resetpwd';
import { Storage } from '@ionic/storage';  // Storage
//import { LoginPage } from '../login/login';

//import { LoginService } from "../../app/login/login.service";
//import { LoginComponent } from "../../app/login/login.component";
import { YourLogPage } from '../your-log/your-log';
import { TrackersPage } from '../trackers/trackers';

// **** PAGE **** //
@IonicPage()
@Component({ selector: 'page-about-me', templateUrl: 'about-me.html', })
export class AboutMePage {

  // remove in cleanup? hideChangePassword = false;
  public unregisterBackButtonAction: any;

  constructor(public loadingCtrl: LoadingController, private alertCtrl: AlertController, private navCtrl: NavController, private storage: Storage, private db: AngularFireDatabase, public navParams: NavParams,
    public afAuth: AngularFireAuth, public platform: Platform) {
  };

  goToTrackers() {
        this.navCtrl.push(TrackersPage);
   }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
