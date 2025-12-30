import {
    FactsetService,
    EdgarService
} from './services.js';
import { InvalidServiceStringError } from './errors.js'
import axios from 'axios';


/*
Specs:
    Requires:   None
    Returns:    Valid service object
    Modifies:   None
    Throws:     InvalidServiceStringError
*/
export function stringToService(string) {
    
    const validStrings = ['factset', 'edgar'];
    if (!(validStrings.includes(string)))
        throw new InvalidServiceStringError('The string was not found');

    switch (string) {

        case 'factset':
            return new FactsetService();
        
        case 'edgar':
            return new EdgarService();
        default:
            throw new InvalidServiceStringError('weird mismatch');
    }
}

/*
Specs:
    Requires:   op1, op2, operator be non-null
                op1, op2 are Numeric datatypes
                operator is a string in ['+', '-', '*', '/']
    Returns:    the result of applying operation on op1, op2 in their order
    Modifies:   None
    Throws:     None
*/
export function executeOperation(op1, op2, operator) {
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

/*
Specs:
    Requires:   none
    Returns:    A dictionary mapping of stock ticker to cik
    Modifies:   None
    Throws:     None
*/
export async function tickerToCik() {

    // auth header is required for interacting with sec edgar api
    const authHeader = { 'User-Agent': 'FinanceClubResearch jacob.hebbel@gmail.com' };
    const response = await axios.get('https://www.sec.gov/files/company_tickers.json', {
        headers: {
            ...authHeader,
            'Accept-Encoding': 'gzip, deflate, br'
        }
    });
    
    // check the response is ok
    if (response.status != 200) throw new Error(`Could not connect to SEC api`);
    const data = response.data;    
    
    // convert the result into a { ticker: 10-digit cik } map
    const mapping = {}; 
    Object.values(data).forEach(item => {
        const paddedCik = item.cik_str.toString().padStart(10, '0');
        mapping[item.ticker] = paddedCik;
    });

    return mapping;
}