// ==========================================
// KITEEZI RECREATIONAL CENTER
// ADMIN MEDIA MANAGEMENT
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

const refreshButton =
    document.getElementById("refresh-button");

const mediaFile =
    document.getElementById("media-file");

const mediaArea =
    document.getElementById("media-area");

const mediaType =
    document.getElementById("media-type");

const loginMessage =
    document.getElementById("login-message");

const uploadMessage =
    document.getElementById("upload-message");

const mediaList =
    document.getElementById("media-list");


// ==========================================
// STORAGE
// ==========================================

const STORAGE_BUCKET =
    "website-images";


const STORAGE_URL =
    SUPABASE_URL +
    "/storage/v1/object/public/" +
    STORAGE_BUCKET;


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener(
    "click",
    async function () {

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


        loginMessage.textContent =
            "Logging in...";


        const { error } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "Login failed. Check your email and password.";

            return;
        }


        loginMessage.textContent =
            "Login successful.";

        showAdminPanel();

        loadMedia();
    }
);


// ==========================================
// SHOW ADMIN
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
    async function () {

        await supabaseClient.auth.signOut();

        adminPanel.style.display =
            "none";

        loginSection.style.display =
            "block";

        loginMessage.textContent =
            "";

        mediaList.innerHTML =
            "";
    }
);


// ==========================================
// UPLOAD / REPLACE
// ==========================================

uploadButton.addEventListener(
    "click",
    async function () {

        const file =
            mediaFile.files[0];

        const area =
            mediaArea.value;

        const type =
            mediaType.value;


        if (!file) {

            uploadMessage.textContent =
                "Please choose a file.";

            return;
        }


        if (!area || !type) {

            uploadMessage.textContent =
                "Please select the website area and media type.";

            return;
        }


        // Check file type

        if (
            type === "image" &&
            !file.type.startsWith("image/")
        ) {

            uploadMessage.textContent =
                "Please choose an image.";

            return;
        }


        if (
            type === "video" &&
            !file.type.startsWith("video/")
        ) {

            uploadMessage.textContent =
                "Please choose a video.";

            return;
        }


        uploadMessage.textContent =
            "Uploading...";


        try {

            // ==========================================
            // FIND EXISTING MEDIA
            // ==========================================

            const { data: oldMedia } =
                await supabaseClient
                    .from("website_images")
                    .select("*")
                    .eq("area", area)
                    .eq("position", "main")
                    .maybeSingle();


            // ==========================================
            // CREATE FILE NAME
            // ==========================================

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                area +
                "-main-" +
                Date.now() +
                "." +
                extension;


            // ==========================================
            // UPLOAD NEW FILE
            // ==========================================

            const { error: uploadError } =
                await supabaseClient.storage
                    .from(STORAGE_BUCKET)
                    .upload(
                        fileName,
                        file,
                        {
                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(uploadError);

                uploadMessage.textContent =
                    "Upload failed: " +
                    uploadError.message;

                return;
            }


            // ==========================================
            // SAVE DATABASE RECORD
            // ==========================================

            const { error: databaseError } =
                await supabaseClient
                    .from("website_images")
                    .upsert(
                        {
                            area: area,

                            position: "main",

                            file_path: fileName,

                            media_type: type,

                            updated_at:
                                new Date().toISOString()
                        },
                        {
                            onConflict:
                                "area,position"
                        }
                    );


            if (databaseError) {

                console.error(databaseError);

                // Remove newly uploaded file

                await supabaseClient.storage
                    .from(STORAGE_BUCKET)
                    .remove([
                        fileName
                    ]);


                uploadMessage.textContent =
                    "File uploaded but database update failed.";

                return;
            }


            // ==========================================
            // DELETE OLD FILE
            // ==========================================

            if (
                oldMedia &&
                oldMedia.file_path &&
                oldMedia.file_path !== fileName
            ) {

                await supabaseClient.storage
                    .from(STORAGE_BUCKET)
                    .remove([
                        oldMedia.file_path
                    ]);
            }


            uploadMessage.textContent =
                "Media changed successfully.";


            mediaFile.value =
                "";

            mediaArea.value =
                "";

            mediaType.value =
                "";


            await loadMedia();

        }

        catch (error) {

            console.error(error);

            uploadMessage.textContent =
                "Something went wrong.";

        }

    }
);


// ==========================================
// LOAD MEDIA
// ==========================================

async function loadMedia() {

    mediaList.innerHTML =
        `<p class="loading">
            Loading website media...
        </p>`;


    const { data, error } =
        await supabaseClient
            .from("website_images")
            .select("*")
            .order("area");


    if (error) {

        console.error(error);

        mediaList.innerHTML =
            `<p class="no-media">
                Unable to load website media.
            </p>`;

        return;
    }


    mediaList.innerHTML =
        "";


    if (!data || data.length === 0) {

        mediaList.innerHTML =
            `<p class="no-media">
                No website media has been uploaded yet.
            </p>`;

        return;
    }


    data.forEach(function (item) {

        createMediaCard(item);

    });
}


// ==========================================
// CREATE MEDIA CARD
// ==========================================

function createMediaCard(item) {

    const card =
        document.createElement("div");

    card.className =
        "media-card";


    const mediaURL =
        STORAGE_URL +
        "/" +
        item.file_path;


    // ==========================================
    // PREVIEW
    // ==========================================

    let preview;


    if (item.media_type === "video") {

        preview =
            document.createElement("video");

        preview.src =
            mediaURL;

        preview.controls =
            true;

    }

    else {

        preview =
            document.createElement("img");

        preview.src =
            mediaURL;

        preview.alt =
            getAreaName(item.area);

    }


    preview.className =
        "media-preview";


    // ==========================================
    // INFORMATION
    // ==========================================

    const info =
        document.createElement("div");

    info.className =
        "media-info";


    const name =
        document.createElement("div");

    name.className =
        "media-name";

    name.textContent =
        getAreaName(item.area);


    const type =
        document.createElement("span");

    type.className =
        "media-type";

    type.textContent =
        item.media_type === "video"
            ? "VIDEO"
            : "IMAGE";


    const file =
        document.createElement("div");

    file.className =
        "media-file";

    file.textContent =
        item.file_path;


    // ==========================================
    // ACTIONS
    // ==========================================

    const actions =
        document.createElement("div");

    actions.className =
        "media-actions";


    const replaceButton =
        document.createElement("button");

    replaceButton.className =
        "replace-button";

    replaceButton.textContent =
        "Replace";


    replaceButton.addEventListener(
        "click",
        function () {

            mediaArea.value =
                item.area;

            mediaType.value =
                item.media_type;

            mediaFile.click();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-button";

    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        function () {

            deleteMedia(
                item.id,
                item.file_path
            );

        }
    );


    actions.appendChild(
        replaceButton
    );

    actions.appendChild(
        deleteButton
    );


    info.appendChild(name);

    info.appendChild(type);

    info.appendChild(file);

    info.appendChild(actions);


    card.appendChild(preview);

    card.appendChild(info);


    mediaList.appendChild(card);
}


// ==========================================
// DELETE MEDIA
// ==========================================

async function deleteMedia(
    id,
    filePath
) {

    const confirmed =
        confirm(
            "Delete this media from the website?"
        );


    if (!confirmed) {
        return;
    }


    const { error: storageError } =
        await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .remove([
                filePath
            ]);


    if (storageError) {

        console.error(storageError);

        alert(
            "The file could not be deleted."
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
            "The file was deleted, but the database record could not be deleted."
        );

        return;
    }


    alert(
        "Media deleted successfully."
    );


    loadMedia();
}


// ==========================================
// AREA NAMES
// ==========================================

function getAreaName(area) {

    const names = {

        hero:
            "Hero Background",

        about:
            "About Section",

        swimming:
            "Swimming",

        sports:
            "Sports Video",

        events:
            "Events",

        restaurant:
            "Restaurant",

        food:
            "Food",

        coffee:
            "Coffee",

        snacks:
            "Snacks",

        goat:
            "Goat",

        liver:
            "Liver",

        chicken:
            "Chicken",

        burger:
            "Burger",

        rice:
            "Rice",

        pizza:
            "Pizza",

        fish:
            "Fish",

        logo:
            "Website Logo"

    };


    return names[area] || area;

}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
    "click",
    function () {

        loadMedia();

    }
);


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkSession() {

    const { data } =
        await supabaseClient.auth
            .getSession();


    if (data.session) {

        showAdminPanel();

        loadMedia();

    }

}


checkSession();
