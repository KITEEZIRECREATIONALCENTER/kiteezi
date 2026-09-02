
function welcome() {
    alert("Welcome to Kiteezi Recreational Center!");
}

welcome();


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
```
