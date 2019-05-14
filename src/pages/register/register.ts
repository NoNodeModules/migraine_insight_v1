import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ToastController, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';  // Storage
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import firebase from 'firebase';  // Firebase
import { Facebook } from '@ionic-native/facebook';  // Facebook
import moment from 'moment'; // moment
import { StatusBar } from '@ionic-native/status-bar';  // StatusBar

// import { InAppBrowser } from 'ionic-native'; // in-app

// import { LoginService } from "../../app/login/login.service";
import { LoginComponent } from "../../app/login/login.component";

// Pages
import { Setup1Page } from '../pages-migraine/setup1/setup1';
//import { LoginPage } from '../login/login';
import { YourLogPage } from '../your-log/your-log';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  public registerForm;
  uid: any;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;
  errormessage: string;
  userProfile: any = null;
  terms: boolean;
  buttonFBDisabled: boolean = false;
  buttonRDisabled: boolean = false;
  public unregisterBackButtonAction: any;
  onWeb: string = "onWeb";

  constructor(public statusBar: StatusBar, private ga: GoogleAnalytics, public navCtrl: NavController, private myData: MyDataProvider,
  public afService: AngularFireAuth, private storage: Storage, public navParams: NavParams,
  private facebook: Facebook, public formBuilder: FormBuilder, public alertCtrl: AlertController,
  public loadingCtrl: LoadingController, private db: AngularFireDatabase, private toastCtrl: ToastController, public platform: Platform) {

    // add loader
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
    content: 'Loading', spinner: 'bubbles' });

    // statusBar
    this.statusBar.backgroundColorByHexString("#3d60b3");

    //this.user = afAuth.authState;
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.registerForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      // fullname: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    storage.get('onWeb').then((val) => {
      this.onWeb = val;
     });
  }

  elementChanged(input){
      let field = input.inputControl.name;
      this[field + "Changed"] = true;
  }

  doRegister(){
    if (!this.buttonRDisabled) {
        this.buttonRDisabled = true;
        setTimeout(() => { this.buttonRDisabled = false; }, 4000);
        this.submitAttempt = true;

    if (!this.terms) {
            this.errormessage = "Please accept the terms of use and policies to register.";
            this.buttonRDisabled = false;
            this.buttonFBDisabled = false;
            return;
    }

    //if (!this.registerForm.valid){
    //  console.log(this.registerForm.value);
    //} else {
    //createUserWithEmailAndPassword (email : string , password : string ) : firebase.Promise < any > ;
      this.ga.trackEvent('Register', 'Register Attempt');
      this.afService.auth.createUserWithEmailAndPassword(this.registerForm.value.email, this.registerForm.value.password).then( authService => {

              //this.storage.set('surveyDone', "no");
              //this.storage.set('setupDone', "no");
              //this.storage.set('ProFirstTimeInCalendar', "yes");
              this.storage.set('calendarFirstTime', true);
              //this.storage.set('promptAppRate', 0);
              //this.storage.set("appRateNeverAsk", false);
              this.myData.initMeClearDataFirst();
              this.storage.clear();

              // save registration date !! this is also on setup 1.
              //var tzOffset = new Date().getTimezoneOffset()/60;
              //var regDate = new Date(moment.utc().subtract(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
              //console.log('regDate: ', regDate);
              //this.storage.set('registrationDate', regDate);
              //this.db.object('/users/' + authService.uid).update({ registrationDate: regDate });

              // navigate
              this.navCtrl.push(Setup1Page).then(() => {
                const index = this.navCtrl.getActive().index;
                this.navCtrl.remove(0, index);
              });

      }, error => {
        //this.loading.dismiss().then( () => {
          this.errormessage = error.message;
          this.buttonRDisabled = false;
          this.buttonFBDisabled = false;
        //});
      });

      // show loader
      //this.loading.present();
    //}
  }
  }

  signupWithFB() {
    if (!this.buttonFBDisabled) {
        this.buttonFBDisabled = true;
        setTimeout(() => { this.buttonFBDisabled = false; }, 4000);
        this.ga.trackEvent('Register', 'Register Attempt FB');
        if (!this.terms) {
            this.errormessage = "Please accept the terms of use and policies to register.";
            this.buttonRDisabled = false;
            this.buttonFBDisabled = false;
            return;
        }

          // show loader
          //this.loading.present();

          // FACEBOOK login - logged in?
          this.facebook.getLoginStatus().then( (response) => {

              // logged in to facebook.
              if(response.status == "connected") {
                console.log("1: getloginstatus: connected!");
                const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
                this.goLoginFirebaseWithCreds(facebookCredential);

              // not logged in to facebook.
              } else {

                  console.log("3: facebook.login: try to log in to Firebase!");

                  // login to facebook.
                  this.facebook.login(['email']).then( (response) => {
                    console.log("3: logged in. try to log in to Firebase!");
                    const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
                    this.goLoginFirebaseWithCreds(facebookCredential);
                  });
                }
            });
      }
  }


goLoginFirebaseWithCreds(facebookCredential) {
      firebase.auth().signInWithCredential(facebookCredential)
      .then((success) => {
          console.log("2: signinwithcredential: Firebase success: "); // + JSON.stringify(success));
          this.userProfile = success;
          this.uid = success.uid;
          this.FBRegisterSuccess(success);
      })
      .catch((error) => {
          console.log("2: fail: signinwithcredential: Firebase failure: "); // + JSON.stringify(error));
          this.ga.trackEvent('Register', 'ERROR - Register Attempt');
          this.errormessage = error.message; // + " " + error.email;
          this.buttonRDisabled = false;
          this.buttonFBDisabled = false;
      });
}


  FBRegisterSuccess(result) {
        console.log('fbregistersuccess: result! result.uid: ', result.uid); //, JSON.stringify(result));
        var thisR = this.db.object('/users/' + result.uid);

          //console.log('period setting hhS: ', hhS);
          //if (_items.hasChild(result.uid)) {

              //console.log('period setting hhS: ', hhS);
              var theSub = thisR.subscribe((_items)=> {
                  //console.log("_items: ", JSON.stringify(_items));
                  //console.log("_items.value: ", _items.$value);

                  if (_items.$value === null) {
                    console.log("user doesn't exist");
                    this.storage.set('calendarFirstTime', true);
                    //this.storage.set('promptAppRate', 0);
                    this.myData.initMeClearDataFirst();
                    this.storage.clear();

                    //var tzOffset = new Date().getTimezoneOffset()/60;
                    //var regDate = new Date(moment.utc().subtract(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
                    //this.storage.set('registrationDate', regDate);

                     //this.db.object('/users/' + result.uid).update({ registrationDate: regDate });

                     // navigate
                     this.navCtrl.push(Setup1Page).then(() => {
                       const index = this.navCtrl.getActive().index;
                       this.navCtrl.remove(0, index);
                     });
                  } else {
                    console.log("there is an user");
                    let toast = this.toastCtrl.create({
                        message: 'The facebook account you are logged into exists on Migraine Mechanic already. Please Login.',
                        duration: 2500, position: 'middle' });
                    toast.present();
                    //this.navCtrl.setRoot(YourLogPage);
                  }
                  /* _items.forEach(item => {
                    console.log("item.$key: ", item.$key);
                    console.log("item.$id: ", item.$id);
                    if (item.$key == result.uid) {
                        alert('subscribe test - user exists!!');
                    } else {
                      alert('subscribe test - user does not exist!!');
                    }
                  }); */
                  theSub.unsubscribe();
              });

  }

  goToLogin(){
    //this.navCtrl.pop();
    //this.navCtrl.setRoot(LoginComponent);
    this.navCtrl.push(LoginComponent).then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    });
    //window.location.reload();
  }

  ionViewDidLoad() {
      // -- analytics trackView
      console.log(" -- took out! about to trackview on register (and, on login page)");
      this.ga.trackView("Register");
  }

  swipeEvent(e) { // disable it!
    e.stopPropagation();
   if(e.direction == '2') {
    }
    else if(e.direction == '4'){
    }
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
