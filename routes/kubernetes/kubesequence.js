const k8s = require("@kubernetes/client-node");
const express = require("express");
const router = express();
//this is for outside the cluster
let kc = new k8s.KubeConfig();
kc.loadFromCluster();
let k8sApi = new k8s.Core_v1Api(kc.getCurrentCluster()["server"]);
k8sApi.setDefaultAuthentication(kc);

// this is for inseide the cluster
// var k8sApi = k8s.Config.defaultClient();
var nameSpaces = `${process.argv[4]}`
router.get("/sequence", (request, response) => {
  k8sApi.listNode().then(resNode => {
    return new Promise(function (resolve, reject) {
      var listNode = [];
      for (i = 0; i < resNode.body.items.length; i++) {
        listNode[resNode.body.items[i].metadata.name] = "Node-" + (i + 1);
      }
      resolve(listNode);
    }).then(listNode => {
      k8sApi.listNamespacedPersistentVolumeClaim(nameSpaces).then(resp => {
        var pvcNodeDetails = {
          pvc: [],
          numberOfPvc: resp.body.items.length,
          nodes: listNode
        };
        return new Promise(function (resolve, reject) {
          for (i = 0; i < resp.body.items.length; i++) {
            if (resp.body.items[i].metadata.labels.type = "prometheus-jiva" && !resp.body.items[i].metadata.name.includes("cstor")){
              console.log(resp.body.items[i])
              pvcNodeDetails.pvc.push({
                name: resp.body.items[i].metadata.name,
                volumeName: resp.body.items[i].spec.volumeName
              });
            }
          }
          resolve(pvcNodeDetails);
        }).then(pvcNodeDetails => {
          k8sApi.listNamespacedPod(nameSpaces).then(res => {
            var overAllStatusCount = 0;
            var status = {
              Running: 0,
              Pending: 1,
              Failed: 2,
              Unknown: 3
            };
            var podDetails = {
              status: String,
              statefulSet: [],
              applicationPod: [],
              jivaController: [],
              jivaReplica: [],
              pvc: pvcNodeDetails
            };
            return new Promise(function (resolve, reject) {
              // console.log(JSON.stringify(res.body));
              for (i = 0; i < res.body.items.length; i++) {
                if (
                  status[res.body.items[i].status.phase] >= overAllStatusCount
                ) {
                  overAllStatusCount = res.body.items[i].status.phase;
                  podDetails.status = res.body.items[i].status.phase;
                }
                if (
                  res.body.items[i].metadata.labels.type ==
                  "workload" && res.body.items[i].metadata.labels.name ==
                  "openebs-prometheus-server-jiva"
                ) {
                  podDetails.statefulSet.push({
                    kind: res.body.items[i].metadata.ownerReferences[0].kind,
                    name: res.body.items[i].metadata.name,
                    namespace: res.body.items[i].metadata.namespace,
                    volumes: res.body.items[i].spec.volumes[0].name,
                    pvc:
                      res.body.items[i].spec.volumes[1].persistentVolumeClaim
                        .claimName,
                    status: res.body.items[i].status.phase,
                    nodeName: res.body.items[i].spec.nodeName,
                    dockerImage: res.body.items[i].spec.containers[0].image,
                    node: pvcNodeDetails.nodes[res.body.items[i].spec.nodeName],
                    // adjacency:
                    //   pvcNodeDetails.pvc.find(function(obj) {
                    //     return (
                    //       obj.name ===
                    //       res.body.items[i].spec.volumes[0]
                    //         .persistentVolumeClaim.claimName
                    //     );
                    //   }).volumeName + "-ctrl-"
                  });
                } else if (
                  res.body.items[i].metadata.ownerReferences[0].kind ==
                  "ReplicaSet"
                ) {
                  if (
                    res.body.items[i].metadata.name.includes("rep")
                  ) {
                    // console.log('name : ' + res.body.items[i].spec.containers[0].image);
                    podDetails.jivaReplica.push({
                      kind: res.body.items[i].metadata.ownerReferences[0].kind,
                      name: res.body.items[i].metadata.name,
                      namespace: res.body.items[i].metadata.namespace,
                      pvc: res.body.items[i].metadata.labels['openebs.io/persistent-volume-claim'],
                      vsm: res.body.items[i].metadata.labels.vsm,
                      nodeName: res.body.items[i].spec.nodeName,
                      node:
                        pvcNodeDetails.nodes[res.body.items[i].spec.nodeName],
                      status: res.body.items[i].status.phase,
                      openebsjivaversion:
                        res.body.items[i].spec.containers[0].image
                    });
                  } else if (
                    res.body.items[i].metadata.name.includes("ctr")
                  ) {
                    podDetails.jivaController.push({
                      kind: res.body.items[i].metadata.ownerReferences[0].kind,
                      name: res.body.items[i].metadata.name,
                      namespace: res.body.items[i].metadata.namespace,
                      pvc: res.body.items[i].metadata.labels['openebs.io/persistent-volume-claim'],
                      vsm: res.body.items[i].metadata.labels.vsm,
                      nodeName: res.body.items[i].spec.nodeName,
                      node:
                        pvcNodeDetails.nodes[res.body.items[i].spec.nodeName],
                      status: res.body.items[i].status.phase,
                      openebsjivaversion:
                        res.body.items[i].spec.containers[0].image,
                      // adjacency:
                      //   pvcNodeDetails.pvc.find(function(obj) {
                      //     return (
                      //       obj.name === res.body.items[i].metadata.labels.pvc
                      //     );
                      //   }).volumeName + "-rep-"
                    });
                  } else {
                    podDetails.applicationPod.push({
                      kind: res.body.items[i].metadata.ownerReferences[0].kind,
                      name: res.body.items[i].metadata.name,
                      namespace: res.body.items[i].metadata.namespace,
                      nodeName: res.body.items[i].spec.nodeName,
                      node:
                        pvcNodeDetails.nodes[res.body.items[i].spec.nodeName],
                      status: res.body.items[i].status.phase,
                      dockerImage: res.body.items[i].spec.containers[0].image
                    });
                  }
                }
              }

              resolve(podDetails);
            }).then(podDetails => {
              response.status(200).json(podDetails);
            });
          });
        });
      });
    });
  });
});

module.exports = router;
