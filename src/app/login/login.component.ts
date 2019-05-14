import { Component } from '@angular/core';
//import { LoginService } from "./login.service";
//import {NavController} from "ionic-angular/index";

// REFERENCE - https://javebratt.com/ionic-2-facebook-login/
//import { Component } from '@angular/core';
//import { LoginService } from "./login.service";
import moment from 'moment'; // moment
import { NavController, AlertController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { StatusBar } from '@ionic-native/status-bar';  // StatusBar
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import firebase from 'firebase';  // Firebase
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { Storage } from '@ionic/storage';  // Storage
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';  // Facebook

import { RegisterPage } from '../../pages/register/register';
import { ResetpwdPage } from '../../pages/resetpwd/resetpwd';
//import { Setup1Page } from '../../pages/setup1/setup1';
import { MenuComponent } from "../../app/menu.component";
import { TabsPage } from '../../pages/tabs/tabs';

@Component({ templateUrl: 'login.html' })

export class LoginComponent {

    uid: any;
    user: Observable<firebase.User>;
    public loginForm;
    emailChanged: boolean = false;
    submitAttempt: boolean = false;
    loading: any;
    errormessage: string;
    userProfile: any = null;
    onWeb: boolean = false;

  //constructor(private loginService: LoginService, private nav: NavController) {}
  constructor(private statusBar: StatusBar, public navCtrl: NavController, private myData: MyDataProvider,
    private ga: GoogleAnalytics, private storage: Storage, private db: AngularFireDatabase, public navParams: NavParams, public formBuilder: FormBuilder,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    public afAuth: AngularFireAuth, private facebook: Facebook, private toastCtrl: ToastController) {

      this.facebook.browserInit(1808477442542137, 'v2.7');
      //this.fb.browserInit(this.FB_APP_ID, "v2.8");

      //this.user = afAuth.authState;
      let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });

      storage.get('onWeb').then((val) => {
        if (val == "true") { this.onWeb = true; }
       });

       this.statusBar.backgroundColorByHexString("#3d60b3");
       //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
       //content: 'Loading', spinner: 'bubbles' });
}

login() {
    this.ga.trackEvent('Login', 'Login Attempt');
    console.log("login! in login component");

    // show loader
    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    this.loading.present();

    this.afAuth.auth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password).then( authService => {
         // success!
         this.afAuth.authState.subscribe(auth => {
               this.loading.dismiss();

               this.uid = auth.uid;
               this.db.object('/users/'+this.uid).subscribe(user => {
                     this.storage.clear();
                     //var regDate = new Date(moment.utc(user.registrationDate).add(new Date(user.registrationDate).getTimezoneOffset()/60,'hours').valueOf()).setHours(0,0,0,0);
                     //this.storage.set('registrationDate', regDate);
                     //console.log("user: ", user);
                     //console.log("Setting reg date: ", new Date(regDate));
                     //console.log("Setting reg date: ", new Date(user.registrationDate));
                     //this.storage.set('registrationDate', new Date(user.registrationDate).setHours(0,0,0,0));
                     var tzOffset = new Date(user.registrationDate).getTimezoneOffset()/60;
                     var regDate = new Date(moment.utc(user.registrationDate).add(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
                     this.storage.set('registrationDate', regDate);

                     //this.storage.set('promptAppRate', 0);
                     //console.log("going to your log!!");
                     this.navCtrl.push(TabsPage).then(() => {
                          const index = this.navCtrl.getActive().index;
                          this.navCtrl.remove(0, index);
                      });
              });
          });
        }, error => {
            this.loading.dismiss();
            //console.log('Dismissed 2 on login error!');
            this.errormessage = error.message;
            this.ga.trackEvent('Login', 'ERROR Login Attempt', error.message);
    });
  }


  facebookLogin() {

        console.log("Attempting facebook login.");

          // are we logged into facebook?
          this.facebook.login(['email']).then( (response) => {
          const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

          this.ga.trackEvent('Login', 'Login Attempt FB')
          firebase.auth().signInWithCredential(facebookCredential)
          .then((success) => {
              //console.log("start - logged in. success: ", JSON.stringify(success));
              // success!
              this.afAuth.authState.subscribe(auth => {
                    this.uid = auth.uid;
                    this.db.object('/users/'+this.uid).subscribe(user => {
                            this.storage.clear();
                            //console.log('1 Snapshot result: ' + JSON.stringify(user));

                            if (user.$value === null) {

                                let toast = this.toastCtrl.create({
                                    message: 'Please check the checkbox and the register button to continue.',
                                    duration: 3000, position: 'middle' });
                                toast.present();

                                console.log("user doesn't exist");
                                //var user = firebase.auth().currentUser;

                                firebase.auth().currentUser.delete(); //.then(function() {
                                  // User deleted.
                                //}, function(error) {
                                  // An error happened.
                                //});

                                 // navigate
                                 this.navCtrl.push(RegisterPage).then(() => {
                                   const index = this.navCtrl.getActive().index;
                                   this.navCtrl.remove(0, index);
                                 });

                            } else {
                                console.log("there is a user, user.registrationDate: ", user.registrationDate);
                                //this.storage.set('registrationDate', user.registrationDate); //moment(user.registrationDate).startOf('day').valueOf());
                                //var regDate = new Date(moment.utc(user.registrationDate).add(new //Date(user.registrationDate).getTimezoneOffset()/60,'hours').valueOf()).setHours(0,0,0,0);
                                //this.storage.set('registrationDate', regDate);

                                console.log("Setting reg date: ", new Date(user.registrationDate));
                                //this.storage.set('registrationDate', new Date(user.registrationDate).setHours(0,0,0,0));
                                var tzOffset = new Date(user.registrationDate).getTimezoneOffset()/60;
                                var regDate = new Date(moment.utc(user.registrationDate).add(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
                                this.storage.set('registrationDate', regDate);

                                //this.navCtrl.setRoot(YourLogPage);
                                //this.navCtrl.pop();
                                //this.navCtrl.push(MenuComponent);
                                //this.navCtrl.popToRoot();
                                this.navCtrl.push(TabsPage).then(() => {
                                  const index = this.navCtrl.getActive().index;
                                  this.navCtrl.remove(0, index);
                                });
                            }
                        });
                  });
             })
          .catch((error) => {
              //console.log("Firebase failure error coming.");
              //console.log("Firebase failure: " + JSON.stringify(error));
              this.errormessage = JSON.stringify(error), " There has been an error. You may need to reset your password and login using the email and password fields."; //error.message;
              this.ga.trackEvent('Login', 'ERROR Login Attempt FB'); //, JSON.stringify(error));
              // the only error I'm getting is from when the FB email has been reset, so you can't
              // login with FB anymore. you have to go email style.
          });
          }).catch((error) => {
            //console.log("error here:");
            //console.log(error);
            this.errormessage = error.message;
            //if (error.contains("using a provider associated")) {
            //  console.log("error! USING A PROVIDER ASSOCIATED");
            //  this.errormessage = "This account exists. But, it wasn't made using Facebook. Try logging in without Facebook."; //error.message;
            //}
            this.ga.trackEvent('Login', 'ERROR Login Attempt FB'); //, JSON.stringify(error));
          });

    }

    elementChanged(input){
      let field = input.inputControl.name;
      this[field + "Changed"] = true;
    }

    register(){
      this.navCtrl.push(RegisterPage);
    }

    resetPwd(){
      this.navCtrl.push(ResetpwdPage);
    }

    ionViewDidEnter() {
        // -- analytics trackView
        this.ga.trackView("Login");
        this.statusBar.backgroundColorByHexString("#3d60b3");
    }

    swipeEvent(e) { // disable it!
      e.stopPropagation();
      if(e.direction == '2') {
          //this.forwardOneDay();
          //this.content.scrollToTop();
      }
      else if(e.direction == '4'){
          //this.backOneDay();
          //this.content.scrollToTop();
      }
    }

  /* login(username) {
    this.loginService.login(username);
    this.navCtrl.pop();
  } */
}
