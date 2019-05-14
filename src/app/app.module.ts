import { BrowserModule } from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Tabs } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Storage } from '@ionic/storage';  // Storage
import { Platform } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';  // Keyboard
import { MigraineMechanic } from './app.component';  // My App
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { MyDataProvider } from '../providers/my-data/my-data';  // My Data Provider
import { MomentModule } from 'angular2-moment';  // Moment
import { NgCalendarModule  } from 'ionic2-calendar';
import { Facebook } from '@ionic-native/facebook'
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { EmailComposer } from '@ionic-native/email-composer';
//import { AppRate } from '@ionic-native/app-rate';
// import { Pipe, PipeTransform } from '@angular/core';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { MonthViewComponent } from 'ionic2-calendar/monthview';
import { WeekViewComponent } from 'ionic2-calendar/weekview';
import { DayViewComponent } from 'ionic2-calendar/dayview';
import { enableProdMode } from '@angular/core';
import { HttpModule } from '@angular/http';

// Pages
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { TabsPage } from '../pages/tabs/tabs';
import { HomePageModule } from '../pages/home/home.module';
import { HomePage } from '../pages/home/home';
import { HomeDetailPageModule } from '../pages/home/home-detail/home-detail.module';
import { HomeDetailPage } from '../pages/home/home-detail/home-detail';
import { ArticlePageModule } from '../pages/home/article/article.module';
import { ArticlePage } from '../pages/home/article/article';
import { YourLogPageModule } from '../pages/your-log/your-log.module';
import { YourLogPage } from '../pages/your-log/your-log';
import { AboutMePageModule } from '../pages/about-me/about-me.module';
import { AboutMePage } from '../pages/about-me/about-me';
import { MorePageModule } from '../pages/more/more.module';
import { MorePage } from '../pages/more/more';
import { AccountPageModule } from '../pages/account/account.module';
import { AccountPage } from '../pages/account/account';
import { CalendarPageModule } from '../pages/calendar/calendar.module';
import { CalendarPage } from '../pages/calendar/calendar';
import { HowItWorksPageModule } from '../pages/how-it-works/how-it-works.module';
import { HowItWorksPage } from '../pages/how-it-works/how-it-works';
import { PrintReportPageModule } from '../pages/print-report/print-report.module';
import { PrintReportPage } from '../pages/print-report/print-report';
import { ReportAMigrainePageModule } from '../pages/report-a-migraine/report-a-migraine.module';
import { ReportAMigrainePage } from '../pages/report-a-migraine/report-a-migraine';
import { ResultsMainPageModule } from '../pages/results-main/results-main.module';
import { ResultsMainPage } from '../pages/results-main/results-main';
import { ResultsDetailPageModule } from '../pages/results-detail/results-detail.module';
import { ResultsDetailPage } from '../pages/results-detail/results-detail';
import { ResultsPeriodPageModule } from '../pages/results-period/results-period.module';
import { ResultsPeriodPage } from '../pages/results-period/results-period';
import { ResultsExplorerPageModule } from '../pages/results-explorer/results-explorer.module';
import { ResultsExplorerPage } from '../pages/results-explorer/results-explorer';
import { TrackersPageModule } from '../pages/trackers/trackers.module';
import { TrackersPage } from '../pages/trackers/trackers';
//import { LoginPageModule } from '../pages/login/login.module';
//import { LoginPage } from '../pages/login/login';
import { RegisterPageModule } from '../pages/register/register.module';
import { RegisterPage } from '../pages/register/register';
import { RegisterOnWebPageModule } from '../pages/register-on-web/register-on-web.module';
import { RegisterOnWebPage } from '../pages/register-on-web/register-on-web';
import { ResetpwdPageModule } from '../pages/resetpwd/resetpwd.module';
import { ResetpwdPage } from '../pages/resetpwd/resetpwd';


// IF migraine, add these
import { Setup1PageModule } from '../pages/pages-migraine/setup1/setup1.module';
import { Setup2PageModule } from '../pages/pages-migraine/setup2/setup2.module';
import { Setup3PageModule } from '../pages/pages-migraine/setup3/setup3.module';
import { Setup4PageModule } from '../pages/pages-migraine/setup4/setup4.module';
import { Setup5PageModule } from '../pages/pages-migraine/setup5/setup5.module';
import { Setup6PageModule } from '../pages/pages-migraine/setup6/setup6.module';
import { Setup7PageModule } from '../pages/pages-migraine/setup7/setup7.module';
import { Setup8PageModule } from '../pages/pages-migraine/setup8/setup8.module';
import { Setup1Page } from '../pages/pages-migraine/setup1/setup1';
import { Setup2Page } from '../pages/pages-migraine/setup2/setup2';
import { Setup3Page } from '../pages/pages-migraine/setup3/setup3';
import { Setup4Page } from '../pages/pages-migraine/setup4/setup4';
import { Setup5Page } from '../pages/pages-migraine/setup5/setup5';
import { Setup6Page } from '../pages/pages-migraine/setup6/setup6';
import { Setup7Page } from '../pages/pages-migraine/setup7/setup7';
import { Setup8Page } from '../pages/pages-migraine/setup8/setup8';
// END migraine files


// status bar and splash
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { LoginModule } from "./login/login.module";
import { MenuComponent } from "./menu.component";

// angularfire2
import { AngularFireAuth } from 'angularfire2/auth';
import { HelpersProvider } from '../providers/helpers/helpers';
//import { MyAlphabetizeComponent } from '../app/pipes/my-alphabetize';
//import { SortByHhsComponent } from '../app/pipes/sort-by-hhs';
//import { SortByArgComponent } from '../app/pipes/sort-by-arg';  // fix todo remove these three unused components totally
//import { OrderByDateComponent } from '../app/pipes/order-by-date';
//import { RateServiceProvider } from '../providers/rate-service/rate-service';


/* OLD Production MIGRAINE MECHANIC
export const firebaseConfig = {
    apiKey: "AIzaSyDwBxG3vL_831iz3ram-TDPnkfrGhIZXzE",
    authDomain: "migrainemechanicfirebase.firebaseapp.com",
    databaseURL: "https://migrainemechanicfirebase.firebaseio.com",
    projectId: "migrainemechanicfirebase",
    storageBucket: "migrainemechanicfirebase.appspot.com",
    messagingSenderId: "322982800029"
  };*/

/* Migraine Mechanic Staging */
/*
export const firebaseConfig = {
      apiKey: "AIzaSyBy5WAKHfrL4o9LSbG8Q74duqYBjN0_hTU",
      authDomain: "migraine-mechanic-staging.firebaseapp.com",
      databaseURL: "https://migraine-mechanic-staging.firebaseio.com",
      projectId: "migraine-mechanic-staging",
      storageBucket: "migraine-mechanic-staging.appspot.com",
      messagingSenderId: "124694354236"
    };
*/

/* NOTE: To move from staging to prod and back, just comment and uncomment these. That's it. */

/* Migraine Insight Staging */
export const firebaseConfig = {
    apiKey: "AIzaSyD6GlKTwMkWV8L1raqgdRTEKurSX3V9dtU",
    authDomain: "migraine-insight-staging.firebaseapp.com",
    databaseURL: "https://migraine-insight-staging.firebaseio.com",
    projectId: "migraine-insight-staging",
    storageBucket: "migraine-insight-staging.appspot.com",
    messagingSenderId: "993610955093"
  };


/* Migraine Insight Prod
  var firebaseConfig = {
      apiKey: "AIzaSyBFt-K5mRIi1I-NAyFMjWlS-fpXEUGhJi8",
      authDomain: "migraine-insight-produ.firebaseapp.com",
      databaseURL: "https://migraine-insight-produ.firebaseio.com",
      projectId: "migraine-insight-produ",
      storageBucket: "migraine-insight-produ.appspot.com",
      messagingSenderId: "814320329534"
    };
*/
/* NOTE: The production emails list's code is: e5ed9dda88 This is all done in /functions/src/index.ts in the directory of this project. */


@NgModule({
  declarations: [
    MigraineMechanic,
    //YourLogPage,
    //AccountPage,
    MenuComponent,
    //YourLogPage,
    //AccountPage,
    //CalendarPage,
    /*HowItWorksPage,
    PrintReportPage,
    ReportAMigrainePage,
    ResultsMainPage,
    ResultsDetailPage,
    ResultsPeriodPage,
    ResultsExplorerPage,
    TrackersPage,
    LoginPage,
    RegisterPage,
    ResetpwdPage,
    Setup1Page,
    Setup2Page,
    Setup3Page,
    Setup4Page,
    Setup5Page,
    Setup6Page,
    Setup7Page,
    Setup8Page, */
    //MyAlphabetizeComponent,
    //OrderByDateComponent,
    //SortByHhsComponent,
    //SortByArgComponent,
    PdfViewerComponent
  ],
  imports: [
    BrowserModule,
    //BrowserAnimationsModule, //BrowserAnimationsModule
    NgCalendarModule,
    IonicModule.forRoot(MigraineMechanic),
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot(MigraineMechanic),
    AngularFireDatabaseModule,
    LoginModule,
    MomentModule,
    HttpModule,
    TabsPageModule,
    HomePageModule,
    ArticlePageModule,
    YourLogPageModule,
    AccountPageModule,
    AboutMePageModule,
    CalendarPageModule,
    HowItWorksPageModule,
    PrintReportPageModule,
    ReportAMigrainePageModule,
    ResultsMainPageModule,
    ResultsDetailPageModule,
    HomeDetailPageModule,
    ResultsPeriodPageModule,
    ResultsExplorerPageModule,
    TrackersPageModule,
    //LoginPageModule,
    RegisterPageModule,
    RegisterOnWebPageModule,
    ResetpwdPageModule,
    Setup1PageModule,
    Setup2PageModule,
    Setup3PageModule,
    Setup4PageModule,
    Setup5PageModule,
    Setup6PageModule,
    Setup7PageModule,
    Setup8PageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MigraineMechanic,
    TabsPage,
    YourLogPage,
    AccountPage,
    AboutMePage,
    MenuComponent,
    CalendarPage,
    HowItWorksPage,
    PrintReportPage,
    ReportAMigrainePage,
    ResultsMainPage,
    ResultsDetailPage,
    HomeDetailPage,
    ResultsPeriodPage,
    ResultsExplorerPage,
    TrackersPage,
    //LoginPage,
    RegisterPage,
    RegisterOnWebPage,
    ResetpwdPage,
    Setup1Page,
    Setup2Page,
    Setup3Page,
    Setup4Page,
    Setup5Page,
    Setup6Page,
    Setup7Page,
    Setup8Page
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AngularFireDatabaseModule,
    AngularFireAuth,
    MyDataProvider,
    HelpersProvider,
    GoogleAnalytics,
    Keyboard,
    Facebook,
    Tabs,
    //MyAlphabetizeComponent,
    //OrderByDateComponent,
    //SortByHhsComponent,
    //SortByArgComponent,
    EmailComposer,
    //AppRate
    //{ provide: LOCALE_ID, useValue: undefined }
  ]
})
export class AppModule {

  //, private appRate: AppRate
  constructor(platform: Platform, public ga: GoogleAnalytics, private storage: Storage) {

        platform.ready().then(() => {

            // start google analytics
            this.ga.startTrackerWithId('UA-115951379-1')
                  .then(() => {
                    this.ga.setAllowIDFACollection(true);
                    // -- analytics trackevent
                    this.ga.trackEvent('platform open - start', 'user opened app and analytics loaded');
                  }).catch(e => console.log('Error starting GoogleAnalytics', e));


            // set app vars.
            // In order to change app flavors, do these things:
            // 1) change the appFlavor var below
            // 2)  ** change the loading of the imports section at the top of this page per condition **
            this.storage.set("currentDB", firebaseConfig);
            this.storage.set("versionVar", "1.1");
            this.storage.set("appFlavor", "Migraine"); // "Fibro" "Healy" "Headache" "IBD"

            /* check if you want to prompt them to rate the app
            // https://gonehybrid.com/how-to-implement-in-app-ratings-for-ionic-apps-on-ios/
            this.storage.get('promptAppRate').then((val) => {
              storage.set('promptAppRate', val + 1);
               if (val == 20) {
                  const plugins = (window as any).plugins;
                  if (plugins && plugins.InAppRatingsReview) {
                    plugins.InAppRatingsReview.requestReview();
                    this.ga.trackEvent("App Rate","Show Dialog");
                    storage.set('promptAppRate', -100);
                  }
               }
             }); */

             // enable prod mode for angular
             if (platform.is('ios') || platform.is('android') || platform.is('windows')) {
               //console.log("ENABLE PROD MODE");
               //enableProdMode();
             } else {             // running on web browser on website
                //console.log("platoform ready! IM ON THE WEBSITE");
             }


            /* rate app
            this.storage.get('promptAppRate').then((val) => {

              //console.log('PROMPT APP RATE val: ', val);
               storage.set('promptAppRate', val + 1);
               if (val == 20) {

                 //console.log('PROMPT APP RATE!! DO IT!!!');

                 // check if they've said before not to ask
                 this.storage.get('appRateNeverAsk').then((val2) => {
                 if (!val2) {

                 this.appRate.preferences = {
                     openStoreInApp: true,
                     displayAppName: 'Migraine Mechanic',
                     usesUntilPrompt: 5,
                     promptAgainForEachNewVersion: false,
                     storeAppURL: {
                       ios: '1053283579',
                       //android: 'market://details?id=<package_name>',
                       //windows: 'ms-windows-store://pdp/?ProductId=<the apps Store ID>',
                       //blackberry: 'appworld://content/[App Id]/',
                       //windows8: 'ms-windows-store:Review?name=<the Package Family Name of the application>'
                     },
                     customLocale: {
                       title: "Rate Migraine Mechanic?",
                       message: "If you're enjoying this app - help us by giving us a good rating? Any other feedback, send to: info@mi grainemechanic.com - we want to know! Thanks!",
                       cancelButtonLabel: "No Thanks (never)",
                       laterButtonLabel: "Maybe Later",
                       rateButtonLabel: "Yes, I'll Help",
                       //noButtonLabel: "Not really",
                       //appRatePromptTitle: 'Do you like using %@',
                       //feedbackPromptTitle: 'Mind giving us some feedback?',
                     },
                     // DONE - later fix todo, take out analytics stuff here and appratetrack from mydata. maybe
                     // I can't get the analytics to show up on the panel for app rate
                     callbacks: {
                     handleNegativeFeedback: function() {
                       //console.log('PROMPT APP RATE!! callback handle negative');
                       window.open('info@migraineme chanic.com','_system');
                       this.ga.trackEvent("App Rate","Negative Feedback Selected");
                     },
                     onRateDialogShow: function(callback) {
                       //console.log('PROMPT APP RATE!! show callback: ', JSON.stringify(callback));
                       this.ga.trackEvent("App Rate","Show Dialog");
                     },
                     onButtonClicked: function(buttonIndex) {
                       //console.log('PROMPT APP RATE!! button Clicked buttonIndex: ', buttonIndex);
                       var b = "notsure";
                       if (buttonIndex == 1) { b = "yes" }
                       if (buttonIndex == 3) { b = "no thanks" }
                       if (buttonIndex == 2) { b = "later" }
                       if (buttonIndex == 2) { storage.set('promptAppRate', -20); storage.set("appRateNeverAsk", false); }
                       if (buttonIndex == 3) { console.log('appRateNeverAsk true'); storage.set("appRateNeverAsk", true); }
                       ga.trackEvent("App Rate","Button Selected: " + b);
                     }
                   }
                   };

                   /* this.appRate.preferences.storeAppURL = {
                   ios: '1053283579'
                   //android: 'market://details?id=< package_name >',
                   //windows: 'ms-windows-store://review/?ProductId=< Store_ID >'
                 }; * /
                   this.appRate.promptForRating(true);
               }

             });

               }
               });*/
             });

        //});

        platform.resume.subscribe(e => {
          this.storage.set("dayToView", 0);
          // DONE - fix todo - if this works, remove the daytoview setting when entering report migraine. and, setting it when calling yourlog page
        });

    }
}
