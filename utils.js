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