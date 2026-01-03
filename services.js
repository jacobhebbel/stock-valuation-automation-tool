import { FieldNotFoundError } from './errors.js';
import mapping from './fmpMapping.json' with { type: 'json' };
import {
    calculateMarketReturn,
    calculateCostOfDebt,
} from './utils.js';
import axios from 'axios';


class TemplateService {

    constructor() {}

    // common access function
    async getTickerInfo(query) {
        const data = await this.fetchData(query);
        const result = await this.formatData(data);
        return result;
    }

    // override these functions
    async fetchData(ticker) {}
    async formatData(data) {}
}

export class EdgarService extends TemplateService {

    // call super constructor
    constructor() { 
        super();
    }
    static tickerToCik = null;

    // call for getting data
    async fetchData(ticker) {

        console.log('calling fetch data on edgar service');

        const url = 'https://financialmodelingprep.com/stable/';
        
        // endpoints to hit for all the data
        const stockEndpoints = ['income-statement', 'balance-sheet-statement', 
            'cash-flow-statement', 'key-metrics', 'ratios'];
        const rateEndpoints = ['market-risk-premium', 'treasury-rates', 'profile'];
        
        const params = {
            'symbol': ticker,
            'apikey': process.env.FMP_KEY
        };

        var allData = {};
        for (const endpoint of [...stockEndpoints, ...rateEndpoints]) {
            
            // build the url
            const searchParams = new URLSearchParams(params).toString();
            console.log(`${url}${endpoint}?${searchParams}`);
            
            // get the response
            const response = await axios.get(`${url}${endpoint}?${searchParams}`);
            
            // check the response is ok
            if (response.status != 200) throw new Error(`Could not connect to SEC api`);
            
            const data = response.data;

            // logic specific to rate endpoints
            if (rateEndpoints.includes(endpoint)) {
                switch (endpoint) {
                    case 'market-risk-premium':
                        allData[endpoint] = [{
                            value: data.find(premium => premium.country == "United States").totalEquityRiskPremium
                        }];
                        continue;

                    case 'treasury-rates':
                        allData[endpoint] = [{
                            value: data[0].year10,
                            date: data[0].date
                        }];
                        continue;

                    case 'profile':
                        allData[endpoint] = [{
                            value: data[0].beta
                        }];
                        continue;

                    default:
                        throw Error('unexpected behavior');
                }
            }

            // loops over all fields
            const skipValues = ["symbol", "date", "fiscalYear", "period", "reportedCurrency"];
            data.forEach(json => {
                
                // adds all entries of the json to allData, where each field has its metadata attached
                for (const [key, value] of Object.entries(json)) {

                    // skips metadata fields
                    if (skipValues.includes(value))
                        continue;
                    
                    // ensures key points to an array
                    if (!allData[key])
                        allData[key] = [];
                    
                    // attaches metadata to each individual filing
                    allData[key].push({
                        "value": value,
                        "date": json.date,
                        "fiscalYear": json.fiscalYear,
                        "period": json.period,
                        "currency": json.reportedCurrency
                    });                        
                }
            });
        }
        
        return allData;
    }

    async formatData(data) {
        
        // go through each field: alias combo
        let results = {};
        Object.entries(mapping).forEach(([field, aliasList]) => {

            // find the first alias that's in the edgar response object
            const matchingAlias = aliasList.find(alias => alias in data);
            
            if (matchingAlias)
                results[field] = {
                    ...data[matchingAlias][0],
                    givenAlias: field,
                    reportedAs: matchingAlias
                };
            

            // ensure the field is populated. if not, throw an error
            if (!results[field])
                // throw new FieldNotFoundError('Could not find a filing label suitable for field ' + field);
                results[field] = null;
            else
                console.log('made entry %o : %o', field, results[field]);
        });


        // some fields need to be calculated
        const calculatedFields = {
            'Cost of Debt': calculateCostOfDebt,
            'Market Return': calculateMarketReturn
        };
        
        // calculate each field
        Object.entries(calculatedFields).forEach(([field, func]) => results[field] = func(results));
        
        // logging the output
        console.log('Sending response object %o', results);
        
        // return a json
        return results;
    }
}


export class FactsetService extends TemplateService {

    constructor(args) { super(args); }

    async fetchData(ticker) {

    }

    async formatData(data) {
        
    }
};