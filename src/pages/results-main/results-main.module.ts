import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultsMainPage } from './results-main';

@NgModule({
  declarations: [
    ResultsMainPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultsMainPage),
  ],
  exports: [
    ResultsMainPage
  ]
})
export class ResultsMainPageModule {}
