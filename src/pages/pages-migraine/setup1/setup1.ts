import { Component } from '@angular/core';    // Core
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'; // Page, etc.
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { Storage } from '@ionic/storage';  // Storage
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';  // Firebase
import { StatusBar } from '@ionic-native/status-bar';  // StatusBar
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard
import { Setup2Page } from '../setup2/setup2';  // pages
import moment from 'moment'; // moment
// import moment from 'moment'; // moment

@IonicPage()
@Component({ selector: 'page-setup1', templateUrl: 'setup1.html', })
export class Setup1Page {

  // Variables
  uid: any;
  perMonth: any;
  users: FirebaseListObservable<any>;
  overlay1: boolean = false;

  // Constructor
  constructor(private statusBar: StatusBar, private ga: GoogleAnalytics, public navCtrl: NavController,
  private keyboard: Keyboard, private storage: Storage,
  public toastCtrl: ToastController, public afAuth: AngularFireAuth,
  public navParams: NavParams, private db: AngularFireDatabase) {
    //this.users = db.list('/users');
    this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;
          console.log("IN setup1");
          //var tzOffset = new Date().getTimezoneOffset()/60;
          // save registration date
          var tzOffset = new Date().getTimezoneOffset()/60;
          var regDate = new Date(moment().subtract(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
          console.log('regDate: ', regDate);
          this.storage.set('registrationDate', regDate);

          this.db.object('/users/' + this.uid).update({ registrationDate: regDate, useremail: auth.email });

          this.statusBar.backgroundColorByHexString("#eff6fb");
          //var regDate = new Date(moment.utc().subtract(tzOffset,'hours').valueOf()).setHours(0,0,0,0);
          //var regDate = new Date().getTime(); //.setHours(0,0,0,0);
          //console.log("set reg date: ", regDate);
          //console.log("set reg date: ", new Date(regDate));
          //this.storage.set('registrationDate', regDate);
          //this.db.object('/users/' + this.uid).update({ registrationDate: regDate });
     });
  }

  ionViewDidLoad() {
      // -- analytics trackView
      this.ga.trackView("Setup 1");
  }

goNow() {
     this.db.object('/users/' + this.uid).update({
       perMonth: this.perMonth.toString()
     });

    // go to next page
    this.navCtrl.setRoot(Setup2Page);
}

  closeOverlay(overlayName) {
    this.overlay1 = false;
  }

  showOverlay() {
      // show the error overlay or the other one
      var isNumber =  /^\d+$/.test(this.perMonth);
      if (!isNumber) {
          let toast = this.toastCtrl.create({
              message: 'Please enter a number to continue.',
              duration: 2500, position: 'middle' });
          toast.present();
      } else {
          this.keyboard.close();
          this.overlay1 = true;
      }
  }


}
