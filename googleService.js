((googleService)=>{

    const Q  = require('q');
    const fs  = require('fs');

    const async = require('async')
    const axios = require('axios');
    const cheerio = require('cheerio');
    const _ =  require('underscore')

    const helperService  = require('./helperService');

    var URI = "https://www.google.com/search?q=<search_string>";


    googleService.web_scrapper_initiator_utility = async (device_list) =>{
        let deferred = Q.defer();
        var i=1;
        device_list_chunk = _.chunk(device_list, 100)
        async.forEachLimit(device_list_chunk,1,(item,callback)=>{
            console.log(`Chunk ${i} started at `+ new Date())
            setTimeout(()=>{
                googleService.web_scrapper_initiator(item,i)
                .then((result)=>{
                    console.log(`Chunk ${i++} completed at `+ new Date())
                    callback()
                })
                .catch((error)=>{
                    callback()
                })
            },10000)
        },(error)=>{
            console.log('Process Completed!!!')
            deferred.resolve()
        })
        return deferred.promise;
    }

    googleService.web_scrapper_initiator = async (device_list,chunk) =>{
        let deferred = Q.defer();
        let final_arr=[]

        async.forEachLimit(device_list,1,(device_name,callback)=>{
            let final_obj = {};
            if(chunk)
                fs.writeFileSync("./prod_files/google_scrape_"+chunk+".json", JSON.stringify(final_arr)) 
            else
                fs.writeFileSync("./google_scrape.json", JSON.stringify(final_arr))     
            setTimeout(()=>{ 
                googleService.google_search_result(device_name+' 91mobiles')
                .then((google_91mobiles_search_result)=>{
                    return helperService.filter_mobile91(google_91mobiles_search_result)
                })
                .then((mobile91_price_details)=>{
                    if(mobile91_price_details!='Not Found'){
                        final_obj['91mobiles'] = mobile91_price_details
                    }
                    return googleService.google_search_result(device_name+' gadgetsndtv')
                })
                .then((google_gadgetsndtv_search_result)=>{
                    return helperService.filter_gadgetsndtv(google_gadgetsndtv_search_result)
                })
                .then((gadgetsndtv_price_details)=>{
                    if(gadgetsndtv_price_details!='Not Found'){
                        final_obj['gadgetsndtv'] = gadgetsndtv_price_details
                    }
                    return googleService.google_search_result(device_name+' gsmarena')
                })
                .then((google_gsmarena_search_result)=>{
                    return helperService.filter_gsmarema(google_gsmarena_search_result)
                })
                .then((gsmarena_price_details)=>{
                    if(gsmarena_price_details!='Not Found'){
                        final_obj['gsmarena'] = gsmarena_price_details
                    }
                    final_arr.push({
                        device_name           : device_name,
                        additional_details    : final_obj
                    })
                    callback()
                })
                .catch((model_search_error)=>{
                    console.log("googleService.web_scrapping_initiator " + model_search_error)
                    callback();
                })
            },10000)
        },(async_error)=>{
            if(async_error){
                console.log("googleService.web_scrapping_initiator async_error - " +async_error)
            }
            if(chunk){
                fs.writeFileSync("./prod_files/google_scrape_"+chunk+".json", JSON.stringify(final_arr))
            }else{
                fs.writeFileSync("./google_scrape.json", JSON.stringify(final_arr))    
            }
            console.log('Completed!!')
            deferred.resolve(final_arr)
        });
        return deferred.promise;
    }  

    // Get google search result
    googleService.google_search_result = async (device_name) => {
        console.log('googleService.google_search_result '+device_name)
        let deferred = Q.defer();

        const AXIOS_OPTIONS = {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
            },
        };
        device_name = encodeURI(device_name)  
        let url = URI.replace('<search_string>',device_name)

        console.log(url)

        const response = await axios.get(url,AXIOS_OPTIONS)

        const html = response.data;

        const links = [];
        const titles = [];
        const snippets = [];

        const $ = cheerio.load(html)
       
        $(".yuRUbf > a").each((i, el) => {
            links[i] = $(el).attr("href");
          });
          $(".yuRUbf > a > h3").each((i, el) => {
            titles[i] = $(el).text();
          });
          $(".IsZvec").each((i, el) => {
            snippets[i] = $(el).text().trim();
          });
    
        const result = [];
        for (let i = 0; i < links.length; i++) {
            result[i] = {
                link: links[i],
                title: titles[i],
                snippet: snippets[i],
            };
        }

        deferred.resolve(result)
    
        return deferred.promise;
       
    }

})(module.exports)