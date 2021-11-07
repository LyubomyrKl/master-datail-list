/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
 class Model{
    constructor(){
        this._apiBase = 'http://localhost:3000/api/Stores';
        this._productsURL = this._apiBase + "/{currentStoreId}/rel_Products";
        this._storeURL =  this._apiBase + "/{currentStoreId}";
        this._allStoresURL = this._apiBase 

        /*
         * - Initial: ```null```
         * - Click 1: ```false```
         * - Click 2: ```true```
         * - Click 3: Initial
         */

        this.isPropsSortOrderReversed = {
            Name: null,
            MadeIn: null,
            ProductionCompanyName: null
        };
        this.currentFilter = "ALL",
        this.storeItems = [],
        this.currentStore = [],
        this.currentStoreId = null,
        this.currentProductId = null,
        this.allTableObjects = [],
        this.filteredTableObjects = []
    }

    async fetchStoreList () {
         return fetch(this._allStoresURL)
         .then((data)=>{
            if(!data.ok){
                Promise.reject(data)
            }
            return data.json();
         }).then((data)=>{
            this.storeItems = data;
            return data
         }).catch((error)=>{
            console.error('There was an error!', error);
        })
    }

    async fetchTableList () {
        await fetch(this._productsURL.replace("{currentStoreId}", this.currentStoreId))
        .then((data)=>{
            if(!data.ok){
                Promise.reject(res)
            }
            return data.json();
        })
        .then((data)=>{
            this.allTableObjects = JSON.parse(JSON.stringify(data));
            this.filteredTableObjects = JSON.parse(JSON.stringify(data));
        })
        .catch((error)=>{
            console.error('There was an error!', error);
        })
    }

    async deleteProduct (productId) {
        const confirmation = confirm("Are you sure you want to delete this product?");
        if(confirmation) {
        await   fetch(`${this._productsURL.replace("{currentStoreId}", this.currentStoreId)}/${productId}`, {
                method: "DELETE"
            })
            .then(response =>{
                if(!response.ok){
                    Promise.reject(res)
                }
            })
            .catch((error)=>{
                console.error('There was an error!', error);
            }) 

        }   
    }


    validation (objectForValidity) {
		let errorsInputArray = [];
        
		Object.keys(objectForValidity).forEach( value => {
		  objectForValidity[value] === false ? errorsInputArray.push(value) : "" ;
          
          switch (value) {
              case "Email":
                objectForValidity["Email"].replace(/\s*/g, "").match(/^\w+@\w+\.\w+$/) ? "" : errorsInputArray.push("Email");
              break;
              case "FloorArea":
                !objectForValidity["FloorArea"].toString().replace(/\s*/g, "").match(/\D+/) ? "" : errorsInputArray.push("FloorArea");
              break;
              case "PhoneNumber":
                objectForValidity["PhoneNumber"].replace(/\W*/g, "").match(/\d{10}/) ? "" : errorsInputArray.push("PhoneNumber");
              break;
              case "Price":
                !objectForValidity["Price"].toString().replace(/\s*/g, "").match(/\D+/) ? "" : errorsInputArray.push("Price");
              break;
              case "Rating":
                objectForValidity["Rating"].toString().replace(/\s*/g, "").match(/[1-5]{1}/) ? "" : errorsInputArray.push("Rating");
              break;           
              
              default:
              break;
          }
		});
        errorsInputArray = [...new Set(errorsInputArray)];
		return errorsInputArray
	}


    getFormData (form) {
        const formData = new FormData(form)
        return Object.fromEntries(formData.entries())  
    }

   async postData (data, url, method) {   
        await fetch(url,    
        {
            method: method,    
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response =>{
            if(!response.ok){
                Promise.reject(res)
            };
        })
        .catch((error)=>{
            console.error('There was an error!', error);
        })     
             
    }

    /**
     * Sorts {@linkcode filteredTableObjects} by the next sorting type (see {@linkcode isPropsSortOrderReversed}),
     * cycles the icon of the pressed sorting button
     * and sets the icons of other sorting buttons to initial ones
     * @param {"Name" | "MadeIn" | "ProductionCompanyName"} propName The prop to sort the table by
     * @param {HTMLButtonElement} btn Button that was clicked to sort the table
     * @param {HTMLButtonElement[]} otherBtns All of the other sorting buttons
     */

     sortTableByProp(propName, btn, otherBtns){
        if(this.isPropsSortOrderReversed[propName] === true) { // Is the next sort order null (initial)?
            this.isPropsSortOrderReversed[propName] = null;
            this.filterTableByStatus(this.currentFilter);
            btn.classList.replace("fa-sort-alpha-up-alt", "fa-align-justify");
        } else { 
            this.filteredTableObjects.sort( (item, nextItem) => {
                const shouldSortInNormalOrder = this.isPropsSortOrderReversed[propName] === null;
                item = item[propName].toLowerCase();
                nextItem = nextItem[propName].toLowerCase();
                if(item > nextItem) {
                    return shouldSortInNormalOrder ? 1 : -1; 
                }
                if(item < nextItem) {
                    return shouldSortInNormalOrder ? -1 : 1;
                }
            return 0;
        });
        this.isPropsSortOrderReversed[propName] = this.isPropsSortOrderReversed[propName] === null ? false : true;

        this.isPropsSortOrderReversed[propName] ?
                    btn.classList.replace("fa-sort-alpha-up", "fa-sort-alpha-up-alt")
                :
                    btn.classList.replace("fa-align-justify", "fa-sort-alpha-up");
        }

        // Set other columns and sort buttons to initial state
        otherBtns.forEach(otherBtn => {
            otherBtn.classList.remove("fa-sort-alpha-up", "fa-sort-alpha-up-alt");
            otherBtn.classList.add("fa-align-justify");
        });
        for(const prop in this.isPropsSortOrderReversed) {
            if(prop !== propName) this.isPropsSortOrderReversed[prop] = null;
        }
        // ///
    }

    
    filterTableByStatus (status) {
        return status === "ALL" ?
            this.filteredTableObjects = JSON.parse(JSON.stringify(this.allTableObjects))
        :
            this.filteredTableObjects = this.allTableObjects.filter(item => item.Status === `${status}`);
    }

    searchTableItem (input) {
            let tableItemText = [...document.querySelectorAll('.js-table-item')];
            let newTableItems = tableItemText.filter(item => {
                return item.innerText.toUpperCase().includes(input.value.toUpperCase());
            }).map(item=>{
                return +item.getAttribute("data-table-key");
            }) 
            return this.filteredTableObjects.filter(item => +newTableItems.includes(item.id))
    }

    searhStoreItem (input) {
        const listItems = [...document.querySelectorAll(".list-item")];
        let newStoreItemsId = listItems.filter(item=>{
            return  item.innerText.toUpperCase().includes(input.value.toUpperCase())
        }).map(item => {
            return +item.getAttribute("data-key")
        });

        return this.storeItems.filter(item=> +newStoreItemsId.includes(item.id))
    }

    getFormattedDate (date) {    
        // convert 2018-10-26T21:00:00.000Z type into "Month date, year"
        let d = new Date(date);
        let day = d.getUTCDate();
        let month = d.getUTCMonth();
        let year = d.getUTCFullYear();
        let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthArray[month]} ${day}, ${year} `;
    }


    getFilteredItems (status, array) {
        return array.filter(item => item.Status === `${status}`);
    }

    getProductInfo (productId) {
        return this.allTableObjects.find( product => product.id === Number(productId) );
    }
} 