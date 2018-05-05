import './bootstrap/bootstrap';
import { GoogleMap } from './app/lib/gmap.module';

declare let window: any;
document.addEventListener("DOMContentLoaded", () => {
    window.googlemap = new GoogleMap();
    window.googlemap.init();
    // var http: HttpModule = new HttpModule();
    // http.get(environment.test, (res: any) => {
    //     console.log(res);
    // },
    // (err: any) => {
    //     console.log(err);
    // });
}, false);