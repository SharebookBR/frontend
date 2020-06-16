import { AppConfigModule } from './../../../app-config.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitatorNotesComponent } from './facilitator-notes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('FacilitatorNotesComponent', () => {
  let component: FacilitatorNotesComponent;
  let fixture: ComponentFixture<FacilitatorNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        AppConfigModule,
      ],
      declarations: [FacilitatorNotesComponent],
      providers: [NgbActiveModal],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilitatorNotesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.bookId = '9eb3fe55-d195-4f9b-9533-08d6eae2daab';
    component.bookTitle = 'My Book';
    component.facilitatorNotes = 'My Notes for book';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
