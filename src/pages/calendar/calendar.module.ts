import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarPage } from './calendar';
import { NgCalendarModule  } from 'ionic2-calendar';

@NgModule({
  declarations: [
    //NgCalendarModule,
    CalendarPage,
  ],
  imports: [
    IonicPageModule.forChild(CalendarPage),
    NgCalendarModule
  ],
  exports: [
    //NgCalendarModule,
    CalendarPage
  ]
})
export class CalendarPageModule {}
