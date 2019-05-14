import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { YourLogPage } from '../pages/your-log/your-log';
import { AccountPage } from '../pages/account/account';
import { CalendarPage } from '../pages/calendar/calendar';
import { HowItWorksPage } from '../pages/how-it-works/how-it-works';
import { PrintReportPage } from '../pages/print-report/print-report';
import { ReportAMigrainePage } from '../pages/report-a-migraine/report-a-migraine';
import { ResultsMainPage } from '../pages/results-main/results-main';
import { TrackersPage } from '../pages/trackers/trackers';

import { Storage } from '@ionic/storage';  // Storage

import { AlertController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard

@Component({
  templateUrl: 'menu.html'
})
export class MenuComponent {
  @ViewChild('content') nav: Nav;

  rootPage: any = YourLogPage;

  pages: Array<{title: string, component: any}>;
  YourLogLink: any;
  AccountLink: any;
  CalendarLink: any;
  HowItWorksLink: any;
  PrintReportLink: any;
  ReportAMigraineLink: any;
  ResultsMainLink: any;
  TrackersLink: any;
  todayHasMigraine: boolean = false;
  onWeb: boolean = false;


  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              public menuCtrl: MenuController, private keyboard: Keyboard, private storage: Storage,
              private alertCtrl: AlertController) {

    this.menuCtrl.swipeEnable(false);

    /* this.pages = [
      { title: 'Your Log', component: YourLogPage },
      { title: 'Account', component: AccountPage }
    ]; */

    // mobile web version changes
    //storage.get('onWeb').then((val) => {
    if (document.URL.startsWith('http')) {
      console.log("MENU onWeb: true");
      this.onWeb = true;
    }

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Your Log', component: YourLogPage },
      { title: 'Account', component: AccountPage },
      { title: 'Calendar', component: CalendarPage },
      { title: 'How It Works', component: HowItWorksPage },
      { title: 'Print Report', component: PrintReportPage },
      { title: 'Report A Migraine', component: ReportAMigrainePage },
      { title: 'Results Main', component: ResultsMainPage },
      { title: 'Trackers', component: TrackersPage }
      //{ title: '', component: Page },

    ];

    this.YourLogLink = YourLogPage;
    this.AccountLink = AccountPage;
    this.CalendarLink = CalendarPage;
    this.HowItWorksLink = HowItWorksPage;
    this.PrintReportLink = PrintReportPage;
    this.ReportAMigraineLink = ReportAMigrainePage;
    this.ResultsMainLink = ResultsMainPage;
    this.TrackersLink = TrackersPage;
  }

  swipeEvent(e) {
    e.stopPropagation();

    if(e.direction == '2'){
        //this.forwardOneDay();
        //this.content.scrollToTop();
    }
    else if(e.direction == '4'){
        //this.backOneDay();
        //this.content.scrollToTop();
    }
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  navToPage(daPage) {
    //console.log("going to:", daPage);
    this.storage.set("dayToView", 0);
    this.nav.setRoot(daPage);
    //this.nav.push(daPage).then(() => {
            // first we find the index of the current view controller:
            //const index = this.viewCtrl.index;
            // then we remove it from the navigation stack
            //this.nav.remove(index);
    //      });

    this.menuCtrl.close();
  }

  navToMigraine() {
    this.storage.get("todayHasMigraine").then(val => {

      if (val) {
        let alert = this.alertCtrl.create({
          title: 'Migraine', message: 'You can only add one migraine per day. We will take you to the migraine you already have for today.',
          buttons: [ {
            text: 'Ok', role: 'cancel', handler: () => {
              this.storage.set("dayToView", 0);
              this.nav.setRoot(this.ReportAMigraineLink);
              this.menuCtrl.close();
            } } ] });
        alert.present();
        return;
      } else {
        this.storage.set("dayToView", 0);
        this.nav.setRoot(this.ReportAMigraineLink);
        this.menuCtrl.close();
      }
    });
  }

}
