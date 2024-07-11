import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseURL: string = 'http://localhost:8081';
  option: any = {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };

  constructor(private httpClient: HttpClient) {}

  get<T>(baseURL: string) {
    return this.httpClient.get<T>(this.baseURL + baseURL, this.option);
  }

  post<T>(baseURL: string, body: any) {
    return this.httpClient.post<T>(this.baseURL + baseURL, body, this.option);
  }

  put<T>(baseURL: string, body: any) {
    return this.httpClient.put<T>(this.baseURL + baseURL, body, this.option);
  }

  delete<T>(baseURL: string) {
    return this.httpClient.delete<T>(this.baseURL + baseURL, this.option);
  }

  patch<T>(baseURL: string, body: any) {
    return this.httpClient.patch<T>(this.baseURL + baseURL, body, this.option);
  }
}
