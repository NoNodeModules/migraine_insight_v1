//import { Component, ViewChild } from '@angular/core';
//import { NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
//import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
//import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
//import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
//import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers

import { Component } from '@angular/core';
import { IonicPage, NavController, Tabs, Platform } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
//import { MyDataProvider } from '../../providers/my-data/my-data'; // MyData
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';  // Firebase
import { StatusBar } from '@ionic-native/status-bar';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';  // Storage

import { HomePage } from '../home';

//@IonicPage()
@Component({ selector: 'page-home-detail', templateUrl: 'home-detail.html' })
export class HomeDetailPage {

  public unregisterBackButtonAction: any;
  theBody: any = [];
  theTitle: any = [];
  theImageURL: any;
  //theArticle: any = [];
  theArticle: any;
  //myName: string;

    constructor(private storage: Storage, private platform: Platform, private ga: GoogleAnalytics, public navCtrl: NavController) {

      // -- analytics trackView
      this.ga.trackView('Home - Detail Article');

      this.storage.get("currentArticle").then((val) => {
          //this.theItem = val.body[0].value;
          //var thePost = JSON.parse(val);
          val = JSON.parse(val);
          //this.myName = val.name;
          this.theArticle = val; //JSON.parse(JSON.stringify(val));
          //val = JSON.parse(val.body);
          //console.log("thePost - ", thePost);
          //console.log("theArticle - ", this.theArticle);
          this.theTitle = this.theArticle.title[0].value;
          this.theImageURL = this.theArticle.field_image[0].url;
          this.theBody = this.theArticle.body[0].value;

          //console.log("theURL - ", this.theURL);

          //this.myNameLowerCase = val.name.toLowerCase();
          //this.tracker = val;
          //this.myScore = val.highestHighestScore;
      });

    }

ngAfterViewInit() {}

goToExplorer() {
  this.navCtrl.push(HomePage);
}


/* Android Leaving Code */
// public unregisterBackButtonAction: any; , public platform: Platform
ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
private customHandleBackButton(): void { this.navCtrl.setRoot(HomePage); }
/* END Android Leaving Code */

}
