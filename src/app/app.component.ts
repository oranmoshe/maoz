import {Component, ElementRef, NgZone, OnInit, Pipe, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import {AppService} from './services/store.service';
import {GeoCoord, HaversineService} from 'ng2-haversine';

@Component({
  selector: 'app-root',
  styles: [`
    agm-map {
      height: 300px;
    }
  `],
  templateUrl: 'app.component.html',
})

export class AppComponent implements OnInit {

  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  stores = [];
  public mapDistanceStore: Map<number, StoreDto>;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private storeService: AppService,
    private _haversineService: HaversineService
  ) {
    this.mapDistanceStore = new Map<number, StoreDto>();
  }

  ngOnInit() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;

          this.calculateDistances();
        });
      });

    });


  }

  private getDistance(store1: CoordinateDto, store2: CoordinateDto): number {
    return this._haversineService.getDistanceInMiles( store1 , store2);
  }

  private calculateDistances() {
    // Read json of stores
    this.storeService.getStores().subscribe(res => {
      this.stores = res.json() as StoreDto[];
      this.mapDistanceStore.clear();
      this.stores.map(store => {
        this.mapDistanceStore.set(this.getDistance(store.coordinates, { latitude: this.latitude, longitude: this.longitude}), store);
      });
      console.log(this.mapDistanceStore);
    });
  }

  public getData() {
    return Array.from( this.mapDistanceStore.keys());
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
}
