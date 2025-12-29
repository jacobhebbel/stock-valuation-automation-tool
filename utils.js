import {
    FactsetService,
    EdgarService
} from './services';

import {
    InvalidServiceStringError,
    InvalidTickerStringError
} from './errors'


/*
Specs:
    Requires: None
    Returns: Valid service object
    Modifies: None
    Throws: InvalidServiceStringError
*/
function stringToService(string) {
    
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

module.exports = { stringToService };