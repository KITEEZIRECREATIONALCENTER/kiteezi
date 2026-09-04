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

const cancelReplaceButton =
    document.getElementById("cancel-replace-button");

const refreshButton =
    document.getElementById("refresh-button");

const mediaFile =
    document.getElementById("media-file");

const mediaArea =
    document.getElementById("media-area");

const loginMessage =
    document.getElementById("login-message");

const uploadMessage =
    document.getElementById("upload-message");

const mediaList =
    document.getElementById("media-list");

const uploadTitle =
    document.getElementById("upload-title");


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
// REPLACEMENT STATE
// ==========================================

let replacingMediaId = null;

let replacingOldFile = null;


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
// UPLOAD
// ==========================================

uploadButton.addEventListener(
    "click",
    async function () {

        const files =
            Array.from(mediaFile.files);

        const area =
            mediaArea.value;


        if (!area) {

            uploadMessage.textContent =
                "Please select the website area.";

            return;
        }


        if (files.length === 0) {

            uploadMessage.textContent =
                "Please choose at least one image or video.";

            return;
        }


        // ==========================================
        // REPLACE MODE
        // ==========================================

        if (replacingMediaId) {

            if (files.length !== 1) {

                uploadMessage.textContent =
                    "Replacement requires exactly one file.";

                return;
            }


            await replaceMedia(
                files[0],
                area
            );

            return;
        }


        // ==========================================
        // NORMAL MULTIPLE UPLOAD
        // ==========================================

        uploadMessage.textContent =
            "Uploading " +
            files.length +
            " file(s)...";


        uploadButton.disabled =
            true;


        let successfulUploads = 0;


        try {

            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const file =
                    files[i];


                // Make sure file is image or video

                if (
                    !file.type.startsWith("image/") &&
                    !file.type.startsWith("video/")
                ) {

                    continue;
                }


                const mediaType =
                    file.type.startsWith("video/")
                        ? "video"
                        : "image";


                const extension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const safeArea =
                    area.replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    );


                const fileName =
                    safeArea +
                    "-" +
                    Date.now() +
                    "-" +
                    i +
                    "." +
                    extension;


                // ==========================================
                // UPLOAD TO STORAGE
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

                    console.error(
                        "Storage error:",
                        uploadError
                    );

                    continue;
                }


                // ==========================================
                // SAVE DATABASE RECORD
                // ==========================================

                const { error: databaseError } =
                    await supabaseClient
                        .from("website_images")
                        .insert({

                            area: area,

                            position:
                                Date.now() +
                                "-" +
                                i,

                            file_path:
                                fileName,

                            media_type:
                                mediaType,

                            updated_at:
                                new Date().toISOString()

                        });


                if (databaseError) {

                    console.error(
                        "Database error:",
                        databaseError
                    );


                    // Remove uploaded file
                    await supabaseClient.storage
                        .from(STORAGE_BUCKET)
                        .remove([
                            fileName
                        ]);

                    continue;
                }


                successfulUploads++;

            }


            uploadMessage.textContent =
                successfulUploads +
                " file(s) uploaded successfully.";


            mediaFile.value =
                "";


            mediaArea.value =
                "";


            await loadMedia();

        }

        catch (error) {

            console.error(error);

            uploadMessage.textContent =
                "Something went wrong.";

        }

        finally {

            uploadButton.disabled =
                false;

        }

    }
);


// ==========================================
// REPLACE MEDIA
// ==========================================

async function replaceMedia(
    newFile,
    area
) {

    uploadMessage.textContent =
        "Replacing media...";


    uploadButton.disabled =
        true;


    try {

        const mediaType =
            newFile.type.startsWith("video/")
                ? "video"
                : "image";


        if (
            !newFile.type.startsWith("image/") &&
            !newFile.type.startsWith("video/")
        ) {

            uploadMessage.textContent =
                "Please select an image or video.";

            return;
        }


        const extension =
            newFile.name
                .split(".")
                .pop()
                .toLowerCase();


        const safeArea =
            area.replace(
                /[^a-zA-Z0-9-_]/g,
                "-"
            );


        const newFileName =
            safeArea +
            "-replacement-" +
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
                    newFileName,
                    newFile,
                    {
                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(uploadError);

            uploadMessage.textContent =
                "Replacement upload failed: " +
                uploadError.message;

            return;
        }


        // ==========================================
        // UPDATE DATABASE
        // ==========================================

        const { error: databaseError } =
            await supabaseClient
                .from("website_images")
                .update({

                    file_path:
                        newFileName,

                    media_type:
                        mediaType,

                    area:
                        area,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    replacingMediaId
                );


        if (databaseError) {

            console.error(databaseError);


            await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .remove([
                    newFileName
                ]);


            uploadMessage.textContent =
                "Database update failed.";

            return;
        }


        // ==========================================
        // DELETE OLD FILE
        // ==========================================

        if (replacingOldFile) {

            await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .remove([
                    replacingOldFile
                ]);
        }


        uploadMessage.textContent =
            "Media replaced successfully.";


        cancelReplacement();


        await loadMedia();

    }

    catch (error) {

        console.error(error);

        uploadMessage.textContent =
            "Something went wrong.";

    }

    finally {

        uploadButton.disabled =
            false;

    }

}


// ==========================================
// START REPLACEMENT
// ==========================================

function startReplacement(item) {

    replacingMediaId =
        item.id;

    replacingOldFile =
        item.file_path;


    mediaArea.value =
        item.area;


    uploadTitle.textContent =
        "Replace Media";


    uploadButton.textContent =
        "Replace Selected Media";


    cancelReplaceButton.style.display =
        "block";


    mediaFile.value =
        "";


    uploadMessage.textContent =
        "Choose ONE new image or video to replace this file.";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CANCEL REPLACEMENT
// ==========================================

function cancelReplacement() {

    replacingMediaId =
        null;

    replacingOldFile =
        null;


    uploadTitle.textContent =
        "Add Website Media";


    uploadButton.textContent =
        "Upload Media";


    cancelReplaceButton.style.display =
        "none";


    mediaFile.value =
        "";


    uploadMessage.textContent =
        "";

}


cancelReplaceButton.addEventListener(
    "click",
    cancelReplacement
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
            .order(
                "area",
                {
                    ascending: true
                }
            )
            .order(
                "updated_at",
                {
                    ascending: true
                }
            );


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


    // ==========================================
    // GROUP BY AREA
    // ==========================================

    const grouped =
        {};


    data.forEach(function (item) {

        if (!grouped[item.area]) {

            grouped[item.area] =
                [];
        }


        grouped[item.area].push(
            item
        );

    });


    Object.keys(grouped).forEach(
        function (area) {

            const section =
                document.createElement("div");

            section.className =
                "media-section";


            const heading =
                document.createElement("h3");

            heading.textContent =
                getAreaName(area);


            section.appendChild(
                heading
            );


            const grid =
                document.createElement("div");

            grid.className =
                "media-grid";


            grouped[area].forEach(
                function (item) {

                    createMediaCard(
                        item,
                        grid
                    );

                }
            );


            section.appendChild(
                grid
            );


            mediaList.appendChild(
                section
            );

        }
    );

}


// ==========================================
// CREATE MEDIA CARD
// ==========================================

function createMediaCard(
    item,
    container
) {

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


    if (
        item.media_type === "video"
    ) {

        preview =
            document.createElement("video");

        preview.src =
            mediaURL;

        preview.controls =
            true;

        preview.preload =
            "metadata";

    }

    else {

        preview =
            document.createElement("img");

        preview.src =
            mediaURL;

        preview.alt =
            getAreaName(item.area);

        preview.loading =
            "lazy";

    }


    preview.className =
        "media-preview";


    // ==========================================
    // INFO
    // ==========================================

    const info =
        document.createElement("div");

    info.className =
        "media-info";


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

            startReplacement(
                item
            );

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


    info.appendChild(
        type
    );

    info.appendChild(
        file
    );

    info.appendChild(
        actions
    );


    card.appendChild(
        preview
    );

    card.appendChild(
        info
    );


    container.appendChild(
        card
    );

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
            .eq(
                "id",
                id
            );


    if (databaseError) {

        console.error(databaseError);

        alert(
            "The file was deleted, but its database record could not be deleted."
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
            "Sports",

        events:
            "Events",

        restaurant:
            "Restaurant",

        "restaurant-2":
            "Restaurant 2",

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
    loadMedia
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
