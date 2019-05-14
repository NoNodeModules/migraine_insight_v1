import { Component, Input } from '@angular/core';

/**
 * Generated class for the FlashCardComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'flash-card',
  templateUrl: 'flash-card.html'
})
export class FlashCardComponent {

  text: string;

  @Input('isFlipped') flipCard: boolean;

  constructor() {
    console.log('Hello FlashCardComponent Component');
    this.text = 'Hello World';
  }

}
