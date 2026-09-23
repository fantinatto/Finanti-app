import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfilePayload, UserProfile } from '../interfaces/user.interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/users/me');
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.patch<UserProfile>('/users/me', payload);
  }
}
