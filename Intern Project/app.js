let myRequest = new Request("./data.json")
fetch(myRequest)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        const products = document.getElementById("products")
        let count = 0;
        data.data.forEach((entry) => {
            // console.log(entry)
            const category = document.createElement("section")
            category.setAttribute("id", `product1`)
            category.setAttribute("class", `section-p1`)
            category.innerHTML += 
                `
                <h4>${entry["name"]}</h4>
                <hr class="statistics__line">
                `
            const items = document.createElement('div')
            items.setAttribute("class", "pro-container")
            entry.productList.forEach((item) => {
                items.innerHTML +=
                    `
                    <div class="pro" data-id="${count}">
                        <div class="des">
                            <h5>Name:${item.name}</h5>
                            <h5>Price:${item.price}</h5>
                            <button class="add-to-cart-btn">Add to the cart</button>
                            <br/>
                            <button>Remove form cart</button>
                        </div>
                    </div>
                    `
                count += 1
            })
            category.appendChild(items)
            products.appendChild(category)
        })
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn')
        addToCartBtns.forEach( (btn)=>{
            btn.addEventListener('click', addItemFunction)
        })
    });

class CartItem{
    constructor(name, price){
        this.name = name
        this.price = price
        this.quantity;
    }
}

class LocalCart{
    static key = "cartItems"

    static getLocalCartItems(){
        let cartMap = new Map()
        const cart = localStorage.getItem(LocalCart.key)   
        if(cart===null || cart.length===0)  return cartMap
        return new Map(Object.entries(JSON.parse(cart)))
    }

    static addItemToLocalCart(id, item){
        let cart = LocalCart.getLocalCartItems()
        if(cart.has(id)){
            let mapItem = cart.get(id)
            mapItem.quantity +=1
            cart.set(id, mapItem)
        }
        else
        {
            item.quantity = 1
            cart.set(id, item)
        }
        localStorage.setItem(LocalCart.key,  JSON.stringify(Object.fromEntries(cart)))
        updateCartUI()
    }

    static removeItemFromCart(id){
        let cart = LocalCart.getLocalCartItems()
        if(cart.has(id)){
            let mapItem = cart.get(id)
            if(mapItem.quantity>1)
            {
                mapItem.quantity -=1
                cart.set(id, mapItem)
            }
            else
                cart.delete(id)
        } 
        if (cart.length===0)
            localStorage.clear()
        else
            localStorage.setItem(LocalCart.key,  JSON.stringify(Object.fromEntries(cart)))
        updateCartUI()
    }
}

function addItemFunction(e){
    const id = e.target.parentElement.parentElement.getAttribute("data-id")
    let price = e.target.previousElementSibling.textContent
    let name = e.target.previousElementSibling.previousElementSibling.textContent
    name = name.replace("Name:", "")
    price = price.replace("Price:", "")
    const item = new CartItem(name, price)
    LocalCart.addItemToLocalCart(id, item)
}

const cartIcon = document.querySelector('.fa-cart-arrow-down')
const wholeCartWindow = document.querySelector('.whole-cart-window')
wholeCartWindow.inWindow = 0

cartIcon.addEventListener('mouseover', ()=>{
    if(wholeCartWindow.classList.contains('hide'))
        wholeCartWindow.classList.remove('hide')
})

cartIcon.addEventListener('mouseleave', ()=>{
    // if(wholeCartWindow.classList.contains('hide'))
    setTimeout( () =>{
        if(wholeCartWindow.inWindow===0){
            wholeCartWindow.classList.add('hide')
        }
    } ,500 )

})

wholeCartWindow.addEventListener('mouseover', ()=>{
    wholeCartWindow.inWindow=1
})  

wholeCartWindow.addEventListener('mouseleave', ()=>{
    wholeCartWindow.inWindow=0
    wholeCartWindow.classList.add('hide')
})  

function updateCartUI(){
    const cartWrapper = document.querySelector('.cart-wrapper')
    cartWrapper.innerHTML=""
    const items = LocalCart.getLocalCartItems()
    if(items === null) return
    let count = 0
    let total = 0
    for(const [key, value] of items.entries()){
        const cartItem = document.createElement('div')
        cartItem.classList.add('cart-item')
        let price = value.price*value.quantity
        price = Math.round(price*100)/100
        count+=1
        total += price
        total = Math.round(total*100)/100
        cartItem.innerHTML =
            `
                       <div class="des">
                           <h5>${value.name} x${value.quantity}</h5>
                       </div>
                       <div class="cancel"><i class="fas fa-window-close"></i></div>
        `
        cartItem.lastElementChild.addEventListener('click', ()=>{
            LocalCart.removeItemFromCart(key)
        })
        cartWrapper.append(cartItem)
    }

    if(count > 0){
        cartIcon.classList.add('non-empty')
        let root = document.querySelector(':root')
        root.style.setProperty('--after-content', `"${count}"`)
    }
    else
        cartIcon.classList.remove('non-empty')
    const subtotal = document.querySelector('.subtotal')
    subtotal.innerHTML = `SubTotal: $${total}`
}
document.addEventListener('DOMContentLoaded', ()=>{updateCartUI()})
