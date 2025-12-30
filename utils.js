import {
    FactsetService,
    EdgarService
} from './services.js';
import { InvalidServiceStringError } from './errors.js'


/*
Specs:
    Requires:   None
    Returns:    Valid service object
    Modifies:   None
    Throws:     InvalidServiceStringError
*/
export function stringToService(string) {
    
    const validStrings = ['factset', 'edgar'];
    if (!validStrings.find(string))
        throw new InvalidServiceStringError('The string was not found');

    switch (string) {

        case 'factset':
            return FactsetService();
        
        case 'edgar':
            return EdgarService();
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
    const data = await fetch('https://www.sec.gov/files/company_tickers.json');
    
    const mapping = {}; 
    Object.values(data).forEach(item => {
        const paddedCik = item.cik_str.toString().padStart(10, '0');
        mapping[item.ticker] = paddedCik;
    });

    return mapping;
}