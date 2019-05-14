import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Setup1Page } from './setup1';

@NgModule({
  declarations: [
    Setup1Page,
  ],
  imports: [
    IonicPageModule.forChild(Setup1Page),
  ],
  exports: [
    Setup1Page
  ]
})
export class Setup1PageModule {}
