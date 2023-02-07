//TODO:- filtering should also wo with sorting 

// // Get the current URL query parameters and store them in an object
const addExistingQuery = function(queryParams,queryArray){
  if (queryParams.length) {               //location.search  return "?key1=value1&key2=value2"
    console.log("filter to sort", location.search);
    const keyValuePairs = queryParams.split("&");  //["key=value", "key-value", ...]
    for (const keyValue of keyValuePairs) {
      const [key, value] = keyValue.split("=");   //key   value
      if(decodeURIComponent(key) !== "sort_by")
        queryArray.push(`${decodeURIComponent(key)}=${decodeURIComponent(value)}`);//https%3A%2F%2Fwww.flowjoe.io%2Fexample%20page //: = %3A, / = %2F, space = %20 //make it human readable //https://www.flowjoe.io/example page                                                                  
    }                                                                      
  }
}

// When the user selects a different sorting option, update the query parameters and reload the page
const sortSelect = document.querySelector(".sort-by");
sortSelect.addEventListener("change", event => {
  const queryArray = [];
  const queryParams = location.search.substring(1);
  addExistingQuery(queryParams,queryArray);
  queryArray.push(`sort_by=${event.target.value}`);
  location.search = `?${queryArray.join('&')}`;
}); 
