import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BookService } from '../../../core/services/book/book.service';
import { CategoryService } from '../../../core/services/category/category.service';
import { Category } from '../../../core/models/category';
import { FreightOptions } from '../../../core/models/freightOptions';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  formGroup: FormGroup;
  freightOptions: FreightOptions[] = [];
  categories: Category[] = [];
  isSaved: boolean;

  userId: string;
  userProfile: string;
  buttonSaveLabel: string;
  pageTitle: string;

  constructor(
    private _scBook: BookService,
    private _scCategory: CategoryService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute) {

    this.formGroup = _formBuilder.group({
      id: '',
      userId: '',
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      author: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      categoryId: ['', [Validators.required]],
      freightOption: ['', [Validators.required]],
      imageBytes: [''],
      imageUrl: ['', [Validators.required]],
      approved: false,
    });
  }

  ngOnInit() {

    const { userId, profile } = this.getUserLogged();

    this.userProfile = profile;
    this.formGroup.patchValue({ userId: userId });

    if (this.userProfile === 'User') {
      this.buttonSaveLabel = 'Doar este livro';
      this.pageTitle = 'Quero doar um livro';
    } else {
      this.buttonSaveLabel = 'Salvar';
      this.pageTitle = 'Editar livro';
    }

    this._scBook.getFreightOptions().subscribe(data =>
      this.freightOptions = data
    );

    this._scCategory.getAll().subscribe(data =>
      this.categories = data
    );

    this.getBookSaved();
  }

  getBookSaved() {
    let id = '';
    this._activatedRoute.params.subscribe((param) => id = param.id);

    if (this.userProfile === 'Administrator') {
      this._scBook.getById(id).subscribe(x => {
          const foo = {
            id: x.id,
            userId: x.userId,
            title: x.title,
            author: x.author,
            categoryId: x.categoryId,
            freightOption: x.freightOption,
            imageBytes: '',
            imageUrl: x.imageUrl,
            approved: x.approved
          };
          this.formGroup.setValue(foo);
        }
      );
    }
  }

  onAddBook() {
    if (this.formGroup.valid) {
      console.log(this.formGroup.value);
      if (!this.formGroup.value.id) {
        this._scBook.create(this.formGroup.value).subscribe(resp =>
          console.log(resp)
        );
      } else {
        this._scBook.update(this.formGroup.value).subscribe(resp =>
          console.log(resp)
        );
      }
    }
  }

  getUserLogged() {
    if (localStorage.getItem('shareBookUser')) {
      return JSON.parse(localStorage.getItem('shareBookUser'));
    }
  }

  onChangeFieldFreightOption(freightOption: string) {
    this.formGroup.controls['freightOption'].setValue(freightOption);
  }

  onChangeFieldApproved(approved: boolean) {
    this.formGroup.controls['approved'].setValue(approved);
  }

  onConvertImageToBase64(event: any) {

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      const image = event.target.value;

      reader.readAsDataURL(event.target.files[0]);
      this.formGroup.controls['imageUrl'].setValue(image);

      // tslint:disable-next-line:no-shadowed-variable
      reader.onload = event => {
        this.formGroup.controls['imageBytes'].setValue(event.target['result']);
      };
    }
  }
}
