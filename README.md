A project which will help to collect the mobile device prices from 91mobiles.com, gadgetsndtv.com and gsmarena.com

1. Performing google search for device name with website name ex- OnePlus 6 91mobiles
2. Filter search result to get 91mobile urls, make website specific api call
3. Gather details, do same for other two sites
4. Return array of objects with device name with model & price

Initiate Process 

Endpoint - {http://localhost:8080}/api/v1/srapper_script/initiate_scrapping
Request Body - 
    [
        "OnePlus 6",
        "iPhone 13 Max Pro"
    ]
Response - Create google_scrape.json file with response as follows
    [
    {
        "device_name": "OnePlus 6",
        "additional_details": {
            "91mobiles": {
                "search_model": "OnePlus 6",
                "display_price": "Rs.  35,999",
                "calculated_price": "35999",
                "source": "https://www.91mobiles.com/oneplus-6-price-in-india",
                "announced": "",
                "status": ""
            },
            "gadgetsndtv": {
                "search_model": "OnePlus 6",
                "display_price": "₹ 39,999",
                "calculated_price": "39999",
                "source": "https://gadgets.ndtv.com/oneplus-6-4655",
                "announced": "May 2018",
                "status": "Currently unavailable"
            },
            "gsmarena": {
                "search_model": "OnePlus 6",
                "display_price": "About 410 EUR",
                "calculated_price": "35210",
                "source": "https://www.gsmarena.com/oneplus_6-9109.php",
                "announced": "2018, May 16",
                "status": "Available. Released 2018, May 17"
            }
        }
    }
]


NOTE : This can we uses to run as backend process.

