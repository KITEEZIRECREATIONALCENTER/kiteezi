// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
    "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ======================================================
// WEBSITE STORAGE
// ======================================================

const WEBSITE_STORAGE_URL =
    SUPABASE_URL +
    "/storage/v1/object/public/website-images";


// ======================================================
// REVIEWS
// ======================================================

async function submitReview(event) {

    event.preventDefault();


    const name =
        document.getElementById("review-name").value.trim();

    const rating =
        document.getElementById("review-rating").value;

    const review =
        document.getElementById("review-text").value.trim();


    if (!name || !rating || !review) {

        alert("Please complete all review fields.");

        return;
    }


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/reviews",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " + SUPABASE_KEY,

                        "Prefer":
                            "return=representation"

                    },

                    body: JSON.stringify({

                        name: name,

                        rating: Number(rating),

                        review: review

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to submit review."
            );

        }


        alert(
            "Thank you! Your review has been submitted."
        );


        document
            .getElementById("review-form")
            .reset();


        loadReviews();

    }


    catch (error) {

        console.error(error);

        alert(
            "There was a problem submitting your review."
        );

    }

}


// ======================================================
// LOAD REVIEWS
// ======================================================

async function loadReviews() {

    const container =
        document.getElementById(
            "reviews-container"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/reviews?select=*&order=created_at.desc",
                {

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " + SUPABASE_KEY

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load reviews."
            );

        }


        const reviews =
            await response.json();


        container.innerHTML = "";


        reviews.forEach(function(review) {

            const reviewElement =
                document.createElement("div");


            reviewElement.className =
                "review-card";


            const stars =
                "⭐".repeat(
                    Number(review.rating) || 0
                );


            const date =
                review.created_at
                    ? new Date(
                        review.created_at
                    ).toLocaleDateString(
                        "en-UG"
                    )
                    : "";


            reviewElement.innerHTML = `

                <h3>
                    ${escapeHTML(review.name)}
                </h3>

                <div class="review-stars">
                    ${stars}
                </div>

                <p>
                    ${escapeHTML(review.review)}
                </p>

                <small>
                    ${date}
                </small>

            `;


            container.appendChild(
                reviewElement
            );

        });

    }


    catch (error) {

        console.error(
            "Review loading error:",
            error
        );

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ======================================================
// REVIEW FORM
// ======================================================

const reviewForm =
    document.getElementById(
        "review-form"
    );


if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        submitReview
    );

}


loadReviews();


// ======================================================
// LIGHTBOX
// ======================================================

function openImage(imageSource) {

    if (!imageSource) {
        return;
    }


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


    image.src =
        imageSource;

    image.style.display =
        "block";


    video.pause();

    video.removeAttribute(
        "src"
    );

    video.style.display =
        "none";


    lightbox.style.display =
        "flex";

}


function openVideo(videoSource) {

    if (!videoSource) {
        return;
    }


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


    image.src = "";

    image.style.display =
        "none";


    video.src =
        videoSource;

    video.style.display =
        "block";


    lightbox.style.display =
        "flex";


    video.play().catch(
        function() {}
    );

}


function closeLightbox() {

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


    lightbox.style.display =
        "none";


    image.src =
        "";


    video.pause();

    video.src =
        "";

}


const lightbox =
    document.getElementById(
        "lightbox"
    );


if (lightbox) {

    lightbox.addEventListener(
        "click",
        function(event) {

            if (
                event.target === lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


// ======================================================
// WEBSITE MEDIA MANAGEMENT
//
// IMAGES + VIDEOS
// MULTIPLE MEDIA PER AREA
// ======================================================


// ======================================================
// GET ALL WEBSITE MEDIA
// ======================================================

async function getWebsiteMedia(area) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("website_images")
            .select(
                "id, file_path, media_type, area, position"
            )
            .eq(
                "area",
                area
            )
            .order(
                "position",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Media loading error:",
            error
        );

        return [];

    }


    return data || [];

}


// ======================================================
// CREATE MEDIA ELEMENT
// ======================================================

function createManagedMedia(media) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "managed-media";


    const mediaURL =
        WEBSITE_STORAGE_URL +
        "/" +
        media.file_path;


    // IMAGE

    if (
        media.media_type === "image" ||
        media.media_type?.startsWith("image/")
    ) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            mediaURL;


        image.alt =
            "Kiteezi Recreational Center";


        image.loading =
            "lazy";


        image.onclick =
            function() {

                openImage(
                    mediaURL
                );

            };


        wrapper.appendChild(
            image
        );

    }


    // VIDEO

    else if (
        media.media_type === "video" ||
        media.media_type?.startsWith("video/")
    ) {

        const video =
            document.createElement(
                "video"
            );


        video.src =
            mediaURL;


        video.controls =
            true;


        video.preload =
            "metadata";


        video.onclick =
            function() {

                openVideo(
                    mediaURL
                );

            };


        wrapper.appendChild(
            video
        );

    }


    return wrapper;

}


// ======================================================
// LOAD MEDIA GALLERY
// ======================================================

async function loadMediaGallery(
    area,
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    const media =
        await getWebsiteMedia(
            area
        );


    // Keep original fallback

    if (!media.length) {
        return;
    }


    // Remove fallback

    container.innerHTML =
        "";


    media.forEach(
        function(item) {

            const element =
                createManagedMedia(
                    item
                );


            container.appendChild(
                element
            );

        }
    );

}


// ======================================================
// LOAD HERO BACKGROUND
// ======================================================

async function loadHeroBackground() {

    const hero =
        document.getElementById(
            "home"
        );


    if (!hero) {
        return;
    }


    const media =
        await getWebsiteMedia(
            "hero"
        );


    if (!media.length) {
        return;
    }


    const image =
        media.find(
            function(item) {

                return (

                    item.media_type === "image" ||

                    item.media_type?.startsWith(
                        "image/"
                    )

                );

            }
        );


    if (!image) {
        return;
    }


    const imageURL =
        WEBSITE_STORAGE_URL +
        "/" +
        image.file_path;


    hero.style.backgroundImage =
        `
        linear-gradient(
            rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.55)
        ),
        url("${imageURL}")
        `;

}


// ======================================================
// LOAD MENU MEDIA
// ======================================================

async function loadMenuMedia() {

    const containers =
        document.querySelectorAll(
            "[data-media-area]"
        );


    for (
        const container of containers
    ) {

        const area =
            container.dataset.mediaArea;


        if (!area) {
            continue;
        }


        const media =
            await getWebsiteMedia(
                area
            );


        // Keep fallback if
        // nothing exists.

        if (!media.length) {
            continue;
        }


        container.innerHTML =
            "";


        media.forEach(
            function(item) {

                const element =
                    createManagedMedia(
                        item
                    );


                container.appendChild(
                    element
                );

            }
        );

    }

}


// ======================================================
// LOAD MAIN WEBSITE MEDIA
// ======================================================

async function loadManagedMedia() {


    // HERO

    await loadHeroBackground();


    // ABOUT

    await loadMediaGallery(
        "about",
        "about-media"
    );


    // SWIMMING

    await loadMediaGallery(
        "swimming",
        "swimming-media"
    );


    // SPORTS

    await loadMediaGallery(
        "sports",
        "sports-media"
    );


    // EVENTS

    await loadMediaGallery(
        "events",
        "events-media"
    );


    // RESTAURANT

    await loadMediaGallery(
        "restaurant",
        "restaurant-media"
    );


    // MENU

    await loadMenuMedia();


    // LOGO

    const logoMedia =
        await getWebsiteMedia(
            "logo"
        );


    const logo =
        document.getElementById(
            "website-logo"
        );


    if (
        logo &&
        logoMedia.length
    ) {

        const logoImage =
            logoMedia.find(
                function(item) {

                    return (

                        item.media_type === "image" ||

                        item.media_type?.startsWith(
                            "image/"
                        )

                    );

                }
            );


        if (logoImage) {

            logo.src =
                WEBSITE_STORAGE_URL +
                "/" +
                logoImage.file_path;

        }

    }

}


loadManagedMedia();


// ======================================================
// MENU SEARCH
// ======================================================

const menuSearch =
    document.getElementById(
        "menu-search"
    );


if (menuSearch) {

    menuSearch.addEventListener(
        "input",
        function() {

            filterMenu(
                this.value
            );

        }
    );

}


// ======================================================
// SHOW MENU CATEGORY
// ======================================================

function showCategory(
    category,
    button
) {

    const sections =
        document.querySelectorAll(
            ".menu-section"
        );


    const buttons =
        document.querySelectorAll(
            ".categories button"
        );


    buttons.forEach(
        function(item) {

            item.classList.remove(
                "active"
            );

        }
    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    let visible =
        0;


    sections.forEach(
        function(section) {

            const sectionCategory =
                section.dataset.category;


            if (
                category === "all" ||
                sectionCategory === category
            ) {

                section.style.display =
                    "block";

                visible++;

            }

            else {

                section.style.display =
                    "none";

            }

        }
    );


    const noFood =
        document.getElementById(
            "no-food"
        );


    if (noFood) {

        noFood.style.display =
            visible === 0
                ? "block"
                : "none";

    }

}


// ======================================================
// MENU SEARCH FILTER
// ======================================================

function filterMenu(searchTerm) {

    const term =
        searchTerm
            .toLowerCase()
            .trim();


    const sections =
        document.querySelectorAll(
            ".menu-section"
        );


    let found =
        false;


    sections.forEach(
        function(section) {

            const text =
                section.innerText
                    .toLowerCase();


            if (
                !term ||
                text.includes(term)
            ) {

                section.style.display =
                    "block";

                found =
                    true;

            }

            else {

                section.style.display =
                    "none";

            }

        }
    );


    const noFood =
        document.getElementById(
            "no-food"
        );


    if (noFood) {

        noFood.style.display =
            found
                ? "none"
                : "block";

    }

}


// ======================================================
// ORDER SYSTEM
// ======================================================

let order = [];


// ======================================================
// ADD TO ORDER
// ======================================================

function addToOrder(
    name,
    price
) {

    order.push({

        name: name,

        price: Number(price)

    });


    updateOrder();


    showAddedMessage();

}


// ======================================================
// CHIPS & SAUSAGES
// ======================================================

function chooseChipsSausage() {

    const choice =
        prompt(
            "Choose size:\n1. Small - UGX 13,000\n2. Large - UGX 15,000"
        );


    if (choice === "1") {

        addToOrder(
            "Chips & Sausages - Small",
            13000
        );

    }


    else if (choice === "2") {

        addToOrder(
            "Chips & Sausages - Large",
            15000
        );

    }

}


// ======================================================
// GOAT ACCOMPANIMENT
// ======================================================

function chooseAccompaniment() {

    const choice =
        prompt(
            "Choose accompaniment:\n1. UGX 5,000\n2. UGX 7,000\n3. UGX 10,000"
        );


    const prices = {

        "1": 5000,

        "2": 7000,

        "3": 10000

    };


    if (prices[choice]) {

        addToOrder(
            "Goat Accompaniment",
            prices[choice]
        );

    }

}


// ======================================================
// LIVER ACCOMPANIMENT
// ======================================================

function chooseLiverAccompaniment() {

    const choice =
        prompt(
            "Choose accompaniment:\n1. UGX 2,000\n2. UGX 5,000\n3. UGX 10,000"
        );


    const prices = {

        "1": 2000,

        "2": 5000,

        "3": 10000

    };


    if (prices[choice]) {

        addToOrder(
            "Liver Accompaniment",
            prices[choice]
        );

    }

}


// ======================================================
// UPDATE ORDER
// ======================================================

function updateOrder() {

    const selectedItem =
        document.getElementById(
            "selected-item"
        );


    const orderCount =
        document.getElementById(
            "order-count"
        );


    const totalElement =
        document.getElementById(
            "total"
        );


    if (!selectedItem) {
        return;
    }


    selectedItem.innerHTML =
        "";


    let total =
        0;


    order.forEach(
        function(item, index) {

            total +=
                item.price;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "selected-order-item";


            itemElement.innerHTML = `

                <span>
                    ${escapeHTML(item.name)}
                    <br>
                    <small>
                        UGX ${item.price.toLocaleString()}
                    </small>
                </span>

                <button
                    onclick="removeFromOrder(${index})"
                >
                    ×
                </button>

            `;


            selectedItem.appendChild(
                itemElement
            );

        }
    );


    if (orderCount) {

        orderCount.textContent =
            order.length;

    }


    if (totalElement) {

        totalElement.textContent =
            "UGX " +
            total.toLocaleString();

    }

}


// ======================================================
// REMOVE ORDER ITEM
// ======================================================

function removeFromOrder(index) {

    order.splice(
        index,
        1
    );


    updateOrder();

}


// ======================================================
// OPEN ORDER
// ======================================================

function openOrder() {

    const section =
        document.getElementById(
            "order-section"
        );


    const backdrop =
        document.getElementById(
            "order-backdrop"
        );


    if (section) {

        section.classList.add(
            "open"
        );

    }


    if (backdrop) {

        backdrop.classList.add(
            "open"
        );

    }

}


// ======================================================
// CLOSE ORDER
// ======================================================

function closeOrder() {

    const section =
        document.getElementById(
            "order-section"
        );


    const backdrop =
        document.getElementById(
            "order-backdrop"
        );


    if (section) {

        section.classList.remove(
            "open"
        );

    }


    if (backdrop) {

        backdrop.classList.remove(
            "open"
        );

    }

}


// ======================================================
// ADDED MESSAGE
// ======================================================

function showAddedMessage() {

    const message =
        document.getElementById(
            "added-message"
        );


    if (!message) {
        return;
    }


    message.classList.add(
        "show"
    );


    setTimeout(
        function() {

            message.classList.remove(
                "show"
            );

        },
        1500
    );

}


// ======================================================
// SEND ORDER
// ======================================================

function sendOrder() {

    if (!order.length) {

        alert(
            "Please add at least one item to your order."
        );

        return;

    }


    const customerName =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    const location =
        document.getElementById(
            "location"
        ).value.trim();


    const deliveryType =
        document.getElementById(
            "deliveryType"
        ).value;


    const message =
        document.getElementById(
            "message"
        ).value.trim();


    if (!customerName || !phone) {

        alert(
            "Please enter your name and phone number."
        );

        return;

    }


    let total =
        0;


    let orderText =
        "Hello Kiteezi Recreational Center!%0A%0A";


    orderText +=
        "*NEW ORDER*%0A%0A";


    orderText +=
        "Name: " +
        encodeURIComponent(
            customerName
        ) +
        "%0A";


    orderText +=
        "Phone: " +
        encodeURIComponent(
            phone
        ) +
        "%0A";


    orderText +=
        "Order type: " +
        encodeURIComponent(
            deliveryType
        ) +
        "%0A";


    if (location) {

        orderText +=
            "Location: " +
            encodeURIComponent(
                location
            ) +
            "%0A";

    }


    orderText +=
        "%0A*ITEMS*%0A";


    order.forEach(
        function(item, index) {

            total +=
                item.price;


            orderText +=
                encodeURIComponent(
                    (index + 1) +
                    ". " +
                    item.name +
                    " - UGX " +
                    item.price.toLocaleString()
                ) +
                "%0A";

        }
    );


    orderText +=
        "%0A*TOTAL: UGX " +
        total.toLocaleString() +
        "*%0A";


    if (message) {

        orderText +=
            "%0AMessage: " +
            encodeURIComponent(
                message
            );

    }


    const whatsappNumber =
        "256709763803";


    const whatsappURL =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        orderText;


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ======================================================
// INITIAL ORDER
// ======================================================

updateOrder();
