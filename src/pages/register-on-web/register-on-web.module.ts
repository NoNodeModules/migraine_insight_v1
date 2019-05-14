import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterOnWebPage } from './register-on-web';

@NgModule({
  declarations: [
    RegisterOnWebPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterOnWebPage),
  ],
  exports: [
    RegisterOnWebPage
  ]
})
export class RegisterOnWebPageModule {}
