// ======================================================
// SUPABASE SETUP
// ======================================================

const SUPABASE_URL = "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const WEBSITE_STORAGE_URL =
    SUPABASE_URL + "/storage/v1/object/public/website-images";


// ======================================================
// REVIEWS
// ======================================================

const reviewForm = document.getElementById("review-form");

if (reviewForm) {
    reviewForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const message = document.getElementById("review-message").value.trim();

        if (!name || !message) {
            alert("Please enter your name and review.");
            return;
        }

        const { error } = await supabaseClient
            .from("reviews")
            .insert([
                {
                    name: name,
                    message: message
                }
            ]);

        if (error) {
            console.error(error);
            alert("Could not submit your review.");
            return;
        }

        alert("Thank you for your review!");

        reviewForm.reset();

        loadReviews();
    });
}


async function loadReviews() {

    const reviewsContainer =
        document.getElementById("reviews-container");

    if (!reviewsContainer) return;

    const { data, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading reviews:", error);
        return;
    }

    reviewsContainer.innerHTML = "";

    if (!data || data.length === 0) {
        reviewsContainer.innerHTML =
            "<p>No reviews yet.</p>";
        return;
    }

    data.forEach(review => {

        const card = document.createElement("div");

        card.className = "review-card";

        card.innerHTML = `
            <h3>${escapeHTML(review.name)}</h3>
            <p>${escapeHTML(review.message)}</p>
        `;

        reviewsContainer.appendChild(card);
    });
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


loadReviews();


// ======================================================
// LIGHTBOX
// ======================================================

function openImage(src) {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");

    if (!lightbox || !image) return;

    image.src = src;

    image.style.display = "block";

    if (video) {
        video.pause();
        video.src = "";
        video.style.display = "none";
    }

    lightbox.style.display = "flex";
}


function openVideo(src) {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");

    if (!lightbox || !video) return;

    if (image) {
        image.src = "";
        image.style.display = "none";
    }

    video.src = src;

    video.style.display = "block";

    lightbox.style.display = "flex";

    video.play().catch(() => {});
}


function closeLightbox() {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");

    const video =
        document.getElementById("lightbox-video");

    if (!lightbox) return;

    lightbox.style.display = "none";

    if (image) {
        image.src = "";
    }

    if (video) {
        video.pause();
        video.src = "";
    }
}


// Close when clicking outside the media

const lightbox =
    document.getElementById("lightbox");

if (lightbox) {

    lightbox.addEventListener("click", function (e) {

        if (e.target === lightbox) {
            closeLightbox();
        }

    });
}


// ======================================================
// WEBSITE MEDIA
// ======================================================

async function getWebsiteMedia(area) {

    const { data, error } = await supabaseClient
        .from("website_images")
        .select("id, file_path, media_type, area, position")
        .eq("area", area)
        .order("position", { ascending: true });

    if (error) {

        console.error(
            "Error loading media for:",
            area,
            error
        );

        return [];
    }

    return data || [];
}


// ======================================================
// CREATE MEDIA ELEMENT
// ======================================================

function createMediaElement(media) {

    const wrapper =
        document.createElement("
