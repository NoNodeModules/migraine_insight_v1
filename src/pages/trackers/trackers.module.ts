import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrackersPage } from './trackers';
//import { MyAlphabetizeComponent } from '../../app/pipes/my-alphabetize';

@NgModule({
  declarations: [
  //MyAlphabetizeComponent,
  TrackersPage,
  ],
  imports: [
    IonicPageModule.forChild(TrackersPage),
    //MyAlphabetizeComponent
  ],
  exports: [
    //MyAlphabetizeComponent,
    TrackersPage
  ]
})
export class TrackersPageModule {}
