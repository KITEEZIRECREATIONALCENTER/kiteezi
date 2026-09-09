/* =========================================================
   KITEEZI RECREATIONAL CENTER
   PUBLIC WEBSITE JAVASCRIPT
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const STORAGE_PUBLIC_URL =
    `${SUPABASE_URL}/storage/v1/object/public/website-images`;


/* =========================================================
   GLOBALS
========================================================= */

const carouselStates = new Map();

let lightboxItems = [];
let lightboxIndex = 0;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupNavigation();

    setupReviewForm();

    setupLightbox();

    updateYear();

    await loadManagedMedia();

    await loadReviews();

    if (document.querySelector(".menu-page")) {
        await loadMenuPage();
    }

    if (document.querySelector(".personnel-page")) {
        await loadPersonnel();
    }
});


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");

    if (!toggle || !links) {
        return;
    }

    toggle.addEventListener("click", () => {
        links.classList.toggle("open");
    });

    links.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {
            links.classList.remove("open");
        });

    });
}


/* =========================================================
   YEAR
========================================================= */

function updateYear() {

    const year = document.getElementById("current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
}


/* =========================================================
   STORAGE URL
========================================================= */

function getPublicStorageUrl(filePath) {

    if (!filePath) {
        return "";
    }

    if (
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
    ) {
        return filePath;
    }

    return `${STORAGE_PUBLIC_URL}/${filePath}`;
}


/* =========================================================
   GET MEDIA
========================================================= */

async function getWebsiteMedia(area) {

    const { data, error } = await supabaseClient
        .from("website_images")
        .select("*")
        .eq("area", area)
        .order("position", {
            ascending: true
        });

    if (error) {
        console.error(
            `Could not load ${area} media:`,
            error
        );

        return [];
    }

    return data || [];
}


/* =========================================================
   LOAD MANAGED MEDIA
========================================================= */

async function loadManagedMedia() {

    const galleries =
        document.querySelectorAll(
            ".media-gallery[data-media-area]"
        );

    if (!galleries.length) {
        return;
    }

    for (const gallery of galleries) {

        const area =
            gallery.dataset.mediaArea;

        const managedMedia =
            await getWebsiteMedia(area);

        if (!managedMedia.length) {

            setupExistingCarousel(gallery);

            continue;
        }

        makeCarousel(
            gallery,
            managedMedia
        );
    }
}


/* =========================================================
   MAKE CAROUSEL
========================================================= */

function makeCarousel(container, items) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const normalizedItems =
        items
            .filter(item => item.file_path)
            .map(item => {

                const mediaType =
                    String(
                        item.media_type || ""
                    ).toLowerCase();

                const isVideo =
                    mediaType === "video" ||
                    /\.(mp4|webm|ogg|mov|m4v)$/i.test(
                        item.file_path
                    );

                return {
                    id: item.id,
                    url: getPublicStorageUrl(
                        item.file_path
                    ),
                    type: isVideo
                        ? "video"
                        : "image"
                };

            });

    if (!normalizedItems.length) {
        return;
    }

    normalizedItems.forEach((item, index) => {

        const slide =
            document.createElement("div");

        slide.className =
            "media-slide" +
            (index === 0
                ? " active"
                : "");

        slide.dataset.index = index;

        if (item.type === "video") {

            const video =
                document.createElement("video");

            video.src = item.url;

            video.muted = true;
            video.loop = true;
            video.autoplay = index === 0;
            video.playsInline = true;
            video.preload = "metadata";

            slide.appendChild(video);

        } else {

            const image =
                document.createElement("img");

            image.src = item.url;

            image.alt =
                "Kiteezi Recreational Center";

            image.loading =
                index === 0
                    ? "eager"
                    : "lazy";

            slide.appendChild(image);
        }

        slide.addEventListener(
            "click",
            () => {

                if (
                    carouselStates.has(container)
                ) {

                    const state =
                        carouselStates.get(
                            container
                        );

                    openLightbox(
                        state.items,
                        state.index
                    );
                }
            }
        );

        container.appendChild(slide);

    });

    addCarouselControls(
        container,
        normalizedItems
    );

    carouselStates.set(
        container,
        {
            items: normalizedItems,
            index: 0
        }
    );

    updateCarousel(container);

    setupCarouselSwipe(container);
}


/* =========================================================
   EXISTING / FALLBACK CAROUSEL
========================================================= */

function setupExistingCarousel(container) {

    const slides =
        Array.from(
            container.querySelectorAll(
                ".media-slide"
            )
        );

    if (!slides.length) {

        container.innerHTML = `
            <div class="media-placeholder">
                No media available yet.
            </div>
        `;

        return;
    }

    const items =
        slides.map(slide => {

            const image =
                slide.querySelector("img");

            const video =
                slide.querySelector("video");

            if (video) {

                return {
                    url: video.currentSrc ||
                        video.src,
                    type: "video"
                };

            }

            return {
                url: image
                    ? image.currentSrc ||
                      image.src
                    : "",
                type: "image"
            };

        });

    slides.forEach(
        (slide, index) => {

            slide.dataset.index = index;

            slide.addEventListener(
                "click",
                () => {

                    const state =
                        carouselStates.get(
                            container
                        );

                    if (state) {
                        openLightbox(
                            state.items,
                            state.index
                        );
                    }
                }
            );
        }
    );

    addCarouselControls(
        container,
        items
    );

    carouselStates.set(
        container,
        {
            items,
            index: 0
        }
    );

    updateCarousel(container);

    setupCarouselSwipe(container);
}


/* =========================================================
   CAROUSEL CONTROLS
========================================================= */

function addCarouselControls(
    container,
    items
) {

    container
        .querySelectorAll(
            ".carousel-arrow, .carousel-dots, .carousel-counter"
        )
        .forEach(element => element.remove());

    if (items.length <= 1) {

        container.classList.add(
            "single-item"
        );

        return;
    }

    container.classList.remove(
        "single-item"
    );


    const previous =
        document.createElement("button");

    previous.className =
        "carousel-arrow carousel-prev";

    previous.type = "button";

    previous.setAttribute(
        "aria-label",
        "Previous image"
    );

    previous.innerHTML = "❮";

    previous.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            changeCarousel(
                container,
                -1
            );
        }
    );


    const next =
        document.createElement("button");

    next.className =
        "carousel-arrow carousel-next";

    next.type = "button";

    next.setAttribute(
        "aria-label",
        "Next image"
    );

    next.innerHTML = "❯";

    next.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            changeCarousel(
                container,
                1
            );
        }
    );


    const dots =
        document.createElement("div");

    dots.className =
        "carousel-dots";

    items.forEach(
        (_, index) => {

            const dot =
                document.createElement("button");

            dot.className =
                "carousel-dot" +
                (index === 0
                    ? " active"
                    : "");

            dot.type = "button";

            dot.setAttribute(
                "aria-label",
                `Go to image ${index + 1}`
            );

            dot.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const state =
                        carouselStates.get(
                            container
                        );

                    if (!state) {
                        return;
                    }

                    state.index = index;

                    updateCarousel(
                        container
                    );
                }
            );

            dots.appendChild(dot);
        }
    );


    const counter =
        document.createElement("div");

    counter.className =
        "carousel-counter";

    container.appendChild(previous);
    container.appendChild(next);
    container.appendChild(dots);
    container.appendChild(counter);
}


/* =========================================================
   UPDATE CAROUSEL
========================================================= */

function updateCarousel(container) {

    const state =
        carouselStates.get(container);

    if (!state) {
        return;
    }

    const slides =
        container.querySelectorAll(
            ".media-slide"
        );

    slides.forEach(
        (slide, index) => {

            slide.classList.toggle(
                "active",
                index === state.index
            );

            const video =
                slide.querySelector("video");

            if (video) {

                if (index === state.index) {

                    video.currentTime = 0;

                    video.play().catch(
                        () => {}
                    );

                } else {

                    video.pause();
                }
            }
        }
    );


    const dots =
        container.querySelectorAll(
            ".carousel-dot"
        );

    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index === state.index
            );
        }
    );


    const counter =
        container.querySelector(
            ".carousel-counter"
        );

    if (counter) {

        counter.textContent =
            `${state.index + 1} / ${state.items.length}`;
    }
}


/* =========================================================
   CHANGE CAROUSEL
========================================================= */

function changeCarousel(
    container,
    direction
) {

    const state =
        carouselStates.get(container);

    if (!state) {
        return;
    }

    const total =
        state.items.length;

    state.index =
        (state.index + direction + total) %
        total;

    updateCarousel(container);
}


/* =========================================================
   SWIPE + MOUSE DRAG
========================================================= */

function setupCarouselSwipe(container) {

    let startX = 0;
    let startY = 0;
    let dragging = false;

    container.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.touches[0];

            startX = touch.clientX;
            startY = touch.clientY;

        },
        {
            passive: true
        }
    );


    container.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            const differenceX =
                touch.clientX - startX;

            const differenceY =
                touch.clientY - startY;

            if (
                Math.abs(differenceX) > 50 &&
                Math.abs(differenceX) >
                Math.abs(differenceY)
            ) {

                changeCarousel(
                    container,
                    differenceX < 0
                        ? 1
                        : -1
                );
            }

        },
        {
            passive: true
        }
    );


    container.addEventListener(
        "mousedown",
        event => {

            startX = event.clientX;
            dragging = true;

            container.style.cursor =
                "grabbing";
        }
    );


    container.addEventListener(
        "mouseup",
        event => {

            if (!dragging) {
                return;
            }

            dragging = false;

            container.style.cursor = "";

            const difference =
                event.clientX - startX;

            if (Math.abs(difference) > 50) {

                changeCarousel(
                    container,
                    difference < 0
                        ? 1
                        : -1
                );
            }
        }
    );


    container.addEventListener(
        "mouseleave",
        () => {

            dragging = false;

            container.style.cursor = "";
        }
    );
}


/* =========================================================
   REVIEWS
========================================================= */

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
        submitReview
    );
}


async function loadReviews() {

    const container =
        document.getElementById(
            "reviews-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        `<div class="loading-message">
            Loading reviews...
        </div>`;


    const { data, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("approved", true)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Review loading error:",
            error
        );

        container.innerHTML =
            `<div class="empty-message">
                Reviews are currently unavailable.
            </div>`;

        return;
    }


    if (!data || !data.length) {

        container.innerHTML =
            `<div class="empty-message">
                No approved reviews yet. Be the first to leave one!
            </div>`;

        return;
    }


    container.innerHTML =
        data.map(review => {

            const rating =
                Math.max(
                    1,
                    Math.min(
                        5,
                        Number(review.rating) || 0
                    )
                );

            const stars =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);


            const date =
                review.created_at
                    ? new Date(
                        review.created_at
                    ).toLocaleDateString(
                        "en-UG",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    )
                    : "";


            return `
                <article class="review-card">

                    <div class="review-header">

                        <span class="review-name">
                            ${escapeHTML(
                                review.name ||
                                "Guest"
                            )}
                        </span>

                        <span class="review-stars">
                            ${stars}
                        </span>

                    </div>

                    <p class="review-text">
                        ${escapeHTML(
                            review.review || ""
                        )}
                    </p>

                    ${
                        date
                            ? `<small class="review-date">
                                ${date}
                               </small>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   SUBMIT REVIEW
========================================================= */

async function submitReview(event) {

    event.preventDefault();

    const form =
        event.currentTarget;

    const name =
        document.getElementById(
            "review-name"
        ).value.trim();

    const rating =
        Number(
            document.getElementById(
                "review-rating"
            ).value
        );

    const review =
        document.getElementById(
            "review-text"
        ).value.trim();

    const status =
        document.getElementById(
            "review-status"
        );


    if (!name || !rating || !review) {

        status.textContent =
            "Please complete all fields.";

        return;
    }


    status.textContent =
        "Submitting review...";


    const { error } =
        await supabaseClient
            .from("reviews")
            .insert({
                name,
                rating,
                review,
                approved: false
            });


    if (error) {

        console.error(
            "Review submission error:",
            error
        );

        status.textContent =
            "Unable to submit your review. Please try again.";

        return;
    }


    form.reset();

    status.textContent =
        "Thank you! Your review has been submitted for approval.";

    setTimeout(() => {

        status.textContent = "";

    }, 6000);
}


/* =========================================================
   MENU
========================================================= */

async function loadMenuPage() {

    const menuContainer =
        document.getElementById(
            "menu-items-container"
        );

    if (!menuContainer) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("menu_items")
            .select("*")
            .order("position", {
                ascending: true
            });


    if (error) {

        console.error(
            "Menu loading error:",
            error
        );

        menuContainer.innerHTML =
            `<div class="menu-empty">
                Unable to load the menu.
            </div>`;

        return;
    }


    const items = data || [];

    renderMenuItems(
        items,
        menuContainer
    );

    setupMenuSearch(
        items,
        menuContainer
    );

    setupMenuCategoryButtons(
        items,
        menuContainer
    );

    await loadMenuMedia();
}


/* =========================================================
   MENU MEDIA
========================================================= */

async function loadMenuMedia() {

    const galleries =
        document.querySelectorAll(
            ".menu-media-gallery[data-media-area]"
        );

    for (const gallery of galleries) {

        const area =
            gallery.dataset.mediaArea;

        const media =
            await getWebsiteMedia(area);

        if (media.length) {

            makeCarousel(
                gallery,
                media
            );

        } else {

            setupExistingCarousel(
                gallery
            );
        }
    }
}


/* =========================================================
   RENDER MENU
========================================================= */

function renderMenuItems(
    items,
    container
) {

    if (!items.length) {

        container.innerHTML =
            `<div class="menu-empty">
                No menu items are available yet.
            </div>`;

        return;
    }


    const categories = {};

    items.forEach(item => {

        const category =
            String(
                item.category || "other"
            ).toLowerCase();

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(item);
    });


    const categoryNames = {
        breakfast: "Breakfast",
        snacks: "Snacks",
        goat: "Goat",
        liver: "Liver",
        chicken: "Chicken",
        burgers: "Burgers",
        accompaniments: "Accompaniments",
        pizzas: "Pizzas",
        fish: "Fish"
    };


    container.innerHTML =
        Object.keys(categories)
            .map(category => {

                const title =
                    categoryNames[category] ||
                    capitalize(category);


                return `
                    <section
                        class="menu-section"
                        data-category="${escapeHTML(category)}"
                    >

                        <div class="menu-section-heading">
                            <p class="eyebrow">
                                KITEeZI MENU
                            </p>

                            <h2>
                                ${escapeHTML(title)}
                            </h2>
                        </div>

                        <div class="menu-grid">

                            ${categories[category]
                                .map(
                                    menuItemHTML
                                )
                                .join("")}

                        </div>

                    </section>
                `;

            }).join("");


    attachOrderButtons();
}


/* =========================================================
   MENU ITEM HTML
========================================================= */

function menuItemHTML(item) {

    const price =
        Number(item.price);

    const formattedPrice =
        Number.isFinite(price)
            ? `UGX ${price.toLocaleString()}`
            : escapeHTML(
                item.price || ""
            );


    return `
        <article
            class="menu-item"
            data-name="${escapeHTML(
                item.name || ""
            )}"
            data-category="${escapeHTML(
                String(
                    item.category || ""
                ).toLowerCase()
            )}"
        >

            <div class="menu-item-content">

                <h3>
                    ${escapeHTML(
                        item.name || ""
                    )}
                </h3>

                ${
                    item.description
                        ? `<p>
                            ${escapeHTML(
                                item.description
                            )}
                           </p>`
                        : ""
                }

                <strong class="menu-price">
                    ${formattedPrice}
                </strong>

            </div>

            <button
                type="button"
                class="order-item-btn"
                data-item-name="${escapeHTML(
                    item.name || ""
                )}"
                data-item-price="${Number.isFinite(price) ? price : 0}"
            >
                Order
            </button>

        </article>
    `;
}


/* =========================================================
   MENU SEARCH
========================================================= */

function setupMenuSearch(
    items,
    container
) {

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

            const query =
                search.value
                    .trim()
                    .toLowerCase();

            const menuItems =
                container.querySelectorAll(
                    ".menu-item"
                );

            menuItems.forEach(item => {

                const name =
                    (
                        item.dataset.name ||
                        ""
                    ).toLowerCase();

                const category =
                    (
                        item.dataset.category ||
                        ""
                    ).toLowerCase();

                const description =
                    item.textContent.toLowerCase();

                item.style.display =
                    !query ||
                    name.includes(query) ||
                    category.includes(query) ||
                    description.includes(query)
                        ? ""
                        : "none";
            });

            hideEmptyMenuSections();

        }
    );
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function setupMenuCategoryButtons(
    items,
    container
) {

    const buttons =
        document.querySelectorAll(
            ".menu-category-btn"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );

                const category =
                    button.dataset.category;

                const sections =
                    container.querySelectorAll(
                        ".menu-section"
                    );

                sections.forEach(section => {

                    const sectionCategory =
                        section.dataset.category;

                    section.style.display =
                        category === "all" ||
                        category === sectionCategory
                            ? ""
                            : "none";

                });

                container
                    .querySelectorAll(
                        ".menu-item"
                    )
                    .forEach(item => {

                        item.style.display =
                            "";

                    });

                const search =
                    document.getElementById(
                        "menu-search"
                    );

                if (search) {
                    search.value = "";
                }

                hideEmptyMenuSections();
            }
        );
    });
}


/* =========================================================
   HIDE EMPTY MENU SECTIONS
========================================================= */

function hideEmptyMenuSections() {

    document
        .querySelectorAll(
            ".menu-section"
        )
        .forEach(section => {

            const visibleItems =
                Array.from(
                    section.querySelectorAll(
                        ".menu-item"
                    )
                )
                .filter(
                    item =>
                        item.style.display !==
                        "none"
                );

            if (
                section.style.display !==
                "none"
            ) {

                section.style.display =
                    visibleItems.length
                        ? ""
                        : "none";
            }

        });
}


/* =========================================================
   ORDERING
========================================================= */

let selectedItemName = "";
let selectedItemPrice = 0;


function attachOrderButtons() {

    document
        .querySelectorAll(
            ".order-item-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedItemName =
                        button.dataset.itemName ||
                        "";

                    selectedItemPrice =
                        Number(
                            button.dataset.itemPrice
                        ) || 0;

                    openOrderDrawer();
                }
            );

        });
}


function openOrderDrawer() {

    const drawer =
        document.getElementById(
            "order-section"
        );

    const backdrop =
        document.getElementById(
            "order-backdrop"
        );

    const selected =
        document.getElementById(
            "selected-item"
        );

    const total =
        document.getElementById(
            "total"
        );


    if (!drawer) {
        return;
    }


    if (selected) {

        selected.textContent =
            selectedItemName;
    }


    if (total) {

        total.textContent =
            `UGX ${selectedItemPrice.toLocaleString()}`;
    }


    drawer.classList.add("open");

    if (backdrop) {
        backdrop.classList.add("open");
    }

    document.body.classList.add(
        "no-scroll"
    );
}


function closeOrderDrawer() {

    const drawer =
        document.getElementById(
            "order-section"
        );

    const backdrop =
        document.getElementById(
            "order-backdrop"
        );

    if (drawer) {
        drawer.classList.remove("open");
    }

    if (backdrop) {
        backdrop.classList.remove("open");
    }

    document.body.classList.remove(
        "no-scroll"
    );
}


/* =========================================================
   SPECIAL MENU FUNCTIONS
========================================================= */

function chooseChipsSausage() {

    const choice =
        prompt(
            "Choose size:\n1. Small - UGX 13,000\n2. Large - UGX 15,000"
        );

    if (choice === "1") {

        selectedItemName =
            "Chips & Sausages Small";

        selectedItemPrice = 13000;

        openOrderDrawer();

    } else if (choice === "2") {

        selectedItemName =
            "Chips & Sausages Large";

        selectedItemPrice = 15000;

        openOrderDrawer();
    }
}


function chooseAccompaniment() {

    const choice =
        prompt(
            "Choose accompaniment:\nWhite Rice\nVegetable Rice\nEgg Fried Rice\nChips\nPotato Wedges\nPosho\nMashed Potatoes"
        );

    if (!choice) {
        return;
    }

    selectedItemName =
        `Accompaniment - ${choice}`;

    selectedItemPrice = 0;

    openOrderDrawer();
}


function chooseLiverAccompaniment() {

    chooseAccompaniment();
}


/* =========================================================
   ORDER DRAWER EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.matches(
                "#order-close"
            )
        ) {

            closeOrderDrawer();
        }


        if (
            event.target.matches(
                "#order-backdrop"
            )
        ) {

            closeOrderDrawer();
        }


        if (
            event.target.matches(
                "#send-whatsapp"
            )
        ) {

            sendOrderToWhatsApp();
        }

    }
);


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function sendOrderToWhatsApp() {

    const customerName =
        document.getElementById(
            "customerName"
        )?.value.trim();

    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();

    const deliveryType =
        document.getElementById(
            "deliveryType"
        )?.value;

    const location =
        document.getElementById(
            "location"
        )?.value.trim();

    const message =
        document.getElementById(
            "message"
        )?.value.trim();


    if (!customerName || !phone) {

        alert(
            "Please enter your name and phone number."
        );

        return;
    }


    let text =
        `Hello Kiteezi Recreational Center,%0A%0A`;

    text +=
        `I would like to order:%0A`;

    text +=
        `${encodeURIComponent(
            selectedItemName
        )}%0A`;

    if (selectedItemPrice > 0) {

        text +=
            `Price: UGX ${selectedItemPrice.toLocaleString()}%0A`;
    }


    text +=
        `%0ACustomer: ${encodeURIComponent(
            customerName
        )}%0A`;

    text +=
        `Phone: ${encodeURIComponent(
            phone
        )}%0A`;

    if (deliveryType) {

        text +=
            `Order type: ${encodeURIComponent(
                deliveryType
            )}%0A`;
    }

    if (location) {

        text +=
            `Location: ${encodeURIComponent(
                location
            )}%0A`;
    }

    if (message) {

        text +=
            `Additional message: ${encodeURIComponent(
                message
            )}%0A`;
    }


    const whatsappUrl =
        `https://wa.me/256709763803?text=${text}`;


    window.open(
        whatsappUrl,
        "_blank"
    );
}


/* =========================================================
   LIGHTBOX
========================================================= */

function setupLightbox() {

    const lightbox =
        document.getElementById(
            "lightbox"
        );

    if (!lightbox) {
        return;
    }


    document
        .getElementById(
            "lightbox-close"
        )
        ?.addEventListener(
            "click",
            closeLightbox
        );


    document
        .getElementById(
            "lightbox-prev"
        )
        ?.addEventListener(
            "click",
            () => {

                changeLightbox(-1);
            }
        );


    document
        .getElementById(
            "lightbox-next"
        )
        ?.addEventListener(
            "click",
            () => {

                changeLightbox(1);
            }
        );


    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target === lightbox
            ) {

                closeLightbox();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains(
                    "open"
                )
            ) {
                return;
            }

            if (event.key === "Escape") {
                closeLightbox();
            }

            if (event.key === "ArrowLeft") {
                changeLightbox(-1);
            }

            if (event.key === "ArrowRight") {
                changeLightbox(1);
            }
        }
    );
}


function openLightbox(
    items,
    index
) {

    if (!items || !items.length) {
        return;
    }

    lightboxItems = items;

    lightboxIndex =
        Math.max(
            0,
            Math.min(
                index || 0,
                items.length - 1
            )
        );


    const lightbox =
        document.getElementById(
            "lightbox"
        );

    if (!lightbox) {
        return;
    }


    lightbox.classList.add("open");

    document.body.classList.add(
        "no-scroll"
    );

    renderLightbox();
}


function renderLightbox() {

    const image =
        document.getElementById(
            "lightbox-image"
        );

    const video =
        document.getElementById(
            "lightbox-video"
        );

    if (!image || !video) {
        return;
    }


    const item =
        lightboxItems[
            lightboxIndex
        ];

    image.style.display = "none";

    video.style.display = "none";

    video.pause();

    video.removeAttribute("src");

    if (item.type === "video") {

        video.src = item.url;

        video.style.display = "block";

    } else {

        image.src = item.url;

        image.style.display = "block";
    }
}


function changeLightbox(
    direction
) {

    if (!lightboxItems.length) {
        return;
    }

    lightboxIndex =
        (
            lightboxIndex +
            direction +
            lightboxItems.length
        ) %
        lightboxItems.length;

    renderLightbox();
}


function closeLightbox() {

    const lightbox =
        document.getElementById(
            "lightbox"
        );

    const video =
        document.getElementById(
            "lightbox-video"
        );

    if (video) {
        video.pause();
    }

    if (lightbox) {
        lightbox.classList.remove(
            "open"
        );
    }

    document.body.classList.remove(
        "no-scroll"
    );
}


/* =========================================================
   PERSONNEL
========================================================= */

async function loadPersonnel() {

    const container =
        document.getElementById(
            "personnel-container"
        );

    if (!container) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("personnel")
            .select("*")
            .order("display_order", {
                ascending: true
            });


    if (error) {

        console.error(
            "Personnel loading error:",
            error
        );

        container.innerHTML =
            `<div class="empty-team">
                Personnel information is currently unavailable.
            </div>`;

        return;
    }


    const people =
        data || [];


    if (!people.length) {

        container.innerHTML =
            `<div class="empty-team">
                Personnel information will be added soon.
            </div>`;

        return;
    }


    const administrators = [];

    const departments = [];


    people.forEach(person => {

        const position =
            String(
                person.position || ""
            ).toLowerCase();


        if (
            /ceo|founder|general manager|managing director|director|administrator/
                .test(position)
        ) {

            administrators.push(person);

        } else {

            departments.push(person);
        }

    });


    container.innerHTML = "";


    if (administrators.length) {

        const adminSection =
            document.createElement(
                "section"
            );

        adminSection.className =
            "administrators";

        adminSection.innerHTML =
            administrators
                .map(
                    personnelCardHTML
                )
                .join("");

        container.appendChild(
            adminSection
        );
    }


    if (departments.length) {

        const departmentSection =
            document.createElement(
                "section"
            );

        departmentSection.className =
            "departments";

        departmentSection.innerHTML = `
            <h1>Our Departments</h1>

            ${departments
                .map(
                    personnelCardHTML
                )
                .join("")}
        `;

        container.appendChild(
            departmentSection
        );
    }
}


/* =========================================================
   PERSONNEL CARD
========================================================= */

function personnelCardHTML(person) {

    const photo =
        person.photo_url
            ? getPublicStorageUrl(
                person.photo_url
            )
            : "";


    return `
        <article class="administrator">

            <div class="administrator-image">

                ${
                    photo
                        ? `<img
                            src="${escapeHTML(photo)}"
                            alt="${escapeHTML(
                                person.name || "Personnel"
                            )}"
                            loading="lazy"
                           >`
                        : `<div class="no-photo">
                            No photo available
                           </div>`
                }

            </div>

            <div class="administrator-text">

                <h2>
                    ${escapeHTML(
                        person.name || ""
                    )}
                </h2>

                <h3>
                    ${escapeHTML(
                        person.position || ""
                    )}
                </h3>

                ${
                    person.description
                        ? `<p>
                            ${escapeHTML(
                                person.description
                            )}
                           </p>`
                        : ""
                }

                ${
                    person.phone
                        ? `<a
                            class="contact"
                            href="tel:${escapeHTML(
                                person.phone
                            )}"
                           >
                            Contact
                           </a>`
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}