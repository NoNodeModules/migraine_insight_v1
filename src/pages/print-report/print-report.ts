import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics
import moment from 'moment'; // moment
import { MyDataProvider } from '../../providers/my-data/my-data'; // MyData
import { AngularFireAuth } from 'angularfire2/auth';  // Auth
import firebase from 'firebase';  // Firebase
import { AngularFireDatabase } from 'angularfire2/database';  // Firebase
import { Storage } from '@ionic/storage'; // Storage

import { YourLogPage } from '../your-log/your-log';

import * as jsPDF from 'jspdf';

@IonicPage() @Component({ selector: 'page-print-report', templateUrl: 'print-report.html' })
export class PrintReportPage {

  uid: any;
  events: any;
  // events: FirebaseListObservable<any>;
  migraines: any = [];
  justEvents: any = [];
  theDoc: any;
  trackingStartDate: any;
  topMargin: any = 60;
  registrationDate: any;
  theStartY: any;
  fullHeight: any = 790;
  pageMidPoint: any = 306;
  loading: any;
  pageWidth: any = 612;
  leftMargin: any = 26;
  rightMargin: any = 612 - 26;
  useremail: any = "";
  public unregisterBackButtonAction: any;

  constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController,
  public toastCtrl: ToastController, private myData: MyDataProvider, private emailComposer: EmailComposer,
  private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase, public platform: Platform) {

    this.afAuth.authState.subscribe(auth => {
          this.uid = auth.uid;
          console.log("auth: ", auth);
          if (auth && auth.uid) {
            this.useremail = auth.email;
          }
          // Or to get a key/value pair
          storage.get('registrationDate').then((val) => {
            var tzOffset = new Date(val).getTimezoneOffset()/60;
            this.registrationDate = new Date(moment.utc(val).add(tzOffset,'hours').format());
            console.log('registration Date UTC: ', new Date(this.registrationDate));
            console.log('registration Date : ', new Date(val));
          });

          // query events
          this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 30000, showBackdrop: true, content: 'Creating Your Report', spinner: 'bubbles' });
          this.loading.present().then(ret => {
                //this.events = this.db.list('/events/'+ this.uid);
                console.log("this.uid: ", this.uid);
                // get migraine object that exists
                var theSub = this.db.list('/events/'+ this.uid).subscribe((_items)=> {

                    console.log("_itesm: ", _items);
                    this.events = _items;
                    //console.log("loading ... this.events: ", this.events);

                    _items.forEach(item => {
                      if(item.name) {
                        if (item.name.toLowerCase() === "migraine") { this.migraines.push(item); }
                        else { this.justEvents.push(item); }
                      } else { console.log("***         ***     *** YOU HAVE BAD DATA IN THE DB!!! print report 64: item: ", item); }
                    });

                    // get migraines
                    this.migraines = myData.sortByDate(this.migraines);

                    // make doc
                    this.makeTheDoc();

                    // dismiss loading
                    this.loading.dismiss();
                    this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Creating Your Report',
                    spinner: 'bubbles' });
                    theSub.unsubscribe();
                });
          });
    });

  }

  ionViewDidLoad() {
    this.ga.trackView("Send Report");
    //  this.myData.migraineUpdateTreatments();
  }

  sendEmail = function() {
      console.log("Sending...");
      //this.emailComposer.isAvailable().then((available: boolean) =>{
      // if(available) {
            //Now we know we can send


         let email = {
           to: this.useremail,
           subject: 'Your log from Migraine Insight',
           attachments: [this.theDoc],
           body: "Here's your log from Migraine Insight."
         }

         this.emailComposer.open(email);

         this.ga.trackEvent("Send Report", "Send Report - Done");
         console.log('***     SENT email     ***', );

       //} else {
      //   let toast = this.toastCtrl.create({
    //         message: 'Your email is not setup for sending.',
      //       duration: 2500, position: 'middle' });
      //   toast.present();
       //}
      //});
  }

sendEmailBasic = function() {

        if (this.migraines.length < 1) {
              //$ionicLoading.hide();

              console.log('migraines are 0');
              let toast = this.toastCtrl.create({
                  message: "You haven't tracked any migraines. Please record more data to make a report.",
                  duration: 3000,
                  position: 'middle'
                });
                toast.present();
                return;
          } else {
                console.log("send Email!");

                // -- analytics trackevent
                // don't track start send, too confusing on analytics. this.ga.trackEvent('Send Report', 'Send Report - Starting');

                // add loader
                //this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true, content: 'Loading', spinner: 'bubbles' });
                //this.loading.present();

                // send email
                this.sendEmail();
        }
    }

    makeTheDoc() {
            console.log("** START generating pdf **");

            // set up vars
            var todayDate = new Date();  //new Date("2015-07-01T17:07:37.821Z");
            //var theDaysInMonth = moment(monthsToShow[a].getFullYear() + "-" + monthsToShow[a].getMonth()).daysInMonth(); //myData.getDaysInMonth(todayDate.getMonth(), todayDate.getFullYear());

            /********* SECTION: SET UP WEEKS AND MONTHS TO TRACK ********/

            // get tracking Start Date
            //var theDate = this.registrationDate; //new Date(p(window.localStorage['registrationDate']));
            //console.log("registration Date: " + theDate);

            this.trackingStartDate = new Date(this.registrationDate);
            //console.log("*** this.trackingStartDate: " + this.trackingStartDate);

            // make array of months and weeks
            var monthsToShow = [];
            var weeksToShow = [];

            var monthAgo = 0;
            var currentMonth = todayDate.getMonth();
            var currentYear = todayDate.getFullYear();

            //console.log("todayDate: " + todayDate + "todayDateMonth: " + todayDate.getMonth());

            // MAKE MONTHS TO SHOW ARRAY loop through and put months in array (since we are only doing 12 months, check only for that.)
            // don't go more than 12 months back or before the selected start date
            for (var i = 0; i < 12; i++) {
                var newDate = new Date();

                newDate.setDate(15);        // THIS FIXES A BUG where on the 31st of the month, everything counts back weird.
                //console.log("newDate.getDate(): " + newDate.getDate());
                var newYear = currentYear;
                var newMonth = currentMonth - monthAgo;
                //console.log("newMonth: " + newMonth + "currentMonth: " +  currentMonth + "     this.trackingStartDate: " + this.trackingStartDate);
                //console.log("newmonthtime: " + newMonth.getTime() + "       trackingstartdatetime: " + this.trackingStartDate.getTime());


                // set the year back if it's going past 0
                if (newMonth < 0) {
                    //console.log("newMonth: " + newMonth);
                    newMonth = 12 + newMonth;
                    newYear = currentYear - 1;
                }

                newDate.setMonth(newMonth);
                newDate.setFullYear(newYear);
                newDate.setDate(1);
                newDate.setHours(0,0,0,0);


                // put it in the array if it's greater than the scope tracking start date
                var firstDayOfTheTrackingMonthNORESET = this.trackingStartDate;       // withouth this weirdness, this.trackingStartDate gets set
                var firstDayOfTheTrackingMonth = new Date(firstDayOfTheTrackingMonthNORESET);
                firstDayOfTheTrackingMonth.setDate(1);
                firstDayOfTheTrackingMonth.setHours(0,0,0,0);

                // if the newDate is greater than the first of the month, add it to the array
                if (newDate.getTime() >= firstDayOfTheTrackingMonth.getTime()) {
                    monthsToShow.push(new Date(newDate));
                }
                monthAgo = monthAgo + 1;
            }

            // console.log("monthsToShow: " + JSON.stringify(monthsToShow));

            // MAKE WEEKS TO SHOW ARRAY
            //var curr = new Date;
            var aWeekOfMilis = (24*60*60*1000) * 7;  //7 days
            var weeksAgoMilis = aWeekOfMilis;
            //var firstDayOfCurrWeek = new Date(curr.setDate(curr.getDate() - curr.getDay()));

            // put first day of each week you want to show into an array
            for (var i = 0; i < 52; i++) {
                var newDate = new Date();
                newDate.setTime(newDate.getTime() - weeksAgoMilis);
                // you want one week back from today as #1 in array, then a week back, etc.
                if (newDate.getTime() > this.trackingStartDate.getTime()) {
                    // console.log("pushing: " + new Date(newDate));
                    weeksToShow.push(new Date(newDate));
                }
                weeksAgoMilis = weeksAgoMilis + aWeekOfMilis;
            }

            // console.log("this.trackingStartDate: " + this.trackingStartDate);

            // set vars for page layout of big sections
            var showMoreOnFirstPage = true;     // this lets us know if the first page has a week section or not
            if (monthsToShow.length > 3) {
                showMoreOnFirstPage = false;
            }

    /********* SECTION: END **********/

    /********* SECTION: SET UP VARS **********/

            // var doc = new jsPDF('p', 'pt', 'letter');
            var doc = new jsPDF('p', 'pt', 'letter');
            doc.setFont("arial");
            doc.setFontType("bold");
            //var pageWidth = doc.internal.pageSize.width;
            // console.log('pageWidth: ', pageWidth);

            // setup page vars
            //var fullPageWidth = 612;
            //var pageMidPoint = 306;
            //this.topMargin = 60;
            //var mFS = .26; //multiplierWithFontSize
            //var m16 = 4.2; // multiplier x 16 (font size)
            //var leftMargin = 15;
            //$scope.leftMargin = leftMargin; // Don't need?? only shows once in file
            // var rightMargin = 597;
            //$scope.rightMargin = rightMargin; // Don't need?? only shows once in file

            // colors
            /* var c1_r = 255;
            var c1_g = 138;
            var c1_b = 82;

            var c2_r = 0;
            var c2_g = 189;
            var c2_b = 106;

            var c3_r = 99;
            var c3_g = 165;
            var c3_b = 221; */
    /********* SECTION: END ********/



    /********* SECTION: DRAW TOP PART OF DOC  --  VERSION 2  --  ********/

            // draw logo image
            var theImg = this.myData.getLogo_mi();
            doc.addImage(theImg, 'PNG', 30, 33, 150, 30);

            // var theText =  startDate + " - " + today;
            //doc.text(30, 71, theText);

            // draw background rounded rect
            doc.setFillColor(108,180,220);    // set style
            // orig - doc.roundedRect(380, 33, 200, 16, 6, 6, 'F');   // x, y, w, h, radius, radius, type
            doc.roundedRect(430, 33, 150, 20, 7, 7, 'F');   // x, y, w, h, radius, radius, type

            // draw user name
    		    doc.setFontSize(10);            // 4.2 = font size adjuster for font size 16 when making centered text.
    		    doc.setTextColor(43,76,94);     // doc.setTextColor(130,170,170);
            doc.setFontStyle('normal');
            var theText = firebase.auth().currentUser.email; //'Name: ' +
            doc.text(450, 67, theText);

            // draw date
            var startDate = new Date(moment(this.registrationDate).format( "MM/dd/yyyy")); //$filter('date')(new Date(p(window.localStorage['registrationDate'])), "MM/dd/yyyy"); // "EEE, MMM dd yyyy");
            var today = moment().endOf('day').format("MM/DD/YYYY"); //$filter('date')(new Date(), "MM/dd/yyyy");
            doc.text(450, 80, today);

            // draw text
            doc.setFontSize(10);
    		    doc.setTextColor(255,255,255);
            doc.setFontStyle('normal');
            // orig - doc.text(393, 43, "Migraine Insight Summary Report");
            doc.text(469, 46, "Summary Report");
            doc.setFontStyle('normal');

            // draw text
            // doc.setTextColor(230,75,75);doc.setFontStyle("normal");doc.setFontSize(7);  // set style
            // was - doc.text(379, 41,  "This is our FREE report. Our $9.99 trigger analysis report uses");
            // was - doc.text(367, 50,  "deep intelligence analysis to score each individual trigger. We also");
            // was - doc.text(395, 59,  "check for combination triggers and other trigger scenarios.");
            //doc.text(419, 41,           "Our trigger analysis report uses advanced algorithms");
            //doc.text(428, 50,           "to score each individual trigger. We also check for ");
            //doc.text(433, 59,           "combination triggers and other trigger scenarios.");

            // ** END draw ad on top **
    /********* SECTION: END VERSION 2 ********/



    /********* SECTION: DRAW CALENDAR SECTION ********/

      // draw calendar
      var startX = 26;
      var startY = 130;
      var calWidth = 165;
      var calHeight = 135;
      var calMargin = 29;
      var calHeightMargin = 20;
      var calSectionEndY = 0;

      // console.log("monthsToShow.length: " + );

      // num of migraines in num months
      doc.setFontSize(16);
      doc.setTextColor(230,30,70);

      // set migraine words
      //var spacerT = 3;
      var migWord = " migraines";
      if (this.migraines.length == 1) { migWord = " migraine"; }

      // set week words
      //var weekWord = " weeks";
      //if (weeksToShow.length == 1) { weekWord = " week"; }

      // set top message
      // console.log('weeksToShow: ', JSON.stringify(weeksToShow));
      // console.log('weeksToShow length: ', weeksToShow.length);

      var t = (weeksToShow.length) + " weeks, " + this.migraines.length + migWord; // it's more than one
      if (weeksToShow.length == 0) { t = "0 weeks, " + this.migraines.length + migWord;  }
      if (weeksToShow.length == 1) { t = "1 week, " + this.migraines.length + migWord; } //spacerT = spacerT + 10;

      // console.log('weeksToShow message: ', t);

      var fontSize = 16;
      var xPosText = this.pageMidPoint - (t.length * (fontSize * .245));  // .2585

      // write top message
      doc.text(xPosText, 110, t);

      // center on page
      //var fontSize = jsPDF.getFontSize();
      //var pageWidth = doc.pageSize.width;
      //var txtWidth = jsPDF.getStringUnitWidth(txt)*fontSize/doc.scaleFactor;
      //return ( pageWidth - txtWidth ) / 2;

      // console.log('2: here monthsToShow.length: ', monthsToShow.length);

      // 1 month
       if (monthsToShow.length == 1) {
          // get migraine events
          var daysInMonth = moment(monthsToShow[0].getTime()).daysInMonth(); //getDaysInMonth(monthsToShow[0].getMonth(), monthsToShow[0].getFullYear());
          var migraineDayNums = [];
          for (var b = 0; b < daysInMonth; b++) {
              var theDay = new Date(monthsToShow[0].getTime() + (86400000 * b));
              var migraineEventsForToday = this.getMigrainesForDate(new Date(theDay));
              if (migraineEventsForToday.length == 1) {
                  migraineDayNums.push(b);  // if the migraine array has something, add this day to the migraineDayNums
              }
          }
          // do calendar
          this.mm_drawCalendar(startX + calWidth + calMargin, startY, calWidth, calHeight, monthsToShow[0],this.trackingStartDate, migraineDayNums, this.registrationDate, doc); // middle spot
          calSectionEndY = startY + calHeight + calHeightMargin;
      }

      // 2 months
      if (monthsToShow.length == 2) {
          // FIRST MONTH
          var daysInMonth = moment(monthsToShow[1].getTime()).daysInMonth(); //getDaysInMonth(monthsToShow[1].getMonth(), monthsToShow[1].getFullYear());
          var migraineDayNums = [];
          console.log("two months to show 2 daysInMonth: ", daysInMonth);
          for (var b = 0; b < daysInMonth; b++) {
              var theDay = new Date(monthsToShow[1].getTime() + (86400000 * b));
              var migraineEventsForToday = this.getMigrainesForDate(new Date(theDay));
              if (migraineEventsForToday.length == 1) {
                  migraineDayNums.push(b);  // if the migraine array has something, add this day to the migraineDayNums
              }
          }
          this.mm_drawCalendar(this.pageMidPoint - (calWidth + 5), startY, calWidth, calHeight, monthsToShow[1],
          this.trackingStartDate, migraineDayNums, this.registrationDate, doc);   // left spot

          // SECOND MONTH
          daysInMonth = moment(monthsToShow[0].getTime()).daysInMonth(); //getDaysInMonth(monthsToShow[0].getMonth(), monthsToShow[0].getFullYear());
          migraineDayNums = [];

          for (var b = 0; b < daysInMonth; b++) {
              //if (monthsToShow[1].getMonth() ==
              var theDay = new Date(monthsToShow[0].getTime() + (86400000 * b));
              var migraineEventsForToday = this.getMigrainesForDate(new Date(theDay));
              if (migraineEventsForToday.length == 1) {
                  migraineDayNums.push(b);  // if the migraine array has something, add this day to the migraineDayNums
              }
          }
          this.mm_drawCalendar(this.pageMidPoint + 5, startY, calWidth, calHeight, monthsToShow[0],
          this.trackingStartDate, migraineDayNums, this.registrationDate, doc); // middle spot

          calSectionEndY = startY + calHeight + calHeightMargin;
      }

      // 3 or more months
      if (monthsToShow.length >= 3) {

          // set up the vars
          var myX = startX;
          var myY = startY;
          var currentXSpot = 0;
          calSectionEndY = startY + calHeight + calHeightMargin + 10;

          //console.log("monthsToShow.length: " + monthsToShow.length);

          //for (var k = 0; k < monthsToShow.length; k++) {  // forward
          for (var k = monthsToShow.length - 1; k >= 0; k--) {
              //console.log("1 k: " + k);
              // get migraine events
              var migraineDayNums = [];
              var daysInMonth = moment(monthsToShow[k].getTime()).daysInMonth(); //getDaysInMonth(monthsToShow[k].getMonth(), monthsToShow[k].getFullYear());
              for (var b = 0; b < daysInMonth; b++) {
                  var theDay = new Date(monthsToShow[k].getTime() + (86400000 * b));
                  var migraineEventsForToday = this.getMigrainesForDate(new Date(theDay));
                  //console.log("migraineEventsForToday: " + migraineEventsForToday);
                  if (migraineEventsForToday.length == 1) {
                      migraineDayNums.push(b);  // if the migraine array has something, add this day to the migraineDayNums
                  }
              }

              this.mm_drawCalendar(myX, myY, calWidth, calHeight, monthsToShow[k],this.trackingStartDate, migraineDayNums, this.registrationDate, doc);
              myX = myX + calWidth + calMargin;
              currentXSpot = currentXSpot + 1;
              if (currentXSpot == 3) {
                  myX = startX;
                  myY = myY + calHeight + calHeightMargin;
                  currentXSpot = 0;
              }
              if (currentXSpot == 1) {
                  calSectionEndY = myY + calHeight + calHeightMargin + 10;
              }
          }

      }
      // END 3 months
      console.log("3: here");

      // bottom line
      doc.setLineWidth(2);
      doc.setDrawColor(108,180,220);
      // doc.line(this.leftMargin, calSectionEndY, this.rightMargin, calSectionEndY);

    /********* SECTION: END ********/



    /********* SECTION: MIGRAINE LIST ********/

            // var theMigs = JSON.parse(window.localStorage["Migraines"]);
            var theX = startX;
            this.theStartY = calSectionEndY + 50;

            doc = this.mm_drawMigraineEvents(theX, doc);

            // bottom, bottom line
            doc.setLineWidth(2);
            doc.setDrawColor(108,180,220);
            doc.line(25, this.theStartY, 580, this.theStartY);

            // bottom rect info box
            // draw background
            doc.setLineWidth(1);
            doc.setDrawColor(108,180,220);
            doc.setFillColor(255,255,255);
            doc.roundedRect(25, this.theStartY + 12, 580-25, 40, 8, 8, 'D');

            // was - var bottomWords1 = "This is our FREE report. Our $9.99 full report has a lot more information!"
            // was - var bottomWords2 = "Combination triggers, menstruation triggers, caffeine, and more. ";
            //var bottomWords1 = "Our full app checks combination triggers, menstruation, caffeine, and more. Cost effective tracking at a low price.";
            var bottomWords1 =   "We help people with migraines see their situation more clearly. Patients track in our app. Doctors get a clear";
            var bottomWords2 =   "log of events. In the app, data intelligence illuminates hard-to-find correlations. migraineinsight.com"

            // draw text
            doc.setTextColor(43,76,94);
            doc.setFontStyle("normal");
            doc.setFontSize(10);
            doc.text(62, this.theStartY + 28, bottomWords1);
            doc.text(75, this.theStartY + 42, bottomWords2);


            // WRAP IT UP!
            // make the pdf into a nice, sendable doc
            // var currentDate = new Date();
            var theReportName = moment().format("MMMMDD").toString() +  '_migraine_report.pdf';
            var uristring = doc.output('datauristring');
            var uristringparts = uristring.split(',');
            // WAS - uristringparts[0] = "base64:" + escape(theReportName) + "//";
            uristringparts[0] = "base64:" + theReportName + "//";
            var moddeduristring =  uristringparts.join("");

            // save it to the scope level
            this.theDoc = moddeduristring;

            //$ionicLoading.hide();
            console.log("** END generating pdf **");
        }


        getTriggersForDate(myDateTime) {
              //console.log("window.localStorage[Migraines]:" + window.localStorage["Migraines"] );
        			//var eventsArray = JSON.parse(window.localStorage["Migraines"]);
        			var newEventsArray = [];
        			//alert("date: " + myDateTime + "\n migraine eventsArray: " + JSON.stringify(eventsArray));
        			//limit to items on the specific date
        			for (var i = 0; i < this.justEvents.length; i++) {
        				var date = new Date(this.justEvents[i].myDateTime);
        				var toutc = date.toUTCString();
        				var itemLocalDate = new Date(toutc);
        				if (myDateTime.setHours(0,0,0,0) == itemLocalDate.setHours(0,0,0,0))
        				{
        					newEventsArray.push(this.justEvents[i])
        				}
        			}
        			return newEventsArray;
        	}

          getMigrainesForDate(myDateTime) {
                      //console.log("window.localStorage[Migraines]:" + window.localStorage["Migraines"] );
                //var eventsArray = JSON.parse(window.localStorage["Migraines"]);
                var newEventsArray = [];
                //alert("date: " + myDateTime + "\n migraine eventsArray: " + JSON.stringify(eventsArray));
                //limit to items on the specific date
                for (var i = 0; i < this.migraines.length; i++) {
                  var date = new Date(this.migraines[i].myDateTime);
                  var toutc = date.toUTCString();
                  var itemLocalDate = new Date(toutc);
                  if (myDateTime.setHours(0,0,0,0) == itemLocalDate.setHours(0,0,0,0))
                  {
                    newEventsArray.push(this.migraines[i])
                  }
                }
                return newEventsArray;
            }


    mm_drawMigraineEvents(x, doc) {
        console.log("draw mig events");
        //mm_drawMigraineEvent(x, theEmigNum, theMigraine, doc) {
        // var theMigs = JSON.parse(window.localStorage["Migraines"]);
        // $filter('orderBy')(theMigs, "myDateTime");
        // console.log("draw migraine event. theMigraine: " + JSON.stringify(theMigraine));

        //var theEvents = this.myData.getEventsDayOfBefore(theMigraine.myDateTime).reverse();

        //var theEvents = this.events;
        //console.log("this.events: ", JSON.stringify(this.events));

        var migCounter = 0;
        var migAndEventsArrays: any = [];
        var theE = this.myData.sortByDateReverse(this.events);
        var newArray: any = [];
        var theEnd: any = [];
        var theStart: any = [];

        // make an array of arrays. first item is a migraine. then, events before it
        theE.forEach((item, index) => {
          // console.log("item:", item.name, " time: ", new Date(item.myDateTime));
          if (item.name == "Migraine") {
              migCounter++;

              // first one is migraine and second is, too.
              if (index == 0 && theE[1].name == "Migraine") {
                  newArray.push(item);
                  migAndEventsArrays.push(newArray);
              } else {
                // start a new array. first, push current 'newarray' onto migandeventsarrays
                  if (newArray.length >= 1) { migAndEventsArrays.push(newArray); }
                  newArray = [];
                  newArray.push(item);

                  // go back trhough items before this migraine to see if they belong in the event array (after the mig, but same day)
                  theEnd = moment(item.myDateTime).endOf('day').valueOf();
                  theStart = moment(item.myDateTime).add(-1,'day').startOf('day').valueOf();
                  var itemBack = 1;
                  //console.log("");
                  //console.log("index; ", index);
                  //console.log("CHECKING! item.name: ", item.name, " time: ", new Date(item.myDateTime));
                  for (var i = 0; i < theE.length - 1; i++) {
                      var checkNum = index - itemBack;  // so, the one before the current, which is a migraine.
                      if (checkNum > 0) {
                        //console.log("checkNum; ", checkNum);
                          // going one back at at time, is it in the range?
                          if(theE[checkNum].myDateTime >= theStart && theE[checkNum].myDateTime <= theEnd) {
                              //console.log("adding! backitem.name: ", theE[checkNum].name, " time: ", new Date(theE[checkNum].myDateTime));
                              newArray.push(theE[checkNum]);
                          } else {
                            console.log("return");
                            return;
                          }  // not in range, get out of this loop
                      }
                      itemBack++;
                  }
              }
              // console.log("migraine. newArray: ", JSON.stringify(newArray));

          } else {
              if (migCounter >= 1) {
                  //var migTime = newArray[0].myDateTime;
                  //console.log("newArray: ", JSON.stringify(newArray));
                  // was it day of or day before?
                  var migStartYest = moment(newArray[0].myDateTime).add(-1,'day').startOf('day').valueOf();
                  //var itemtart = moment(item.myDateTime).startOf('day').valueOf();

                  //console.log("migStartYest", new Date(migStartYest));
                  //console.log("moment(item.myDateTime).valueOf()", new Date(moment(item.myDateTime).valueOf()));
                  if (migStartYest <= moment(item.myDateTime).valueOf()) {
                      //console.log("Adding item: ", item.name);
                      newArray.push(item);
                  }
            }
          }

          //done. is there an array that still needs to be saved?
          // console.log("theE.length: ", theE.length, " index: ", index);

          if ((theE.length - 1) == index && newArray.length >= 1) { migAndEventsArrays.push(newArray); }
          });

          // console.log("DONE! migAndEventsArrays: ", migAndEventsArrays);

          migAndEventsArrays.forEach(arr => {
            // console.log("mig events arr:  ", JSON.stringify(arr));
            var theMigraine: any = arr[0];
            //console.log("theMigraine:  ", theMigraine, " time: ", new Date(theMigraine.myDateTime));

            var theEvents = this.myData.sortByDateReverse(arr); // arr.splice(1,arr.length);
            //console.log("theEvents: ", theEvents);

            var eventsCol1: any[] = [];
            var eventsCol2: any[] = [];
            var eventsCol3: any[] = [];

            var curDateStart = moment(theMigraine.myDateTime).startOf('day').valueOf();  //moment(new Date()).valueOf(); //

            //console.log('theEvents: ', JSON.stringify(theEvents));
            //console.log('curDateStart: ', new Date(curDateStart));

            // 0 - 5
            if (theEvents.length <= 5) {
                //var f = 0;
                var befNoted: boolean = false;
                arr.forEach(item => {           // arr not theEvents, so that it has the migraine
                    var nom = "";
                    if (befNoted) {nom = item.name.slice(0,12); } else { nom = item.name.slice(0,16); }
                    // add in treatment amount, if applicable.
                    if (item.treatment_showUnitAmount && item.type == "treatmentEvent") {
                      nom = nom + " " + item.treatment_amount + item.treatment_unitType;
                    }

                    var dbef = ""
                    if (moment(item.myDateTime).valueOf() < curDateStart) { dbef = moment(item.myDateTime).format("M/DD - "); }

                    if (dbef != "" && !befNoted) { eventsCol1.push("-- Day Before --"); befNoted = true; }
                    if (item.name == "Period") { eventsCol1.push("Period Start Day");
                    } else { eventsCol1.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                    //eventsCol1.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom);
                    //f++
                });
            }

            // 5 - 10
            if (theEvents.length > 5 && theEvents.length <= 10) {
                console.log('*** 2 ***');
                var counter: number = 0;
                var befNoted: boolean = false;
                theEvents.forEach(item => {
                    var nom = "";
                    if (befNoted) {nom = item.name.slice(0,12); } else { nom = item.name.slice(0,16); }

                    // add in treatment amount, if applicable.
                    if (item.treatment_showUnitAmount && item.type == "treatmentEvent") {
                      nom = nom + " " + item.treatment_amount + item.treatment_unitType;
                    }

                     //console.log('! counter: ', counter);
                    var dbef = ""
                    if (moment(item.myDateTime).valueOf()  < curDateStart) {
                        dbef = moment(item.myDateTime).format("M/DD - ");
                    }
                    if (counter <= 4) {
                      //console.log('under 6. : ');
                      if (dbef != "" && !befNoted) { eventsCol1.push("-- Day Before --"); befNoted = true; }
                      if (item.name == "Period") { eventsCol1.push("Period Start Day");
                      } else { eventsCol1.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                      //eventsCol1.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom);
                    }
                    if (counter >= 5) {
                      //console.log('over 6 : ');
                      if (dbef != "" && !befNoted) { eventsCol2.push("-- Day Before --"); befNoted = true; }
                      if (item.name == "Period") { eventsCol2.push("Period Start Day");
                      } else { eventsCol2.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                      //eventsCol2.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom);
                    }
                    counter++;
                });
            }

            // 20 - 60
            if (theEvents.length > 10 && theEvents.length <= 60) {
                console.log('*** 3 ***');
                var f: number = 0;
                var befNoted: boolean = false;
                theEvents.forEach(item => {
                //for (var f = 0; f < theEvents.length; f++) {
                var nom = "";
                if (befNoted) {nom = item.name.slice(0,12); } else { nom = item.name.slice(0,16); }

                // add in treatment amount, if applicable.
                if (item.treatment_showUnitAmount && item.type == "treatmentEvent") {
                  nom = nom + " " + item.treatment_amount + item.treatment_unitType;
                }
                //console.log('nom: ', nom);
                //var pos = f % 3; // remainder
                var dbef = ""
                if (moment(item.myDateTime).valueOf()  < curDateStart) { dbef = moment(item.myDateTime).format("M/DD - "); }

                var pos = theEvents.length / 3;
                if (f <= pos) {
                    if (dbef != "" && !befNoted) { eventsCol1.push("-- Day Before --"); befNoted = true; }
                    if (item.name == "Period") { console.log('PERIOD 1!'); eventsCol1.push("Period Start Day");
                    } else { eventsCol1.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                }
                if (f >= pos && f < (pos * 2)) {
                    if (dbef != "" && !befNoted) { eventsCol2.push("-- Day Before --"); befNoted = true; }
                    if (item.name == "Period") { console.log('PERIOD 2!'); eventsCol2.push("Period Start Day");
                  } else { eventsCol2.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                }
                if (f >= (pos * 2) && f < theEvents.length) {
                    if (dbef != "" && !befNoted) { eventsCol3.push("-- Day Before --"); befNoted = true; }
                    if (item.name == "Period") { console.log('PERIOD 3!'); eventsCol3.push("Period Start Day");
                  } else { eventsCol3.push(dbef + moment(item.myDateTime).format("h:mma") + " " + nom); }
                }
                f++;
              });
            }

            console.log('theEvents.length: ', theEvents.length);
            console.log('theEvents 1/3: ', (theEvents.length / 3));
            //console.log('eventsCol1: ', JSON.stringify(eventsCol1));
            //console.log('eventsCol2: ', JSON.stringify(eventsCol2));
            //console.log('eventsCol3: ', JSON.stringify(eventsCol3));
            console.log("lenghts: " + eventsCol2.length + " " + eventsCol2.length + " " + eventsCol3.length);
            console.log('  ');

            // setup column
            var widthColumn1 = 110;
            var widthColumn2 = 110;
            var widthColumn3 = 110;
            var widthColumn4 = 110;
            var xColumn1 = 30;
            var xColumn2 = xColumn1 + widthColumn1 + 10;
            var xColumn3 = xColumn2 + widthColumn2 + 10;
            var xColumn4 = xColumn3 + widthColumn3 + 30;

            // symptoms
            if (theMigraine.symptoms === "") {
                var splitText2 = doc.splitTextToSize("Symptoms: None reported.", widthColumn4);
            } else {
                var splitText2 = doc.splitTextToSize("Symptoms: " + theMigraine.symptoms, widthColumn4);
            }

            // make the text for the column
            var splitTextNotes: any[] = [];

            // start with period text
            var periodText = "Day " + theMigraine.periodCycleDay + " of menstrual cycle";
            if (theMigraine.periodCycleDay == 0) {  periodText = "Menstrual cycle day not reported.";  }
            splitTextNotes.push(periodText);

            // add symptoms text
            var symptomsText = "Symptoms: none reported."
            if (theMigraine.symptoms != "") {
                symptomsText = doc.splitTextToSize("Symptoms: " + theMigraine.symptoms, widthColumn4);
            }
            splitTextNotes = splitTextNotes.concat(symptomsText);

            // add notes if any
            if (theMigraine.notes != "") { splitTextNotes = splitTextNotes.concat(doc.splitTextToSize("Migraine Comment: " + theMigraine.notes, widthColumn4)); }

            // get the height of the column
            var columnHeightNotes = (splitTextNotes.length * 13);
            var heightEventsColumns = (eventsCol1.length * 13);  // get the height of the column
            var cH = heightEventsColumns;
            if (heightEventsColumns < columnHeightNotes) { cH = columnHeightNotes; }

            // check if you need to go to a new page
            var finalHeight = cH + this.theStartY + 60; // 50 is for bottom margin
            if (finalHeight > this.fullHeight) {
                doc.addPage();
                this.theStartY = this.topMargin;
            }

            // draw title
            doc.setTextColor(29,147,209);
            doc.setFontSize(13);
            doc.setFontStyle("bold");
            doc.text(this.leftMargin, this.theStartY, moment(theMigraine.myDateTime).format('ddd, MMM DD'));

            // draw subtitle
            doc.setFontSize(11);
            doc.setFontStyle("bold");
            var intensityText = "Medium Intensity (3)";
            if (theMigraine.amount == 1) { intensityText = "Low Intensity (1)"; }
            if (theMigraine.amount == 2) { intensityText = "Low-Medium Intensity (2)"; }
            if (theMigraine.amount == 4) { intensityText = "Medium-High Intensity (4)"; }
            if (theMigraine.amount == 5) { intensityText = "High Intensity (5)"; }
            doc.text(this.leftMargin + 91, this.theStartY, "Migraine of " + intensityText + " for " + Number(theMigraine.durationHours).toString() + " hours, " + Number(theMigraine.durationMinutes).toString() + " minutes");

            // draw line
            doc.setLineWidth(1);
            doc.setDrawColor(29,147,209);
            doc.line(this.leftMargin, this.theStartY + 8, this.rightMargin, this.theStartY + 8);

            // draw column1 title
            doc.setFontSize(10);
            doc.setTextColor(54,47,45);
            doc.text(xColumn1, this.theStartY + 23, "Events");

            // draw column1 text
            doc.setTextColor(43,76,94);
            doc.setFontStyle("normal");
            doc.setFontSize(9);
            var yP = this.theStartY + 35;
            for (var f = 0; f < eventsCol1.length; f++) {
                if (eventsCol1[f].indexOf("Migraine") > -1) { doc.setTextColor(215,27,27); }
                doc.text(xColumn1, yP, eventsCol1[f]);
                doc.setTextColor(54,47,45);
                yP = yP + 13;
            }

            // draw column2 text
            yP = this.theStartY + 35;
            for (var f = 0; f < eventsCol2.length; f++) {
              if (eventsCol2[f].indexOf("Migraine") > -1) { doc.setTextColor(215,27,27); }
              doc.text(xColumn2, yP, eventsCol2[f]);
              doc.setTextColor(54,47,45);
              yP = yP + 13;
            }

            // draw column3 text
            var yP = this.theStartY + 35;
            for (var f = 0; f < eventsCol3.length; f++) {
              if (eventsCol3[f].indexOf("Migraine") > -1) { doc.setTextColor(215,27,27); }
              doc.text(xColumn3, yP, eventsCol3[f]);
              doc.setTextColor(54,47,45);
              yP = yP + 13;
            }

            // draw column4 title
            doc.setFontSize(10);
            doc.setFontStyle("bold");
            doc.text(xColumn4, this.theStartY + 23, "Notes");

            // draw notes text
            doc.setTextColor(43,76,94);
            doc.setFontStyle("normal");
            doc.setFontSize(9);
            doc.text(xColumn4, this.theStartY + 35, splitTextNotes);

            // set x lower
            //x = x + boxHeight + 20;

            // set theStartY
            this.theStartY = this.theStartY + cH + 60;

            //doc = this.mm_drawMigraineEvents(theX, doc);
            counter ++;
          })

        // });

        // return
        return doc;
      };


/*        mm_drawRectWithInfo(x, y, w, h, theText, doc) {

            // draw background
            doc.setLineWidth(1);
            doc.setDrawColor(108,180,220);
            doc.setFillColor(255,255,255);
            doc.roundedRect(x, y, w, h, 8, 8, 'D');

            // draw text
            //doc.setTextColor(150);
            doc.setTextColor(43,76,94);
            //doc.setFontSize(16);
            doc.setFontStyle("normal");

            doc.setFontSize(11);
            //doc.text(x + 5, y + 16, theTitle);

            doc.text(x + 8, y + 18, theText);

            // return
            return doc;
        } */

        /* mm_drawColumnNotes(x, y, w, h, theText, doc) {

            // draw background
            //doc.setLineWidth(1);
            //doc.setDrawColor(108,180,220);
            //doc.setFillColor(255,255,255);
            //doc.roundedRect(x, y, w, h, 8, 8, 'D');

            // draw text
            doc.setTextColor(43,76,94);
            doc.setFontStyle("normal");
            doc.setFontSize(11);
            doc.text(x + 8, y + 18, theText);

            // return
            return doc;
        } */




  mm_drawCalendar(x, y, calWidth, calHeight, monthToShow, trackingStartDate, migraineDayNums, regD, doc) {

        var regDate = new Date(parseInt(regD));

        var cellHeight = calHeight * .15;
        var cellWidth = calWidth * .143;
        var heightOfDayLetters = 15;

        doc.setLineWidth(1);
        //this.setDrawColor(108,180,220); BLUE
        doc.setFont("helvetica");
        doc.setFontType("normal");

        // draw top
        //this.setDrawColor(108,180,220);
        doc.setFillColor(108,180,220);
        doc.setDrawColor(108,180,220);
        doc.setLineWidth(.5);
        doc.roundedRect(x, y, calWidth, cellHeight + heightOfDayLetters, 8, 8, 'FD'); // the 20 here is the height of the s m t w line
        doc.setTextColor(255,255,255);
        doc.setFontSize(11);
        // was doc.text(x + 50, y + 12, getMonthName(monthToShow) + " " + monthToShow.getFullYear());
        var spacer = 0;
        console.log('getMonth: ', monthToShow.getMonth(), "  ", moment(monthToShow).format("MMMM"));

        // Jan
        if (monthToShow.getMonth() == 0) { spacer = 6; }
        // Feb
        if (monthToShow.getMonth() == 1) { spacer = 5; }
        // Mar
        if (monthToShow.getMonth() == 2) { spacer = 10; }
        // april
        if (monthToShow.getMonth() == 3 ) { spacer = 16; }
        // june
        if (monthToShow.getMonth() == 5) { spacer = 15; }
        // may, july
        if (monthToShow.getMonth() == 4 || monthToShow.getMonth() == 6) { spacer = 17; }
        // august, october
        if (monthToShow.getMonth() == 7 ||  monthToShow.getMonth() == 9) { spacer = 7; }
        // september
        if (monthToShow.getMonth() == 8 ) { spacer = 3; }

        doc.text(x + 43 + spacer, y + 12, moment(monthToShow).format("MMMM") + " " + monthToShow.getFullYear());
        doc.setTextColor(255,255,255);
        doc.setFontSize(8);
        var yForText = y + cellHeight + 3;
        doc.text(x + (cellWidth * .4), yForText, "S");
        doc.text(x + cellWidth + (cellWidth * .4), yForText, "M");
        doc.text(x + (cellWidth * 2) + (cellWidth * .4), yForText, "T");
        doc.text(x + (cellWidth * 3) + (cellWidth * .4), yForText, "W");
        doc.text(x + (cellWidth * 4) + (cellWidth * .4), yForText, "T");
        doc.text(x + (cellWidth * 5) + (cellWidth * .4), yForText, "F");
        doc.text(x + (cellWidth * 6) + (cellWidth * .4), yForText, "S");

        // draw rows
        doc.setLineWidth(.5);
        doc.setDrawColor(108,180,220);
        doc.setFillColor(255,255,255);
        var vVar = y + cellHeight + heightOfDayLetters - 10;
        //console.log("cell height 1: " + cellHeight);
        for (var f = 0; f < 6; f++) {
            doc.rect(x, vVar, calWidth, cellHeight, 'FD');
            vVar = vVar + cellHeight;
            //console.log("cell height: " + cellHeight);
        }

        doc.setDrawColor(108,180,220);

        // draw columns
        var xVar = x + cellWidth;
        for (var d = 0; d < 6; d++) {
            /* if (d == 5) {
                this.line(xVar, y + cellHeight, xVar, y + (cellHeight * 6.5) + heightOfDayLetters);
            } else {
                this.line(xVar, y + cellHeight, xVar, y + (cellHeight * 6.5) + heightOfDayLetters);
            } */
            doc.line(xVar, y + cellHeight, xVar, y + (cellHeight * 6.5) + heightOfDayLetters);
            xVar = xVar + cellWidth;
        }

        // set vars
        var dayNum = monthToShow.getDay();
        doc.setTextColor(150);
        doc.setFontSize(6);
        var daysInMonth = moment(monthToShow.getTime()).daysInMonth();
        //var daysInMonth = getDaysInMonth(monthToShow.getYear(), monthToShow.getMonth());
        console.log("monthToShow: " + monthToShow);
        console.log("monthToShow.getMonth(): " + monthToShow.getMonth());
        console.log("monthToShow.getYear(): " + monthToShow.getYear());
        console.log("daysInMonth: " + daysInMonth);

        var currentDay = 1;
        var xNumPos = x + (cellWidth * dayNum) + 2;
        var yNumPos = y + cellHeight + heightOfDayLetters - 2;

        //console.log("xnum and ynum: " + xNumPos + " " + yNumPos);

        //console.log("monthToShow: " + monthToShow);
        //console.log("migraineDayNums: " + JSON.stringify(migraineDayNums));


        // draw month things
        for (var i = 0; i < daysInMonth; i++) {

            var foundIt = false;
            // draw migraine day indicator
            for (var z = 0; z < migraineDayNums.length; z++) {
                //console.log(" IN !!! migraineDayNums: " + migraineDayNums);
                //console.log("monthToShow: " + monthToShow);
                if (parseInt(migraineDayNums[z]) === i) {
                    //console.log("gotcha i: " + i);

                    // fill in square with red
                    doc.setFillColor(255,0,95);
                    //this.rect(xNumPos - 2, yNumPos - 8, cellWidth, cellHeight, 'F');

                    // draw background darker
                    //this.setDrawColor(240,240,240);
                    //this.setFillColor(240,240,240);
                    //console.log("currentDay.getDay(): " + currentDay.getDay());

                    //var aDate = new Date(monthToShow);
                    //aDate.setDate(currentDay);
                    // last column is a little less wide
                    //console.log("aDate.getDay(): " + aDate.getDay());
                    //if (aDate.getDay() != 6) {
                    doc.roundedRect(xNumPos - 2, yNumPos - 8, cellWidth, cellHeight, 0, 0, 'F'); // w, h, type
                    //} else {
                    //    this.roundedRect(xNumPos - 2, yNumPos - 8, cellWidth-2.5, cellHeight, 0, 0, 'F'); // w, h, type
                    //}

                    // draw big m
                    //this.setTextColor(255,255,0);
                    //this.setFontType("bold");
                    doc.setTextColor(255);
                    doc.setFontSize(11);
                    doc.setFontStyle("bold");
                    doc.text(xNumPos + 6, yNumPos + 7, "M");
                    doc.setFontStyle("normal");
                    doc.setTextColor(255);

                    // draw day num on top left
                    doc.setFontSize(5);
                    doc.text(xNumPos, yNumPos - 3, JSON.stringify(currentDay));
                    doc.setTextColor(150);
                    foundIt = true;
                }
            }

            if (! foundIt) {
                    // draw day num on top left
                    doc.setFontSize(6);
                    doc.text(xNumPos, yNumPos - 1, JSON.stringify(currentDay));
                    doc.setTextColor(150);
            }

            // draw starting date indicator
            if (monthToShow.getFullYear() == trackingStartDate.getFullYear() && monthToShow.getMonth() == trackingStartDate.getMonth() && trackingStartDate.getDate() == currentDay) {

                // draw background rounded rect
                doc.setDrawColor(255,0,95);
                doc.setFillColor(255);
                doc.roundedRect(xNumPos - 8, yNumPos - cellHeight - 15, cellWidth + 13, cellHeight + 1, 6, 6, 'FD');

                // draw white inside carat
                doc.setFillColor(255);
                doc.roundedRect(xNumPos + 6, yNumPos - 14, 8, 2, 1, 1, 'F'); // x, y, w, h,
                doc.roundedRect(xNumPos + 7, yNumPos - 13, 6, 2, 1, 1, 'F'); // x, y, w, h,
                doc.roundedRect(xNumPos + 8, yNumPos - 12, 4, 2, 1, 1, 'F'); // x, y, w, h,

                // draw carat
                doc.setDrawColor(255,0,95);
                doc.line(xNumPos + 5, yNumPos - 14, xNumPos + 10, yNumPos - 9);

                doc.setDrawColor(255,0,95);
                doc.line(xNumPos + 15, yNumPos - 14, xNumPos + 10, yNumPos - 9);

                // white line
                doc.setFillColor(255);
                doc.roundedRect(xNumPos + 5.5, yNumPos - 15.3, 9, 2, 1, 1, 'F');

                // text
                doc.setFontSize(8);
                doc.setTextColor(53,86,94);
                doc.text(xNumPos - 3, yNumPos - 26, "Started");
                doc.text(xNumPos - 5, yNumPos - 18, "Tracking");
                doc.setTextColor(150);

                // circle
                doc.setFillColor(53,86,94);
                doc.circle(xNumPos + 10, yNumPos - 4, 3, 'FD');  //(x + offsetX, y + offsetY, radius, 'FD');
            }



            /* "end" report indicator (on today)
            var today = new Date();
            if (monthToShow.getFullYear() == today.getFullYear() && monthToShow.getMonth() == today.getMonth() && currentDay == today.getDate()) {

                // draw background rounded rect
                this.setDrawColor(255,0,95);
                this.setFillColor(255);
                this.roundedRect(xNumPos + 15, yNumPos + cellHeight - 19, 23, 12, 5, 5, 'FD'); // w, h, type

                // circle
                this.setFillColor(53,86,94);
                this.circle(xNumPos + 10, yNumPos + cellHeight - 14, 3, 'FD');  //(x + offsetX, y + offsetY, radius, 'FD');

                // end
                this.setFontSize(8);
                this.setTextColor(53,86,94);
                this.text(xNumPos + 18, yNumPos + cellHeight - 11, "End");
            } */



            // if after today, then darken square
            var today = new Date();
            if (monthToShow.getFullYear() == today.getFullYear() && monthToShow.getMonth() == today.getMonth() && currentDay > today.getDate()) {

                // draw background darker
                doc.setDrawColor(240,240,240);
                doc.setFillColor(240,240,240);
                //console.log("currentDay.getDay(): " + currentDay.getDay());

                //var aDate = new Date(monthToShow);
                //aDate.setDate(currentDay);
                // last column is a little less wide
                //console.log("aDate.getDay(): " + aDate.getDay());
                //if (aDate.getDay() != 6) {
                doc.roundedRect(xNumPos - 1, yNumPos - 7, cellWidth-2, cellHeight-2, 0, 0, 'FD'); // w, h, type
                //} else {
                //    this.roundedRect(xNumPos - 1, yNumPos - 7, cellWidth-4.5, cellHeight-2, 0, 0, 'FD'); // w, h, type
                //}

                // draw day num on top left
                doc.setFontSize(6);
                doc.text(xNumPos, yNumPos - 1, JSON.stringify(currentDay));
                doc.setTextColor(150);
            }

            // if before reg date, darken square
            //var regDate = new Date(window.localStorage["registrationDate"]);
            //$rootScope.regDate = window.localStorage["registrationDate"];
            //console.log("*** regDate: " + regDate);
            //console.log("regDate.getDate(): " + regDate.getDate());
            //console.log("regDate.getMonth(): " + regDate.getMonth());
                if (monthToShow.getFullYear() <= regDate.getFullYear() && monthToShow.getMonth() <= regDate.getMonth() && currentDay < regDate.getDate()) {

                        // draw background darker
                        doc.setDrawColor(240,240,240);
                        doc.setFillColor(240,240,240);
                        //console.log("currentDay.getDay(): " + currentDay.getDay());

                        //var aDate = new Date(monthToShow);
                        //aDate.setDate(currentDay);
                        // last column is a little less wide
                        //console.log("aDate.getDay(): " + aDate.getDay());
                        //if (aDate.getDay() != 6) {
                        doc.roundedRect(xNumPos - 1, yNumPos - 7, cellWidth-2, cellHeight-2, 0, 0, 'FD'); // w, h, type
                        //} else {
                        //    this.roundedRect(xNumPos - 1, yNumPos - 7, cellWidth-4.5, cellHeight-2, 0, 0, 'FD'); // w, h, type
                        //}

                        // draw day num on top left
                        doc.setFontSize(6);
                        doc.text(xNumPos, yNumPos - 1, JSON.stringify(currentDay));
                        doc.setTextColor(150);
                    }


            //console.log("in loop: dayNum: " + dayNum);
            xNumPos = xNumPos + cellWidth;
            currentDay++;
            dayNum++;
            if (dayNum == 7) {
                xNumPos = x + 2;
                yNumPos = yNumPos + cellHeight;
                dayNum = 0;
            }
        }

        return this;
    }

    /* Android Leaving Code */
    // public unregisterBackButtonAction: any; , public platform: Platform
    ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
    ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
    public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
    private customHandleBackButton(): void { this.navCtrl.setRoot(YourLogPage); }
    /* END Android Leaving Code */

/* mm_drawRectWithInfoLong = function(x, y, w, h, theText, doc) {

// draw background
doc.setLineWidth(1);
doc.setDrawColor(108,180,220);
doc.setFillColor(255,255,255);
doc.roundedRect(x, y, w, h, 8, 8, 'D');

// draw text
doc.setTextColor(150);
doc.setFontStyle("normal");

doc.setFontSize(11);
//doc.text(x + 5, y + 16, theTitle);
doc.text(x + 18, y + 18, theText);

// return
return doc;
}; */


    /* mm_drawWeekSection(x, y, weekSectionWidth, weekSectionHeight, width, margin, currentWeekStartDate, doc) {

                //console.log("** draw week section start **");

                // get events array for the week
                var eventPlacesByDay = [];
                for (var k = 0; k < 7; k++) {
                    var aDate = new Date(currentWeekStartDate.getTime() + ((86400000) * k)); // add one day
                    var theEvents = this.getTriggersForDate(aDate);
                    var migraineEvents = this.getMigrainesForDate(new Date(currentWeekStartDate.getTime() + ((86400000) * k)));
                    theEvents = theEvents.concat(migraineEvents);
                    eventPlacesByDay.push(getEventPlaces(theEvents, width, margin));
                }

                var circWidth = 8;
                var circRadius = 4;


                // draw week title
                doc.setTextColor(150);
                doc.setFontSize(16);
                doc.setFontStyle("normal");
                var lastDayOfWeek = new Date(currentWeekStartDate.getTime() + ((86400000) * 6));
                if (getMonthName(lastDayOfWeek) == getMonthName(currentWeekStartDate)) {
                    var endWords = lastDayOfWeek.getDate();
                } else {
                    var endWords = getMonthName(lastDayOfWeek) + " " + lastDayOfWeek.getDate();
                }
                doc.text(x + 9, y, getMonthName(currentWeekStartDate) + " " + currentWeekStartDate.getDate() + " - " + endWords);

                // draw top line
                doc.setLineWidth(2);
                doc.setDrawColor(108, 180, 220);
                doc.line(25, y + 8, 580, y + 8);

                // vars for draw days
                var dayTopX = x;
                var dayTopY = y + 16;
                var dayWidth = weekSectionWidth;
                var dayHeight = weekSectionHeight * .15;
                var currentDate = currentWeekStartDate;

                // midnight and noon markings
                doc.setFontSize(7);
                doc.setTextColor(150);
                doc.text(x + (dayWidth / 2) - 12, dayTopY + dayHeight + 7, "NOON");
                doc.text(x + dayWidth - 37, dayTopY + dayHeight + 7, "MIDNIGHT");

                // draw days
                for (var i = 0; i < 7; i++) {

                    // draw background for day
                    doc.setFillColor(197,243,249);
                    doc.roundedRect(dayTopX, dayTopY, dayWidth, dayHeight, 8, 8, 'F');

                    // draw letter of day
                    doc.setTextColor(150);
                    doc.setFontSize(14);
                    doc.setFontStyle('bold');
                    var theDayName = getTheDayName(currentDate);
                    doc.text(dayTopX + 8, dayTopY + 20, theDayName.substring(0,1));

                    // draw ticks
                    doc.setLineWidth(.5);
                    doc.setDrawColor(150);
                    doc.line(x + (dayWidth / 2) - 2, dayTopY, x + (dayWidth / 2) - 2, dayTopY + dayHeight);
                    doc.line(x + dayWidth - 8, dayTopY, x + dayWidth - 8, dayTopY + dayHeight);


                    var eventsForToday = eventPlacesByDay[i];
                    for (var a = 0; a < eventsForToday.length; a++) {
                        doc.roundedRect(eventsForToday[a][0], (eventsForToday[a][1] * 4.6) + dayTopY - 3, circWidth, circWidth, circRadius, circRadius, 'F');
                        //console.log("PRINTING rounded rect: y: " + eventsForToday[a][1] + " dayTopY: " + dayTopY);
                    }

                    // set vars for next loop through
                    dayTopY = dayTopY + dayHeight + 10;
                    currentDate = new Date(currentDate.getTime() + ((86400000) * 1)); // add one day

                }


                // draw bottom line
                //doc.setLineWidth(2);
                //doc.setDrawColor(108, 180, 220);
                //doc.line(25, dayTopY, 580, dayTopY);
                // xx doc.line(25, startPointY, 580, startPointY);
      } */



  //getCenteredX(doc, txt) {
  //  }


}
