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
import { LoginComponent } from "../../app/login/login.component";
import { YourLogPage } from '../your-log/your-log';

// **** PAGE **** //
@IonicPage()
@Component({ selector: 'page-account', templateUrl: 'account.html', })
export class AccountPage {
  useremail: string;
  currentDB: string;
  hideCurrentDB: boolean = true;
  uid: any;
  loading: any;
  registrationDate: Date = new Date();
  oLay1Hide: boolean = true;
  // remove in cleanup? hideChangePassword = false;
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
        //console.log('val: ', new Date(val));
        //console.log('this.registrationDate: ', this.registrationDate);
        //console.log('this.registrationDatetime: ', this.registrationDate.getTime());
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


    // should be this?
    //this.navCtrl.setRoot(MenuComponent);
    //this.nav.push(LoginPage);

    //this.navCtrl.setRoot(YourLogPage);
    //this.navCtrl.push(LoginComponent);

    //this.navCtrl.push(LoginComponent).then(() => {
    //  const index = this.navCtrl.getActive().index;
    //  this.navCtrl.remove(0, index);
    //});

    //this.navCtrl.push(MenuComponent);
    window.location.reload();


    //this.navCtrl.popToRoot();

    //this.loginService.logout();
    //this.navCtrl.push();
    //this.navCtrl.parent.parent.setRoot(YourLogPage);
    //this.navCtrl.componentStack.push({ page: LoginComponent });
    //this.navCtrl.push(LoginComponent);
    //this.navCtrl.rootNav.setRoot(LoginComponent);
    //this.getRootNav().setRoot(LoginComponent);

  }

/*  logout() {
    this.afAuth.auth.signOut();
    this.navCtrl.setRoot(LoginPage); //.then(() => {
        //this.navCtrl.remove(this.viewCtrl.index);
      //});

    //this.navCtrl.setRoot(LoginPage);
  } */

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
            //$deleteUser()  // https://github.com/firebase/angularfire/blob/master/docs/migration/1XX-to-2XX.md
            user.delete().then(function() {
            // User deleted.
            console.log("deleted");
            }, function(error) {
            // An error happened.
            console.log("error in deleting: ", error);
            });
        } } ] });
    alert.present();
    // return;
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
