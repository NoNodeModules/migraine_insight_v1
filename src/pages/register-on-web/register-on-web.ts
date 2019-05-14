import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LoginComponent } from "../../app/login/login.component";
import { YourLogPage } from '../your-log/your-log';

/**
 * Generated class for the RegisterOnWebPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register-on-web',
  templateUrl: 'register-on-web.html',
})
export class RegisterOnWebPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad RegisterOnWebPage');
  }

  goToLogin() {
    //this.navCtrl.pop();
    //this.navCtrl.setRoot(LoginComponent);
    this.navCtrl.push(LoginComponent).then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    });
    //window.location.reload();
  }

  swipeEvent(e) { // disable it!
    e.stopPropagation();
   if(e.direction == '2') {
    }
    else if(e.direction == '4'){
    }
  }

}
