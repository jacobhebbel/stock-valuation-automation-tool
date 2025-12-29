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


class EdgarService extends TemplateService {

    // call super constructor
    constructor(args) { 
        super(args);
        this.authHeader = { 'User-Agent': 'stockTool jacob.hebbel@gmail.com' };
    }

    // call for getting data
    async fetchData(ticker) {
        
    }

    async formatData(data) {

    }

    tickerToCIK(tickerString) {

    }
}


class EdgarService extends TemplateService {

    constructor(args) { super(args); }

    async fetchData(ticker) {

    }

    async formatData(data) {
        
    }
}