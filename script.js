// ==========================================
// KITEEZI RECREATIONAL CENTER
// JAVASCRIPT
// ==========================================

// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// ==========================================
// SUBMIT REVIEW
// ==========================================

async function submitReview(name, review, rating) {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/reviews`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        "return=representation"
                },

                body: JSON.stringify({
                    name: name,
                    rating: rating,
                    review: review
                })
            }
        );


        const result = await response.text();


    if (!response.ok) {
    console.error(
        "Supabase error:",
        response.status,
        result
    );

    alert(
        "Your review could not be submitted. " +
        "Please try again."
    );

    return false;
}


        console.log(
            "Review submitted:",
            result
        );


        alert(
            "Thank you! Your review has been submitted."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Connection error:",
            error
        );

        alert(
            "Unable to connect to the review system. " +
            "Please try again."
        );

        return false;
    }
}


// ==========================================
// LOAD REVIEWS
// ==========================================

async function loadReviews() {

    const reviewsContainer =
        document.getElementById(
            "reviews-container"
        );


    if (!reviewsContainer) {
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`
                }
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Could not load reviews:",
                errorText
            );

            reviewsContainer.innerHTML =
                `<p class="no-reviews">
                    Reviews could not be loaded.
                </p>`;

            return;
        }


        const reviews =
            await response.json();


        reviewsContainer.innerHTML = "";


        if (reviews.length === 0) {

            reviewsContainer.innerHTML =
                `<p class="no-reviews">
                    No reviews yet. Be the first to leave a review!
                </p>`;

            return;
        }


        reviews.forEach(function(item) {

            const reviewElement =
                document.createElement("div");


            reviewElement.className =
                "review";


            const nameElement =
                document.createElement("h3");

            nameElement.textContent =
                item.name;


            const ratingElement =
                document.createElement("p");

            ratingElement.className =
                "review-rating";

            ratingElement.textContent =
                "⭐".repeat(Number(item.rating));


            const textElement =
                document.createElement("p");

            textElement.className =
                "review-text";

            textElement.textContent =
                item.review;


            const dateElement =
                document.createElement("p");

            dateElement.className =
                "review-date";


            if (item.created_at) {

                const date =
                    new Date(item.created_at);

                dateElement.textContent =
                    date.toLocaleDateString(
                        "en-UG",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    );
            }


            reviewElement.appendChild(
                nameElement
            );

            reviewElement.appendChild(
                ratingElement
            );

            reviewElement.appendChild(
                textElement
            );

            reviewElement.appendChild(
                dateElement
            );


            reviewsContainer.appendChild(
                reviewElement
            );

        });

    }

    catch (error) {

        console.error(
            "Error loading reviews:",
            error
        );

        reviewsContainer.innerHTML =
            `<p class="no-reviews">
                Unable to load reviews.
            </p>`;
    }
}


// ==========================================
// REVIEW FORM
// ==========================================

const reviewForm =
    document.getElementById(
        "review-form"
    );


if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "review-name"
                    )
                    .value
                    .trim();


            const review =
                document
                    .getElementById(
                        "review-text"
                    )
                    .value
                    .trim();


            const rating =
                Number(
                    document
                        .getElementById(
                            "review-rating"
                        )
                        .value
                );


            if (
                !name ||
                !review ||
                !rating
            ) {

                alert(
                    "Please complete all review fields."
                );

                return;
            }


            const successful =
                await submitReview(
                    name,
                    review,
                    rating
                );


            if (successful) {

                reviewForm.reset();

                await loadReviews();
            }

        }
    );
}


// ==========================================
// LOAD REVIEWS WHEN PAGE OPENS
// ==========================================

loadReviews();


// ==========================================
// IMAGE LIGHTBOX
// ==========================================

function openImage(imageSource) {

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


    video.style.display =
        "none";


    lightbox.style.display =
        "flex";
}


// ==========================================
// VIDEO LIGHTBOX
// ==========================================

function openVideo(videoSource) {

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


    video.src =
        videoSource;


    video.style.display =
        "block";


    image.style.display =
        "none";


    lightbox.style.display =
        "flex";


    video.play();
}


// ==========================================
// CLOSE LIGHTBOX
// ==========================================

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


// ==========================================
// CLOSE LIGHTBOX BY BACKGROUND
// ==========================================

const lightbox =
    document.getElementById(
        "lightbox"
    );


if (lightbox) {

    lightbox.addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeLightbox();
            }

        }
    );
}
// ==========================================
// WEBSITE MEDIA MANAGEMENT
// IMAGES + VIDEOS
// ==========================================

const WEBSITE_STORAGE_URL =
    SUPABASE_URL +
    "/storage/v1/object/public/website-images";


async function getWebsiteMedia(
    area,
    position = "main"
) {

    const { data, error } =
        await supabaseClient
            .from("website_images")
            .select("file_path, media_type")
            .eq("area", area)
            .eq("position", position)
            .maybeSingle();


    if (error) {

        console.error(
            "Media loading error:",
            error
        );

        return null;
    }


    return data;
}


// ==========================================
// LOAD IMAGE
// ==========================================

async function loadWebsiteImage(
    area,
    elementId
) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    const media =
        await getWebsiteMedia(area);


    if (!media) {
        return;
    }


    if (
        media.media_type &&
        media.media_type !== "image"
    ) {
        return;
    }


    element.src =
        WEBSITE_STORAGE_URL +
        "/" +
        media.file_path;
}


// ==========================================
// LOAD VIDEO
// ==========================================

async function loadWebsiteVideo(
    area,
    elementId
) {

    const video =
        document.getElementById(elementId);


    if (!video) {
        return;
    }


    const media =
        await getWebsiteMedia(area);


    if (!media) {
        return;
    }


    if (
        media.media_type &&
        media.media_type !== "video"
    ) {
        return;
    }


    video.src =
        WEBSITE_STORAGE_URL +
        "/" +
        media.file_path;


    video.load();
}


// ==========================================
// LOAD HERO BACKGROUND
// ==========================================

async function loadHeroBackground() {

    const hero =
        document.getElementById("home");


    if (!hero) {
        return;
    }


    const media =
        await getWebsiteMedia("hero");


    if (!media) {
        return;
    }


    if (
        media.media_type &&
        media.media_type !== "image"
    ) {
        return;
    }


    const imageURL =
        WEBSITE_STORAGE_URL +
        "/" +
        media.file_path;


    hero.style.backgroundImage =
        `
        linear-gradient(
            rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.55)
        ),
        url("${imageURL}")
        `;
}


// ==========================================
// LOAD MAIN WEBSITE MEDIA
// ==========================================

async function loadManagedMedia() {

    // Hero

    await loadHeroBackground();


    // About

    await loadWebsiteImage(
        "about",
        "about-image"
    );


    // Swimming

    await loadWebsiteImage(
        "swimming",
        "swimming-image"
    );


    // Sports video

    await loadWebsiteVideo(
        "sports",
        "sports-video"
    );


    // Events

    await loadWebsiteImage(
        "events",
        "events-image"
    );


    // Restaurant

    await loadWebsiteImage(
        "restaurant",
        "restaurant-image"
    );


    // Food

    await loadWebsiteImage(
        "food",
        "food-image"
    );


    // Menu images

    await loadWebsiteImage(
        "coffee",
        "coffee-image"
    );


    await loadWebsiteImage(
        "snacks",
        "snacks-image"
    );


    await loadWebsiteImage(
        "goat",
        "goat-image"
    );


    await loadWebsiteImage(
        "liver",
        "liver-image"
    );


    await loadWebsiteImage(
        "chicken",
        "chicken-image"
    );


    await loadWebsiteImage(
        "burger",
        "burger-image"
    );


    await loadWebsiteImage(
        "rice",
        "rice-image"
    );


    await loadWebsiteImage(
        "pizza",
        "pizza-image"
    );


    await loadWebsiteImage(
        "fish",
        "fish-image"
    );


    // Logo

    await loadWebsiteImage(
        "logo",
        "website-logo"
    );

}


loadManagedMedia();

function openWhatsApp() {
    window.location.href =
        "https://wa.me/256XXXXXXXXX?text=Hello%20I%20would%20like%20to%20make%20an%20inquiry";
}
