/* script.js */

const SUPABASE_URL = "https://YOUR-SUPABASE-URL.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-KEY";

let supabaseClient = null;

if (
    typeof window !== "undefined" &&
    window.supabase &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR-SUPABASE")
) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
}


/* =========================================================
   CART
========================================================= */

let cart = [];

const CART_STORAGE_KEY = "kiteeziCart";


function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(CART_STORAGE_KEY);

        if (savedCart) {
            cart = JSON.parse(savedCart);
        }

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        cart = [];
    }
}


function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Could not save cart:",
            error
        );
    }
}


function formatPrice(price) {

    const number = Number(price) || 0;

    return number.toLocaleString("en-US");
}


function addToCart(name, price) {

    const itemName = String(name || "").trim();

    const itemPrice =
        Number(price) || 0;

    if (!itemName) {
        return;
    }

    const existingItem =
        cart.find(
            item =>
                item.name.toLowerCase() ===
                itemName.toLowerCase() &&
                Number(item.price) === itemPrice
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showAddedMessage(itemName);

    openOrderDrawer();
}


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


function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();
    updateCart();
}


function getCartCount() {

    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );
}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (
                Number(item.price) || 0
            ) *
            (
                Number(item.quantity) || 0
            ),
        0
    );
}


function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const orderTotal =
        document.getElementById("order-total");


    if (cartCount) {

        cartCount.textContent =
            getCartCount();
    }


    if (orderTotal) {

        orderTotal.textContent =
            formatPrice(getCartTotal());
    }


    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="cart-empty">
                Your cart is empty.
            </p>
        `;

        return;
    }


    cartItems.innerHTML =
        cart.map(
            (item, index) => {

                const quantity =
                    Number(item.quantity) || 0;

                const price =
                    Number(item.price) || 0;

                const lineTotal =
                    price * quantity;

                return `
                    <div
                        class="cart-item"
                        data-cart-index="${index}"
                    >

                        <div class="cart-item-info">

                            <div class="cart-item-name">
                                ${escapeHtml(item.name)}
                            </div>

                            <div class="cart-item-price">
                                UGX ${formatPrice(price)}
                                each
                                <br>
                                <strong>
                                    UGX ${formatPrice(lineTotal)}
                                </strong>
                            </div>

                        </div>


                        <div class="quantity-controls">

                            <button
                                type="button"
                                class="cart-minus"
                                data-index="${index}"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <strong>
                                ${quantity}
                            </strong>

                            <button
                                type="button"
                                class="cart-plus"
                                data-index="${index}"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>


                        <button
                            type="button"
                            class="remove-cart-item"
                            data-index="${index}"
                            aria-label="Remove item"
                        >
                            ×
                        </button>

                    </div>
                `;
            }
        ).join("");
}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showAddedMessage(name) {

    const message =
        document.getElementById("added-message");

    if (!message) {
        return;
    }

    message.textContent =
        `${name} added to cart.`;

    message.classList.add("show");

    clearTimeout(
        showAddedMessage.timeout
    );

    showAddedMessage.timeout =
        setTimeout(
            () => {
                message.classList.remove("show");
            },
            1800
        );
}


/* =========================================================
   ORDER DRAWER
========================================================= */

function openOrderDrawer() {

    const drawer =
        document.getElementById("order-drawer");

    const backdrop =
        document.getElementById("order-backdrop");

    if (drawer) {

        drawer.classList.add("active");

        drawer.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    if (backdrop) {

        backdrop.classList.add("active");
    }

    updateCart();
}


function closeOrderDrawer() {

    const drawer =
        document.getElementById("order-drawer");

    const backdrop =
        document.getElementById("order-backdrop");

    if (drawer) {

        drawer.classList.remove("active");

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    if (backdrop) {

        backdrop.classList.remove("active");
    }
}


/* =========================================================
   CART EVENTS
========================================================= */

function setupCartEvents() {

    const cartButton =
        document.getElementById("cart-button");

    const closeButton =
        document.getElementById("close-order");

    const backdrop =
        document.getElementById("order-backdrop");


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


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeOrderDrawer
        );
    }


    document.addEventListener(
        "click",
        event => {

            const plusButton =
                event.target.closest(
                    ".cart-plus"
                );

            const minusButton =
                event.target.closest(
                    ".cart-minus"
                );

            const removeButton =
                event.target.closest(
                    ".remove-cart-item"
                );


            if (plusButton) {

                const index =
                    Number(
                        plusButton.dataset.index
                    );

                changeCartQuantity(
                    index,
                    1
                );

                return;
            }


            if (minusButton) {

                const index =
                    Number(
                        minusButton.dataset.index
                    );

                changeCartQuantity(
                    index,
                    -1
                );

                return;
            }


            if (removeButton) {

                const index =
                    Number(
                        removeButton.dataset.index
                    );

                removeFromCart(index);
            }
        }
    );


    const sendButton =
        document.getElementById(
            "send-whatsapp"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendOrderToWhatsApp
        );
    }
}


/* =========================================================
   MENU ORDER BUTTONS
========================================================= */

function attachOrderButtons() {

    const buttons =
        document.querySelectorAll(
            ".order-item-btn"
        );


    buttons.forEach(button => {

        if (button.dataset.cartAttached === "true") {
            return;
        }

        button.dataset.cartAttached = "true";


        button.addEventListener(
            "click",
            () => {

                const name =
                    button.dataset.itemName ||
                    button.getAttribute(
                        "data-item-name"
                    ) ||
                    button.closest(
                        ".menu-item"
                    )?.querySelector(
                        "h3"
                    )?.textContent ||
                    "Menu Item";


                const price =
                    Number(
                        button.dataset.itemPrice ||
                        button.getAttribute(
                            "data-item-price"
                        ) ||
                        0
                    );


                addToCart(
                    name.trim(),
                    price
                );
            }
        );
    });
}


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function sendOrderToWhatsApp() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty. Please add an item first."
        );

        return;
    }


    const name =
        document.getElementById(
            "customer-name"
        )?.value.trim() || "";


    const phone =
        document.getElementById(
            "customer-phone"
        )?.value.trim() || "";


    const location =
        document.getElementById(
            "customer-location"
        )?.value.trim() || "";


    const note =
        document.getElementById(
            "customer-note"
        )?.value.trim() || "";


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }


    if (!phone) {

        alert(
            "Please enter your phone number."
        );

        return;
    }


    let message =
        "Hello Kiteezi Recreational Center,%0A%0A";

    message +=
        "I would like to place an order:%0A%0A";


    cart.forEach(
        (item, index) => {

            const quantity =
                Number(item.quantity) || 0;

            const price =
                Number(item.price) || 0;

            const total =
                quantity * price;


            message +=
                `${index + 1}. ${item.name}%0A`;

            message +=
                `Quantity: ${quantity}%0A`;

            message +=
                `Price: UGX ${formatPrice(price)}%0A`;

            message +=
                `Subtotal: UGX ${formatPrice(total)}%0A%0A`;
        }
    );


    message +=
        `TOTAL: UGX ${formatPrice(
            getCartTotal()
        )}%0A%0A`;


    message +=
        `Customer Name: ${name}%0A`;

    message +=
        `Phone: ${phone}%0A`;


    if (location) {

        message +=
            `Location: ${location}%0A`;
    }


    if (note) {

        message +=
            `Note: ${note}%0A`;
    }


    message +=
        "%0AThank you.";


    const whatsappNumber =
        "256709763803";


    const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=${message}`;


    window.open(
        whatsappUrl,
        "_blank"
    );
}


/* =========================================================
   SPECIAL MENU OPTIONS
========================================================= */

function chooseChipsSausage() {

    const choice =
        prompt(
            "Choose size:%0A%0A1. Small - UGX 13,000%0A2. Large - UGX 15,000"
        );


    if (choice === "1") {

        addToCart(
            "Chips & Sausages - Small",
            13000
        );

    } else if (choice === "2") {

        addToCart(
            "Chips & Sausages - Large",
            15000
        );

    }
}


function chooseAccompaniment(
    name = "Accompaniment"
) {

    addToCart(
        name,
        0
    );
}


function chooseLiverAccompaniment(
    name = "Liver Accompaniment"
) {

    chooseAccompaniment(
        name
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const toggle =
        document.getElementById(
            "nav-toggle"
        );

    const links =
        document.getElementById(
            "nav-links"
        );


    if (!toggle || !links) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            links.classList.toggle(
                "active"
            );
        }
    );


    links.querySelectorAll("a").forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    links.classList.remove(
                        "active"
                    );
                }
            );
        }
    );
}


/* =========================================================
   YEAR
========================================================= */

function setupCurrentYear() {

    const year =
        document.getElementById(
            "current-year"
        );

    if (year) {

        year.textContent =
            new Date().getFullYear();
    }
}


/* =========================================================
   LIGHTBOX
========================================================= */

let currentLightboxIndex = 0;
let currentLightboxItems = [];


function setupLightbox() {

    const lightbox =
        document.getElementById(
            "lightbox"
        );

    const image =
        document.getElementById(
            "lightbox-image"
        );

    const video =
        document.getElementById(
            "lightbox-video"
        );

    const close =
        document.getElementById(
            "lightbox-close"
        );

    const previous =
        document.getElementById(
            "lightbox-prev"
        );

    const next =
        document.getElementById(
            "lightbox-next"
        );


    if (!lightbox) {
        return;
    }


    document.addEventListener(
        "click",
        event => {

            const media =
                event.target.closest(
                    ".media-slide img, .media-slide video"
                );


            if (!media) {
                return;
            }


            const gallery =
                media.closest(
                    ".media-gallery"
                );


            if (!gallery) {
                return;
            }


            currentLightboxItems =
                Array.from(
                    gallery.querySelectorAll(
                        ".media-slide img, .media-slide video"
                    )
                );


            currentLightboxIndex =
                currentLightboxItems.indexOf(
                    media
                );


            showLightboxItem();
        }
    );


    function showLightboxItem() {

        const item =
            currentLightboxItems[
                currentLightboxIndex
            ];


        if (!item) {
            return;
        }


        lightbox.classList.add(
            "active"
        );


        if (item.tagName.toLowerCase() === "img") {

            image.src =
                item.src;

            image.alt =
                item.alt || "";

            image.style.display =
                "block";

            video.style.display =
                "none";

            video.pause();

        } else {

            video.src =
                item.currentSrc ||
                item.src;

            video.style.display =
                "block";

            image.style.display =
                "none";
        }
    }


    if (close) {

        close.addEventListener(
            "click",
            () => {

                lightbox.classList.remove(
                    "active"
                );

                video.pause();
            }
        );
    }


    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                if (
                    currentLightboxItems.length === 0
                ) {
                    return;
                }

                currentLightboxIndex =
                    (
                        currentLightboxIndex -
                        1 +
                        currentLightboxItems.length
                    ) %
                    currentLightboxItems.length;

                showLightboxItem();
            }
        );
    }


    if (next) {

        next.addEventListener(
            "click",
            () => {

                if (
                    currentLightboxItems.length === 0
                ) {
                    return;
                }

                currentLightboxIndex =
                    (
                        currentLightboxIndex +
                        1
                    ) %
                    currentLightboxItems.length;

                showLightboxItem();
            }
        );
    }


    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                lightbox
            ) {

                lightbox.classList.remove(
                    "active"
                );

                video.pause();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            if (event.key === "Escape") {

                lightbox.classList.remove(
                    "active"
                );

                video.pause();
            }


            if (event.key === "ArrowLeft") {

                previous?.click();
            }


            if (event.key === "ArrowRight") {

                next?.click();
            }
        }
    );
}


/* =========================================================
   SUPABASE MENU
========================================================= */

async function loadMenu() {

    const container =
        document.getElementById(
            "menu-container"
        );


    if (!container) {
        return;
    }


    if (!supabaseClient) {

        attachOrderButtons();

        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("menu")
            .select("*");


        if (error) {
            throw error;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `
                <p class="loading-message">
                    No menu items available.
                </p>
            `;

            return;
        }


        renderMenu(
            data
        );


    } catch (error) {

        console.error(
            "Error loading menu:",
            error
        );


        container.innerHTML = `
            <p class="loading-message">
                Unable to load menu at the moment.
            </p>
        `;
    }
}


/* =========================================================
   MENU RENDERING
========================================================= */

let allMenuItems = [];
let selectedCategory = "all";


function renderMenu(items) {

    allMenuItems =
        Array.isArray(items)
            ? items
            : [];


    createCategories(
        allMenuItems
    );


    displayMenuItems(
        allMenuItems
    );
}


function getMenuField(
    item,
    fields,
    fallback = ""
) {

    for (const field of fields) {

        if (
            item &&
            item[field] !== undefined &&
            item[field] !== null
        ) {

            return item[field];
        }
    }

    return fallback;
}


function menuItemHTML(item) {

    const name =
        getMenuField(
            item,
            [
                "name",
                "item_name",
                "title"
            ],
            "Menu Item"
        );


    const description =
        getMenuField(
            item,
            [
                "description",
                "details"
            ],
            ""
        );


    const price =
        Number(
            getMenuField(
                item,
                [
                    "price",
                    "item_price"
                ],
                0
            )
        ) || 0;


    const image =
        getMenuField(
            item,
            [
                "image",
                "image_url",
                "photo",
                "photo_url"
            ],
            "images/food.webp"
        );


    const safeName =
        escapeHtml(name);


    const safeDescription =
        escapeHtml(description);


    const safeImage =
        escapeHtml(image);


    return `
        <article class="menu-item">

            <img
                class="menu-item-image"
                src="${safeImage}"
                alt="${safeName}"
                onerror="this.src='images/food.webp'"
            >

            <div class="menu-item-content">

                <h3>
                    ${safeName}
                </h3>

                ${
                    description
                        ? `
                            <p>
                                ${safeDescription}
                            </p>
                        `
                        : ""
                }

                <p class="menu-item-price">
                    UGX ${formatPrice(price)}
                </p>

                <button
                    type="button"
                    class="order-item-btn"
                    data-item-name="${safeName}"
                    data-item-price="${price}"
                >
                    Add to Cart
                </button>

            </div>

        </article>
    `;
}


function displayMenuItems(
    items
) {

    const container =
        document.getElementById(
            "menu-container"
        );


    if (!container) {
        return;
    }


    let filtered =
        Array.isArray(items)
            ? items
            : [];


    const search =
        document.getElementById(
            "menu-search"
        )?.value
            ?.trim()
            ?.toLowerCase() || "";


    if (search) {

        filtered =
            filtered.filter(
                item => {

                    const name =
                        String(
                            getMenuField(
                                item,
                                [
                                    "name",
                                    "item_name",
                                    "title"
                                ],
                                ""
                            )
                        ).toLowerCase();


                    const description =
                        String(
                            getMenuField(
                                item,
                                [
                                    "description",
                                    "details"
                                ],
                                ""
                            )
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        description.includes(search)
                    );
                }
            );
    }


    if (
        selectedCategory !==
        "all"
    ) {

        filtered =
            filtered.filter(
                item => {

                    const category =
                        String(
                            getMenuField(
                                item,
                                [
                                    "category",
                                    "menu_category",
                                    "type"
                                ],
                                ""
                            )
                        ).toLowerCase();


                    return (
                        category ===
                        selectedCategory.toLowerCase()
                    );
                }
            );
    }


    if (filtered.length === 0) {

        container.innerHTML = `
            <p class="loading-message">
                No menu items found.
            </p>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(menuItemHTML)
            .join("");


    attachOrderButtons();
}


function createCategories(
    items
) {

    const categoryContainer =
        document.getElementById(
            "menu-categories"
        );


    if (!categoryContainer) {
        return;
    }


    const categories =
        [
            ...new Set(
                items
                    .map(
                        item =>
                            String(
                                getMenuField(
                                    item,
                                    [
                                        "category",
                                        "menu_category",
                                        "type"
                                    ],
                                    ""
                                )
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ];


    categoryContainer.innerHTML = `
        <button
            type="button"
            class="category-button active"
            data-category="all"
        >
            All
        </button>

        ${
            categories
                .map(
                    category => `
                        <button
                            type="button"
                            class="category-button"
                            data-category="${escapeHtml(category)}"
                        >
                            ${escapeHtml(category)}
                        </button>
                    `
                )
                .join("")
        }
    `;


    categoryContainer
        .querySelectorAll(
            ".category-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        categoryContainer
                            .querySelectorAll(
                                ".category-button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        selectedCategory =
                            button.dataset.category ||
                            "all";


                        displayMenuItems(
                            allMenuItems
                        );
                    }
                );
            }
        );
}


/* =========================================================
   MENU SEARCH
========================================================= */

function setupMenuSearch() {

    const search =
        document.getElementById(
            "menu-search"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            displayMenuItems(
                allMenuItems
            );
        }
    );
}


/* =========================================================
   REVIEWS
========================================================= */

async function loadReviews() {

    const container =
        document.getElementById(
            "reviews-container"
        );


    if (!container) {
        return;
    }


    if (!supabaseClient) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("reviews")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `
                <p>
                    No reviews yet.
                </p>
            `;

            return;
        }


        container.innerHTML =
            data
                .map(
                    review => {

                        const name =
                            escapeHtml(
                                review.name ||
                                review.customer_name ||
                                "Guest"
                            );


                        const text =
                            escapeHtml(
                                review.review ||
                                review.review_text ||
                                review.text ||
                                ""
                            );


                        const rating =
                            Number(
                                review.rating
                            ) || 0;


                        return `
                            <div class="review-card">

                                <h3>
                                    ${name}
                                </h3>

                                <p>
                                    ${"★".repeat(
                                        Math.max(
                                            0,
                                            Math.min(
                                                5,
                                                rating
                                            )
                                        )
                                    )}
                                </p>

                                <p>
                                    ${text}
                                </p>

                            </div>
                        `;
                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Error loading reviews:",
            error
        );
    }
}


function setupReviewForm() {

    const form =
        document.getElementById(
            "review-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const status =
                document.getElementById(
                    "review-status"
                );


            const name =
                document.getElementById(
                    "review-name"
                )?.value.trim() || "";


            const rating =
                Number(
                    document.getElementById(
                        "review-rating"
                    )?.value
                );


            const text =
                document.getElementById(
                    "review-text"
                )?.value.trim() || "";


            if (!name || !rating || !text) {

                if (status) {

                    status.textContent =
                        "Please complete all fields.";
                }

                return;
            }


            if (!supabaseClient) {

                if (status) {

                    status.textContent =
                        "Review service is unavailable.";
                }

                return;
            }


            try {

                const {
                    error
                } = await supabaseClient
                    .from("reviews")
                    .insert([
                        {
                            name,
                            rating,
                            review: text
                        }
                    ]);


                if (error) {
                    throw error;
                }


                if (status) {

                    status.textContent =
                        "Thank you for your review!";
                }


                form.reset();

                await loadReviews();


            } catch (error) {

                console.error(
                    "Error submitting review:",
                    error
                );


                if (status) {

                    status.textContent =
                        "Unable to submit your review.";
                }
            }
        }
    );
}


/* =========================================================
   SUPABASE MEDIA
========================================================= */

async function loadDynamicMedia() {

    if (!supabaseClient) {
        return;
    }


    const mediaAreas =
        document.querySelectorAll(
            "[data-media-area]"
        );


    for (const area of mediaAreas) {

        const areaName =
            area.dataset.mediaArea;


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("media")
                .select("*")
                .eq(
                    "area",
                    areaName
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {
                continue;
            }


            if (!data || data.length === 0) {
                continue;
            }


            renderDynamicMedia(
                area,
                data
            );


        } catch (error) {

            console.error(
                `Error loading ${areaName} media:`,
                error
            );
        }
    }
}


function renderDynamicMedia(
    container,
    items
) {

    if (!container || !items.length) {
        return;
    }


    container.innerHTML =
        items
            .map(
                (item, index) => {

                    const type =
                        String(
                            item.type ||
                            item.media_type ||
                            "image"
                        ).toLowerCase();


                    const url =
                        item.url ||
                        item.media_url ||
                        item.image_url ||
                        item.video_url ||
                        "";


                    if (!url) {
                        return "";
                    }


                    if (
                        type === "video"
                    ) {

                        return `
                            <div
                                class="media-slide ${
                                    index === 0
                                        ? "active"
                                        : ""
                                }"
                            >
                                <video
                                    src="${escapeHtml(url)}"
                                    muted
                                    autoplay
                                    loop
                                    playsinline
                                ></video>
                            </div>
                        `;
                    }


                    return `
                        <div
                            class="media-slide ${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                        >
                            <img
                                src="${escapeHtml(url)}"
                                alt="Kiteezi Recreational Center"
                            >
                        </div>
                    `;
                }
            )
            .join("");


    setupCarousels();
}


/* =========================================================
   CAROUSELS
========================================================= */

function setupCarousels() {

    document
        .querySelectorAll(
            ".media-gallery"
        )
        .forEach(
            gallery => {

                const slides =
                    gallery.querySelectorAll(
                        ".media-slide"
                    );


                if (slides.length <= 1) {
                    return;
                }


                if (
                    gallery.dataset.carouselReady ===
                    "true"
                ) {
                    return;
                }


                gallery.dataset.carouselReady =
                    "true";


                let index = 0;


                setInterval(
                    () => {

                        slides[
                            index
                        ].classList.remove(
                            "active"
                        );


                        index =
                            (
                                index + 1
                            ) %
                            slides.length;


                        slides[
                            index
                        ].classList.add(
                            "active"
                        );

                    },
                    5000
                );
            }
        );
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadCart();

        updateCart();

        setupNavigation();

        setupCartEvents();

        setupCurrentYear();

        setupLightbox();

        setupReviewForm();

        setupMenuSearch();

        setupCarousels();

        attachOrderButtons();

        await loadMenu();

        await loadReviews();

        await loadDynamicMedia();

        updateCart();
    }
); 
