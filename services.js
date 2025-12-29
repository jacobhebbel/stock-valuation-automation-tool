import { 
    InvalidTickerStringError,
    FieldNotFoundError
} from './errors';
import { mapping } from './edgarMapping.json';

class TemplateService {

    constructor() {}

    // common access function
    async getTickerInfo(query) {
        const data = await fetchData(query);
        const result = await formatData(data);
        return result;
    }

    // override these functions
    async fetchData(ticker) {}
    async formatData(data) {}
}


async function tickerToCik() {
    const data = await fetch('https://www.sec.gov/files/company_tickers.json');
    
    const mapping = {}; 
    Object.values(data).forEach(item => {
        const paddedCik = item.cik_str.toString().padStart(10, '0');
        mapping[item.ticker] = paddedCik;
    });

    return mapping;
}

function executeOperation(op1, op2, operator) {
    switch (operator) {
        case '+':
            return op1 + op2;
        case '-':
            return op1 - op2;
        case '*':
            return op1 * op2;
        case '/':
            return op1 / op2;
    }
}

class EdgarService extends TemplateService {

    // call super constructor
    constructor(args) { 
        super(args);
        this.authHeader = { 'User-Agent': 'stockTool jacob.hebbel@gmail.com' };
        
        tickerToCik().then(mapping => {
            this.tickerToCik = mapping
        }).catch(error => {
            throw new Error(error.message);
        }); 
    }

    // call for getting data
    async fetchData(ticker) {
        const cik = this.tickerToCik[ticker] || null;
        if (!cik) throw new InvalidTickerStringError();

        const url = 'data.sec.gov/api/xbrl/companyfacts/CIK' + cik + '.json';
        const data = await fetch(url);

        return data;
    }

    async formatData(data) {
        
        // extracting info for dcf
        const dcfMapping = mapping['dcf'];
        let dcfResults = {};

        // go through each field: alias combo for dcf
        Object.entries(dcfMapping).forEach((field, aliasList) => {
            
            // assigns the field the first found alias value
            dcfResults[field] = Object.values(aliasList).forEach(alias => {
                if (data[alias]) return data[value];
            });

            // ensure the field is populated. if not, throw an error
            if (!dcfResults[field])
                throw new FieldNotFoundError('Could not find a filing label suitable for this field');
        });

        
        // now time to fetch info for WACC
        const waccMapping = mapping['wacc'];
        let waccResults = {};
        Object.entries(waccMapping).forEach((field, instructor) => {

            // try using the static fields for building
            if (instructor.static) {
                waccResults[field] = Object.values(instructor.static).forEach(value => {
                    if (data[value])
                        return data[value];
                });
            }

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


class FactsetService extends TemplateService {

    constructor(args) { super(args); }

    async fetchData(ticker) {

    }

    async formatData(data) {
        
    }
}

module.exports = {
    FactsetService, 
    EdgarService
};