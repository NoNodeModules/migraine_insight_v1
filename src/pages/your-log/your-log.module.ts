import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { YourLogPage } from './your-log';

@NgModule({
  declarations: [
    YourLogPage,
  ],
  imports: [
    IonicPageModule.forChild(YourLogPage),
  ],
  exports: [
    YourLogPage
  ]
})
export class YourLogPageModule { }
