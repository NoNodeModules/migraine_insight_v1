import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

import { YourLogPage } from '../your-log/your-log';

@IonicPage()
@Component({
  selector: 'page-how-it-works',
  templateUrl: 'how-it-works.html',
})
export class HowItWorksPage {

  stubList: any = [];
  public unregisterBackButtonAction: any;

  constructor(private ga:GoogleAnalytics, public navCtrl: NavController, public navParams: NavParams, public platform: Platform) {
    this.stubList.push("one");
    this.ga.trackView("How It Works");
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
