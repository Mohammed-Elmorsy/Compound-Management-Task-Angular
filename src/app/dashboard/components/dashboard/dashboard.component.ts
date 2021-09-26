import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { Visit } from 'src/app/models/visit';
import { Visitor } from 'src/app/models/visitor';
import { AuthService } from 'src/app/services/auth.service';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [ MessageService, ConfirmationService ]

})
export class DashboardComponent implements OnInit {


  visits: Visit[] = [];

  role = this.auth.getUserPayLoad().role;
  items: MenuItem[] = [];
  displayAddVisit: boolean = false;
  visitsLoading: boolean = true;
  visitForm: FormGroup;
  visitorForm: FormGroup;
  
  constructor(public auth: AuthService, private router: Router
              , private formBuilder: FormBuilder, private visitService: VisitService,
              private messageService: MessageService,
              private primengConfig: PrimeNGConfig,
              private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    if (this.role === 'Admin') {
      this.visitService.getAllVisits().subscribe(
        res => {
          this.visits = res;
          this.visitsLoading = false;
        },
        err => {
          alert('error loading visits');
        }
      )
    }

    if (this.role === 'Owner') {
      let userId = this.auth.getUserPayLoad().id;
      this.visitService.getUserVisits(userId).subscribe(
        res => {
          this.visits = res;
          this.visitsLoading = false;
        },
        err => {
          alert('error loading visits');
        }
      )
    }
  }

  showAddVisitDialog() {
    this.displayAddVisit = true;
    this.createVisitForm();
  }

  createVisitForm() {
    this.visitForm = this.formBuilder.group({
      number: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      type: [''],
      carPlateNumber: [''],
      date: [''],
      status: [this.getVisitStatus()],
      visitor: this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: ['', [Validators.required]],
        phone: [''],
      })
    })
  }


  getVisitStatus(): string {
    return this.role === 'Admin' ? 'confirmed' : 'pending';
  }

  addVisit() {
    console.log('visit form ', this.visitForm.value);
    let newVisit: Visit = { ...this.visitForm.value, userId: +this.auth.getUserPayLoad().id, userFullName: this.auth.getUserPayLoad().name};
    console.log('newVisit', newVisit);

    this.visitService.addVisit(newVisit).subscribe(
      (res: Visit) => {
        this.visits.push(res);
        this.messageService.add({key: 'visitAdded', severity:'success', summary: 'Added', detail: 'Successfully added the visit'});
        this.displayAddVisit = false;
        if (this.role === 'Admin') this.sendEmailToVisitor(res.visitor);
      },
      err => {
        console.log('errr', err);
        this.messageService.add({key: 'visitAddFailed', severity:'error', summary: 'Failed', detail: 'Failed to add the visit'});
        this.displayAddVisit = false;
      }
    );
  }

  confirmVisit(visit: Visit) {
    visit.status = 'confirmed';
    console.log('visit', visit);
    this.visitService.updateVisit(visit).subscribe(
      (res: Visit) => {
        this.messageService.add({key: 'visitUpdated', severity:'success', summary: 'Updated', detail: 'Successfully updated visit status'});
        this.displayAddVisit = false;
        this.sendEmailToVisitor(res.visitor);
      },
      err => {
        this.messageService.add({key: 'visitUpdateFailed', severity:'error', summary: 'Updated', detail: 'Failed to update visit status'});
        this.displayAddVisit = false;
      }
    )
  }

  cancelVisit(visit) {
    visit.status = 'rejected';
    this.visitService.updateVisit(visit).subscribe(
      res => {
        this.messageService.add({key: 'visitUpdated', severity:'success', summary: 'Updated', detail: 'Successfully updated visit status'});
        this.displayAddVisit = false;
      },
      err => {
        this.messageService.add({key: 'visitUpdateFailed', severity:'error', summary: 'Updated', detail: 'Failed to update visit status'});
        this.displayAddVisit = false;
      }
    )
  }

  sendEmailToVisitor(visitor: Visitor) {
    this.visitService.sendEmailToVisitor(visitor).subscribe(
      res => {
        alert('email was sent');
        //this.messageService.add({key: 'visitUpdated', severity:'success', summary: 'Updated', detail: 'Successfully updated visit status'});
      },
      err => {
        alert('email was not sent');
      }
    )
  }

  logout(){
    this.auth.logout().subscribe( 
      result => {
        console.log("user logged out successfully", result);
        localStorage.removeItem('token');   
        this.router.navigate(["auth/login"]);
      },
      error => {
        alert('error while logging out');
        console.log("error while logging out", error);
      })

  }

}
