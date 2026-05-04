import { Injectable } from '@angular/core';

@Injectable()
export class RutaBaseService {

	//Local freddy
	// public api_base = 'http://localhost/gitHub/Pa_llevar/pallevarAPI/public/';
	// public images_base = 'http://localhost/gitHub/Pa_llevar/pallevarAPI/public/images_uploads/';
	// public archivos_base = 'http://localhost/gitHub/Pa_llevar/pallevarAPI/public/archivos_uploads/';  

	//Remoto vps
	public api_base = 'https://api.goopy.app/';
	public images_base = 'https://api.goopy.app/images_uploads/';
	public archivos_base = 'https://api.goopy.app/archivos_uploads/';	
	
	constructor() { }

	getRutaApi(){
		return this.api_base;
	}

	getRutaImages(){
		return this.images_base;
	}

	getRutaArchivos(){
		return this.archivos_base;
	}

}
