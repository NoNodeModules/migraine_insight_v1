import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';  // Firebase
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MyDataProvider } from '../../providers/my-data/my-data';  // MyData
import { Storage } from '@ionic/storage';  // Storage
import { HelpersProvider } from '../../providers/helpers/helpers';  // helpers
import { AlertController } from 'ionic-angular';
import moment from 'moment'; // moment
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

import { ResultsMainPage } from '../results-main/results-main';

@Component({ selector: 'page-results-explorer', templateUrl: 'results-explorer.html' })
export class ResultsExplorerPage {

    context:CanvasRenderingContext2D;
    @ViewChild("myCanvas") myCanvas;

    uid: any;
    myName: string = "Timeline Explorer";
    eventsFBL: FirebaseListObservable<any>;
    events: any[] = [];
    events2FBL: FirebaseListObservable<any>;
    events2: any[] = [];
    trackersFBL: FirebaseListObservable<any>;
    trackers: any[] = [];
    //symptomEventsFBL: FirebaseListObservable<any>;
    symptomEvents: any[] = [];
    //treatmentEventsFBL: FirebaseListObservable<any>;
    treatmentEvents: any[] = [];

    migraines: any[] = [];
    //trackers2: any[] = [];
    treatmentTrackers: any[];
    baseList: any[];
    theInput: string;
    oAddHide: boolean = true;
    pausedListNotEmpty: boolean = false;
    registrationDate: any;
    my2UP: any = "notset";
    t1: any = "";

    darkAqua2 = "#4dcad2";
    lighterDarkBlueColor = "#9ccef4";
    migraineColor = "#f83413"; //"#ff4a54"; // "#ec3858";
    migraineColorLowOpacity = "rgba(248, 52, 19, 0.1)";
    blueColor = "#6cb4dc";
    lighterBlueColor = "#bde1f4";

    marginX = 5;
    labelWidthX = 29;
    dayHeight = 100;
    Yadjust = 20;
    oneUnitAcrossX = 85;
    firstDate = new Date();
    score = 70;
    twoUpLeftEdge = 123;
    showSymptoms: boolean = false;
    showTreatments: boolean = false;

    startDate: Date;
    endDate: Date;
    daysInLoad: any;
    fullHeightSpan: any;
    c: any;
    loading: any;
    public unregisterBackButtonAction: any;

    constructor(public loadingCtrl: LoadingController, private ga: GoogleAnalytics, public navCtrl: NavController, public toastCtrl: ToastController,
    public formBuilder: FormBuilder, private myData: MyDataProvider, private helpers: HelpersProvider,
    private storage: Storage, public afAuth: AngularFireAuth, private db: AngularFireDatabase,
    private alertCtrl: AlertController, public platform: Platform) {

      // add loader
      this.loading = this.loadingCtrl.create({ dismissOnPageChange: false, duration: 10000, showBackdrop: true,
      content: 'Loading', spinner: 'bubbles' });
      this.loading.present();

      // -- analytics trackView
      this.ga.trackView('Results - Explorer');

      this.afAuth.authState.subscribe(auth => {

        this.uid = auth.uid;

        // set vars
        storage.get('showSymptoms').then((val) => { if (val) { this.showSymptoms = true; } else { this.showSymptoms = false; } });
        storage.get('showTreatments').then((val) => { if (val) { this.showTreatments = true; } else { this.showTreatments = false; } });

        // trackers
        this.trackersFBL = this.db.list('/trackers/'+this.uid).map(items =>
          items.filter((item) => {
            // removes the name of the current tracker return item.name != this.myName && item.timesTracked > 4 && item.type == "triggerEvent"
            return item.timesTracked > 4 && item.type == "triggerEvent";
        })) as FirebaseListObservable<any[]>;

        // var theSub1 =
        var theSub1 = this.trackersFBL.subscribe((_items)=> {
          this.trackers = this.myData.sortByName(_items);
            //_items.forEach(item => {
            //  this.trackers.push(item);
            //});
            theSub1.unsubscribe();
        });

        // get current tracker that was picked on results main
        this.storage.get("currentTracker").then((val) => {
          console.log("current tracker val on enter explorer: ", val);

          // load registration date, set vars
          this.storage.get('registrationDate').then((regVal) => {
              var tzOffset = new Date(regVal).getTimezoneOffset()/60;
              this.startDate = new Date(moment.utc(regVal).add(tzOffset,'hours').format());
              this.endDate = new Date();
              this.endDate.setHours(23,59,59,999);
              this.registrationDate = regVal;

              // if it's less than 20 days, make it 20 days ago.
              if (moment(this.endDate).diff(moment(this.startDate), 'days') < 20) {
                this.startDate = new Date(moment(this.endDate).subtract(20, 'days').valueOf()); }

              // if it's less than four months, make it 4 months.
              if (moment(this.endDate).diff(moment(this.startDate), 'months') > 4) {
                this.startDate = new Date(moment(this.endDate).subtract(4, 'months').valueOf()); }

              /* MAKE canvas */
              this.daysInLoad = moment(this.endDate).diff(moment(this.startDate), 'days');
              if (this.daysInLoad < 7) { this.daysInLoad = 7; }
              this.fullHeightSpan = this.dayHeight * this.daysInLoad;
              var canvasHeight = (this.dayHeight * this.daysInLoad) + 10;

              //if (canvasHeight > 13000) { canvasHeight = 13000; } // weird bug. breaks everything goes blank if more than this. Argh.

              // how to do this - https://www.html5rocks.com/en/tutorials/canvas/hidpi/
              var can1 = this.myCanvas.nativeElement;
              var ratio = window.devicePixelRatio;
              var oldWidth = can1.width + 20;
              can1.width = oldWidth * ratio;
              can1.height = canvasHeight * ratio;
              can1.style.width = oldWidth + 'px';
              can1.style.height = canvasHeight + 'px';
              var context = can1.getContext('2d');
              context.scale(ratio, ratio);
              this.c = context;

              // has a value
              if (val != "") {
                  val = JSON.parse(val);
                  this.myName = val.name;
                  this.t1 = val.name;
                  //this.loadStuffTrigger1();

                  // query events
                  this.eventsFBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'myDateTime', startAt: this.startDate.valueOf(), endAt: this.endDate.valueOf() } });

                   var theSub = this.eventsFBL.subscribe((_items)=> {
                        _items.forEach(item => {
                          if (item.name == this.myName) { this.events.push(item); }
                          if (item.name == "Migraine") { this.migraines.push(item); }
                          if (item.type == "treatmentEvent") { this.treatmentEvents.push(item); }
                          if (item.type == "symptomEvent") { this.symptomEvents.push(item); }
                        })

                    this.events = this.myData.sortByDate(this.events);

                    // draw out the screen
                    this.drawDays(this.c, this.events, 1, "normalsize");
                    this.drawMigraines();
                    this.drawSymptomsAndTreatments();
                    this.drawBackground("normalsize");
                    this.loading.dismiss();
                    theSub.unsubscribe();
                  });

              } else {    // no value - coming from results main
                  // display overlay
                  this.oAddHide = false;

                  // shut off loading
                  this.loading.dismiss();

                  // query events
                  this.eventsFBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'myDateTime', startAt: this.startDate.valueOf(), endAt: this.endDate.valueOf() } });

                   var theSub = this.eventsFBL.subscribe((_items)=> {
                        _items.forEach(item => {
                          if (item.name == "Migraine") { this.migraines.push(item); }
                          if (item.type == "treatmentEvent") { this.treatmentEvents.push(item); }
                          if (item.type == "symptomEvent") { this.symptomEvents.push(item); }
                        })
                    theSub.unsubscribe();
                    });
              }// end if val

          });

      });


      }); // auth
    }

  /*  loadStuffTrigger1() {

            this.storage.get('registrationDate').then((val) => {
                var tzOffset = new Date(val).getTimezoneOffset()/60;
                this.startDate = new Date(moment.utc(val).add(tzOffset,'hours').format());
                this.endDate = new Date();
                this.endDate.setHours(23,59,59,999);
                this.registrationDate = val;

                // if it's less than 20 days, make it 20 days ago.
                if (moment(this.endDate).diff(moment(this.startDate), 'days') < 20) {
                  this.startDate = new Date(moment(this.endDate).subtract(20, 'days').valueOf()); }

                // if it's less than four months, make it 4 months.
                if (moment(this.endDate).diff(moment(this.startDate), 'months') > 4) {
                  this.startDate = new Date(moment(this.endDate).subtract(4, 'months').valueOf()); }


            });

      });
    } */

    ngAfterViewInit() {
      // console.log("after init - this.registrationDate: ", this.registrationDate);
    }

    drawDays(c, theEvents, colorScheme, sizing) {
            //console.log("** Draw Days **");
            var c = this.c;

            // set sizer
            if (sizing == "normalsize") { var sizer = 1; }
            if (sizing == "halfsize") { var sizer = .65; }

            // set vars (this is repeated in draw migraines)
            var startPosY = this.Yadjust;
            //var endPosY = startPosY + this.fullHeightSpan;
            var leftEdge = this.marginX + this.labelWidthX;

            // if it's half size and second color - move it all to the right
            if (colorScheme == 2 && sizing == "halfsize") { leftEdge = leftEdge + this.twoUpLeftEdge; }

            // set colors
            var color1, color2, colorTransp;
            if (colorScheme == 1) {
                color1 = "#478ff1"; //this.darkBlueColor;
                color2 = this.lighterDarkBlueColor;
                colorTransp = "rgba(71,143,241, 0.2)";  // this is lighter, not transparenty - "#c5dcf8"; //this.blueColorTransp;
            }

            if (colorScheme == 2) {
                color1 = "#2ed7a9"; //"#6ce280"; //this.aqua2;
                color2 = this.darkAqua2;
                colorTransp = "rgba(53,217,173, 0.2)"; // "#bfeee7"; //this.aqua2Transp;
            }

            //data = $filter('orderBy')(data, "myDateTime");
            //data.reverse();

            // process each event
            theEvents.forEach((event) => {
                  //console.log('this.events event: ', event);
                  //console.log('time: ', new Date(event.myDateTime));
                    var dotSize = event.amount * 7;

                    // Y position
                    var percentIntoSpan = ((this.endDate.getTime() - event.myDateTime) / (86400000 * this.daysInLoad)) * 100;
                    var YintoSpan = (this.fullHeightSpan / 100) * percentIntoSpan;
                    var positionY = (startPosY + YintoSpan + 5); // + this.marginY; // the 20 is to get it right visually

                    // X position
                    var myX = (leftEdge + (this.oneUnitAcrossX * event.amount)) * sizer;
                    if (event.amount == 1) { myX = myX + 18; }

                    // if moving over, set new myX (why +20?? It's coming up short.)
                    if (colorScheme == 2 && sizing == "halfsize") { myX = (myX + this.twoUpLeftEdge) * sizer + 35; }

                    // draw area
                    c.fillStyle = colorTransp; //this.blueColorTransp;
                    c.beginPath();
                    c.moveTo(leftEdge, positionY - (this.dayHeight * event.amount)); // Y is set at two days future
                    c.lineTo(leftEdge, positionY);
                    c.lineTo(myX, positionY);
                    c.lineTo(myX + dotSize, positionY - (dotSize * 1.3));
                    c.lineTo(leftEdge, positionY - (this.dayHeight * event.amount));
                    c.fill();
                    // draw circle
                    //this.c.fillStyle = this.aquaColor;
                    c.fillStyle = color1; //this.blueColor;
                    c.beginPath();
                    c.arc(myX, positionY - dotSize, dotSize, 0, Math.PI*2, false);
                    c.fill();

                    // draw rect up to circle
                    c.fillRect(leftEdge, positionY - (dotSize * 2), myX - leftEdge, dotSize * 2);
                    // console.log("filled rect");
            });


            // process each event - FOR TEXT LABEL
            theEvents.forEach((event) => {
                    var dotSize = event.amount * 7;

                    // Y position
                    var percentIntoSpan = ((this.endDate.getTime() - event.myDateTime) / (86400000 * this.daysInLoad)) * 100;
                    var YintoSpan = (this.fullHeightSpan / 100) * percentIntoSpan;
                    var positionY = startPosY + YintoSpan + 5; // + this.marginY; // the 20 is to get it right visually

                    // X position
                    //var myX = leftEdge + (this.oneUnitAcrossX * event.amount);

                    // draw label of event
                    var theTime = moment(event.myDateTime).format('h:mma'); //$filter('date')(event.myDateTime, 'h:mma');
                    theTime = theTime.replace("AM", "a").replace("PM","p");
                    if (sizing == "halfsize") { this.c.font="bold 10px VagBlack"; }
                        else { this.c.font="bold 13px VagBlack"; }
                    c.fillStyle = "#FFFFFF";
                    if (event.amount == 1) { // if it's super short, don't put the name on it
                        this.c.font="bold 9px VagBlack";
                        var theName = event.name.substring(0, 8);
                        if (event.name.length > 7) { theName = theName + "..."; }
                        //this.c.fillText(theTime + " " + event.name.charAt(0) + event.name.charAt(1) + event.name.charAt(2) + event.name.charAt(3) + event.name.charAt(4) + event.name.charAt(5) + "...", leftEdge + 8, positionY - dotSize + 3);
                        c.fillText(theTime + " " + theName, leftEdge + 8, positionY - dotSize + 3);
                    } else {
                        c.fillText(theTime + " " + event.name, leftEdge + 8, positionY - dotSize + 4);
                    }
            });
        }

        // Function
        drawMigraines() {

            // set vars (this is repeated in draw days)
            var startPosY = this.Yadjust + 4;
            //var endPosY = startPosY + this.fullHeightSpan;
            var leftEdge = this.marginX + this.labelWidthX;

            // process each migraine  `
            this.migraines.forEach((event) => {

                    var dotSize = 30; //event.amount * 10;

                    // calculate position Y
                    var percentIntoSpan = ((this.endDate.getTime() - event.myDateTime) / (86400000 * this.daysInLoad)) * 100;
                    var YintoSpan = (this.fullHeightSpan / 100) * percentIntoSpan;
                    var positionY = startPosY + YintoSpan + 17; // + 17; //this.marginY;

                    // set x
                    var myX = leftEdge + 258; //(this.oneUnitAcrossX * 2.85); // * event.amount);

                    // get text
                    //var daDate = new Date(event.myDateTime);
                    //var dayNum = daDate.getDay();
                    //var dayName = this.helpers.getDayName(dayNum);
                    //var text1 = dayName + ", " + helpers.formatAMPM(new Date(event.myDateTime));
                    //var text2 = "Severity: " + event.amount;

                    // draw length of migraine
                    //this.c.fillStyle = this.migraineColor;
                    //this.c.fillRect(leftEdge, positionY - (dotSize), myX - leftEdge, 2);

                    // draw circle
                    this.c.fillStyle = this.migraineColor;
                    this.c.beginPath();
                    this.c.arc(myX, positionY - dotSize, dotSize - 10, 0, Math.PI*2, false);
                    this.c.fill();


                    // draw duration text

                    // if four hours or more, use this formula
                    var adjuster = 25;
                    var theHours = event.durationHours;
                    if (event.durationHours.charAt(0) == '0') { theHours = event.durationHours.charAt(1); adjuster = adjuster - 4; }

                    var theMins = event.durationMinutes;
                    if (event.durationMinutes.charAt(0) == '0') { theMins = event.durationMinutes.charAt(1); adjuster = adjuster - 4; }

                    //console.log("this.showSymptoms: " + this.showSymptoms);
                    //console.log("this.showTreatments: " + this.showTreatments);

                    if (parseInt(event.durationHours) >= 8) {

                        // draw wider band rect up to migraine circle
                        this.c.fillStyle = this.migraineColorLowOpacity;
                        var theMinutes = (event.durationHours * 60) + event.durationMinutes;
                        var theMinsAsSpace = theMinutes * (this.dayHeight * .0000069);
                        this.c.fillRect(leftEdge, positionY - (dotSize) - theMinsAsSpace, myX - leftEdge + dotSize - 9, theMinsAsSpace);

                        // text
                        if (!this.showSymptoms && !this.showTreatments) {
                            this.c.font="bold 10px VagBlack";
                            this.c.fillStyle = this.migraineColor;
                            this.c.fillText(theHours + "h, " + theMins + "m", myX - adjuster, positionY - theMinsAsSpace - 16);
                        }
                    } else { // if it's less than 8 hours, just manually do the spacing (no theMinsAsSpace)

                        // draw wider band rect up to migraine circle
                        this.c.fillStyle = this.migraineColorLowOpacity;
                        var theMinutes = (event.durationHours * 60) + event.durationMinutes;
                        var theMinsAsSpace = theMinutes * (this.dayHeight * .0000069);
                        this.c.fillRect(leftEdge, positionY - (dotSize) - theMinsAsSpace, myX - leftEdge + (dotSize * .5) - 9, theMinsAsSpace);

                        // text
                        if (!this.showSymptoms && !this.showTreatments) {
                            this.c.font="bold 10px VagBlack";
                            this.c.fillStyle = this.migraineColor;
                            this.c.fillText(theHours + "h, " + theMins + "m", myX - adjuster, positionY - dotSize - 24);
                        }
                    }

                    // draw line up to migraine circle
                    this.c.fillStyle = this.migraineColor;
                    this.c.fillRect(leftEdge, positionY - (dotSize), myX - leftEdge, 2);

                    // draw text
                    this.c.font="bold 18px VagBlack";
                    this.c.fillStyle = "#FFFFFF";
                    this.c.fillText("M", myX - dotSize + 22, positionY - (dotSize));
                    this.c.font="bold 9px VagBlack";
                    this.c.fillText(this.helpers.formatAMPM(new Date(event.myDateTime)), myX - dotSize + 19, positionY - (dotSize) + 11);

            });
        }

        // Function -- drawBackground
        drawBackground(sizing) {
            //console.log("** Draw Background **");
            // set canvas
            // var canvas = this.myCanvas.nativeElement;
            // let c = canvas.getContext('2d');
            //var c = this.c;


            // SET VARS //
            // get height of span
            //start = Math.floor( this.startInMilis / (3600*24*1000));
            //end   = Math.floor( this.endInMilis / (3600*24*1000));
            //this.daysInLoad = end - start;
            //if (this.daysInLoad < 7) { this.daysInLoad = 7; }
            //this.fullHeightSpan = this.dayHeight * this.daysInLoad;

            // get end and start (end is far back, start is today)
            var start = new Date();
            start.setDate(start.getDate() - 1);
            //var endInMilis = this.startInMilis; // weird, but here we're going the opposite way.
            var end = new Date(this.startDate.getTime());

            // set vars
            var lineWidth = 4;
            //var tickWidth = 4;
            var vLineX = this.marginX + this.labelWidthX;
            var vLineY = 0; //this.marginY;

            // get X for tick
            var fontSizer = 14;
            //var tickX = this.marginX + this.labelWidthX - fontSizer/2;
            // END SET VARS //


            // draw blue vertical line
            this.c.beginPath();
            this.c.lineWidth = lineWidth;
            this.c.strokeStyle = this.blueColor;
            this.c.fillStyle = this.blueColor;
            this.c.moveTo(vLineX, vLineY);
            this.c.lineTo(vLineX, this.c.canvas.height);
            this.c.stroke();

            // if halfsize, draw second vertical line
            if (sizing == "halfsize") {
                this.c.beginPath();
                this.c.lineWidth = lineWidth;
                this.c.strokeStyle = this.blueColor;
                this.c.fillStyle = this.blueColor;
                this.c.moveTo(vLineX + this.twoUpLeftEdge, vLineY);
                this.c.lineTo(vLineX + this.twoUpLeftEdge, this.c.canvas.height);
                this.c.stroke();
            }

            // START TODAY //
            // draw 'TODAY'
            this.c.font="bold 15px VagBlack";
            this.c.fillStyle = this.blueColor;
            this.c.fillText("T", this.marginX + 7, fontSizer/2 + 20);
            this.c.fillText("O", this.marginX + 5, fontSizer/2 + 35);
            this.c.fillText("D", this.marginX + 6, fontSizer/2 + 50);
            this.c.fillText("A", this.marginX + 6, fontSizer/2 + 65);
            this.c.fillText("Y", this.marginX + 6, fontSizer/2 + 80);
            this.c.font="bold 11px VagBlack";

            // draw blue line for TODAY
            this.c.beginPath();
            this.c.lineWidth = 2;
            this.c.strokeStyle = this.lighterBlueColor;
            this.c.moveTo(0, fontSizer/2 + this.dayHeight + 5);
            this.c.lineTo(this.labelWidthX + 2, fontSizer/2 + this.dayHeight + 5);
            this.c.stroke();

            // draw blue line on bottom of today
            this.c.beginPath();
            this.c.lineWidth = 2;
            this.c.strokeStyle = this.lighterBlueColor;
            this.c.moveTo(0, newY + 5);

            // you are looping through using 'start' as current day
            var x = 1;

            while(start > end) {
                //var newDate = start.setDate(start.getDate());
                //start = new Date(newDate);

                x = x + 1;
                // on bottom of indicator var newY = this.marginY + fontSizer/2 + (this.dayHeight * x);
                var newY = fontSizer/2 + (this.dayHeight * x);
                //console.log("********* newY: " + newY);

                // draw label words
                this.c.font="bold 12px VagBlack";
                this.c.fillStyle = this.blueColor;
                //var oneOrTwo = start.getDate().toString().length;

                var adjuster = 16;
                if (start.getDate().toString().length == 1) { adjuster = adjuster + 8; }
                if (start.getDate() == 21 || start.getDate() == 31) { adjuster = adjuster + 3; }
                if (x != 0) {
                    var numAdjust = 2;
                    if (parseInt(start.getDate().toString()) < 10) { numAdjust = 6; }
                    if (start.getDate().toString().indexOf("1") > -1) { numAdjust = numAdjust + 1; }
                    this.c.fillText(this.helpers.getMonthName(start.getMonth()), this.marginX, newY - this.dayHeight + 24);
                    this.c.font="bold 16px VagBlack";
                    this.c.fillText(start.getDate(), this.marginX + numAdjust, newY - this.dayHeight + 41);
                    //this.c.fillText(helpers.getMonthName(start.getMonth()) + " " + start.getDate(), this.marginX + adjuster, newY);
                }

                // draw blue line
                this.c.beginPath();
                this.c.lineWidth = 2;
                this.c.strokeStyle = this.lighterBlueColor;
                this.c.moveTo(0, newY + 5);
                this.c.lineTo(this.labelWidthX + 2, newY + 5);
                this.c.stroke();

                var theNewDate = start.setDate(start.getDate() - 1);
                start = new Date(theNewDate);
            }
          }

    // Function
    drawSymptomsAndTreatments() {

        console.log("symptoms bool: ", this.showSymptoms, " symptomEvents: ", this.symptomEvents);
        console.log("treatments bool: ", this.showTreatments);
        // set canvas
        // var canvas = this.myCanvas.nativeElement;
        // let c = canvas.getContext('2d');
        //var c = this.c;

        var theEvents: any = [];
        //var events2 = [];

        // ADD BACK IN - make combined list and sort it
        if (this.showSymptoms)    { theEvents = this.symptomEvents; }
        if (this.showTreatments)  { theEvents = theEvents.concat(this.treatmentEvents); }

        //events = $filter('orderBy')(events, "myDateTime");

        // set vars (this is repeated in draw days)
        var startPosY = this.Yadjust + 4;
        //var endPosY = startPosY + this.fullHeightSpan;
        var leftEdge = this.marginX + this.labelWidthX;

        // set vars for staggering (set to two days ahead for safety!)
        var lastEventTimeMilis = new Date().getTime() + (86400000 * 2);
        //var eventNum = 0;
        var previousWasStaggered = 1;
        var numEvent = 0;
        var firstPosY;

        // process each ` -- should be treatemtns nad symotom
        theEvents.forEach((event) => {

                //console.log("sandt event: " + event.name + " " + new Date(event.myDateTime));

                //var dotSize = 30; //event.amount * 10;

                // calculate position Y
                var percentIntoSpan = ((this.endDate.getTime() - event.myDateTime) / (86400000 * this.daysInLoad)) * 100;
                var YintoSpan = (this.fullHeightSpan / 100) * percentIntoSpan;
                var positionY = startPosY + YintoSpan - 10; // + 17; //this.marginY;

                // set x
                var myX = leftEdge + 210; //(this.oneUnitAcrossX * 2.85); // * event.amount);

                // get text
                //var daDate = new Date(event.myDateTime);
                //var dayNum = daDate.getDay();
                //var dayName = this.helpers.getDayName(dayNum);

                // stagger the text if the time is too close. (within 6 hours after)
                if (new Date(event.myDateTime).getTime() - (6 * 60 * 60 * 1000) < lastEventTimeMilis) {
                    //console.log("in cluster. " + event.name + " " + new Date(event.myDateTime) + " " + previousWasStaggered);
                    // you want to put it relative to first one captured, but not the absolute first one ever
                    if (numEvent != 0) { positionY = firstPosY - (10 * previousWasStaggered); }
                    previousWasStaggered = previousWasStaggered + 1;

                } else {
                    previousWasStaggered = 1;
                    firstPosY = positionY;
                }

                // draw text
                this.c.font="bold 9px VagBlack";
                this.c.fillStyle = "#000";
                this.c.fillText(this.helpers.formatAMPM(new Date(event.myDateTime)) + " " + event.name, myX, positionY);

                // set var for next go around
                lastEventTimeMilis = new Date(event.myDateTime).getTime();
                numEvent++;
        });
      }

    onSelectChangeOne() {
      var val = this.t1;
      console.log('val one: ', val);
      // make events list
      this.eventsFBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: val} });
      var daSub = this.eventsFBL.subscribe((_items)=> {
            this.events = [];
            _items.forEach(item => {
              this.events.push(item);
            })
            this.events = this.myData.sortByDate(this.events);
            daSub.unsubscribe();
      });
    }

    onSelectChangeTwo() {
      var val = this.my2UP;
      console.log('val two: ', val);
      if (val != "none") {
          // make events list
          this.events2FBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: val} });
          var daSub2 = this.events2FBL.subscribe((_items)=> {
                this.events2 = [];
                _items.forEach(item => {
                  this.events2.push(item);
                })
                this.events2 = this.myData.sortByDate(this.events2);
                daSub2.unsubscribe();
            });
        }
    }

    processAddOverlay() {
        console.log('proccess this.t1: ', this.t1);
        console.log('proccess this.my2UP: ', this.my2UP);

        if (this.t1 == "") {
          let alert = this.alertCtrl.create({
            title: 'Trigger', message: 'Please select a trigger to explore.',
            buttons: [ {
              text: 'Ok', role: 'cancel', handler: () => {
                } } ] });
          alert.present();

          return;
        }

        this. oAddHide = true;

        if (this.my2UP != "None" && this.my2UP != "notset") {    // 1 and 2 are selected

            // make events list
            /* this.events2FBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: this.my2UP} });
            var theSub2 = this.events2FBL.subscribe((_items)=> {
                  this.events2 = [];
                  _items.forEach(item => {
                    this.events2.push(item);
                  })
                  this.events2 = this.myData.sortByDate(this.events2);
                  */

                  // draw two halves
                  //var can1 = this.myCanvas.nativeElement;
                  this.c.clearRect(0, 0, 5000, 5000);
                  this.drawDays(this.c, this.events, 1, "halfsize");
                  this.drawDays(this.c, this.events2, 2, "halfsize");
                  this.drawMigraines();
                  this.drawSymptomsAndTreatments();
                  this.drawBackground("halfsize");
                  //theSub2.unsubscribe();
              //});
          } else { // 1 is selected, 2 is not

              //console.log("NOTHING SELECTED");
              // query events
              /* this.eventsFBL = this.db.list('/events/'+this.uid, { query: { orderByChild: 'name', equalTo: this.t1} });
              var theSub2 = this.events2FBL.subscribe((_items)=> {
                    this.events = [];
                    _items.forEach(item => {
                      this.events.push(item);
                    })
                    this.events = this.myData.sortByDate(this.events);
                    */

                    // draw solo
                    // var can1 = this.myCanvas.nativeElement;
                    this.c.clearRect(0, 0, 5000, 5000);
                    this.drawDays(this.c, this.events, 1, "normalsize");
                    this.drawMigraines();
                    this.drawSymptomsAndTreatments();
                    this.drawBackground("normalsize");
              //});
              /*  clear canvas
              var canvas = document.getElementById("canvas");
              ctx = canvas.getContext("2d");
              this.c.clearRect(0, 0, canvas.width, canvas.height);

              // draw out the screen
              this.drawDays(JSON.parse(window.localStorage["detail_triggerArray"]), 1, "normalsize");
              this.drawMigraines();
              this.drawSymptomsAndTreatments();
              this.drawBackground("normalsize"); */

          }  // end if = select trigger

        //} else {   // 1 is selected, but 2 is not

        //}
    //}
  //});
  }

  ionViewDidLeave() {
    // set vars
    if (this.showSymptoms) { this.storage.set('showSymptoms', true); } else { this.storage.set('showSymptoms', false); }
    if (this.showTreatments) { this.storage.set('showTreatments', true); } else { this.storage.set('showTreatments', false); }
  }

  /* Android Leaving Code */
  // public unregisterBackButtonAction: any; , public platform: Platform
  ionViewDidEnter() { this.initializeBackButtonCustomHandler(); }
  ionViewWillLeave() { this.unregisterBackButtonAction && this.unregisterBackButtonAction(); }
  public initializeBackButtonCustomHandler(): void { this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => { this.customHandleBackButton(); }, 10); }
  private customHandleBackButton(): void { this.navCtrl.setRoot(ResultsMainPage); }
  /* END Android Leaving Code */
}
