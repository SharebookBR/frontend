import { AlertService } from './../../core/services/alert/alert.service';
import { ContactUsService } from './../../core/services/contact-us/contact-us.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import * as AppConst from '../../core/utils/app.const';

@Component({
  selector: 'app-contact-us-page',
  templateUrl: './contact-us-page.component.html',
  styleUrls: ['./contact-us-page.component.css']
})
export class ContactUsPageComponent implements OnInit {

  formGroup: FormGroup;
  isSent: Boolean;
  isLoading: Boolean = false;
  pageTitle: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _scContactUs: ContactUsService,
    private _scAlert: AlertService
  ) {
    this.createFormGroup();
   }

  ngOnInit() {
    // TODO: receber mensagem por query string, pra integrar com outras pages.
  }

  createFormGroup() {
    this.formGroup = this._formBuilder.group({
      id: '',
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      email: ['',  [Validators.required, Validators.pattern(AppConst.emailPattern)]],
      phone: ['', [Validators.pattern(AppConst.phonePattern)]],
      message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(512)]],
      recaptchaReactive: new FormControl(null, Validators.required)
    });
  }

  onContactUs() {
    if (this.formGroup.valid) {
      this.isLoading = true;
      if (!this.formGroup.value.id) {
        this._scContactUs.contactUs(this.formGroup.value).subscribe(resp => {
          if (resp.success) {
            this.isSent = true;
            this._scAlert.success('Mensagem enviada com sucesso!');
            this.pageTitle = 'Obrigado por entrar em contato! ^^ ';
          } else {
            this._scAlert.error(resp.messages[0]);
          }
          this.isLoading = false;
        });
      }
    }
  }

}
