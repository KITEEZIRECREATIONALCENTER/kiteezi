// ==========================================
// KITEEZI RECREATIONAL CENTER
// ADMIN IMAGE MANAGEMENT
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

const imageArea =
    document.getElementById("image-area");

const imagePosition =
    document.getElementById("image-position");

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


        const { error } =
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
// UPLOAD / REPLACE IMAGE
// ==========================================

uploadButton.addEventListener(
    "click",
    async function() {

        const file =
            imageFile.files[0];

        const area =
            imageArea.value;

        const position =
            imagePosition.value;


        if (!file) {

            uploadMessage.textContent =
                "Please choose an image.";

            return;
        }


        if (!area || !position) {

            uploadMessage.textContent =
                "Please select the website area and image position.";

            return;
        }


        uploadMessage.textContent =
            "Uploading image...";


        // Create a unique filename

        const fileName =
            area +
            "-" +
            position +
            "-" +
            Date.now() +
            "-" +
            file.name;


        // Upload to Supabase Storage

        const { error: uploadError } =
            await supabaseClient.storage
                .from("website-images")
                .upload(
                    fileName,
                    file
                );


        if (uploadError) {

            console.error(uploadError);

            uploadMessage.textContent =
                "Image upload failed.";

            return;
        }


        // Check whether this position
        // already has an image

        const { data: oldImage } =
            await supabaseClient
                .from("website_images")
                .select("*")
                .eq("area", area)
                .eq("position", position)
                .maybeSingle();


        // If an old image exists,
        // delete it from Storage

        if (oldImage) {

            await supabaseClient.storage
                .from("website-images")
                .remove([
                    oldImage.file_path
                ]);
        }


        // Save the new image location
        // in the database

        const { error: databaseError } =
            await supabaseClient
                .from("website_images")
                .upsert(
                    {
                        area: area,
                        position: position,
                        file_path: fileName,
                        updated_at: new Date().toISOString()
                    },
                    {
                        onConflict:
                            "area,position"
                    }
                );


        if (databaseError) {

            console.error(databaseError);

            uploadMessage.textContent =
                "Image uploaded, but the database could not be updated.";

            return;
        }


        uploadMessage.textContent =
            "Image uploaded successfully.";


        imageFile.value =
            "";

        loadImages();
    }
);


// ==========================================
// LOAD CURRENT IMAGES
// ==========================================

async function loadImages() {

    imageList.innerHTML =
        "Loading images...";


    const { data, error } =
        await supabaseClient
            .from("website_images")
            .select("*")
            .order("area");


    if (error) {

        console.error(error);

        imageList.innerHTML =
            "Unable to load images.";

        return;
    }


    imageList.innerHTML =
        "";


    if (!data || data.length === 0) {

        imageList.innerHTML =
            "No website images have been assigned yet.";

        return;
    }


    data.forEach(function(item) {

        const card =
            document.createElement("div");

        card.className =
            "image-card";


        const title =
            document.createElement("h4");

        title.textContent =
            item.area +
            " — " +
            item.position;


        const image =
            document.createElement("img");


        const { data: publicUrlData } =
            supabaseClient.storage
                .from("website-images")
                .getPublicUrl(
                    item.file_path
                );


        image.src =
            publicUrlData.publicUrl;


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";


        deleteButton.className =
            "delete-button";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteImage(
                    item.id,
                    item.file_path
                );

            }
        );


        card.appendChild(title);

        card.appendChild(image);

        card.appendChild(deleteButton);

        imageList.appendChild(card);
    });
}


// ==========================================
// DELETE IMAGE
// ==========================================

async function deleteImage(
    id,
    filePath
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this image?"
        );


    if (!confirmed) {
        return;
    }


    const { error: storageError } =
        await supabaseClient.storage
            .from("website-images")
            .remove([
                filePath
            ]);


    if (storageError) {

        console.error(storageError);

        alert(
            "The image could not be deleted."
        );

        return;
    }


    const { error: databaseError } =
        await supabaseClient
            .from("website_images")
            .delete()
            .eq("id", id);


    if (databaseError) {

        console.error(databaseError);

        alert(
            "The image file was deleted, but the database record could not be deleted."
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
