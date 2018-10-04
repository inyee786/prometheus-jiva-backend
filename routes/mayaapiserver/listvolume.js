const express = require("express");
const router = express();
const http = require('request');


const nameSpaces = `${process.argv[2]}`;
const mayaapiIp = `${process.argv[3]}`;
const applicationDeployedNamespaces = `${process.argv[2]}`;

var options = {
    url: `http://${mayaapiIp}:5656/latest/volumes/`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'namespace': nameSpaces
    }
};
console.log(options);

for (i = 0; i < process.argv.length; i++) {
    console.log(process.argv[i]);
}

http.get(options, function (err, resp, body) {
    var mayaVolume = [];
    if (err) {
        console.log("this is volume erro namespaces ");
    } else {
        data = JSON.parse(body);
        console.log(JSON.stringify(data.items));
        console.log("this is volume lis http");
        console.log(data);

        for (i = 0; i < data.items.length; i++) {
            if (data.items[i].spec.casType == "jiva") {
                mayaVolume.push({
                    name: data.items[i].metadata.name,
                    size: data.items[i].metadata.annotations['openebs.io/volume-size'],
                    status: data.items[i].metadata.annotations['openebs.io/controller-status'],
                    replicas: data.items[i].spec.replicas,
                    kind: data.items[i].kind,
                    castype: data.items[i].spec.casType
                });
            }
        }
        console.log(mayaVolume);
    }
});

router.get('/volume', (req, res) => {
    var mayaVolume = [];
    var options = {
        url: `http://${mayaapiIp}:5656/latest/volumes/`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'namespace': nameSpaces
        }
    };

    http.get(options, function (err, resp, body) {
        if (err) {
            //   reject(err);
            console.log(err);
            console.log("this is volume erro namespaces ");
        } else {
            data = JSON.parse(body);
            // console.log(data);

            for (i = 0; i < data.items.length; i++) {
                if (data.items[i].spec.casType == "jiva") {
                    mayaVolume.push({
                        name: data.items[i].metadata.name,
                        size: data.items[i].metadata.annotations['openebs.io/volume-size'],
                        status: data.items[i].metadata.annotations['openebs.io/controller-status'],
                        replicas: data.items[i].spec.replicas,
                        kind: data.items[i].kind,
                        castype: data.items[i].spec.casType
                    });
                }
            }
        }
        // console.log(body +' this is body1')
        console.log(mayaVolume);

        res.status(200).json(mayaVolume);
    });

});
module.exports = router;