import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage'; // Storage
// import { AppRate } from '@ionic-native/app-rate';
import { AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Events } from 'ionic-angular';
import { TabsPage } from '../pages/tabs/tabs';

//-- FIX? remove unused calls here
import { HomePage } from '../pages/home/home';
import { YourLogPage } from '../pages/your-log/your-log';
import { AccountPage } from '../pages/account/account';
import { CalendarPage } from '../pages/calendar/calendar';
import { HowItWorksPage } from '../pages/how-it-works/how-it-works';
import { PrintReportPage } from '../pages/print-report/print-report';
import { ReportAMigrainePage } from '../pages/report-a-migraine/report-a-migraine';
import { ResultsMainPage } from '../pages/results-main/results-main';
import { TrackersPage } from '../pages/trackers/trackers';
import { MenuController } from 'ionic-angular';
//import { InAppBrowser } from '@ionic-native'; // in-app
//import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard
import { MenuComponent } from "./menu.component";
import { RegisterPage } from '../pages/register/register';
import { RegisterOnWebPage } from '../pages/register-on-web/register-on-web';
import { Facebook } from '@ionic-native/facebook';  // Facebook


// import { Page } from '../pages//';

@Component({
  template: '<ion-nav #baseNav></ion-nav>'
  //providers: [LoginService]
})
export class MigraineMechanic {

  @ViewChild('baseNav') nav: Nav;
  //rootPage: any = YourLogPage;
  rootPage:any = TabsPage;

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
  FB: any;

 constructor(private statusBar: StatusBar, public events: Events, public platform: Platform, private storage: Storage, public afAuth: AngularFireAuth) {
   //public facebook:Facebook,
   //this.initializeApp();
   this.platform.ready().then(() => {

     // Okay, so the platform is ready and our plugins are available.
     // Here you can do any higher level native things you might need.
     //this.statusBar.overlaysWebView(false);
     //this.statusBar.backgroundColorByHexString("#6cb4dc");
     //styleBlackOpaque(); // makes it white bkg - .styleDefault();
     // - migraine insight purple blue this.statusBar.backgroundColorByHexString("#3d60b3");
     //Splashscreen.hide();
     this.storage.set("dayToView", 0);
   });
 }

 ngOnInit() {
   //const componentStack: Array<{page: Component}> = [{
  //   page: MenuComponent
   //}];

   console.log("NG ON INIT");
   //this.nav.setRoot(MenuComponent);
   this.nav.setRoot(TabsPage);

    if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')) {
      console.log("1 platoform ready! authed. IM ON THE WEBSITE onweb false");
      //if (this.platform.is('iOS') || this.platform.is('android') || this.platform.is('windows')) {
       this.storage.set('onWeb', "false");
     } else {
       console.log("1 platoform ready! authed. IM ON THE WEBSITE onweb true");
       this.storage.set('onWeb', "true");
     }

   this.afAuth.authState.subscribe(auth => {
          console.log("auth -- ", JSON.stringify(auth));
         if (!auth) {
           console.log("** not auth."); //" init platform: ", this.platform._platforms);
           //var onWeb = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));

           //console.log("onWeb: ", onWeb);
           // enable prod mode for angular
           if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')) {
             //if (this.platform.is('ios') || this.platform.is('android') || this.platform.is('windows')) {
             //this.storage.set('onWeb', "false");
             //console.log("ngOnInit platform: ", this.platform);
             // running on app - ios or android
             console.log("2 platoform ready! IM ON THE APP onweb false");
             //this.nav.push(RegisterPage);

             this.nav.push(RegisterPage).then(() => {
               const index = this.nav.getActive().index;
               this.nav.remove(0, index);
             });

           } else {
              // running on website
              //this.storage.set('onWeb', "true");
              console.log("2 platoform ready! IM ON THE WEBSITE onweb true");
              this.nav.push(RegisterOnWebPage);
           }

         } else { // AUTHED!
           console.log("** authed");
          /* if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')) {
            console.log("1 platoform ready! authed. IM ON THE WEBSITE onweb false");
            //if (this.platform.is('iOS') || this.platform.is('android') || this.platform.is('windows')) {
             this.storage.set('onWeb', "false");
           } else {
             console.log("1 platoform ready! authed. IM ON THE WEBSITE onweb true");
             this.storage.set('onWeb', "true");
           } */
           //this.nav.push(TabsPage);
         }
   });
 }

 /* initializeApp() {

 } */

}
