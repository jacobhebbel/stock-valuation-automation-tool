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

export function calculateCostOfDebt(data) {
    
    const interestExpense = data['Interest Expense'].value;
    const debt = data['Debt'].value;

    return {
        value: interestExpense / debt
    };
}

export function calculateMarketReturn(data) {

    // parse values
    const risk = data['Market Risk'].value;
    const rate = data['Ten Year Rate'].value;

    return {
        value: (risk + rate) / 100
    };
}