import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from '@angular/router';
import { ICategory, IProduct, ITag } from '../model';
import { cloudinaryConfig } from "./../../configs";

const TOKEN = 'x-token';

@Injectable({
  providedIn: 'root'
})
export class DashboardServService {
  private pageNoOfProduct = 20; 
  constructor(private http: HttpClient, private router:Router) { }

  _url = 'https://tis-bandb.herokuapp.com/api/v1/'; //Base URL
  cloudinary = cloudinaryConfig;

  //Temporary data
  _category:ICategory;
  _product:IProduct;
  _tag:ITag;

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

  numberOfProductPages(totalNo){
    const no = Math.ceil(totalNo/this.pageNoOfProduct);
    return new Array(no).fill(1); //Thank you Leonardo Giroto
  }

  //Category fns
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
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', { file:  category.image, public_id: 'category-' + category.name, upload_preset : cloudinaryConfig.upload_preset}).subscribe(resp => {
        const response = <any>resp;
        console.log('cloudy', response);
        const token = this.getToken();
        this.http.post<any>(this._url + 'categories',{
          name: category.name,
          picture: {
            url: response.url,
            thumbnail: response.eager[0].url
          }
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
    })
  }

  updateCategory(category:ICategory){
    return new Promise(resolve=>{
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', { file:  category.image, public_id: 'category-' + category.name, upload_preset : cloudinaryConfig.upload_preset}).subscribe(resp => {
        const response = <any>resp;
        console.log('cloudy', response);
        const token = this.getToken();
        this.http.put<any>(this._url + 'categories/'+category.id,{
          name: category.name,
          picture: [{
            url: response.url,
            thumbnail: response.eager[0].url
          }]
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


// products
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

  getSearchedProducts(searchTerm:string, param:string){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'products/search', {
        params: new HttpParams().set('search', searchTerm).set('page', param)
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

  getProductsByCategory(catid:number, param:string){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'categories/'+ catid +'/products', {
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

  getProductsByTag(tagName:string){
    return new Promise(resolve=>{
      this.http.post<any>(this._url + 'products/tags',{
        tag: tagName
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

  getProduct(id){
    return new Promise((resolve, reject)=>{
      this.http.get<any>(this._url + 'products/' + id).subscribe(
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

  createProduct(product:IProduct){
    return new Promise(resolve=>{
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', { file:  product.images[0].url, public_id: 'product-' + product.name, upload_preset : cloudinaryConfig.upload_preset}).subscribe(resp => {
        const response = <any>resp;
        console.log('cloudy', response);
        const token = this.getToken();
        this.http.post<any>(this._url + 'products',{
          name: product.name,
          category_id: product.category.id,
          description: product.description,
          excerpts: product.excerpt,
          cost: product.cost,
          discount: product.discount,
          image:{
            url: response.url,
            thumbnail: response.eager[0].url
          },
          quantity: product.quantity
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
    })
  }

  updateProduct(product:IProduct){
    return new Promise(resolve=>{
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', { file:  product.images[0].url, public_id: 'product-' + product.name, upload_preset : cloudinaryConfig.upload_preset}).subscribe(resp => {
        const response = <any>resp;
        console.log('cloudy', response);
        const token = this.getToken();
        this.http.put<any>(this._url + 'products/' + product.id,{
          name: product.name,
          category_id: product.category.id,
          description: product.description,
          excerpts: product.excerpt,
          cost: product.cost,
          discount: product.discount,
          image:[{
            url: response.url,
            thumbnail: response.eager[0].url
          }],
          quantity: product.quantity
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
    })
  }

  deleteProduct(id){
    return new Promise((resolve, reject)=>{
      const token = this.getToken();
      this.http.delete<any>(this._url + 'products/' + id,{
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      }).subscribe(
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

  // tags
  getAllTags(){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.get<any>(this._url + 'tags',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
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

  createTag(tagName:string){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.post<any>(this._url + 'tags',{
        name: tagName,
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

  updateTag(tagName:string){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.put<any>(this._url + 'tags',{
        name: tagName,
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

  deleteTag(tagId:number){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.put<any>(this._url + 'tags/' + tagId,
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

  getTag(id){
    return new Promise((resolve, reject)=>{
      this.http.get<any>(this._url + 'tags/' + id).subscribe(
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

  //Get all user => Customer
  getCustomers(){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.get<any>(this._url + 'users',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            let customers = res.data.filter(r=> !r.is_admin);
            resolve(customers);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }


  //Orders
  getAllOrders(){
    return new Promise(resolve=>{
      const token = this.getToken();
      this.http.get<any>(this._url + 'orders-all',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
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
}
