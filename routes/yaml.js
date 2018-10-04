
const express = require('express');
const router = express();

router.get('/yaml', (req, res) => {
    res.status(200).json({ 
        status: 200, 
        workloadName: "prometheus",
        nameSpaceyaml: "https://github.com/openebs/e2e-infrastructure/blob/master/production/mongo-jiva/mongo-jiva-namespace.yaml",
        workloadyaml:"https://github.com/openebs/e2e-infrastructure/blob/master/production/mongo-jiva/mongo-jiva-mongo.yaml"
 });
});



module.exports = router;