import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ToastController, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';
import { YourLogPage } from '../your-log/your-log';
import { StatusBar } from '@ionic-native/status-bar';  // StatusBar

@Component({
  selector: 'page-resetpwd',
  templateUrl: 'resetpwd.html'
})
export class ResetpwdPage {

  public resetpwdForm;
  emailChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;
  //public unregisterBackButtonAction: any; , public platform: Platform

  constructor(public statusBar: StatusBar, private toastCtrl: ToastController, private ga: GoogleAnalytics, public navCtrl: NavController, public afAuth: AngularFireAuth, public navParams: NavParams, public formBuilder: FormBuilder,public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

    // add loader
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
    content: 'Loading', spinner: 'bubbles' });

    // statusBar
    // dark purple - this.statusBar.backgroundColorByHexString("#3d60b3");
    this.statusBar.backgroundColorByHexString("#6cb4dc");

    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.resetpwdForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
    });
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  resetPwd() {
    if (!this.resetpwdForm.valid){
      // console.log(this.resetpwdForm.value);
    } else {

      // show loader
      //this.loading.present();

      // send reset
      this.afAuth.auth.sendPasswordResetEmail(this.resetpwdForm.value.email).then( afAuth => {

        let toast = this.toastCtrl.create({
            message: 'A password reset link was sent to your email. Thank you!',
            duration: 2500, position: 'middle' });
        toast.present();
        //this.navCtrl.setRoot(YourLogPage);
        this.navCtrl.pop();
      }, error => {
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
            buttons: [
              {
                text: "Ok",
                role: 'cancel'
              }
            ]
          });
          alert.present();
        });
      });
    }
  }

  /* Android Leaving Code  NEEDED? check for login status */
  // public unregisterBackButtonAction: any; , public platform: Platform
  //ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  //ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  //public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  /**  */private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
