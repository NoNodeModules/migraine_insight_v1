import { Component } from '@angular/core';

//import { AboutPage } from '../about/about';
//import { ContactPage } from '../contact/contact';
//import { HomePage } from '../home/home';

import { HomePage } from '../home/home';
import { YourLogPage } from '../your-log/your-log';
import { AccountPage } from '../account/account';
import { AboutMePage } from '../about-me/about-me';
import { MorePage } from '../more/more';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AboutMePage;
  tab3Root = YourLogPage;
  tab4Root = AccountPage;
  //tab4Root = MorePage;
  tab5Root = MorePage;

  constructor() {

  }
}
