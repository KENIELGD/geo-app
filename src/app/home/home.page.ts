import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from '../components/popover/popover.component';

import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  latitude: number;
  longitude: number;

  map: L.map;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(){
    this.getCurrentLocation();
  }

  async getCurrentLocation(){
    try{
        const coordinates = await Geolocation.getCurrentPosition();
        console.log('Current position:', coordinates);
        this.latitude=coordinates.coords.latitude;
        this.longitude=coordinates.coords.longitude;

        setTimeout(()=>{
          const map = L.map('map').setView([this.latitude, this.longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'your.mapbox.access.token'
        }).addTo(map);

        const marker = L.marker([this.latitude, this.longitude]).addTo(map);
        }, 1500);
    }catch(err){
      console.log(`Error al obtener señal GPS ${JSON.stringify(err)}`);
      this.presentPopOver();
    }
  }

  async presentPopOver(){
    const popover=await this.popoverController.create({
      backdropDismiss: false,
      component: PopoverComponent,
      cssClass: 'custom-popover',
      translucent: true
    });

    await popover.present();

    const {data} =await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', data);

    if(data){
      this.requestGeolocationPermission();
      window.location.reload();
    }else{
      console.log('Se cancelo el proceso');
    }
  }

  async requestGeolocationPermission(){
    try{
      const status=await Geolocation.requestPermissions();
      console.log('Status:'+status);
      if(status?.location==='granted'){
        this.getCurrentLocation();
      }
    }catch(err){
      console.log(`Error en los permisos ${err}`);
    }
  }
}
