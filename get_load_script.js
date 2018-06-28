var fs = require('fs')
var qlikEngine = require('./qlik_engine.js')

var qlikServer = 'qlik.jefferson.edu:4747';
var certPath = 'C:\\Users\\cxs339\\Documents\\Qlik\\qlik.jefferson.edu';
var qlikUserHeader = 'UserDirectory=INTERNAL; UserId=sa_engine';
var appId = "1ed10771-7b34-4880-a496-47fa98f2df64"
//certPath, qlikServer, qlikUserHeader, appGUID
qlikEngine.openWebsocket(certPath,qlikServer,qlikUserHeader,appId ).then(function(webS){
    let qWS = webS
    let handle;
    qlikEngine.openQlikApp(appId, qWS).then(function(h){
        handle = h;
        qlikEngine.getAppLoadScript(handle,qWS).then(function(load_Script){
         
           
            fs.writeFile("./scripts/script1.txt", load_Script, function(err) {
                if(err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            qWS.close()
        })
    })
})
