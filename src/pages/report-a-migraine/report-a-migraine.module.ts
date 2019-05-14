import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportAMigrainePage } from './report-a-migraine';

@NgModule({
  declarations: [
    ReportAMigrainePage,
  ],
  imports: [
    IonicPageModule.forChild(ReportAMigrainePage),
  ],
  exports: [
    ReportAMigrainePage
  ]
})
export class ReportAMigrainePageModule {}
