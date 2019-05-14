import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultsExplorerPage } from './results-explorer';
//import { MyAlphabetizeComponent } from '../../app/pipes/my-alphabetize';

@NgModule({
  declarations: [
    //MyAlphabetizeComponent,
    ResultsExplorerPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultsExplorerPage),
  ],
  exports: [
    //MyAlphabetizeComponent,
    ResultsExplorerPage
  ]
})
export class ResultsExplorerPageModule {}
