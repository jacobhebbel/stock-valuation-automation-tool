import { 
    InvalidTickerStringError,
    FieldNotFoundError
} from './errors.js';

import {
    executeOperation,
    tickerToCik
} from './utils.js'

import mapping from './edgarMapping.json' with { type: 'json' };
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

    static tickerToCik = null;
    // call super constructor
    constructor() { 
        super();
        this.authHeader = { 'User-Agent': 'stockTool jacob.hebbel@gmail.com' };
    }

    // call for getting data
    async fetchData(ticker) {

        console.log('calling fetch data on edgar service');

        if (!EdgarService.tickerToCik)
            EdgarService.tickerToCik = await tickerToCik();

        const cik = EdgarService.tickerToCik[ticker] || null;
        if (!cik) throw new InvalidTickerStringError('ticker had no correlating cik');

        console.log('fetching facts for ' + ticker + ' with cik ' + cik);
        const url = 'https://data.sec.gov/api/xbrl/companyfacts/CIK' + cik + '.json';
        const authHeader = { 'User-Agent': 'FinanceClubResearch jacob.hebbel@gmail.com' };
        const response = await axios.get(url, {
            headers: {
                ...authHeader,
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });
        
        // check the response is ok
        if (response.status != 200) throw new Error(`Could not connect to SEC api`);        
        console.log(response.data);
        return response.data;
    }

    async formatData(data) {
        
        // extracting info for dcf
        const dcfMapping = mapping['dcf'];
        
        let dcfResults = {};

        // go through each field: alias combo for dcf
        Object.entries(dcfMapping).forEach(([field, aliasList]) => {
            
            console.log(`looking for field ${field} using alias list ${aliasList}`);

            // find the first alias that's in the edgar response object
            const matchingAlias = aliasList.find(alias => alias in data.facts['us-gaap']);
            dcfResults[field] = data.facts['us-gaap'][matchingAlias];
            
            // ensure the field is populated. if not, throw an error
            if (!dcfResults[field])
                throw new FieldNotFoundError('Could not find a filing label suitable for field ' + field);
            else
                console.log(`made entry ${field} : ${dcfResults[field]}`);
        });

        
        // now time to fetch info for WACC
        const waccMapping = mapping['wacc'];
        let waccResults = {};
        Object.entries(waccMapping).forEach(([field, instructor]) => {

            console.log(`looking for field ${field} using instructor ${instructor}`);

            // first see if any static fields are in the response object
            if (instructor.static) 
                waccResults[field] = instructor.static.find(alias => alias in data.facts['us-gaap']); 

            // if no static or no static field worked, try calculating it
            if (!waccResults[field]) {

                // parse operation aliases and operator
                const op1 = instructor[operation][0];
                const op2 = instructor[operation][1];
                const op = instructor[operation][2];

                if (data[op1] && data[op2])
                    waccResults[field] = executeOperation(data[op1], data[op2], op);
                else
                    throw new FieldNotFoundError();
            }
        });

        // return a json
        return {
            dcfResults,
            waccResults
        };
    }
}


export class FactsetService extends TemplateService {

    constructor(args) { super(args); }

    async fetchData(ticker) {

    }

    async formatData(data) {
        
    }
};