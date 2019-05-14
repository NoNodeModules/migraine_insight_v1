// REFERENCE https://github.com/twinssbc/Ionic2-Calendar
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import moment from 'moment'; // moment
import { Storage } from '@ionic/storage';  // Storage

//import { NgCalendarModule  } from 'ionic2-calendar';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { MonthViewComponent } from 'ionic2-calendar/monthview';
//import { WeekViewComponent } from 'ionic2-calendar/weekview';
//import { DayViewComponent } from 'ionic2-calendar/dayview';
//import { AppModule } from '../../app/app.module';

import { YourLogPage } from '../your-log/your-log';

@IonicPage()
@Component({ selector: 'page-calendar', templateUrl: 'calendar.html', })
export class CalendarPage {

  //@ViewChild(CalendarComponent) myCalendar:CalendarComponent;
  eventSource;
  viewTitle;
  titleMonth;

  calendar = {
          mode: 'month',
          currentDate: new Date(),
          dateFormatter: {
              formatMonthViewDay: function(date:Date) {
                  return date.getDate().toString();
              },
              formatMonthViewDayHeader: function(date:Date) {
                  return 'MonMH';
              },
              formatMonthViewTitle: function(date:Date) {
                  return 'testMT';
              },
              formatWeekViewDayHeader: function(date:Date) {
                  return 'MonWH';
              },
              formatWeekViewTitle: function(date:Date) {
                  return 'testWT';
              },
              formatWeekViewHourColumn: function(date:Date) {
                  return 'testWH';
              },
              formatDayViewHourColumn: function(date:Date) {
                  return 'testDH';
              },
              formatDayViewTitle: function(date:Date) {
                  return 'testDT';
              }
          }
      };

  uid: any;
  //startTime: Date;
  //endTime: Date;
  events: any = [];
  migEvents: any;
  numMigrainesThisMonth: number;
  migrainesLoggedAverage: number;
  eventsLogged: number;
  loading: any;
  hideSwipeOverlay: boolean = true;
  public unregisterBackButtonAction: any;

  constructor(private storage: Storage, private ga: GoogleAnalytics, public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    public loadingCtrl: LoadingController, public afAuth: AngularFireAuth, public platform: Platform) {

      // -- analytics trackView
      this.ga.trackView('Calendar');

      //this.startTime = new Date(Date.UTC(2014, 4, 8));
      //this.endTime = new Date(Date.UTC(2018, 4, 8));

      this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;
      });

      storage.get('calendarFirstTime').then((val) => {
         if (val) {
           this.hideSwipeOverlay = false;
           storage.set('calendarFirstTime', false);
         }
       });
  }

  onViewTitleChanged(title) {

    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 30000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
    this.loading.present().then(ret => {
    // start and end of this month
    //var theStart: Date = new Date(moment().startOf('month').valueOf());
    //var theEnd: Date = new Date(moment().endOf('month').valueOf());

    //this.events = this.db.list('/events/'+this.uid, {
    //  query: { orderByChild: 'myDateTime', startAt: theStart.valueOf(), endAt: theEnd.valueOf() }
    //});

        this.viewTitle = title;
        this.titleMonth = title.substr(0, title.length - 5);
        console.log("title: " + title);
        console.log("title.substr(0, 3): " + title.substr(0, 2));
        var monthNum = new Date(title.substr(0, 3) + '-1-01').getMonth()+1;
        console.log("monthNum: " + monthNum);
        var year = title.substr(title.length - 4);
        var firstDay = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
        //var firstDayMilis = firstDay.getTime();
        //var lastDay = new Date(year, monthNum, 0, 23, 59, 59, 999); // date.setHours(23,59,59,999);
        //var lastDayMilis = lastDay.getTime();

        // get migraine object that exists
        var migNum: number = 0;
        var eventsNum: number = 0;
        var newA: any = [];

        // start and end of this month
        var theStart: Date = new Date(moment(firstDay).startOf('month').valueOf());
        var theEnd: Date = new Date(moment(firstDay).endOf('month').valueOf());

        this.events = this.db.list('/events/'+this.uid, {
          query: { orderByChild: 'myDateTime', startAt: theStart.valueOf(), endAt: theEnd.valueOf() }
        });

        // var theSub =
        this.events.subscribe((_items)=> {
            _items.forEach(item => {
                /* if (item.name == "Migraine" && item.myDateTime < lastDayMilis
                && item.myDateTime > firstDayMilis) { migNum++; }
                if (item.myDateTime < lastDayMilis && item.myDateTime > firstDayMilis) { eventsNum++; } */
                if (item.name == "Migraine") { migNum++; }
                eventsNum++;

                  //console.log('item: ', item.name, " ", new Date(item.myDateTime));
                  newA.push({ title:item.name,
                    startTime: new Date(item.myDateTime),
                    endTime: new Date(item.myDateTime),
                    allDay:false });
              });

              // hide loading
              this.eventSource = newA;

              // set vars for top
              this.numMigrainesThisMonth = Math.floor(migNum); //num;
              this.migrainesLoggedAverage = 0;
              if (migNum != 0) { this.migrainesLoggedAverage = Math.floor(Number(30 / migNum)); }
              this.eventsLogged = Math.floor(eventsNum);

              // theSub.unsubscribe();
              this.loading.dismiss();
              this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading',
              spinner: 'bubbles' });
        });

      });
  }

  onTimeSelected(ev) {
      //console.log('Selected time: ' + JSON.stringify(ev));
  }

  onCurrentDateChanged(event:Date) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        event.setHours(0, 0, 0, 0);

        /* if (this.calendar.mode === 'month') {
            if (event.getFullYear() < today.getFullYear() || (event.getFullYear() === today.getFullYear() && event.getMonth() <= today.getMonth())) {
                this.lockSwipeToPrev = true;
            } else {
                this.lockSwipeToPrev = false;
            }
        } */
    }

  loadEvents() {
    //console.log('Load Events Function');
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
  /* END Android Leaving Code */

}
