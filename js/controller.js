

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */

 class Controller{
    constructor (model, view) {
        this.model = model
        this.view = view  
        
        this.view.filterAll.addEventListener("click", () => {
            this.model.filteredTableObjects=this.model.allTableObjects;
            this.view.setFilterActiveClass(this.view.filterAll);
            this.view.createTableProducts(this.model.allTableObjects);
            this.model.currentFilter = "ALL";
            this.view.detailSearchField.value = '';
        })
        this.view.filterOk.addEventListener("click", () => {
            this.view.setFilterActiveClass(this.view.filterOk);
            this.view.createTableProducts(this.model.filterTableByStatus("OK"));
            this.model.currentFilter = "OK";
            this.view.detailSearchField.value = '';
        })
        this.view.filterStorage.addEventListener("click", () => {
            this.view.setFilterActiveClass(this.view.filterStorage);
            this.view.createTableProducts(this.model.filterTableByStatus("STORAGE"));
            this.model.currentFilter = "STORAGE";
            this.view.detailSearchField.value = '';
        })
        this.view.filterOutOfStock.addEventListener("click", () => {
            this.view.setFilterActiveClass(this.view.filterOutOfStock);
            this.view.createTableProducts(this.model.filterTableByStatus("OUT_OF_STOCK"));
            this.model.currentFilter = "OUT_OF_STOCK";
            this.view.detailSearchField.value = '';
        })

        
        this.view.masterSearhField.addEventListener("change", () => {
            if(this.view.masterSearhField.value == ''){
                this.view.createStores(this.model.storeItems);
                this.view.boxItem.querySelectorAll(".list-item").forEach(item =>{
                    item.dataset.key == this.model.currentStoreId ? item.classList.add('active') : item
                }); 
            }else{
                this.view.createStores(this.model.searhStoreItem(this.view.masterSearhField))
            }; 
        })
        this.view.masterSearchIcon.addEventListener("click", () => {
            this.model.currentStore.classList.add("active");
            if(this.view.masterSearhField.value == ''){
                this.view.boxItem.querySelectorAll(".list-item").forEach(item =>{
                    item.dataset.key == this.model.currentStoreId ? item.classList.add('active') : item
                });
            }else{

                this.view.createStores(this.model.searhStoreItem(this.view.masterSearhField))
            };
        })
        this.view.storeRefresher.addEventListener("click", () => {   
            this.view.createStores(this.model.storeItems);
            this.view.boxItem.querySelectorAll(".list-item").forEach(item =>{
                item.dataset.key == this.model.currentStoreId ? item.classList.add('active') : item
            });
            this.view.masterSearhField.value = '';
        })


        this.view.detailSearchField.addEventListener("input", () => {
            this.view.setFilterActiveClass(this.view.filterAll);
            this.model.filteredTableObjects = this.model.allTableObjects;
            if(this.view.detailSearchField.value == ''){
                this.view.createTableProducts(this.model.allTableObjects);
            }else{
                this.view.createTableProducts(this.model.searchTableItem(this.view.detailSearchField));
            };
        });       
        this.view.detailSearchIcon.addEventListener("click", ()=>{
            if(this.view.detailSearchField.value == ''){
                this.view.createTableProducts(this.model.allTableObjects);
            }else{
                this.view.createTableProducts(this.model.searchTableItem(this.view.detailSearchField));
            };
        }); 


        this.view.nameSortBtn.addEventListener('click', () => {
            this.model.sortTableByProp("Name", this.view.nameSortBtn, [this.view.companySortBtn, this.view.countrySortBtn]);
            this.view.createTableProducts(this.model.filteredTableObjects);
        });
        this.view.countrySortBtn.addEventListener('click', () => {
            this.model.sortTableByProp("MadeIn", this.view.countrySortBtn, [this.view.companySortBtn, this.view.nameSortBtn]);
            this.view.createTableProducts(this.model.filteredTableObjects);
        });
        this.view.companySortBtn.addEventListener('click', () => {
            this.model.sortTableByProp("ProductionCompanyName", this.view.companySortBtn, [this.view.nameSortBtn, this.view.countrySortBtn]);
            this.view.createTableProducts(this.model.filteredTableObjects);
        });

        this.view.storeOpenPopupBtn.addEventListener('click', () => {
            this.view.storePopup.classList.remove('hide');
        });
        this.view.tableOpenPopupBtn.addEventListener('click', () => {
            this.view.tablePopup.classList.remove('hide');
        });
        this.view.closeTriggers.forEach( btn => {
            btn.addEventListener('click', (e)=>{
                if(e.target === e.currentTarget){
                    e.preventDefault();
                    this.view.closePopups();
                }
            });
        })

        
        window.addEventListener ( 'keydown', event => {
            if(event.key === "Escape"){
                this.view.closePopups();
            }
        })

        this.view.deleteStoreBtn.addEventListener('click', async () => {
            let ask = confirm('Are you sure you want to delete store?');
            if(ask){
                await fetch(`http://localhost:3000/api/Stores/${this.model.currentStoreId}`, {
                        method: 'DELETE',
                });
                this.view.hideDetail();
                this.renderStores();
            };
        });

        this.view.tbody.addEventListener("click", async (e) => {
            e.preventDefault();
            if(e.target.classList.contains('js-delete-product')){
                const productId = e.target.closest(".js-delete-product").dataset.delete;
                await this.model.deleteProduct(productId);
                this.renderTable();
            }else if(e.target.classList.contains('js-edit-product')){
                this.model.currentProductId = e.target.closest(".js-edit-product").dataset.edit;
                let productInfo = this.model.getProductInfo(this.model.currentProductId);
                this.view.openEditModal(productInfo);
            }
            return
        })

        this.view.storePopup.addEventListener('submit',async (e) => {
            e.preventDefault();
            if(this.view.getErrorFields(this.model.validation(this.model.getFormData(e.target)), e.target)){
                await this.model.postData(this.model.getFormData(e.target), `http://localhost:3000/api/Stores`, "POST");
                this.view.closePopups();
                this.renderStores();
            }
        })
        
        this.view.tablePopup.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(this.view.getErrorFields(this.model.validation(this.model.getFormData(e.target)), e.target)){
                await this.model.postData(this.model.getFormData(e.target), `http://localhost:3000/api/Stores/${this.model.currentStoreId}/rel_Products`, "POST");
                this.view.closePopups();
                this.renderTable();
            }
        })

        this.view.editPopup.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(this.view.getErrorFields(this.model.validation(this.model.getFormData(e.target)), e.target)){
                await this.model.postData(this.model.getFormData(e.target), `http://localhost:3000/api/Stores/${this.model.currentStoreId}/rel_Products/${this.model.currentProductId}`, "PUT");
                this.view.closePopups();
                this.view.setFilterActiveClass(this.view.filterAll)
                this.renderTable();
            }
        })

        this.view.boxItem.addEventListener("click", async(e)=>{
            if(e.target.classList.contains("list-item__address")){
                this.model.currentStore = e.target.parentNode;
            }else if(e.target.classList.contains("square__number")){
                this.model.currentStore = e.target.parentNode.parentNode.parentNode;
            }else if(e.target.classList.contains("list-item__name") ){
                this.model.currentStore = e.target.parentNode.parentNode;
            }else if(e.target.classList.contains("square__meters")){
                this.model.currentStore = e.target.parentNode.parentNode.parentNode.parentNode;
            }else if(e.target === e.currentTarget){
                this.renderStores(); //if click were out of block
                return
            }else{
                this.model.currentStore = e.target;
            }
            
            this.model.currentStoreId = +this.model.currentStore.getAttribute('data-key');

            this.view.boxItem.querySelectorAll(".list-item").forEach(item =>{
                item.classList.remove("active");
            });
            this.model.currentStore.classList.add("active");

            this.renderTable()

            this.view.renderDetailHeader(this.model.getFormattedDate, this.model.storeItems, this.model.currentStoreId) 
            this.view.setFilterActiveClass(this.view.filterAll)
        })
    }

    init () {
        this.renderStores()   
    }

    renderStores () {
        this.model.fetchStoreList()
        .then(()=>{
            this.view.createStores(this.model.storeItems);
        });
    }
    
    async renderTable () {
        await this.model.fetchTableList()
        .then(()=>{
           this.view.createTableProducts(this.model.allTableObjects);
        }).then(()=>{
            this.view.renderFiltersNumber(this.model.getFilteredItems, this.model.allTableObjects);
        })
    }
}

(new Controller(new Model(), new View())).init();