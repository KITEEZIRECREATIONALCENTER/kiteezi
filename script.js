alert("NEW SCRIPT IS LOADING");

function welcome() {
    alert("Welcome to Kiteezi Recreational Center!");
}

welcome();


// ===============================
// SUPABASE DATABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://pkvctsfdqyzlcryikcox.supabase.co";
const SUPABASE_KEY = "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";


// ===============================
// REVIEWS
// ===============================

// Submit a review to Supabase
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
            alert("Supabase error: " + result);
            return false;
        }

        alert("Review submitted successfully!");

        return true;

    } catch (error) {

        console.error("Connection error:", error);

        alert("Connection error: " + error.message);

        return false;
    }
}

// Load reviews from Supabase
async function loadReviews() {

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
            throw new Error(await response.text());
        }

        const reviews = await response.json();

        console.log("Reviews:", reviews);

        const reviewsContainer =
            document.getElementById("reviews-container");

        if (!reviewsContainer) {
            return;
        }

        reviewsContainer.innerHTML = "";

        reviews.forEach(function (item) {

            const reviewElement = document.createElement("div");

            reviewElement.className = "review";

            reviewElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.review}</p>
                <p>⭐ ${item.rating}/5</p>
            `;

            reviewsContainer.appendChild(reviewElement);
        });

    } catch (error) {

        console.error("Error loading reviews:", error);
    }
}


// Load reviews when the page opens
loadReviews();



// ===============================
// IMAGE LIGHTBOX
// ===============================

// Open an image in the large-screen viewer
function openImage(imageSource) {

    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-image");
    const video = document.getElementById("lightbox-video");

    image.src = imageSource;

    image.style.display = "block";
    video.style.display = "none";

    lightbox.style.display = "flex";
}


// Open a video in the large-screen viewer
function openVideo(videoSource) {

    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-image");
    const video = document.getElementById("lightbox-video");

    video.src = videoSource;

    video.style.display = "block";
    image.style.display = "none";

    lightbox.style.display = "flex";

    video.play();
}


// Close the large-screen viewer
function closeLightbox() {

    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-image");
    const video = document.getElementById("lightbox-video");

    lightbox.style.display = "none";

    image.src = "";

    video.pause();
    video.src = "";
}


// Close viewer when clicking the dark background
document.getElementById("lightbox").addEventListener("click", function(event) {

    if (event.target === this) {
        closeLightbox();
    }

});


// Handle the review form
const reviewForm = document.getElementById("review-form");

if (reviewForm) {

```
reviewForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const review = document.getElementById("review-text").value.trim();
    const rating = Number(document.getElementById("review-rating").value);

    if (!name || !review || !rating) {
        alert("Please complete all review fields.");
        return;
    }

    await submitReview(name, review, rating);

    reviewForm.reset();
});

}


