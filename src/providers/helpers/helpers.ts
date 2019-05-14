import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class HelpersProvider {

  constructor(db: AngularFireDatabase) {
  }

  capitalizeMe(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  firstUpperEachWord(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  turnOnTriggerView(theName) {
          //var myP = document.getElementById(myPage);
          //console.log("turnOnTriggerView: " + theName);
          var theElem = document.getElementById(theName); //myP.querySelector(theName);

    // turn on
    if (theElem) {
      theElem.className = "wideTile greenBack";
      theElem.querySelector('#trackThisBtn').className = "showMe";
    }
  }

  findDescription(theName) {
    var baseList = JSON.parse(window.localStorage['baseTriggers']);
          //myData.getBaseTriggersListFromLocal();

          var desc = "This is a custom trigger.";
    for(var i = 0; i < baseList.length; i += 1) {
              //console.log("baseList[i].name: " + baseList[i].name);
      if(theName === baseList[i].name) {
        desc = baseList[i].description;
      }
    }
    return desc;
  }

  containsSpecialChars(str) {
      var iChars = "~`!#$%^&*+=-[]\\\';/{}|\":<>?";

      for (var i = 0; i < str.length; i++) {
         if (iChars.indexOf(str.charAt(i)) != -1) {
             console.log("File name has special characters ~`!#$%^&*+=-[]\\\';/{}|\":<>? \nThese are not allowed\n");
             return true;
         }
      }
      return false;
  }

  getMonthName(theNum) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[theNum];
  }

  getDayName(theNum) {
      //var dayNames = ["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"];
      var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      return dayNames[theNum];
  }

  formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'p' : 'a';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + '' + ampm;
      return strTime;
  }


      /**
       * Draws a rounded rectangle using the current state of the canvas.
       * If you omit the last three params, it will draw a rectangle
       * outline with a 5 pixel border radius
       * @param {CanvasRenderingContext2D} ctx
       * @param {Number} x The top left x coordinate
       * @param {Number} y The top left y coordinate
       * @param {Number} width The width of the rectangle
       * @param {Number} height The height of the rectangle
       * @param {Number} [radius = 5] The corner radius; It can also be an object
       *                 to specify different radii for corners
       * @param {Number} [radius.tl = 0] Top left
       * @param {Number} [radius.tr = 0] Top right
       * @param {Number} [radius.br = 0] Bottom right
       * @param {Number} [radius.bl = 0] Bottom left
       * @param {Boolean} [fill = false] Whether to fill the rectangle.
       * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
       */

      roundedRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == 'undefined') {
          stroke = true;
        }
        if (typeof radius === 'undefined') {
          radius = 5;
        }
        if (typeof radius === 'number') {
          radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
          var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
          for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
          }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
          ctx.fill();
        }
        if (stroke) {
          ctx.stroke();
        }
      }

      backingScale(context) {
          if ('devicePixelRatio' in window) {
              if (window.devicePixelRatio > 1) {
                  return window.devicePixelRatio;
              }
          }
          return 1;
      }
}
