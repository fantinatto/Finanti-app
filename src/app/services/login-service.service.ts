import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

    constructor(private httpClient: HttpClient){   

  }

    login(name: string, password: string){

    return this.httpClient.post<LoginResponse>(
      "/login", 
      {name, password}
    ).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token)
        sessionStorage.setItem("username", value.name)
      })
    )
  }

}
