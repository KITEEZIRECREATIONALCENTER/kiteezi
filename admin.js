// ==========================================
// KITEEZI RECREATIONAL CENTER
// ADMIN IMAGE MANAGEMENT
// ==========================================


// ==========================================
// SUPABASE CONNECTION
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
// ELEMENTS
// ==========================================

const loginSection =
    document.getElementById("login-section");

const adminPanel =
    document.getElementById("admin-panel");

const loginButton =
    document.getElementById("login-button");

const logoutButton =
    document.getElementById("logout-button");

const uploadButton =
    document.getElementById("upload-button");

const imageFile =
    document.getElementById("image-file");

const loginMessage =
    document.getElementById("login-message");

const uploadMessage =
    document.getElementById("upload-message");

const imageList =
    document.getElementById("image-list");


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener(
    "click",
    async function() {

        const email =
            document
                .getElementById("admin-email")
                .value
                .trim();

        const password =
            document
                .getElementById("admin-password")
                .value;

        if (!email || !password) {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;
        }


        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email: email,
                    password: password
                });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "Login failed. Please check your details.";

            return;
        }


        loginMessage.textContent =
            "Login successful.";

        showAdminPanel();

        loadImages();
    }
);


// ==========================================
// SHOW ADMIN PANEL
// ==========================================

function showAdminPanel() {

    loginSection.style.display =
        "none";

    adminPanel.style.display =
        "block";
}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        adminPanel.style.display =
            "none";

        loginSection.style.display =
            "block";
    }
);


// ==========================================
// UPLOAD IMAGE
// ==========================================

uploadButton.addEventListener(
    "click",
    async function() {

        const file =
            imageFile.files[0];

        if (!file) {

            uploadMessage.textContent =
                "Please choose an image first.";

            return;
        }


        const fileName =
            Date.now() +
            "-" +
            file.name;


        uploadMessage.textContent =
            "Uploading image...";


        const { error } =
            await supabaseClient.storage
                .from("website-images")
                .upload(
                    fileName,
                    file
                );


        if (error) {

            console.error(error);

            uploadMessage.textContent =
                "Upload failed.";

            return;
        }


        uploadMessage.textContent =
            "Image uploaded successfully.";

        imageFile.value = "";

        loadImages();
    }
);


// ==========================================
// LOAD IMAGES
// ==========================================

async function loadImages() {

    imageList.innerHTML =
        "Loading images...";


    const { data, error } =
        await supabaseClient.storage
            .from("website-images")
            .list();


    if (error) {

        console.error(error);

        imageList.innerHTML =
            "Unable to load images.";

        return;
    }


    imageList.innerHTML = "";


    if (!data || data.length === 0) {

        imageList.innerHTML =
            "No images uploaded yet.";

        return;
    }


    data.forEach(function(file) {

        const card =
            document.createElement("div");

        card.className =
            "image-card";


        const image =
            document.createElement("img");


        const { data: publicUrlData } =
            supabaseClient.storage
                .from("website-images")
                .getPublicUrl(file.name);


        image.src =
            publicUrlData.publicUrl;


        const name =
            document.createElement("p");

        name.textContent =
            file.name;


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";

        deleteButton.className =
            "delete-button";


        deleteButton.addEventListener(
            "click",
            function() {
                deleteImage(file.name);
            }
        );


        card.appendChild(image);

        card.appendChild(name);

        card.appendChild(deleteButton);

        imageList.appendChild(card);
    });
}


// ==========================================
// DELETE IMAGE
// ==========================================

async function deleteImage(fileName) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this image?"
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabaseClient.storage
            .from("website-images")
            .remove([
                fileName
            ]);


    if (error) {

        console.error(error);

        alert(
            "The image could not be deleted."
        );

        return;
    }


    alert(
        "Image deleted successfully."
    );


    loadImages();
}


// ==========================================
// CHECK LOGIN SESSION
// ==========================================

async function checkSession() {

    const { data } =
        await supabaseClient.auth
            .getSession();


    if (data.session) {

        showAdminPanel();

        loadImages();
    }
}


checkSession();
