
const express = require('express');
const router = express();

router.get('/yaml', (req, res) => {
    res.status(200).json({ 
        status: 200, 
        workloadName: "prometheus",
        nameSpaceyaml: "https://github.com/openebs/e2e-infrastructure/blob/db0ea81bf469956a938715f788ab4b2e35fd2f43/production/prometheus-jiva/prometheus-jiva-namespace.yaml",
        workloadyaml:"https://github.com/openebs/e2e-infrastructure/blob/db0ea81bf469956a938715f788ab4b2e35fd2f43/production/prometheus-jiva/openebs-monitoring-org.yaml"
 });
});



module.exports = router;