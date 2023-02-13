/*
console.log("script.liquid");
const firstProduct = document.querySelector('.product_card');
const firstProductUpperPart = firstProduct.children[0]
const firstProductLowerPart = firstProduct.children[1]
const totalProducts = document.querySelector('.total-count');
const collectionContainer = document.querySelector('.products__container');
const filterButtons = document.querySelectorAll('.filter-main-title');

filterButtons.forEach(filterButton=>{
    filterButton.addEventListener('click',(event)=>{
        event.currentTarget.nextElementSibling.classList.toggle('hidden');
    })
})

const requestProduct = async function(requestUrl, requestMethod, requestBody, requestHeader){
    const response = await fetch(requestUrl,{
        method: requestMethod,
        headers : requestHeader,
        body:JSON.stringify(requestBody)
    })
    return response;
}


if(location.href.includes('collections') && firstProductLowerPart.children[0].textContent == "default"){  //on collection page //first product empty
    console.log("fetch 1 product");
    const requestUrl = "https://1.search.argoid.com/shop-rareism/v1/search/query";
    const requestMethod = 'POST'; 
    const requestBody = {
        "instanceId": "shop-rareism",
        "query": "top",
        "appSource": "WEB",
        "searchId": null,
        "userIds": {
            "anonymousUserId": "1069959396.1673609091",
            "registeredUserId": ""
        },
        "state": 9,
        "page": 0,
        "pageSize": 20,
        "requestType": "PLP",
        "requestAttributes": "",
        "resultSize": 0
    };

    const requestHeader ={
        Authorization: "Basic c2VhcmNoQHFhbGFyYS5jb206cWFsYXJhQDEyMw==",
        "Content-Type": "application/json"
    };
    let response = {};
    try{
        response = requestProduct(requestUrl, requestMethod, requestBody, requestHeader);
    }catch(err){
        console.error(err);
    }
    response
    .then(responseObject=>{
        if(responseObject.ok){
            return responseObject.json();
        }
        else {throw new Error("cannot fetch data")}
    })
    .then(responseData=>{
        // const totalProducts = responseData.assets.length;
        const assets = responseData.assets;
        totalProducts.textContent = responseData.resultSize + totalProducts.textContent;
        assets.forEach(asset => {
            const newProductCard = firstProduct.cloneNode(true);
            newProductCard.children[0].children[0].src = asset.record.images;
            newProductCard.children[1].children[0].textContent = asset.record.name;
            newProductCard.children[1].children[1].textContent = asset.record.sub_title;
            newProductCard.children[1].children[2].textContent = asset.record.currentPrice;
            collectionContainer.append(newProductCard);
        });
        console.log(responseData)
    })
    .catch(err=>console.log(err))
}
else if(location.href.includes('collections')){
    console.log("fetch 2 product");
}
*/

const filtersClick = function(){
    //filter toggler
    const filterButtons = document.querySelectorAll('.filter__main-title');
    filterButtons.forEach(filterButton=>{
        filterButton.addEventListener('click',(event)=>{
            const filterToogleBtn =  event.currentTarget.querySelector('.filter__main-toggler--padding')
            filterToogleBtn.innerHTML = filterToogleBtn.textContent.includes('&#x2191;')? '&#x2193;':'&#x2191;';   //don't work
            event.currentTarget.nextElementSibling.classList.toggle('hidden');
        })
    })

    //LISTEN TO CHECKBOX
    document.querySelectorAll('.argoid-literal-checkBox').forEach(filterCheckbox=>{
        filterCheckbox.addEventListener('click', function(event){
            console.log("filter is selected");
            const selectedFilter = {
                isSelected: true,
                requestType:"FACET",
                attribute:event.currentTarget.closest('.argoid-filter').dataset.requestAttribute,
                value:event.currentTarget.value,
                flag:true
            }
            createPage(false,selectedFilter,false);
        })
    })
}


class productCard{
    constructor(productCardDesign, asset){
        this.productCardDesign = productCardDesign;      //sholud be present and cloned true
        this.productImage = asset.record.images || '';
        this.productTitle = asset.record.name || '';
        this.productSubTitle = asset.record.sub_title || '';
        this.productPrice = asset.record.currentPrice || 0;
    }

    createCard(){
        this.productCardDesign.querySelector('.argoid-product-image').src = this.productImage;
        this.productCardDesign.querySelector('.argoid-product-title').textContent = this.productTitle;
        this.productCardDesign.querySelector('.argoid-product-subTitle').textContent = this.productSubTitle;
        this.productCardDesign.querySelector('.argoid-product-price').textContent = this.productPrice;
        return this.productCardDesign;
    }
}

const requestProduct = async function({requestUrl, requestMethod, requestHeader, requestBody}){
    let response;
    try{
        response = await fetch(requestUrl,{
            method: requestMethod,
            headers : requestHeader,
            body:JSON.stringify(requestBody)
        })
        let responseData;
        if(response.ok)
            responseData = await response.json();
        return responseData;
    }
    catch(error){
        let errorMessage = error.message || "failed to fetch product";
        throw new Error(errorMessage);
    }
}

const createRequest = function(requestPayload){
    const requestUrl = "https://1.search.argoid.com/shop-rareism/v1/search/query";
    const requestMethod = 'POST'; 
    const requestBody = {
        "instanceId": "shop-rareism",
        "query": "top",
        "appSource": "WEB",
        "searchId": null,
        "userIds": {
            "anonymousUserId": "1069959396.1673609091",
            "registeredUserId": ""
        },
        "state": 9,
        "page": 0,
        "pageSize": 20,
        "requestType": `${requestPayload.requestType}`,
        "requestAttributes": requestPayload.requestAttributes,
        "resultSize": 0
    };

    const requestHeader ={
        Authorization: "Basic c2VhcmNoQHFhbGFyYS5jb206cWFsYXJhQDEyMw==",
        "Content-Type": "application/json"
    };
    return {
        requestUrl,
        requestMethod,
        requestHeader,
        requestBody
    }
}

const sortFilters = function(allFilters){
    return allFilters.sort((currentFilter, nextFilter)=>{
        if(+currentFilter.priority < +nextFilter.priority) return -1;
        if(+currentFilter.priority > +nextFilter.priority) return 1;
    }).filter((filter)=>{
        return filter.priority <= 100;
    })
}

// start
const productCardDesignTemplate = document.querySelector('.argoid-product-card-design');
const filterDesignTemplate = document.querySelector('.argoid-filter-design');
const productsContainer = document.querySelector('.products__container');
const filterContainer = document.querySelector('.filters__container');

const productCardDesign = productCardDesignTemplate.content.firstElementChild.cloneNode(true);
const filterDesign = filterDesignTemplate.content.firstElementChild.cloneNode(true);  //element containing class filter 
const literalFilterDesign = filterDesign.querySelector('.filter__type-literal').cloneNode(true);
const numericalFilterDesign = filterDesign.querySelector('.filter__type-numerical').cloneNode(true);

filterDesign.querySelector('.filter__type-literal').remove();   //append to filter__type
filterDesign.querySelector('.filter__type-numerical').remove();
productCardDesignTemplate.remove();                 //removed for proper indexing
filterDesignTemplate.remove();

const createPage = async function(plp=false, selectedFilter, sort=false){
    if(location.href.includes('collections')){     //check for first request
        let requestStructure;
        if(plp){
            const requestType = "PLP";
            const requestAttributes = "";
            requestStructure = createRequest({requestType,requestAttributes});
        }
        else if(selectedFilter.isSelected){  //dom cleaning and request modifiy
            //cleaning up dom
            filterContainer.innerHTML= "";

            //creating filter request
            const requestType = selectedFilter.requestType;
            const requestAttributes = {
                attribute:selectedFilter.attribute,
                values: {
                    [selectedFilter.value] : true
                },
                flag : selectedFilter.flag,
                numeric:false
            }
            requestStructure = createRequest({requestType,requestAttributes});
        }

        try{
            const responseData = await requestProduct(requestStructure);
            console.log(responseData);
            // totalProducts.textContent = responseData.resultSize + totalProducts.textContent;
            
            //priority ordering
            const allFilters = [...sortFilters([...responseData.literalFacets, ...responseData.numericalFacets])]
            console.log("allFilters",allFilters);

            //filter creation
            allFilters.forEach(filter=>{
                let newfilterDesign = filterDesign.cloneNode(true);
                newfilterDesign.querySelector('.argoid-display-name').innerHTML = filter.displayName;
                if(filter.facetType === "LITERAL"){
                    Object.keys(filter.values).map(subFilter=>{
                        if(filter.values[subFilter] === true){
                            const newliteralFilterDesign = literalFilterDesign.cloneNode(true);
                            const filterLabel = newliteralFilterDesign.querySelector('.argoid-literal-label');
                            const filterCheckbox = newliteralFilterDesign.querySelector('.argoid-literal-checkBox');
                            filterLabel.textContent = subFilter;
                            filterCheckbox.value = subFilter;
                            filterLabel.htmlFor = filterCheckbox.id =`${filter.displayName}-${subFilter}`;

                            newfilterDesign.querySelector('.argoid-filter').dataset.requestAttribute = filter.facetLabel;
                            newfilterDesign.querySelector('.argoid-filter').append(newliteralFilterDesign);
                        }
                    })
                }
                else if(filter.facetType === "NUMERICAL"){

                }
                filterContainer.append(newfilterDesign);
            })

            //product card creation
            const assets = responseData.assets;
            assets.forEach(asset => {
                let newProductCardDesign = productCardDesign.cloneNode(true);
                const newProduct = new productCard(newProductCardDesign, asset);
                newProductCardDesign = newProduct.createCard();
                productsContainer.append(newProductCardDesign);
            });

            // toggle machanisum to filter button
            filtersClick();
        }
        catch(error){
            console.log(error);
        }
    }
}

createPage(true,{isSelected:false},false);



