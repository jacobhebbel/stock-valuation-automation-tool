// imports
import 'dotenv/config';
import express from 'express';

import { stringToService } from './utils.js';
import { 
    InvalidServiceStringError, 
    InvalidTickerStringError,
    FieldNotFoundError
} from './errors.js';

const app = express();

// middlewares
app.use(express.json()); 


// serve frontend
app.use(express.static('public'));

// endpoints
app.get('/health', async (req, res) => {

    // will be handled by service objects
    const factsetHealth = false; 
    const edgarHealth = false;

    // send a response indicating which services are on
    return res.json({
        serverHealth: true,
        factsetHealth,
        edgarHealth
    });
});

app.get('/data/:stockTicker/:service', async (req, res) => {

    let Service, ticker;
    try {

        if (!req.params.service || !req.params.stockTicker)
            return res.status(400).json({ 'error': '1 or more path parameters missing' });

        // initialize vars
        Service = stringToService(req.params.service.trim().toLowerCase());
        ticker = req.params.stockTicker.toUpperCase();

    } catch (error) {

        // log the error 
        console.log('\n\n\nERROR ENCOUNTERED:\n\n%O\n\n\n', error);

        // The provided string didnt match one of the supported datasets
        if (error instanceof InvalidServiceStringError)
            return res.status(404).json({ 'error': 'the specified service does not match a supported service' });
        
        // if we can't account for the error, then serve a general 500  
        return res.status(500).json({ 'error': 'Internal Server Error '});
    }

    // now we have the service, its time to query our dataset for the ticker 
    // after getting the data, we return it in the required field: value format    

    try {

        // executes the query and returns a formatted json of field: value
        const data = await Service.getTickerInfo(ticker);
        return res.status(200).json({ data });
    } catch (error) {

        // log the error 
        console.log('\n\n\nERROR ENCOUNTERED:\n\n%O\n\n\n', error);
        
        // stock ticker wasn't found in the service
        if (error instanceof InvalidTickerStringError)
            return res.status(404).json({ 'error': 'the provided ticker string wasn\'t found in the dataset' });
        
        if (error instanceof FieldNotFoundError)
            return res.status(500).json({ 'error': 'The dataset couldn\t collect one or more fields' });

        // if we can't account for the error, then serve a general 500  
        return res.status(500).json({ 'error': 'Internal Server Error '});
    }
});

app.listen(3000, () => {
    console.log('live on port 3000');
});