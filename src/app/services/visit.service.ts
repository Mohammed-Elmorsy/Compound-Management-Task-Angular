import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Visit } from '../models/visit';
import { Visitor } from '../models/visitor';


@Injectable({
  providedIn: 'root'
})
export class VisitService {

  constructor(private http: HttpClient) { }

  getAllVisits() {
    return this.http.get<Visit[]>(`${environment.baseURL}/Visits`);
  }

  getUserVisits(userId: number) {
    return this.http.get<Visit[]>(`${environment.baseURL}/Visits/${userId}`);
  }

  updateVisit(visit: Visit) {
    return this.http.put(`${environment.baseURL}/visits`, visit);
  }

  addVisit(visit: Visit) {
    return this.http.post(`${environment.baseURL}/visits`, visit);
  }

  sendEmailToVisitor(visitor: Visitor) {
    return this.http.post(`${environment.baseURL}/user/SendEmail`, visitor);
  }

/*   sendEmailToVisitor() {
    return this.http.get(`${environment.baseURL}/user/SendEmail`);
  } */
}
