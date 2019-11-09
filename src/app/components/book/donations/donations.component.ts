import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { BookService } from '../../../core/services/book/book.service';
import { BookDonationStatus } from '../../../core/models/BookDonationStatus';
import { TrackingComponent } from '../tracking/tracking.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { DonateComponent } from '../donate/donate.component';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.css']
})
export class DonationsComponent implements OnInit {
  donatedBooks = new Array<any>();
  tableSettings: any;
  isLoading: boolean;

  constructor(
    private _bookService: BookService,
    private _sanitizer: DomSanitizer,
    private _modalService: NgbModal,
    private _toastr: ToastrService,
    private _confirmationDialogService: ConfirmationDialogService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getDonations();

    // Carrega Status do ENUM BookDonationStatus
    const myBookDonationStatus = new Array();
    Object.keys(BookDonationStatus).forEach(key => {
      myBookDonationStatus.push({ value: BookDonationStatus[key], title: BookDonationStatus[key] });
    });

    const btnDonate =
      '<span class="btn btn-warning btn-sm ml-1 mb-1" data-toggle="tooltip" title="Escolher Donatário">' +
      ' <i class="fa fa-trophy"></i> </span>';
    const btnRenewChooseDate =
      '<span class="btn btn-info btn-sm ml-1 mb-1" data-toggle="tooltip" title="Renovar Data de Escolha">' +
      ' <i class="fa fa-calendar"></i> </span>';
    const btnTrackNumber =
      '<span class="btn btn-secondary btn-sm ml-1 mb-1" data-toggle="tooltip" title="Informar Código Rastreio">' +
      ' <i class="fa fa-truck"></i> </span>';

    this.tableSettings = {
      columns: {
        title: {
          title: 'Titulo',
          width: '27%'
        },
        totalInterested: {
          title: 'Total interessados',
          width: '08%'
        },
        daysInShowcase: {
          title: 'Dias na vitrine',
          width: '08%'
        },
        chooseDate: {
          title: 'Data Escolha',
          width: '10%',
          type: 'html',
          valuePrepareFunction: (cell, row) => {
            return new DatePipe('en-US').transform(cell, 'dd/MM/yyyy');
          }
        },
        trackingNumber: {
          title: 'Código Ratreio',
          width: '15%'
        },
        status: {
          title: 'Status',
          width: '15%',
          type: 'html',
          valuePrepareFunction: value => {
            return this._sanitizer.bypassSecurityTrustHtml(
              `<span class="badge badge-${this.getStatusBadge(value)}">${value}</span>`
            );
          },
          filter: {
            type: 'list',
            config: {
              selectText: 'Selecionar...',
              list: myBookDonationStatus
            }
          }
        }
      },
      actions: {
        delete: false,
        edit: false,
        add: false,
        update: false,
        custom: [
          {
            name: 'donate',
            title: btnDonate
          },
          {
            name: 'renewChooseDate',
            title: btnRenewChooseDate
          },
          {
            name: 'trackNumber',
            title: btnTrackNumber
          }
        ],
        position: 'right' // left|right
      },
      attr: {
        class: 'table table-bordered table-hover table-striped'
      },
      noDataMessage: 'Nenhum registro encontrado.'
    };
  }

  private getStatusBadge(status) {
    switch (status) {
      case BookDonationStatus.UNKNOW:
        return 'secondary';
      case BookDonationStatus.WAITING_APPROVAL:
        return 'warning';
      case BookDonationStatus.AVAILABLE:
        return 'primary';
      case BookDonationStatus.INVISIBLE:
        return 'light';
      case BookDonationStatus.DONATED:
        return 'success';
      case BookDonationStatus.CANCELED:
        return 'danger';
    }
  }

  getDonations() {
    this.isLoading = true;

    this._bookService.getDonatedBooks().subscribe(resp => {
      this.donatedBooks = resp;
      this.isLoading = false;
    });
  }

  onCustom(event) {
    switch (event.action) {
      case 'donate': {
        if (event.data.donated || event.data.status === BookDonationStatus.CANCELED) {
          alert('Livro já doado ou cancelado!');
        } else {
          const chooseDate = Math.floor(new Date(event.data.chooseDate).getTime() / (3600 * 24 * 1000));
          const todayDate = Math.floor(new Date().getTime() / (3600 * 24 * 1000));

          if (!chooseDate || chooseDate - todayDate > 0) {
            alert('Aguarde a data de escolha!');
          } else {
            this._router.navigate([`book/donate/${event.data.id}`], {
              queryParams: { returnUrl: this._activatedRoute.snapshot.url.join('/') }
            });
          }
        }
        break;
      }
      case 'renewChooseDate': {
        if (event.data.donated || event.data.status === BookDonationStatus.CANCELED) {
          alert('Livro já doado ou cancelado!');
        } else {
          const chooseDate = Math.floor(new Date(event.data.chooseDate).getTime() / (3600 * 24 * 1000));
          const todayDate = Math.floor(new Date().getTime() / (3600 * 24 * 1000));

          if (!chooseDate || chooseDate - todayDate > 0) {
            alert('Aguarde a data de escolha!');
          } else {
            this._confirmationDialogService
              .confirm('Atenção!', 'Confirma a renovação da data de doação?')
              .then(confirmed => {
                if (confirmed) {
                  this._bookService.renewChooseDate(event.data.id).subscribe(
                    resp => {
                      this._toastr.success('Doação renovada com sucesso.');
                      this.getDonations();
                    },
                    error => {
                      this._toastr.error(error);
                    }
                  );
                }
              });
          }
        }
        break;
      }
      case 'trackNumber': {
        if (!event.data.donated) {
          alert('Livro deve estar como doado!');
        } else {
          const modalRef = this._modalService.open(TrackingComponent, {
            backdropClass: 'light-blue-backdrop',
            centered: true
          });

          modalRef.result.then(
            result => {
              if (result === 'Success') {
                this.getDonations();
              }
            },
            reason => {
              if (reason === 'Success') {
                this.getDonations();
              }
            }
          );

          modalRef.componentInstance.bookId = event.data.id;
          modalRef.componentInstance.bookTitle = event.data.title;
          modalRef.componentInstance.trackingNumber = event.data.trackingNumber;
          break;
        }
      }
    }
  }
}
