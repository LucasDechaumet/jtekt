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

  get(baseURL: string) {
    return this.httpClient.get(this.baseURL + baseURL, this.option);
  }

  post(baseURL: string, body: any) {
    return this.httpClient.post(this.baseURL + baseURL, body, this.option);
  }

  put(baseURL: string, body: any) {
    return this.httpClient.put(this.baseURL + baseURL, body, this.option);
  }

  delete(baseURL: string) {
    return this.httpClient.delete(this.baseURL + baseURL, this.option);
  }

  patch(baseURL: string, body: any) {
    return this.httpClient.patch(this.baseURL + baseURL, body, this.option);
  }
}
