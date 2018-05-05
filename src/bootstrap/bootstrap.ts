declare global {
    const $: any;
    interface Window {
        XMLHttpRequest: any
    }
}

import 'jquery';
import '../app/bootstrap/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import '../app/js/bootstrap-notify.min.js';
import '../app/scss/style.scss'

export { };