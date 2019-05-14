import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultsPeriodPage } from './results-period';

@NgModule({
  declarations: [
    ResultsPeriodPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultsPeriodPage),
  ],
  exports: [
    ResultsPeriodPage
  ]
})
export class ResultsPeriodPageModule {}
