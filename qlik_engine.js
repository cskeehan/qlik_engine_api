var WebSocket = require('ws')
var fs = require('fs')

module.exports = {

    openWebsocket: function (certPath, qlikServer, qlikUserHeader, appGUID) {
        var ws;

        return new Promise((resolve, reject) => {

            var getDocs = {
                "jsonrpc": "2.0",
                "id": 8,
                "method": "GetDocList",
                "handle": -1,
                "params": []
            }

            var certificates = {
                cert: fs.readFileSync(certPath + '\\client.pem'),
                key: fs.readFileSync(certPath + '\\client_key.pem'),
                root: fs.readFileSync(certPath + '\\root.pem')
            };

            var append;

            if (appGUID != null) {
                append = appGUID;
            } else {
                append = createGuid();
            }
            var wsString = 'wss://' + qlikServer + '//app//' + append;

            ws = new WebSocket(wsString, {
                ca: certificates.root,
                cert: certificates.cert,
                key: certificates.key,
                headers: {
                    'X-Qlik-User': qlikUserHeader
                }
            });

            function ehandler(err) {
                err.message = "qlikEngineAPI.openWebsocket: " + err.message
                reject(err);
            }
            ws.on('error', ehandler);
            ws.onopen = function () {
                ws.removeListener('error', ehandler);
                // console.log('opened')
                resolve(ws);
            };
        });
    },

    openQlikApp: function (appId, qlikWS) {

        return new Promise((resolve, reject) => {
            var openAppmsg = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "OpenDoc",
                "handle": -1,
                "params": [
                    "3e62c5f0-0a4c-472b-94d7-9c8cb4b2b803"
                ]
            }

            function handleropenQlikApp(msg) {

                var obj = JSON.parse(msg);
                // console.log(openAppmsg, msg)
                // console.log(msg)
                if (obj.hasOwnProperty('method')) {

                } else {
                    try {
                        qlikWS.removeListener('message', handleropenQlikApp);
                        qlikWS.removeListener('error', ehandler);
                        var handle = obj.result.qReturn.qHandle;
                        console.log(handle)
                        resolve(handle);
                    } catch (e) {
                        reject(obj.error);
                    }
                }

            }

            function ehandler(err) {
                reject(err);
            }
            qlikWS.on('error', ehandler);
            openAppmsg.params[0] = appId;
            qlikWS.on('message', handleropenQlikApp);
            qlikWS.send(JSON.stringify(openAppmsg));

        });
    },

    getAppLoadScript: function (appHandle, qlikWS) {

        return new Promise((resolve, reject) => {
            var getScript = {
                "jsonrpc": "2.0",
                "id": 0,
                "method": "GetScript",
                "handle": -1,
                "params": []
            }

            function handlergetAppLoadScript(msg) {
                var obj = JSON.parse(msg);
                qlikWS.removeListener('message', handlergetAppLoadScript);
                qlikWS.removeListener('error', ehandler);
                // console.log(obj)
                try {
                    var loadScript = obj.result.qScript;

                    resolve(loadScript);
                } catch (e) {
                    reject(e);
                }
            }

            function ehandler(err) {
                qlikWS.removeListener('message', handlergetAppLoadScript);
                qlikWS.removeListener('error', ehandler);
                reject(err);
            }
            qlikWS.on('error', ehandler);
            getScript.handle = appHandle;
            qlikWS.on('message', handlergetAppLoadScript);
            qlikWS.send(JSON.stringify(getScript));
        });

    },
    getAllInfo: function (appHandle, qlikWS) {

        //Method to get all object IDs
        var getAllInfo = {
            "jsonrpc": "2.0",
            "id": 4,
            "method": "GetAllInfos",
            "handle": 1,
            "params": []
        }

        return new Promise((resolve, reject) => {

            function handlergetAppLayoutFeild(msg) {
                var obj = JSON.parse(msg);

                qlikWS.removeListener('message', handlergetAppLayoutFeild);
                qlikWS.removeListener('error', ehandler);
                try {
                    var fieldHandle = obj.result;
                    //console.log(fieldHandle)
                    resolve(fieldHandle);
                } catch (e) {
                    reject(e);
                }
            }

            function ehandler(err) {
                qlikWS.removeListener('message', handlergetAppLayoutFeild);
                qlikWS.removeListener('error', ehandler);
                reject(err);
            }
            qlikWS.on('error', ehandler);
            getAllInfo.handle = appHandle;
            qlikWS.on('message', handlergetAppLayoutFeild);
            qlikWS.send(JSON.stringify(getAllInfo));
        });
    },

}
