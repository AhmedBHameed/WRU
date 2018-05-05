import { HttpModule } from '../lib/http.module';
import { environment } from '../../environment/environment';
import { MarkerInterface } from './marker.interface';

declare let google: any;
export class GoogleMap {
    http: HttpModule;
    gmap: any;
    labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    labelIndex: number = 0;
    // store important information inside the marks 
    markerObj: MarkerInterface = {
        name: '',
        lat: null,
        lng: null,
        id: null
    }
    // Array of marker objects
    marks: Array<MarkerInterface> = [];
    // Index of the marker after click on it and save where is this marker inside marks array
    marksReference: number;
    // Cash the whole object for the marker.
    chachedMarker: any;

    modal: any = $('#map-modal');
    modalInput = $('#map-modal .marker-name');
    
    inputs: any = $('.source, .distination, .transportation');
    source: any;
    distination: any;
    transportation: string;
    directionsService: any = new google.maps.DirectionsService;
    directionsDisplay: any = new google.maps.DirectionsRenderer;

    constructor() {
        this.http = new HttpModule();
    }
    init() {
        setInterval( this._onDropListChange.bind(this), 300);
        this._drawMap();
        this._listen();
        let getLocations = {
            query: `
                {
                    getLocations{
                        id,
                        name,
                        lat,
                        lng
                    }
                }
            `
        }
        this.http.post(environment.backendApi, getLocations,
            (res: any) => {
                if(res.data.getLocations.length) {
                    let locations: Array<MarkerInterface> = res.data.getLocations;
                    locations.forEach( (location: any, i: number) => {
                        this._setMarkers(location);
                    });
                    this._updateView();
                }
            },
            (err: any) => {
                console.error(err);
        });
        this._activateDelete(false);
    }
    private _onDropListChange(e: any) {
        this.inputs.each( (i: number, el: any) => {
            switch(true) {
                case($(el).is('.source')):
                    this.source = this.marks[$(el).val()];
                    break;
                case($(el).is('.distination')):
                    this.distination = this.marks[$(el).val()];
                    break;
                case($(el).is('.transportation')):
                    this.transportation = $(el).val();
                    break;
                default:
            }
        });
        if( (this.source && this.distination) &&  (this.source.id != this.distination.id) ) {
            $('.activateDirection').show(300);
        } else {
            $('.activateDirection').hide(300);
            $('.deactivateDirection').hide(300);
        }
    }
    private _activateDelete(status: boolean) {
        if(status) {
            $('.deleteMarker').text('Delete ' + this.markerObj.name + ' marker').prop('disabled', false);
        } else {
            $('.deleteMarker').text('Delete marker').prop('disabled', true);
        }
    }
    // Update the view of drop down menu.
    private _updateView() {
        $('.persones-name').each( (index: number, el: any) => {
            $(el).html('');
            this.marks.forEach( (location: any, i: number) => {
                $(el).append(`<option value="` + i + `">` + location.name + `</option>`);
            });
        });
    }
    viewMarkerInfo() {
        let mv = $('.marker-info'),
            latView = mv.find('.lat'),
            lngView = mv.find('.lng'),
            nameView = mv.find('.name');
        latView.text(this.markerObj.lat);
        lngView.text(this.markerObj.lng);
        nameView.text(this.markerObj.name);
    }
    private _listen() {
        this.modal.on({
            "show.bs.modal": () => {
                setTimeout( () => {
                    this.modalInput.val('').get(0).focus();
                }, 50);
            }
        })
    }
    private _cachMarkInfo(marker: any) {
        this.chachedMarker = marker;
        this.markerObj.name = marker.title;
        this.markerObj.lat = marker.position.lat();
        this.markerObj.lng = marker.position.lng();
        this.markerObj.id = marker.id;
        this._setMarksReference(marker);
    }
    private _setMarksReference(marker: any) {
        let pos: any = marker.id, markerIdex: number;
        this.marks.forEach( (mark: any, index: number) => {
            let cachedPos = mark.id;
            if(cachedPos == pos) {
                markerIdex = index;
            }
        });
        this.marksReference = markerIdex;
    }
    private _setMarkers(data: MarkerInterface) {
        let that = this;
        let marker = new google.maps.Marker({
            position: new google.maps.LatLng( data.lat, data.lng),
            map: this.gmap,
            title: data.name,
            draggable: true,
            label: this.labels[this.labelIndex++ % this.labels.length],
            id: data.id,
            animation: google.maps.Animation.DROP
          });
        this.marks.push(data);
        marker.addListener('mousedown', function() {
            that.directionsDisplay.setMap(null);
            that._cachMarkInfo(this);

            that.viewMarkerInfo();
            that._activateDelete(true);
        });
        marker.addListener('dragend', function() {
            that._cachMarkInfo(this);
            that.marks[that.marksReference] = that.markerObj;

            that.viewMarkerInfo();
            that.updateMarker();
        });
    }
    deactivateRoute() {
        $('.deactivateDirection').hide(300);
        this.directionsDisplay.setMap(null);
    }
    calculateAndDisplayRoute(): boolean {
        this.directionsService.route({
            origin: new google.maps.LatLng(this.source.lat, this.source.lng),
            destination: new google.maps.LatLng(this.distination.lat, this.distination.lng),
            travelMode: this.transportation,
        }, (response: any, status: string) => {
            if (status === 'OK') {
                $('.deactivateDirection').show(300);
                this.directionsDisplay.setMap(this.gmap);
                this.directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
        return false;
    }
    private _drawMap() {
        let viennaLocation = {lat: 48.2082, lng: 16.3738};
        this.gmap = new google.maps.Map($('#Google-Map').get(0), {
            zoom: 14,
            center: viennaLocation
        });
        this.gmap.addListener('click', (e: any) => {
            this.modal.modal('show');
            this.markerObj.lat = e.latLng.lat();
            this.markerObj.lng = e.latLng.lng();
        });
    }
    addMarkerInfo() {
        this.markerObj.name = this.modalInput.val();
        let addLocation = {
            query: `
                mutation{
                    addLocation(name: "` + this.markerObj.name + `", lat: "` + this.markerObj.lat + `", lng: "` + this.markerObj.lng + `"){
                    id,
                    name,
                    lat,
                    lng,
                    ack {
                            ok
                            message
                        }
                    }
                }
            `
        }
        this.http.post(environment.backendApi, addLocation,
            (res: any) => {
                this._setMarkers(res.data.addLocation);
                this.modal.modal('hide');
                this._updateView();
            }, (err: any) => {
                console.log(err);
            });
    }
    updateMarker() {
        let updateLocation = {
            query: `
                mutation{
                    updateLocation(id: ` + this.marks[this.marksReference].id + `, name: "` + this.markerObj.name + `", lat: "` + this.markerObj.lat + `", lng: "` + this.markerObj.lng + `"){
                        id,
                        name,
                        lat,
                        lng,
                        ack {
                            ok
                            message
                        }
                    }
                }
            `
        }
        this.http.post(environment.backendApi, updateLocation,
            (res: any) => {
            }, (err: any) => {
                console.log(err);
        });
    }
    deleteMarker() {
        let deleteLocation = {
            query: `
                mutation {
                    deleteLocation(id: ` + this.marks[this.marksReference].id + `){
                        ack {
                            ok
                            message
                        }
                    }
                }
            `
        }
        this.http.post(environment.backendApi, deleteLocation,
            (res: any) => {
                this.chachedMarker.setMap(null);
                this.marks.splice(this.marksReference, 1);
                this.markerObj.name = '';
                this.markerObj.lat = null;
                this.markerObj.lng = null;
                this.markerObj.id = null;
                this._activateDelete(false);
                this._updateView();
                this.viewMarkerInfo();
            }, (err: any) => {
                console.error(err);
        });
    }

}