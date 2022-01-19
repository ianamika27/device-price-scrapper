var express = require('express');
var app = express();

const PORT = process.env.PORT || 8080;


app.listen(PORT,(error)=>{
    if(error)
        console.log(error)
    else
        console.log("Server listening on port ", PORT);
})

app.use(express.json({ limit: '50mb' }));

app.get('/testEndpoint', function (req, res) {
    res.send('Web Scrapping Script is running');
})

const googleService = require('./googleService');

app.get('/api/v1/srapper_script/initiate_scrapping',(req,res)=>{
    if(req.query.batch==1){
        googleService.web_scrapper_initiator_utility(req.body)
        res.send('Batch Scrapping process is in progress...')
    }
    else{
        googleService.web_scrapper_initiator(req.body,'')
        res.send('Scrapping process is in progress...')
    }
})