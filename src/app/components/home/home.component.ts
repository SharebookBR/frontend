import { Component, OnInit } from '@angular/core';
import { BookService } from '../../core/services/book/book.service';
import { Book } from '../../core/models/book';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  top15NewBooks: Book[] = [];
  random15NewBooks: Book[] = [];

  constructor(private _scBook: BookService) {}

  ngOnInit() {
    this._scBook.getTop15NewBooks().subscribe(data => (this.top15NewBooks = data));
    this._scBook.getRandom15Books().subscribe(data => (this.random15NewBooks = data));
  }
}
