/* =========================================================
   KITEeZI RECREATIONAL CENTRE
   MAIN JAVASCRIPT
   ========================================================= */

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("open");
        });
    }

});


/* =========================================================
   CART
   ========================================================= */

let cart = [];

const CART_STORAGE_KEY = "kiteeziCart";


/* =========================================================
   LOAD CART
   ========================================================= */

function loadCart() {

    try {

        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart;
            }
        }

    } catch (error) {

        console.error("Could not load cart:", error);
        cart = [];

    }

}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error("Could not save cart:", error);

    }

}


/* =========================================================
   ADD ITEM TO CART
   ========================================================= */

function addToCart(name, price) {

    const cleanName = String(name || "").trim();
    const cleanPrice = Number(price) || 0;

    if (!cleanName) {
        return;
    }

    const existingItem = cart.find(
        item => item.name === cleanName
    );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            name: cleanName,
            price: cleanPrice,
            quantity: 1
        });

    }

    saveCart();
    updateCart();

    showAddedMessage(cleanName);

}


/* =========================================================
   CHANGE QUANTITY
   ========================================================= */

function changeCartQuantity(index, amount) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCart();

}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();
    updateCart();

}


/* =========================================================
   CART COUNT
   ========================================================= */

function getCartCount() {

    return cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

}


/* =========================================================
   CART TOTAL
   ========================================================= */

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (Number(item.price) || 0) *
            (Number(item.quantity) || 0),
        0
    );

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatPrice(price) {

    return Number(price || 0).toLocaleString("en-UG");

}


/* =========================================================
   UPDATE CART DISPLAY
   ========================================================= */

function updateCart() {

    const countElement =
        document.getElementById("cart-count");

    const cartItemsElement =
        document.getElementById("cart-items");

    const totalElement =
        document.getElementById("order-total");


    /* CART COUNT */

    if (countElement) {

        countElement.textContent =
            getCartCount();

    }


    /* CART ITEMS */

    if (cartItemsElement) {

        if (cart.length === 0) {

            cartItemsElement.innerHTML = `
                <p class="cart-empty">
                    Your cart is empty.
                </p>
            `;

        } else {

            cartItemsElement.innerHTML =
                cart.map((item, index) => {

                    const subtotal =
                        Number(item.price) *
                        Number(item.quantity);

                    return `
                        <div class="cart-item">

                            <div class="cart-item-info">

                                <div class="cart-item-name">
                                    ${escapeHtml(item.name)}
                                </div>

                                <div class="cart-item-price">
                                    UGX ${formatPrice(item.price)}
                                </div>

                                <div class="cart-controls">

                                    <button
                                        type="button"
                                        data-cart-action="decrease"
                                        data-cart-index="${index}"
                                    >
                                        −
                                    </button>

                                    <span>
                                        ${item.quantity}
                                    </span>

                                    <button
                                        type="button"
                                        data-cart-action="increase"
                                        data-cart-index="${index}"
                                    >
                                        +
                                    </button>

                                    <button
                                        type="button"
                                        class="cart-remove"
                                        data-cart-action="remove"
                                        data-cart-index="${index}"
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                            <div class="cart-item-subtotal">
                                UGX ${formatPrice(subtotal)}
                            </div>

                        </div>
                    `;

                }).join("");

        }

    }


    /* TOTAL */

    if (totalElement) {

        totalElement.textContent =
            `UGX ${formatPrice(getCartTotal())}`;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* =========================================================
   ADDED MESSAGE
   ========================================================= */

function showAddedMessage(name) {

    const message = document.createElement("div");

    message.textContent =
        `${name} added to cart`;

    message.style.position = "fixed";
    message.style.bottom = "85px";
    message.style.left = "50%";
    message.style.transform = "translateX(-50%)";
    message.style.zIndex = "3000";
    message.style.padding = "12px 20px";
    message.style.borderRadius = "7px";
    message.style.background = "#111";
    message.style.color = "#fff";
    message.style.fontWeight = "bold";

    document.body.appendChild(message);

    setTimeout(function () {

        message.remove();

    }, 1800);

}


/* =========================================================
   OPEN ORDER DRAWER
   ========================================================= */

function openOrderDrawer() {

    const drawer =
        document.getElementById("order-drawer");

    if (drawer) {

        drawer.classList.add("open");

        updateCart();

    }

}


/* =========================================================
   CLOSE ORDER DRAWER
   ========================================================= */

function closeOrderDrawer() {

    const drawer =
        document.getElementById("order-drawer");

    if (drawer) {

        drawer.classList.remove("open");

    }

}


/* =========================================================
   ATTACH ORDER BUTTONS
   ========================================================= */

function attachOrderButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-item-name][data-item-price]"
        );

    buttons.forEach(function (button) {

        if (button.dataset.cartAttached === "true") {
            return;
        }

        button.dataset.cartAttached = "true";

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const name =
                button.dataset.itemName;

            const price =
                button.dataset.itemPrice;

            addToCart(name, price);

        });

    });

}


/* =========================================================
   CART EVENTS
   ========================================================= */

function setupCartEvents() {

    const cartButton =
        document.getElementById("cart-button");

    const closeButton =
        document.getElementById("close-order");

    const drawer =
        document.getElementById("order-drawer");


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            openOrderDrawer
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeOrderDrawer
        );

    }


    if (drawer) {

        drawer.addEventListener("click", function (event) {

            if (event.target === drawer) {
                closeOrderDrawer();
            }

        });

    }


    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(
                "[data-cart-action]"
            );

        if (!button) {
            return;
        }

        const index =
            Number(button.dataset.cartIndex);

        const action =
            button.dataset.cartAction;


        if (action === "increase") {

            changeCartQuantity(index, 1);

        }

        if (action === "decrease") {

            changeCartQuantity(index, -1);

        }

        if (action === "remove") {

            removeFromCart(index);

        }

    });

}


/* =========================================================
   WHATSAPP ORDER
   ========================================================= */

function sendOrderToWhatsApp() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    const customerName =
        document.getElementById(
            "customer-name"
        )?.value.trim() || "";


    const customerPhone =
        document.getElementById(
            "customer-phone"
        )?.value.trim() || "";


    const customerLocation =
        document.getElementById(
            "customer-location"
        )?.value.trim() || "";


    const customerNote =
        document.getElementById(
            "customer-note"
        )?.value.trim() || "";


    if (!customerName) {

        alert("Please enter your name.");

        return;

    }


    if (!customerPhone) {

        alert("Please enter your phone number.");

        return;

    }


    if (!customerLocation) {

        alert("Please enter your location.");

        return;

    }


    let message =
        "*Kiteezi Recreational Centre Order*\n\n";


    message +=
        `*Customer:* ${customerName}\n`;

    message +=
        `*Phone:* ${customerPhone}\n`;

    message +=
        `*Location:* ${customerLocation}\n\n`;


    message += "*Order:*\n";


    cart.forEach(function (item) {

        const subtotal =
            Number(item.price) *
            Number(item.quantity);

        message +=
            `• ${item.name} x${item.quantity}` +
            ` - UGX ${formatPrice(subtotal)}\n`;

    });


    message +=
        `\n*Total:* UGX ${formatPrice(
            getCartTotal()
        )}`;


    if (customerNote) {

        message +=
            `\n\n*Note:* ${customerNote}`;

    }


    const whatsappNumber =
        "256709763803";


    const whatsappUrl =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappUrl,
        "_blank"
    );

}


/* =========================================================
   WHATSAPP EVENT
   ========================================================= */

function setupWhatsAppOrder() {

    const button =
        document.getElementById(
            "whatsapp-order"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        sendOrderToWhatsApp
    );

}


/* =========================================================
   INITIALISE CART
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

        updateCart();

        attachOrderButtons();

        setupCartEvents();

        setupWhatsAppOrder();

    }
);
