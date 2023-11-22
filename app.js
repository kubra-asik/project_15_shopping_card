// !variables
const cartBtn = document.querySelector(".cart-btn");
const cartItems = document.querySelector(".cart-items");
const clearCartBtn = document.querySelector(".btn-clear");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDom = document.querySelector("#products-dom");

let cart = [];
let buttonsDom = [];

class Products {
    // class sistemiyle yaparak oop kullandık

    // ! get products from API
    async getProducts() {
        //async olarak ürünleri getirmeliyiz
        // çünkü ürünler apiden gelmeden local storage a eklenmeden
        // fiyat isim gibi bilgilerini çağıramayız göremeyiz
        // önce await ile bekletme yapıp fetch ile url i çağırıryoruz
        // gelen sonucu da bekletip jsona çevirip data değişkeni ile
        // kullanacağız
        // apiden çektiğimiz bşlgileri json formatında attığımız data
        // ğzerinden kullanacağız
        // data içerisine ne girdiysek onları da dizi şeklinde kullanabiliriz
        try {
            let result = await fetch("https://6552099b5c69a77903297418.mockapi.io/Products");
            let data = await result.json();
            let products = data;
            return products;

        }
        catch (error) {
            console.log(error);
            // herhangi bir hata olursa consola yazdır
        }
    }
}

class UI {
    // ! display products start
    // önce ürünler gelmeli
    // daha sonra gelen ürünler sepete eklenmeli
    displayProducts(products) {
        //gelen ürünleri products değişkenine atadık
        // products üzerinden alacağımız bilgileri arayüze yansıtacağız

        let result = "";
        // string değerde bir result değişkeni tanımladık
        // dönen productsları foreach ile açarak her 
        // bilgiyi item içine attık
        // item içindeki id,title,price,image değerlerini çekerek
        // ürün cartları üzerindeki olması gereken yerlere atadık
        products.forEach(item => {
            result += `
            <div class="col-lg-4 col-md-6">
                    <div class="product">
                        <div class="product-image">
                            <img src="${item.image}" alt="product">
                        </div>
                        <div class="product-hover">
                            <span class="product-title">${item.title}</span>
                            <span class="product-price">$${item.price}</span>
                            <button class="btn-add-to-cart" data-id=${item.id}>
                                <i class="fas fa-cart-shopping"></i>
                            </button>
                        </div>
                    </div>

                </div> 
                `});
        productsDom.innerHTML = result;
        // result değişkenini ürünlerin olduğu dive atadık
    }

    // ! add to cart the products
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
        // köşeli parantezle tanımladık
        // çünkü array olarak kullanımı daha kolay
        // direkt alsaydık nodeList tipinde dönecekti
        // onu da tekrardan arraya çevirip kullanacaktık
        // işi baştan kolaylaştırmş olduk

        // buttonların hepsine aynı işlemler uygulanacağı için
        // tek bir dizi içinde tutarak kullanmak kullanışlı olacak

        buttonsDom = buttons;
        // buttonsdom dizisine tğm butonları ekledik
        // foreach ile içindeki elemanlara erişim sağlayacağız
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            // ?cart içini doldurunca burayı tamamla
            // cart[] içindeki itemların id si ile
            // buttonların dataset.id değerleri eşit olanları incart içine at

            if (inCart) {
                // incart içi doluysa(yani cart içindeki id ile button id aynıysa)
                button.setAttribute("disabled", "disabled");//butonu disabled yap
                button.style.opacity = ".3";//opacity değerini .3 yap
            }
            else {
                button.addEventListener("click", event => {
                    event.target.disabled = true;
                    // tıklandığı zaman bir daha tıklanamaz yapsın 
                    event.target.style.opacity = ".3";
                    // !get product from products
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    cart = [...cart, cartItem];

                    //!carts save storage
                    Storage.saveCart(cart);

                    //!save cart values
                    this.saveCartValues(cart);


                    // !display cart item
                    this.addCartItem(cartItem);

                    // !show the cart
                    this.showCart();


                })
            }
        })

    }

    saveCartValues(cart) {

        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const li = document.createElement("li");
        li.classList.add("cart-list-item");
        li.innerHTML = `
        <div class="cart-left">
        <div class="cart-left-image">
            <img src=${item.image}" alt="product">
        </div>
        <div class="cart-left-info">
            <a class="cart-left-info-title" href="#">${item.title}</a>
            <span class="cart-left-info-price">$${item.price}</span>
        </div>
    </div>
    <div class="cart-right">
        <div class="cart-right-quantity">
            <button class="quantity-minus" data-id=${item.id}>
                <i class="fas fa-minus"></i>
            </button>
            <span class="quantity">${item.amount}</span>
            <button class="quantity-plus" data-id=${item.id}>
                <i class="fas fa-plus"></i>
            </button>
        </div>
        <div class="cart-right-remove">
            <button class="cart-remove-btn" data-id=${item.id}>
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
    `

        cartContent.appendChild(li);
    }

    showCart() {
        cartBtn.click();
    }

    setupAPP() {
        cart = Storage.getCart();
        this.saveCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        })

        cartContent.addEventListener("click", event => {

            if (event.target.classList.contains("cart-remove-btn")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;

                removeItem.parentElement.parentElement.parentElement.remove();//ui dan sildik
                this.removeItem(id);//gelen id ile storage üzerinden de silen metodu kullanarak her yerden silmiş olduk
            }
            else if (event.target.classList.contains("quantity-minus")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.saveCartValues(cart);
                    lowerAmount.nextElementSibling.innerText = tempItem.amount;
                }
                else {

                    lowerAmount.parentElement.parentElement.parentElement.remove();
                    this.removeItem(id);
                }
            }
            else if (event.target.classList.contains("quantity-plus")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.saveCartValues(cart);
                addAmount.previousElementSibling.innerText = tempItem.amount;

            }

        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.saveCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.style.opacity = "1";
    }
    getSingleButton(id) {
        return buttonsDom.find(button => button.dataset.id === id);
    }

}

class Storage {

    static saveProducts(products) {//apidan aldğımız ürünleri içine param olarak ladık

        localStorage.setItem("products", JSON.stringify(products))
        //localstroage a kaydetmek için önce productsları
        // json.stringfy a çevirdik setitem metodu ile lStora kaydettik
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);


    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();//yeni bir ui nesnesi oluşturduk
    const products = new Products();//yeni bir products nesnesi oluşturduk

    ui.setupAPP();
    //localde cart bilgileri varsa getir yoksa boş dizi dön
    products.getProducts().then(products => {//getProducts()dan dönen (products) jsonları aldık
        ui.displayProducts(products)//bu productsları ui içinde kullanmak üzere fonksiyona parametre olarak döndük
        // önce ürünleri getirdik
        Storage.saveProducts(products);
        // storagedan classı ile; getproductsdan gelen productsları locale kaydettirdik
    })
        .then(() => {
            ui.getBagButtons();

            ui.cartLogic();
        })

})