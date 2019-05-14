import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultsDetailPage } from './results-detail';

@NgModule({
  declarations: [
    ResultsDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultsDetailPage),
  ],
  exports: [
    ResultsDetailPage
  ]
})
export class ResultsDetailPageModule {}
