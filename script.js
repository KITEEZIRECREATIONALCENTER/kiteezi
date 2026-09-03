// ==========================================
// KITEEZI RECREATIONAL CENTER - JAVASCRIPT
// ==========================================


// Welcome message
function welcome() {
    alert("Welcome to Kiteezi Recreational Center!");
}

welcome();


// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY = "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";


// ==========================================
// SUBMIT REVIEW TO SUPABASE
// ==========================================

async function submitReview(name, review, rating) {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/reviews`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    name: name,
                    rating: rating,
                    review: review
                })
            }
        );

        const result = await response.text();

        console.log("Supabase response:", response.status, result);

        if (!response.ok) {

            alert("Review could not be submitted.\n\n" + result);

            return false;
        }

        alert("Review submitted successfully!");

        return true;

    } catch (error) {

        console.error("Supabase connection error:", error);

        alert("Connection error:\n\n" + error.message);

        return false;
    }
}


// ==========================================
// LOAD REVIEWS FROM SUPABASE
// ==========================================

async function loadReviews() {

    const reviewsContainer =
        document.getElementById("reviews-container");

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
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "Could not load reviews:",
                errorText
            );

            return;
        }

        const reviews = await response.json();

        reviewsContainer.innerHTML = "";

        if (reviews.length === 0) {

            reviewsContainer.innerHTML =
                "<p>No reviews yet. Be the first to leave a review!</p>";

            return;
        }


        reviews.forEach(function(item) {

            const reviewElement =
                document.createElement("div");

            reviewElement.className = "review";

            reviewElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>⭐ ${item.rating}/5</p>
                <p>${item.review}</p>
            `;

            reviewsContainer.appendChild(reviewElement);

        });

    } catch (error) {

        console.error(
            "Error loading reviews:",
            error
        );
    }
}


// ==========================================
// REVIEW FORM
// ==========================================

const reviewForm =
    document.getElementById("review-form");

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById("review-name")
                .value
                .trim();

            const review =
                document.getElementById("review-text")
                .value
                .trim();

            const rating =
                Number(
                    document.getElementById("review-rating")
                    .value
                );


            if (!name || !review || !rating) {

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

                // Reload reviews so the new review appears
                loadReviews();
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

// Open an image in the large-screen viewer
function openImage(imageSource) {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");


    image.src = imageSource;

    image.style.display = "block";

    video.style.display = "none";

    lightbox.style.display = "flex";
}


// ==========================================
// VIDEO LIGHTBOX
// ==========================================

// Open a video in the large-screen viewer
function openVideo(videoSource) {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");


    video.src = videoSource;

    video.style.display = "block";

    image.style.display = "none";

    lightbox.style.display = "flex";

    video.play();
}


// ==========================================
// CLOSE LIGHTBOX
// ==========================================

function closeLightbox() {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");


    lightbox.style.display = "none";

    image.src = "";

    video.pause();

    video.src = "";
}


// ==========================================
// CLOSE LIGHTBOX BY CLICKING BACKGROUND
// ==========================================

const lightbox =
    document.getElementById("lightbox");

if (lightbox) {

    lightbox.addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeLightbox();
            }

        }
    );
}
