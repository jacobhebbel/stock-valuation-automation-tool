import { FieldNotFoundError } from './errors.js';
import mapping from './fmpMapping.json' with { type: 'json' };
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
        const endpoints = ['income-statement', 'balance-sheet-statement', 'cash-flow-statement', 'key-metrics'];
        const params = {
            'symbol': ticker,
            'apikey': process.env.FMP_KEY
        };

        var allData = {};
        for (const endpoint of endpoints) {
            
            // build the url
            const searchParams = new URLSearchParams(params).toString();
            console.log(`${url}${endpoint}?${searchParams}`);
            
            // get the response
            const response = await axios.get(`${url}${endpoint}?${searchParams}`);
            
            // check the response is ok
            if (response.status != 200) throw new Error(`Could not connect to SEC api`);
            
            // loops over all fields
            const skipValues = ["symbol", "date", "fiscalYear", "period", "reportedCurrency"];
            response.data.forEach(json => {
                
                // adds all entries of the json to allData, where each field has its metadata attached
                for (const [key, value] of Object.entries(json)) {
                    if (skipValues.includes(value))
                        continue;

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

            console.log(`looking for field ${field} using alias list ${aliasList}`);

            // find the first alias that's in the edgar response object
            const matchingAlias = aliasList.find(alias => alias in data);
            
            console.log(matchingAlias);
            console.log(data[matchingAlias]);
            
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
                console.log(`made entry ${field} : ${results[field]}`);
        });

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