import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrintReportPage } from './print-report';

@NgModule({
  declarations: [
    PrintReportPage,
  ],
  imports: [
    IonicPageModule.forChild(PrintReportPage),
  ],
  exports: [
    PrintReportPage
  ]
})
export class PrintReportPageModule {}
