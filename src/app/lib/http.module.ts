/**
 * http module for calling APIs.
 */
export class HttpModule {
    private onSuccess: Function;
    private onFail: Function;
    private method: string;
    private url: string;
    constructor() { }

    private _checkFuns(onSuccess: Function, onFail: Function) {
        if( (typeof onSuccess != 'function') || (typeof onFail != 'function') ) {
            console.error('onSuccess, onFail arguments must be type of function.');
            return true;
        } else {
            this.onSuccess = onSuccess;
            this.onFail = onFail;
            return false;
        }
    }
    private makeRequest(data: any = null) {
        var xhr: XMLHttpRequest;
        if (window.XMLHttpRequest) {
            // code for modern 5,6 browsers
            xhr = new XMLHttpRequest();
         } else {
            // code for old IE 5,6 browsers
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.open(this.method, this.url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200) {
                // Do acction when there is respond.
                try {
                    this.onSuccess(JSON.parse(xhr.response));
                } catch(err) {
                    this.onSuccess(xhr.response);
                }
                
            } else if( xhr.status >= 400 ) {
                this.onFail('Server respond with ' + xhr.status + '\n' + xhr.response);
            }
        }
        try {
            data = JSON.stringify(data);
        } catch {
            console.error("Data type must be object!");
        }
        xhr.send(data);
    }

    /**
     * HTTP request with GET method
     * @param {string} endpoint
     * @param {function} onSuccess
     * @param {function} onFail
    */
    get(url: string, onSuccess: Function, onFail: Function) {
        this.url = url;
        this.method = 'Get';
        if(this._checkFuns(onSuccess, onFail)) throw new Error('Invalid arguments, callback functions must be provided.');
        this.makeRequest();
    }
    post(url: string, data: any, onSuccess: Function, onFail: Function) {
        this.url = url;
        this.method = 'Post';
        if(this._checkFuns(onSuccess, onFail)) throw new Error('Invalid arguments, callback functions must be provided.');
        this.makeRequest(data);
    }
 }
// var HttpModule = function(){
//     function httpClass() {
//         this.AJAX = $.ajax;
//     }
//     httpClass.prototype._checkFuns = function(onSuccess, onFail) {
//         if( (typeof onSuccess != 'function') || (typeof onFail != 'function') ) {
//             console.error('onSuccess, onFail arguments must be type of function.');
//             return true;
//         } else {
//             return false;
//         }
//     }
//     /**
//      * HTTP request with GET method
//      * @param {string} endpoint
//      * @param {function} onSuccess
//      * @param {function} onFail
//     */
//     httpClass.prototype.get = function(endpoint, onSuccess, onFail) {
//         if(this._checkFuns(onSuccess, onFail)) {
//             return;
//         }
//         this.AJAX({
//             url: endpoint,
//             type: 'GET',
//             contentType: "application/json; charset=utf-8",
//             dataType: "json",
//             success: onSuccess,
//             error: onFail
//         });
//     }
//     /**
//      * HTTP request with POST method
//      * @param {string} endpoint
//      * @param {any} data
//      * @param {function} onSuccess
//      * @param {function} onFail
//     */
//     httpClass.prototype.post = function(endpoint, data, onSuccess, onFail) {
//         if(this._checkFuns(onSuccess, onFail)){
//             return;
//         }
//         this.AJAX({
//             url: endpoint,
//             type: 'POST',
//             contentType: "application/json; charset=utf-8",
//             dataType: "json",
//             data: JSON.stringify(data),
//             success: onSuccess,
//             error: onFail
//         });
//     }
//     return new httpClass();
// };