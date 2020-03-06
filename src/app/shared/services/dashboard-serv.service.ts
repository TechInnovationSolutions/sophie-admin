import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from '@angular/router';
import { ICategory, IProduct } from '../model';

const TOKEN = 'x-token';

@Injectable({
  providedIn: 'root'
})
export class DashboardServService {
  private pageNoOfProduct = 20; 
  constructor(private http: HttpClient, private router:Router) { }

  _url = 'https://tis-bandb.herokuapp.com/api/v1/'; //Base URL

  //Temporary data
  _category:ICategory;
  _product:IProduct;

  setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
  }

  getToken(){
    return localStorage.getItem(TOKEN);
  }

  removeToken(){
    localStorage.removeItem(TOKEN);
  }

  isLogged() {
    return localStorage.getItem(TOKEN) != null;
  }

  checkLoggedIn(){
    this.isLogged() ? true: this.router.navigate(['/login']);
  }

  getCatgory(id){
    return new Promise((resolve, reject)=>{
      this.http.get<any>(this._url + 'categories/' + id).subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res.data);
          } else if(res.code == 401){
            this.removeToken();
            this.checkLoggedIn();
          } else{
            reject(res);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  getCatgories(){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'categories').subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res.data);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  createCategory(category:ICategory){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.post<any>(this._url + 'categories',{
        name: category.name,
        picture: new Array(category.image)
      },
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  updateCategory(category:ICategory){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.put<any>(this._url + 'categories/'+category.id,{
        name: category.name,
        picture: category.image
      },
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  deleteCategory(id:string){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.delete<any>(this._url + 'categories/'+id,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  getProducts(param:string){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'products', {
        params: new HttpParams().set('page', param)
      }).subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            res.data.pg = this.numberOfProductPages(res.data.total)
            resolve(res.data);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  numberOfProductPages(totalNo){
    const no = Math.ceil(totalNo/this.pageNoOfProduct);
    return new Array(no).fill(1); //Thank you Leonardo Giroto

  }
}
