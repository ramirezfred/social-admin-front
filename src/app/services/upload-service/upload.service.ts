import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';

@Injectable()
export class UploadService {

  private data:any;

  constructor(private http: HttpClient,) { }

    //Carga de img---<
    subirImagen(rutaImg,fileImg,baseImgApi,baseApi): Observable<string> {

      return Observable.create(observer => {

        //Solo admitimos imágenes.
        if (!fileImg.type.match('image.*')) {
          observer.error('');
          observer.complete();
        }

        let imgUpload = ''; 
       
        const formModel = this.prepareSave(rutaImg,fileImg,baseImgApi);

        this.http.post(baseApi+'imagenes?token='+localStorage.getItem('mouvers_token'), formModel)
           .toPromise()
           .then(
             data => { // Success
                //console.log(data);
                this.data = data;
                imgUpload = this.data.imagen;

                observer.next(imgUpload);
                observer.complete();
                
             },
             msg => { // Error
               //console.log(msg);
               //console.log(msg.error.error);

               observer.error('');
               observer.complete();
             }
           );

      });
    }

    private prepareSave(rutaImg,fileImg,baseImgApi): any {
      //let rutaImg = 'city'+this.ciudad_id+'/slider';
      let input = new FormData();
      input.append('imagen', fileImg);
      input.append('carpeta', rutaImg);
      input.append('url_imagen', baseImgApi);
      return input;
    }
    
    //Carga de img--->

}
