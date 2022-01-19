((helperService)=>{

    const Q  = require('q');
    const fs  = require('fs');
    const axios = require('axios');
    const _ = require('underscore');
    const cheerio = require('cheerio');
    var json2xls = require('json2xls');
    const convertCurrency = require('currency-converter-lt');

    helperService.filter_mobile91 = async (google_search_result) =>{
        
        let spec_string = ''
        google_search_result.forEach(item=>{
            spec_string += item['link'] + '|';
        })
        specs_search_result = spec_string.substring(0, spec_string.length - 1);

        let deferred = Q.defer();
        
        let filter_mobile91 = _.filter(google_search_result,(search_result)=>{
            if(search_result['link'].includes("https://www.91mobiles.com/") && !search_result['link'].includes("https://www.91mobiles.com/hub/") && !search_result['link'].includes("https://www.91mobiles.com/ta/")){
                return search_result
            }
        })
        // console.log(JSON.stringify(filter_mobile91))
        if(filter_mobile91.length>0){
            helperService.mobile91_by_url(filter_mobile91[0]['link'])
            .then((detailed_result)=>{
                if(detailed_result['calculated_price']){
                    return detailed_result
                }
                else{
                    return helperService.mobile91_by_url(filter_mobile91[1]['link'])
                }
            })  
            .then((detailed_result_1)=>{
                if(detailed_result_1['calculated_price']){
                    deferred.resolve(detailed_result_1)
                }
                else{
                    deferred.resolve("Not Found")
                }
            })        
            .catch((error)=>{
                deferred.resolve("Not Found")
            })
        }
        else{
            deferred.resolve("Not Found")
        }
        return deferred.promise;
    }

    helperService.mobile91_by_url = async(url) =>{
        var deferred = Q.defer()
        let options = {
            url : url,
            method : 'GET',
            headers: {
                "User-Agent": "request"
            }
        }
        console.log("helperService.mobile91_by_url : " +options.url)
        axios(options)
        .then((response)=>{
            const html = response.data;
            const $ = cheerio.load(html)
            let name = $('.h1_pro_head').text()
            let price = $('.big_prc').text()
            let price_str = price.replace(/,/g,'').replace(/^\s+|\s+$/gm,'').trim()
            let calculated_price = price_str.replace(/Rs./g,'').trim()
            let result = {
                search_model      : name,
                display_price     : price,
                calculated_price  : calculated_price,
                source            : url,
                announced         : '',
                status            : ''
            }
            deferred.resolve(result)
        })
        .catch((error)=>{
            console.log("helperService.mobile91_by_url : " +error)
            deferred.reject(error)
        })
        return deferred.promise;
    }

    helperService.filter_gadgetsndtv = async (google_search_result) =>{
        let deferred = Q.defer();

        let filter_gadgets_ndtv = _.filter(google_search_result,(search_result)=>{
            if(search_result['link'].includes("https://gadgets.ndtv.com/") && !search_result['link'].includes('review')){
                return search_result
            }
        })
        
        if(filter_gadgets_ndtv.length>0){
            helperService.gadgetsndtv_by_url(filter_gadgets_ndtv[0]['link'])
            .then((detailed_result)=>{
                if(detailed_result['calculated_price']){
                    return detailed_result
                }
                else{
                    return helperService.gadgetsndtv_by_url(filter_gadgets_ndtv[1]['link'])
                }
            })
            .then((detailed_result_1)=>{
                if(detailed_result_1['calculated_price']){
                    deferred.resolve(detailed_result_1)
                }
                else{
                    deferred.resolve("Not Found")
                }
            })
            .catch((error)=>{
                deferred.resolve("Not Found")
            })
        }
        else{
            deferred.resolve("Not Found")
        }
        return deferred.promise;
    }  

    helperService.gadgetsndtv_by_url = async (url) =>{
        console.log("gadgetsndtvService.gadgetsndtv_by_url "+url)
        let deferred = Q.defer();
        const response = await axios.get(url)
        const html = response.data;
        const $ = cheerio.load(html);

        var name = $('._shins > h1').text()
        var price = $('._trtwgt > a').text()
        var status = $('._trtwgt > span').text()
        var announaced = $('._dtli').text()

        var price_1 = $('#specs > div:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2)').text();

        if(!price && price_1.includes('₹')){
            price = price_1
        }

        let announaced_split =  announaced.split('Release Date')

        let price_string = price.replace(/₹/g,'').replace(/,/g,'').replace('Available in 2 Stores','').toString().trim()

        if(name.includes('User Reviews and Ratings')){
            let name_split = name.split('User')
            name = name_split[0]
        }
        let search_result = {
            search_model      : name,
            display_price     : price,
            calculated_price  : price_string.trim(),
            source            : url,
            announced         : announaced_split[1],
            status            : status
        }
        deferred.resolve(search_result)
        return deferred.promise;
    }
    
    helperService.filter_gsmarema = async (google_search_result) =>{
        let deferred = Q.defer();

        let filter_gsmarema = _.filter(google_search_result,(search_result)=>{
            if(search_result['link'].includes("https://www.gsmarena.com/") && !search_result['link'].includes("https://www.gsmarena.com/compare.php3")){
                return search_result
            }
        })
        
        if(filter_gsmarema.length>0){

            helperService.gsmarena_by_url(filter_gsmarema[0]['link'])
            .then((detailed_result)=>{
                if(detailed_result['calculated_price']){
                    return detailed_result
                }
                else{
                    return helperService.gsmarena_by_url(filter_gsmarema[1]['link'])
                }
            })
            .then((detailed_result_1)=>{
                if(detailed_result_1['calculated_price']){
                    deferred.resolve(detailed_result_1)
                }
                else{
                    deferred.resolve("Not Found")
                }
            })
            .catch((error)=>{
                deferred.resolve("Not Found")
            })
        }
        else{
            deferred.resolve("Not Found")
        }
        return deferred.promise;
    }

    helperService.gsmarena_by_url = async (url) => {
        console.log("helperService.gsmarena_by_url "+url)
        let deferred = Q.defer()

        let options = {
            method  : 'GET',
            url     :  url,
            headers : {
                "User-Agent": "request"
            }
        }    
        axios(options)
        .then((response)=>{
            const html = response.data;
            const $ = cheerio.load(html)
            let title = $('.specs-phone-name-title').text();
            
            let specNode = $('table')
            let spec_detail = []
            specNode.each((i, el) => {
                let specList = []
                let category = $(el).find('th').text();
                let specN = $(el).find('tr')
                specN.each((index, ele) => {
                    let a = {
                        name: $('td.ttl', ele).text(),
                        value: $('td.nfo', ele).text()
                    }
                    specList.push(a)
                });

                spec_detail.push({
                    category: category,
                    specs: specList
                })
            });

            let filter_misc = _.filter(spec_detail,function(spec_detail_item){
                if(spec_detail_item.category=='Misc'){
                    return spec_detail_item
                }
            })

            let filter_misc_price = _.filter(filter_misc[0].specs,function(misc_specs){
                if(misc_specs.name=='Price'){
                    return misc_specs
                }
            })

            let filter_launch = _.filter(spec_detail,function(spec_detail_item){
                if(spec_detail_item.category=='Launch'){
                    return spec_detail_item
                }
            })

            let filter_launch_announced = _.filter(filter_launch[0].specs,function(misc_specs){
                if(misc_specs.name=='Announced'){
                    return misc_specs
                }
            })

            let filter_launch_status = _.filter(filter_launch[0].specs,function(misc_specs){
                if(misc_specs.name=='Status'){
                    return misc_specs
                }
            })

            data = {
                search_model     : title,
                display_price    : "Not Available",
                calculated_price : "",
                source           : url,
                announced        : "Not Available",
                status           : "Not Available",
            }
            if(filter_misc_price && filter_misc_price[0]){
                data['display_price'] = filter_misc_price[0].value
            }
            if(filter_misc_price && filter_misc_price[0]){
                data['calculated_price'] = helperService.price_calculator(filter_misc_price[0].value)
            }
            if(filter_launch_announced && filter_launch_announced[0]){
                data['announced'] = filter_launch_announced[0].value
            }
            if(filter_launch_status && filter_launch_status[0]){
                data['status'] = filter_launch_status[0].value
            }
            deferred.resolve(data)
        })
        .catch((error)=>{
            deferred.reject(error)
        })
        return deferred.promise;
    }

    helperService.price_calculator = (device_price) => {
        let price_in_inr = ''
        device_price =  device_price.replace(/,/g,'')
        if(device_price.startsWith('About') && device_price.endsWith('EUR')){
            let amount = device_price.replace(/About/,'').replace(/EUR/,'')
            price_in_inr = Math.floor(parseInt(amount) * 85.88)
        }
        else if(device_price.startsWith('About') && device_price.endsWith('INR')){
            price_in_inr = device_price.replace(/About/,'').replace(/INR/,'')
        }
        else if(device_price.startsWith('About') && device_price.endsWith('USD')){
            let amount = device_price.replace(/About/,'').replace(/USD/,'')
            price_in_inr = Math.floor(parseInt(amount) * 76.06)
        }
        else{
            device_price = device_price.replace(/INR/g,'').replace(/,/,'').trim();
        
            if(device_price.includes('/')){
                price_in_inr = helperService.get_price_by_currency_priority(device_price)
            }
            else{
                if(device_price.startsWith('₹')){
                    price_in_inr = device_price.replace(/₹/,'').trim()
                }
                else if(device_price.startsWith('Rp')){
                    let amount  = device_price.replace(/Rp/,'').trim()
                    price_in_inr = Math.floor(parseInt(amount)*0.0053)
                }
                else if(device_price.startsWith('€')){
                    let amount  = device_price.replace(/€/,'').trim()
                    price_in_inr = Math.floor(parseInt(amount)*85.73)
                }
                else if(device_price.startsWith('$')){
                    let amount  = device_price.replace('$','').trim()
                    price_in_inr = Math.floor(parseInt(amount)*76.06)
                }
                else if(device_price.startsWith('£')){
                    let amount  = device_price.replace(/£/,'').trim()
                    price_in_inr = Math.floor(parseInt(amount)*100.62)
                }
                else if(device_price.startsWith('C$')){
                    let amount  = device_price.replace('C$','').trim()
                    price_in_inr = Math.floor(parseInt(amount)*59.24)
                }
                else{
                    price_in_inr = device_price
                }
            }
        }
        return price_in_inr.toString().trim()
    }

    helperService.get_price_by_currency_priority = (amount)=>{
        amount =  amount.replace(/,/g,'')
        let amount_split = amount.split('/')
        let price_in_inr = '';

        let euro_filter = _.filter(amount_split,(amount_split_item)=>{
            amount_split_item = amount_split_item.trim()
            if(amount_split_item.startsWith('€')){
                return amount_split_item
            }
        })

        if(euro_filter.length>0){
            let amount  = euro_filter[0].replace(/€/,'').trim()
            price_in_inr = Math.floor(parseInt(amount)*85.44)
        }
        else{
            let pound_filter = _.filter(amount_split,(amount_split_item)=>{
                amount_split_item = amount_split_item.trim()
                if(amount_split_item.startsWith('£')){
                    return amount_split_item
                }
            })
    
            if(pound_filter.length>0){
                let amount  = pound_filter[0].replace(/£/,'').trim()
                price_in_inr = Math.floor(parseInt(amount)*100.62)
            }
            else{
                let cad_filter = _.filter(amount_split,(amount_split_item)=>{
                    amount_split_item = amount_split_item.trim()
                    if(amount_split_item.startsWith('C$')){
                        return amount_split_item
                    }
                })
        
                if(cad_filter.length>0){
                    let amount  = cad_filter[0].replace('C$','').trim()
                    price_in_inr = Math.floor(parseInt(amount)*59.24)
                }
                else{
                    let idr_filter = _.filter(amount_split,(amount_split_item)=>{
                        amount_split_item = amount_split_item.trim()
                        if(amount_split_item.startsWith('Rp')){
                            return amount_split_item
                        }
                    })
            
                    if(idr_filter.length>0){
                        let amount  = idr_filter[0].replace('Rp','').trim()
                        price_in_inr = Math.floor(parseInt(amount)*0.0053)
                    }
                    else{
                        let usd_filter = _.filter(amount_split,(amount_split_item)=>{
                            amount_split_item = amount_split_item.trim()
                            if(amount_split_item.startsWith('$')){
                                return amount_split_item
                            }
                        })
                
                        if(usd_filter.length>0){
                            let amount  = usd_filter[0].replace('$','').trim()
                            price_in_inr = Math.floor(parseInt(amount)*76.06)
                        }
                        else{
                            let inr_filter = _.filter(amount_split,(amount_split_item)=>{
                                amount_split_item = amount_split_item.trim()
                                if(amount_split_item.startsWith('₹')){
                                    return amount_split_item
                                }
                            })
                    
                            if(inr_filter.length>0){
                                let amount  = usd_filter[0].replace('₹','').trim()
                                price_in_inr = amount
                            }
                            else{
                                price_in_inr = amount
                            }
                        }
                    }
                }
            }
        }
        return price_in_inr
    }

})(module.exports)