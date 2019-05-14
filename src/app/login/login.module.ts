import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { LoginComponent } from "./login.component";

@NgModule({
  imports: [IonicModule],
  declarations: [LoginComponent],
  entryComponents: [LoginComponent]
})
export class LoginModule {}
