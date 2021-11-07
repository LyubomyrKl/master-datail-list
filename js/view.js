class DetailItem{
    constructor(name, price, specs, supplier, country, company, rating, key, parent){
        this.name = name
        this.price = price
        this.specs = specs
        this.supplier = supplier
        this.country = country
        this.company = company
        this.rating = rating
        this.key = key
        this.parent = parent
        this.createStars()
    }

    createStars(){
        this.rating = new Array(5).fill('☆').fill('★', 0, this.rating).join("");
    }
    
    createDOMElement(tagName, classNames, innerHtmlText,){
        //function that help create common pattern element fast
        const element = document.createElement(tagName);
            if(classNames){
                element.classList.add(...classNames);
                element.innerHTML = innerHtmlText;
            }
        return element;                 
    }

    render(){
        const element = this.createDOMElement('tr',['js-table-item'], `
            <td class="table__name--text"><div>${this.name}</div><p>${this.key}</p></td>
            <td class="table__price--text"><span>${this.price}</span>USD</td>
            <td class="table__specs--text text-hide" title='${this.specs}'>${this.specs}</td>
            <td class="table__supplierInfo--text text-hide" title='${this.supplier}'>${this.supplier}</td>
            <td class="table__country--text text-hide" title="${this.country}">${this.country}</td>
            <td class="table__company--text text-hide" title='${this.company}'>${this.company}</td>
            <td class="table__rating--text">
                <div class="detail__rating rating">
                  ${this.rating}
                </div>
            </td>
            <td class="table-chevron"><i data-edit="${this.key}" class="fas fa-pencil-alt js-edit-product"></i><i data-delete="${this.key}" class="fas fa-ban js-delete-product"></i><i class="fas fa-chevron-right"></i></td>
        `)
        element.setAttribute('data-table-key', this.key)
       this.parent.append(element);
    }
}

class StoreItem {
    constructor(itemName,  square, address, key, parent){
        this.itemName = itemName
        this.square = square
        this.address = address
        this.key = key
        this.parent = parent
    }

    createDOMElement(tagName, classNames, innerHtmlText,){
        //function that help create common pattern element fast
        const element = document.createElement(tagName);
            if(classNames){
                element.classList.add(...classNames);
                element.innerHTML = innerHtmlText;
            }
        return element
    }

    render(){
        const element = this.createDOMElement('li', ['box-list__item', 'list-item'], 
        `
            <div class="list-item__wrapper">
                <span class="list-item__name">${this.itemName}</span>
                <div class="list-item__square square"><span class="square__number">${this.square}<span class="square__meters">sq.m</span></span></div>
            </div>
            <p class="list-item__address">${this.address}</p>
        `);
        element.setAttribute('data-key', this.key);
        this.parent.append(element);
    }
}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
 class View{
    constructor () {
        this.tbody = document.querySelector('#js-tbody')
        this.boxItem = document.querySelector("#box-list")
        this.filterAll = document.querySelector("#filter__item--all")
        this.filterOk =  document.querySelector("#filter__item--ok")
        this.filterStorage =  document.querySelector("#filter__item--storage")
        this.filterOutOfStock = document.querySelector("#filter__item--outOfStock")
        this.masterSearhField = document.querySelector("#master__searchField input")
        this.masterSearchIcon = document.querySelector("#js-master-search")
        this.storeRefresher =  document.querySelector("#fa-sync")
        this.detailSearchField = document.querySelector("#detail__searchField-inner input")
        this.detailSearchIcon = document.querySelector("#js-detail-search")
        this.nameSortBtn = document.querySelector("#js-name-sorting")
        this.countrySortBtn = document.querySelector("#js-country-sorting")
        this.companySortBtn = document.querySelector("#js-prod-sorting")
        this.tablePopup = document.querySelector("#js-tabel-popup")
        this.storePopup = document.querySelector("#js-store-popup")
        this.editPopup = document.querySelector("#js-edit-popup")
        this.storeOpenPopupBtn = document.querySelector("#js-master-createBtn")
        this.tableOpenPopupBtn = document.querySelector('#js-detail-create')
        this.deleteStoreBtn = document.querySelector("#js-delete-btn")
        this.closeTriggers = document.querySelectorAll("[data-cancel]")
        this.forms = document.querySelectorAll("form")
        this.nameInput = document.querySelector("#name")
        this.priceInput = document.querySelector("#price")
        this.specsInput = document.querySelector("#specs")
        this.ratingInput = document.querySelector("#rating")
        this.supplierInfo = document.querySelector("#supplierInfo")
        this.madeInUput = document.querySelector("#madeIn")
        this.productionCompanyNameInput = document.querySelector("#productionCompanyName")
        this.formInputs = [...document.querySelectorAll(".js-for-valid")]
    }

    createStores (array) {
        this.boxItem.innerHTML = "";
        array.forEach(({Name, FloorArea, Address, id}) =>{
            new StoreItem(Name, FloorArea, Address, id, this.boxItem).render();
        });
    }

    createTableProducts (array) {
        this.tbody.innerHTML = "";
        array.forEach(({Name, Price, Specs, SupplierInfo, MadeIn, ProductionCompanyName, Rating, id})=>{
            new DetailItem(Name, Price, Specs, SupplierInfo, MadeIn, ProductionCompanyName, Rating, id, this.tbody).render();
        });
    }

    renderDetailHeader (argFunction, data, currentStoreId) {
        let elementPos = data.map(item => item.id).indexOf(currentStoreId);
        const {Email, PhoneNumber, Address, Established, FloorArea} = data[elementPos] ;

        document.querySelector(".detail__header-wrapper").classList.remove("hide");
        document.querySelector(".detail__footer").classList.remove("hide");
        document.querySelector(".detail__empty-wrapper").classList.add("hide");
        document.querySelector(".js-email").innerText = `${Email}`;
        document.querySelector(".js-phone").innerText = `${PhoneNumber}`;
        document.querySelector(".js-address").innerText = `${Address}`;
        document.querySelector(".js-date").innerText = `${argFunction(Established)}`;
        document.querySelector(".js-area").innerText = `${FloorArea}`;
    }

    renderFiltersNumber (argFunction, allTable) {
        document.querySelector(".filter__item--number").innerText = `${allTable.length}`;
        document.querySelector(".js-filter-ok").innerText = `${argFunction("OK", allTable).length}`;
        document.querySelector(".js-filter-storage").innerText = `${argFunction("STORAGE", allTable).length}`;
        document.querySelector(".js-filter-outOfStock").innerText = `${argFunction("OUT_OF_STOCK", allTable).length}`;
    }

    setFilterActiveClass (activeBlock) {
        document.querySelectorAll('.filter__item').forEach(item=>item.classList.remove('active'));
        activeBlock.classList.add("active")  
    }

    openEditModal (productInfo) {
        this.editPopup.classList.remove('hide');
        const {Name, Price, Specs, Rating, SupplierInfo, MadeIn, ProductionCompanyName} = productInfo;
        this.nameInput.value = Name;
        this.priceInput.value = Price;
        this.specsInput.value = Specs;
        this.ratingInput.value = Rating;
        this.supplierInfo.value = SupplierInfo;
        this.madeInUput.value = MadeIn;
        this.productionCompanyNameInput.value = ProductionCompanyName;
    }

    hideDetail () {
        document.querySelector(".detail__header-wrapper").classList.add("hide");
        document.querySelector(".detail__footer").classList.add("hide");
        document.querySelector(".detail__empty-wrapper").classList.remove("hide");
    }

    closePopups () {
        this.storePopup.classList.add("hide");
        this.tablePopup.classList.add("hide");
        this.editPopup.classList.add('hide');
        this.forms.forEach(item=>item.reset());
        this.formInputs.forEach( input => input.classList.remove("js-red") );
    }

    getErrorFields (callback, form) {
       let errorFields = callback;   
        if (errorFields.length) {
            this.formInputs.forEach( input => input.classList.remove("js-red"));
            let currentInputs = this.formInputs.filter(item=> item.dataset.form === form.dataset.form)
            errorFields.forEach( title => currentInputs.find( field => field.dataset.valid === title).classList.add("js-red"))
            return false
        } 
        return true
    }
   
}