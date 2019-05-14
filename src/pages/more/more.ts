import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from 'ionic-angular';
import { ResetpwdPage } from '../resetpwd/resetpwd';
import { Storage } from '@ionic/storage';  // Storage

import { LoginComponent } from "../../app/login/login.component";
import { YourLogPage } from '../your-log/your-log';

// **** PAGE **** //
@IonicPage()
@Component({ selector: 'page-more', templateUrl: 'more.html', })
export class MorePage {
  useremail: string;
  currentDB: string;
  hideCurrentDB: boolean = true;
  uid: any;
  loading: any;
  registrationDate: Date = new Date();
  oLay1Hide: boolean = true;

  public unregisterBackButtonAction: any;

  constructor(public loadingCtrl: LoadingController, private alertCtrl: AlertController, private navCtrl: NavController, private storage: Storage, private db: AngularFireDatabase, public navParams: NavParams,
    public afAuth: AngularFireAuth, public platform: Platform) {

      // add loader
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
      content: 'Loading', spinner: 'bubbles' });

      this.afAuth.authState.subscribe(user => {
          this.uid = user.uid;
          console.log("auth ... : ", user.providerData[0].providerId);
          if (user.providerData[0].providerId !== "password") {
            // - why did I have this? I dunno ... this.hideChangePassword = true;
          }

          if (user && user.uid) {
            this.useremail = user.email;
          }
      });

      //reg date
      storage.get('registrationDate').then((val) => {
        this.registrationDate = new Date(val);
      });

      storage.get('currentDB').then((val) => {
         this.currentDB = val;
         console.log("Account page: currentDB: ", this.currentDB);
       });
  };

  logout2() {
    console.log("logout2 from account");
    this.loading.present();
    this.afAuth.auth.signOut();
    window.location.reload();
  }

  resetPwd(){
    this.navCtrl.push(ResetpwdPage);
  }

  deleteAcct() {
    console.log("Delete account");
    let alert = this.alertCtrl.create({
      message: 'Do you want to delete your account? This cannot be undone.',
      buttons: [ {
        text: 'No', role: 'cancel', handler: () => {
        } },
      {
        text: 'Yes', handler: () => {
            var user = firebase.auth().currentUser;
            console.log("deleting! currentUser: ", firebase.auth().currentUser);
            user.delete().then(function() {
            // User deleted.
            console.log("deleted");
            }, function(error) {
            // An error happened.
            console.log("error in deleting: ", error);
            });
        } } ] });
    alert.present();
  }

  /* Android Leaving Code */
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
