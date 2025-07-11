const cheerio = require("cheerio");
const axios = require("axios");
const https = require('https');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

const tasa = async function performScraping() {
    // downloading the target web page
    // by performing an HTTP GET request in Axios
    const axiosResponse = await axios.request({
        method: "GET",
        url: "http://www.bcv.org.ve/",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        },
        httpsAgent: agent 
    });
    let rates = []

    // parsing the HTML source of the target web page with Cheerio
    const $ = cheerio.load(axiosResponse.data);

    // initializing the data structures
    // that will contain the scraped data

    // scraping the "Learn how web data is used in your market" section
    let fechaValor = new Date($(".date-display-single")[0].attribs.content)
    fechaValor.setHours(-4)
    let fechaActual = new Date()
    fechaActual.setHours(-4, 0,0,0)
    console.log(fechaActual, fechaValor, +fechaValor == +fechaActual);
    if(+fechaValor == +fechaActual) {

        let dolar = $("#dolar").find("strong").text();
        if(dolar) {
            rates.push({value: dolar, cmoneda: '$'})
        }
    
        // scraping the "Learn how web data is used in your market" section
        let euro = $("#euro").find("strong").text();
        
        if(euro) {
            rates.push({value: euro, cmoneda: 'EUR'})
        }
        // scraping the "Learn how web data is used in your market" section
        let date = $(".pull-right.dinpro.center").find("span").text();
    
        // scraping the "Learn how web data is used in your market" section
        let datetime = $(".date-display-single").attr('content');
    
        // transforming the scraped data into a general object
        const scrapedData = {
            rates,
            date: date,
            datetime: datetime,
        };
        
        // storing scrapedDataJSON in a database via an API call...
        return scrapedData;
    } else return {message: 'Fecha de valor no coincide con fecha actual'}

}

// Export the performScraping function
module.exports = tasa;

// If you want to execute the function immediately, you can uncomment the line below
// performScraping();
