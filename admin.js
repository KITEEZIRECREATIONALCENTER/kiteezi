/* =========================================================
   KITEEZI RECREATIONAL CENTER
   ADMIN DASHBOARD
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://pkvctsfdqyzlcryikcox.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__pq1skdZvbMRm_R67-xYmw_Ogsm4r00";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const STORAGE_BUCKET =
    "website-images";

const STORAGE_PUBLIC_URL =
    `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;


/* =========================================================
   GLOBAL DATA
========================================================= */

let allMedia = [];
let allMenuItems = [];
let allPersonnel = [];
let allReviews = [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLogin();

        setupNavigation();

        setupForms();

        setupPreviews();

        checkSession();

    }
);


/* =========================================================
   AUTH SESSION
========================================================= */

async function checkSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

        return;
    }


    if (data.session) {

        showDashboard(
            data.session
        );

    } else {

        showLogin();
    }


    supabaseClient.auth.onAuthStateChange(
        (_event, session) => {

            if (session) {

                showDashboard(
                    session
                );

            } else {

                showLogin();
            }

        }
    );
}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const form =
        document.getElementById(
            "login-form"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "login-email"
                ).value.trim();

            const password =
                document.getElementById(
                    "login-password"
                ).value;

            const status =
                document.getElementById(
                    "login-status"
                );


            status.textContent =
                "Signing in...";


            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                status.textContent =
                    error.message;

                return;
            }


            status.textContent = "";

            showDashboard(
                data.session
            );
        }
    );
}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    document
        .getElementById(
            "login-screen"
        )
        ?.classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "dashboard"
        )
        ?.classList.add(
            "hidden"
        );
}


/* =========================================================
   SHOW DASHBOARD
========================================================= */

async function showDashboard(session) {

    document
        .getElementById(
            "login-screen"
        )
        ?.classList.add(
            "hidden"
        );

    document
        .getElementById(
            "dashboard"
        )
        ?.classList.remove(
            "hidden"
        );


    const email =
        document.getElementById(
            "admin-email"
        );

    if (email) {

        email.textContent =
            session?.user?.email ||
            "Admin";
    }


    await refreshAll();
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    await supabaseClient.auth.signOut();

    showLogin();
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            ".admin-nav .admin-tab"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const tab =
                        button.dataset.tab;

                    switchTab(tab);
                }
            );
        });


    document
        .getElementById(
            "logout-btn"
        )
        ?.addEventListener(
            "click",
            logout
        );
}


/* =========================================================
   SWITCH TAB
========================================================= */

function switchTab(tab) {

    document
        .querySelectorAll(
            ".admin-nav .admin-tab"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.tab === tab
            );
        });


    document
        .querySelectorAll(
            ".admin-tab-content"
        )
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id ===
                `tab-${tab}`
            );
        });


    const titles = {
        media: "Images & Media",
        menu: "Menu",
        personnel: "Personnel",
        reviews: "Reviews"
    };


    const title =
        document.getElementById(
            "page-title"
        );

    if (title) {
        title.textContent =
            titles[tab] || "Dashboard";
    }
}


/* =========================================================
   SETUP FORMS
========================================================= */

function setupForms() {

    document
        .getElementById(
            "media-form"
        )
        ?.addEventListener(
            "submit",
            uploadMedia
        );


    document
        .getElementById(
            "menu-form"
        )
        ?.addEventListener(
            "submit",
            saveMenuItem
        );


    document
        .getElementById(
            "personnel-form"
        )
        ?.addEventListener(
            "submit",
            savePersonnel
        );


    document
        .getElementById(
            "menu-cancel"
        )
        ?.addEventListener(
            "click",
            resetMenuForm
        );


    document
        .getElementById(
            "personnel-cancel"
        )
        ?.addEventListener(
            "click",
            resetPersonnelForm
        );


    document
        .getElementById(
            "refresh-menu"
        )
        ?.addEventListener(
            "click",
            loadMenuItems
        );


    document
        .getElementById(
            "refresh-personnel"
        )
        ?.addEventListener(
            "click",
            loadPersonnel
        );


    document
        .getElementById(
            "refresh-reviews"
        )
        ?.addEventListener(
            "click",
            loadReviews
        );


    document
        .getElementById(
            "media-filter"
        )
        ?.addEventListener(
            "change",
            renderMedia
        );
}


/* =========================================================
   PREVIEWS
========================================================= */

function setupPreviews() {

    document
        .getElementById(
            "media-file"
        )
        ?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                const preview =
                    document.getElementById(
                        "media-preview"
                    );

                previewFile(
                    file,
                    preview
                );
            }
        );


    document
        .getElementById(
            "personnel-photo"
        )
        ?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];

                const preview =
                    document.getElementById(
                        "personnel-preview"
                    );

                previewFile(
                    file,
                    preview
                );
            }
        );
}


/* =========================================================
   PREVIEW FILE
========================================================= */

function previewFile(
    file,
    container
) {

    if (!container) {
        return;
    }


    if (!file) {

        container.textContent =
            "No file selected.";

        return;
    }


    const url =
        URL.createObjectURL(file);


    if (file.type.startsWith("video/")) {

        container.innerHTML = `
            <video
                src="${url}"
                controls
            ></video>
        `;

    } else {

        container.innerHTML = `
            <img
                src="${url}"
                alt="Preview"
            >
        `;
    }
}


/* =========================================================
   REFRESH ALL
========================================================= */

async function refreshAll() {

    await Promise.all([
        loadMedia(),
        loadMenuItems(),
        loadPersonnel(),
        loadReviews()
    ]);
}


/* =========================================================
   MEDIA
========================================================= */

async function loadMedia() {

    const container =
        document.getElementById(
            "media-list"
        );

    if (container) {
        container.innerHTML =
            "Loading media...";
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("website_images")
            .select("*")
            .order("area", {
                ascending: true
            })
            .order("position", {
                ascending: true
            });


    if (error) {

        console.error(
            "Media loading error:",
            error
        );

        if (container) {

            container.innerHTML =
                `<div class="status-message">
                    Unable to load media.
                 </div>`;
        }

        return;
    }


    allMedia = data || [];

    renderMedia();
}


/* =========================================================
   RENDER MEDIA
========================================================= */

function renderMedia() {

    const container =
        document.getElementById(
            "media-list"
        );

    if (!container) {
        return;
    }


    const filter =
        document.getElementById(
            "media-filter"
        )?.value || "all";


    const media =
        filter === "all"
            ? allMedia
            : allMedia.filter(
                item =>
                    item.area === filter
            );


    if (!media.length) {

        container.innerHTML =
            `<div class="status-message">
                No media has been added for this area yet.
             </div>`;

        return;
    }


    container.innerHTML =
        media.map(
            mediaCardHTML
        ).join("");
}


/* =========================================================
   MEDIA CARD
========================================================= */

function mediaCardHTML(item) {

    const url =
        getPublicStorageUrl(
            item.file_path
        );


    const type =
        String(
            item.media_type || ""
        ).toLowerCase();


    const isVideo =
        type === "video" ||
        /\.(mp4|webm|ogg|mov|m4v)$/i
            .test(
                item.file_path
            );


    const preview =
        isVideo
            ? `
                <video
                    src="${escapeHTML(url)}"
                    muted
                    controls
                ></video>
              `
            : `
                <img
                    src="${escapeHTML(url)}"
                    alt="${escapeHTML(item.area || "Website media")}"
                >
              `;


    return `
        <article
            class="media-admin-card"
        >

            <div class="media-admin-preview">
                ${preview}
            </div>

            <div class="media-admin-info">

                <strong>
                    ${escapeHTML(
                        item.area || ""
                    )}
                </strong>

                <small>
                    Position:
                    ${Number(
                        item.position || 0
                    )}
                </small>

                <button
                    class="delete-btn"
                    type="button"
                    onclick="deleteMedia('${escapeJS(item.id)}')"
                >
                    Delete
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   UPLOAD MEDIA
========================================================= */

async function uploadMedia(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const area =
        document.getElementById(
            "media-area"
        ).value;


    const position =
        Number(
            document.getElementById(
                "media-position"
            ).value
        ) || 0;


    const file =
        document.getElementById(
            "media-file"
        ).files[0];


    const status =
        document.getElementById(
            "media-status"
        );


    if (!file) {

        status.textContent =
            "Please select a file.";

        return;
    }


    status.textContent =
        "Uploading...";


    const safeName =
        sanitizeFilename(
            file.name
        );


    const filePath =
        `${area}/${Date.now()}-${safeName}`;


    const {
        error: uploadError
    } =
        await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(
                filePath,
                file,
                {
                    upsert: false,
                    contentType:
                        file.type || undefined
                }
            );


    if (uploadError) {

        console.error(
            "Media upload error:",
            uploadError
        );

        status.textContent =
            uploadError.message;

        return;
    }


    const mediaType =
        file.type.startsWith("video/")
            ? "video"
            : "image";


    const {
        error: databaseError
    } =
        await supabaseClient
            .from("website_images")
            .insert({
                file_path: filePath,
                media_type: mediaType,
                area,
                position
            });


    if (databaseError) {

        console.error(
            "Media database error:",
            databaseError
        );

        await removeStorageFile(
            filePath
        );

        status.textContent =
            databaseError.message;

        return;
    }


    status.textContent =
        "Media uploaded successfully.";


    form.reset();


    document.getElementById(
        "media-position"
    ).value = 0;


    document.getElementById(
        "media-preview"
    ).textContent =
        "Select an image or video to preview it here.";


    await loadMedia();
}


/* =========================================================
   DELETE MEDIA
========================================================= */

async function deleteMedia(id) {

    const item =
        allMedia.find(
            media =>
                String(media.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this media from the website?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("website_images")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Media delete error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    await removeStorageFile(
        item.file_path
    );


    await loadMedia();
}


/* =========================================================
   MENU
========================================================= */

async function loadMenuItems() {

    const container =
        document.getElementById(
            "admin-menu-list"
        );

    if (container) {
        container.innerHTML =
            "Loading menu...";
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("menu_items")
            .select("*")
            .order("position", {
                ascending: true
            });


    if (error) {

        console.error(
            "Menu loading error:",
            error
        );

        if (container) {

            container.innerHTML =
                `<div class="status-message">
                    Unable to load menu.
                 </div>`;
        }

        return;
    }


    allMenuItems =
        data || [];


    renderMenuAdmin();
}


/* =========================================================
   RENDER MENU ADMIN
========================================================= */

function renderMenuAdmin() {

    const container =
        document.getElementById(
            "admin-menu-list"
        );

    if (!container) {
        return;
    }


    if (!allMenuItems.length) {

        container.innerHTML =
            `<div class="status-message">
                No menu items have been added yet.
             </div>`;

        return;
    }


    container.innerHTML =
        allMenuItems.map(
            item => {

                const price =
                    Number(item.price);


                return `
                    <article
                        class="admin-list-item"
                    >

                        <div
                            class="admin-list-main"
                        >

                            <h3>
                                ${escapeHTML(
                                    item.name || ""
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.category || ""
                                )}
                                ·
                                UGX
                                ${
                                    Number.isFinite(price)
                                        ? price.toLocaleString()
                                        : escapeHTML(
                                            item.price || ""
                                        )
                                }
                                · Position
                                ${Number(
                                    item.position || 0
                                )}
                            </p>

                            ${
                                item.description
                                    ? `<p>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                       </p>`
                                    : ""
                            }

                        </div>


                        <div
                            class="admin-list-actions"
                        >

                            <button
                                class="edit-btn"
                                type="button"
                                onclick="editMenuItem('${escapeJS(item.id)}')"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                type="button"
                                onclick="deleteMenuItem('${escapeJS(item.id)}')"
                            >
                                Delete
                            </button>

                        </div>

                    </article>
                `;

            }
        ).join("");
}


/* =========================================================
   SAVE MENU ITEM
========================================================= */

async function saveMenuItem(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "menu-id"
        ).value;


    const name =
        document.getElementById(
            "menu-name"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "menu-price"
            ).value
        );


    const category =
        document.getElementById(
            "menu-category"
        ).value;


    const position =
        Number(
            document.getElementById(
                "menu-position"
            ).value
        ) || 0;


    const description =
        document.getElementById(
            "menu-description"
        ).value.trim();


    const status =
        document.getElementById(
            "menu-status"
        );


    status.textContent =
        "Saving...";


    const payload = {
        name,
        price,
        category,
        position,
        description
    };


    let result;


    if (id) {

        result =
            await supabaseClient
                .from("menu_items")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("menu_items")
                .insert(payload);
    }


    if (result.error) {

        console.error(
            "Menu save error:",
            result.error
        );

        status.textContent =
            result.error.message;

        return;
    }


    status.textContent =
        "Menu item saved successfully.";


    resetMenuForm();

    await loadMenuItems();
}


/* =========================================================
   EDIT MENU
========================================================= */

function editMenuItem(id) {

    const item =
        allMenuItems.find(
            menu =>
                String(menu.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    document.getElementById(
        "menu-id"
    ).value = item.id;


    document.getElementById(
        "menu-name"
    ).value =
        item.name || "";


    document.getElementById(
        "menu-price"
    ).value =
        item.price ?? "";


    document.getElementById(
        "menu-category"
    ).value =
        item.category || "snacks";


    document.getElementById(
        "menu-position"
    ).value =
        item.position ?? 0;


    document.getElementById(
        "menu-description"
    ).value =
        item.description || "";


    document.getElementById(
        "menu-form-title"
    ).textContent =
        "Edit Menu Item";


    document.getElementById(
        "menu-cancel"
    ).classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "tab-menu"
        )
        ?.scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================================================
   RESET MENU
========================================================= */

function resetMenuForm() {

    const form =
        document.getElementById(
            "menu-form"
        );

    form?.reset();


    document.getElementById(
        "menu-id"
    ).value = "";


    document.getElementById(
        "menu-position"
    ).value = 0;


    document.getElementById(
        "menu-form-title"
    ).textContent =
        "Add Menu Item";


    document.getElementById(
        "menu-cancel"
    )?.classList.add(
        "hidden"
    );
}


/* =========================================================
   DELETE MENU
========================================================= */

async function deleteMenuItem(id) {

    const item =
        allMenuItems.find(
            menu =>
                String(menu.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    if (
        !confirm(
            `Delete "${item.name}" from the menu?`
        )
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("menu_items")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Menu delete error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    await loadMenuItems();
}


/* =========================================================
   PERSONNEL
========================================================= */

async function loadPersonnel() {

    const container =
        document.getElementById(
            "admin-personnel-list"
        );

    if (container) {
        container.innerHTML =
            "Loading personnel...";
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("personnel")
            .select("*")
            .order("display_order", {
                ascending: true
            });


    if (error) {

        console.error(
            "Personnel loading error:",
            error
        );

        if (container) {

            container.innerHTML =
                `<div class="status-message">
                    Unable to load personnel.
                 </div>`;
        }

        return;
    }


    allPersonnel =
        data || [];


    renderPersonnelAdmin();
}


/* =========================================================
   RENDER PERSONNEL
========================================================= */

function renderPersonnelAdmin() {

    const container =
        document.getElementById(
            "admin-personnel-list"
        );

    if (!container) {
        return;
    }


    if (!allPersonnel.length) {

        container.innerHTML =
            `<div class="status-message">
                No personnel have been added yet.
             </div>`;

        return;
    }


    container.innerHTML =
        allPersonnel.map(
            person => {

                const photo =
                    person.photo_url
                        ? getPublicStorageUrl(
                            person.photo_url
                        )
                        : "";


                return `
                    <article
                        class="personnel-admin-item"
                    >

                        <div
                            class="personnel-admin-photo"
                        >

                            ${
                                photo
                                    ? `<img
                                        src="${escapeHTML(photo)}"
                                        alt="${escapeHTML(
                                            person.name || ""
                                        )}"
                                       >`
                                    : "No photo"
                            }

                        </div>


                        <div
                            class="admin-list-main"
                        >

                            <h3>
                                ${escapeHTML(
                                    person.name || ""
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    person.position || ""
                                )}
                            </p>

                            ${
                                person.phone
                                    ? `<p>
                                        ${escapeHTML(
                                            person.phone
                                        )}
                                       </p>`
                                    : ""
                            }

                        </div>


                        <div
                            class="admin-list-actions"
                        >

                            <button
                                class="edit-btn"
                                type="button"
                                onclick="editPersonnel('${escapeJS(person.id)}')"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                type="button"
                                onclick="deletePersonnel('${escapeJS(person.id)}')"
                            >
                                Delete
                            </button>

                        </div>

                    </article>
                `;

            }
        ).join("");
}


/* =========================================================
   SAVE PERSONNEL
========================================================= */

async function savePersonnel(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "personnel-id"
        ).value;


    const oldPhoto =
        document.getElementById(
            "personnel-old-photo"
        ).value;


    const name =
        document.getElementById(
            "personnel-name"
        ).value.trim();


    const position =
        document.getElementById(
            "personnel-position"
        ).value.trim();


    const phone =
        document.getElementById(
            "personnel-phone"
        ).value.trim();


    const displayOrder =
        Number(
            document.getElementById(
                "personnel-order"
            ).value
        ) || 0;


    const description =
        document.getElementById(
            "personnel-description"
        ).value.trim();


    const photoFile =
        document.getElementById(
            "personnel-photo"
        ).files[0];


    const removePhoto =
        document.getElementById(
            "personnel-remove-photo"
        ).checked;


    const status =
        document.getElementById(
            "personnel-status"
        );


    status.textContent =
        "Saving...";


    let photoUrl =
        oldPhoto || null;

    let uploadedNewPhoto = null;


    /* UPLOAD NEW PHOTO */

    if (photoFile) {

        const safeName =
            sanitizeFilename(
                photoFile.name
            );


        const photoPath =
            `personnel/${Date.now()}-${safeName}`;


        const {
            error: uploadError
        } =
            await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .upload(
                    photoPath,
                    photoFile,
                    {
                        upsert: false,
                        contentType:
                            photoFile.type ||
                            "image/jpeg"
                    }
                );


        if (uploadError) {

            console.error(
                "Personnel photo upload error:",
                uploadError
            );

            status.textContent =
                uploadError.message;

            return;
        }


        uploadedNewPhoto =
            photoPath;

        photoUrl =
            photoPath;
    }


    if (removePhoto) {
        photoUrl = null;
    }


    const payload = {
        name,
        position,
        phone,
        display_order:
            displayOrder,
        description,
        photo_url:
            photoUrl
    };


    let result;


    if (id) {

        result =
            await supabaseClient
                .from("personnel")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("personnel")
                .insert(payload);
    }


    if (result.error) {

        console.error(
            "Personnel save error:",
            result.error
        );


        if (uploadedNewPhoto) {

            await removeStorageFile(
                uploadedNewPhoto
            );
        }


        status.textContent =
            result.error.message;

        return;
    }


    /* REMOVE OLD PHOTO */

    if (
        oldPhoto &&
        (
            photoFile ||
            removePhoto
        )
    ) {

        await removeStorageFile(
            oldPhoto
        );
    }


    status.textContent =
        "Personnel saved successfully.";


    resetPersonnelForm();

    await loadPersonnel();
}


/* =========================================================
   EDIT PERSONNEL
========================================================= */

function editPersonnel(id) {

    const person =
        allPersonnel.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!person) {
        return;
    }


    document.getElementById(
        "personnel-id"
    ).value =
        person.id;


    document.getElementById(
        "personnel-old-photo"
    ).value =
        person.photo_url || "";


    document.getElementById(
        "personnel-name"
    ).value =
        person.name || "";


    document.getElementById(
        "personnel-position"
    ).value =
        person.position || "";


    document.getElementById(
        "personnel-phone"
    ).value =
        person.phone || "";


    document.getElementById(
        "personnel-order"
    ).value =
        person.display_order ?? 0;


    document.getElementById(
        "personnel-description"
    ).value =
        person.description || "";


    document.getElementById(
        "personnel-remove-photo"
    ).checked = false;


    document.getElementById(
        "personnel-form-title"
    ).textContent =
        "Edit Personnel";


    document.getElementById(
        "personnel-cancel"
    ).classList.remove(
        "hidden"
    );


    const preview =
        document.getElementById(
            "personnel-preview"
        );


    if (
        person.photo_url &&
        preview
    ) {

        preview.innerHTML = `
            <img
                src="${escapeHTML(
                    getPublicStorageUrl(
                        person.photo_url
                    )
                )}"
                alt="Current photo"
            >
        `;

    } else if (preview) {

        preview.textContent =
            "No current photo.";
    }


    document
        .getElementById(
            "tab-personnel"
        )
        ?.scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================================================
   RESET PERSONNEL
========================================================= */

function resetPersonnelForm() {

    document
        .getElementById(
            "personnel-form"
        )
        ?.reset();


    document.getElementById(
        "personnel-id"
    ).value = "";


    document.getElementById(
        "personnel-old-photo"
    ).value = "";


    document.getElementById(
        "personnel-order"
    ).value = 0;


    document.getElementById(
        "personnel-form-title"
    ).textContent =
        "Add Personnel";


    document.getElementById(
        "personnel-cancel"
    )?.classList.add(
        "hidden"
    );


    document.getElementById(
        "personnel-preview"
    ).textContent =
        "No new photo selected.";
}


/* =========================================================
   DELETE PERSONNEL
========================================================= */

async function deletePersonnel(id) {

    const person =
        allPersonnel.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!person) {
        return;
    }


    if (
        !confirm(
            `Delete ${person.name} from the personnel list?`
        )
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("personnel")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Personnel delete error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    if (person.photo_url) {

        await removeStorageFile(
            person.photo_url
        );
    }


    await loadPersonnel();
}


/* =========================================================
   REVIEWS
========================================================= */

async function loadReviews() {

    const container =
        document.getElementById(
            "admin-reviews-list"
        );

    if (container) {
        container.innerHTML =
            "Loading reviews...";
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Reviews loading error:",
            error
        );

        if (container) {

            container.innerHTML =
                `<div class="status-message">
                    Unable to load reviews.
                 </div>`;
        }

        return;
    }


    allReviews =
        data || [];


    renderReviews();
}


/* =========================================================
   RENDER REVIEWS
========================================================= */

function renderReviews() {

    const container =
        document.getElementById(
            "admin-reviews-list"
        );

    if (!container) {
        return;
    }


    if (!allReviews.length) {

        container.innerHTML =
            `<div class="status-message">
                No reviews have been submitted yet.
             </div>`;

        return;
    }


    container.innerHTML =
        allReviews.map(
            review => {

                const rating =
                    Math.max(
                        0,
                        Math.min(
                            5,
                            Number(
                                review.rating
                            ) || 0
                        )
                    );


                const stars =
                    "★".repeat(rating) +
                    "☆".repeat(5 - rating);


                const approved =
                    review.approved === true;


                const date =
                    review.created_at
                        ? new Date(
                            review.created_at
                        ).toLocaleDateString(
                            "en-UG"
                        )
                        : "";


                return `
                    <article
                        class="review-admin-item"
                    >

                        <div
                            class="review-admin-top"
                        >

                            <span
                                class="review-admin-name"
                            >
                                ${escapeHTML(
                                    review.name ||
                                    "Guest"
                                )}
                            </span>

                            <span
                                class="review-admin-rating"
                            >
                                ${stars}
                            </span>

                        </div>


                        <p
                            class="review-admin-text"
                        >
                            ${escapeHTML(
                                review.review || ""
                            )}
                        </p>


                        <span
                            class="review-status ${
                                approved
                                    ? "approved"
                                    : "pending"
                            }"
                        >
                            ${
                                approved
                                    ? "Approved"
                                    : "Pending"
                            }
                        </span>


                        ${
                            date
                                ? `<small>
                                    ${date}
                                   </small>`
                                : ""
                        }


                        <div
                            class="review-actions"
                        >

                            <button
                                class="${
                                    approved
                                        ? "hide-btn"
                                        : "approve-btn"
                                }"
                                type="button"
                                onclick="toggleReview('${escapeJS(review.id)}', ${approved})"
                            >
                                ${
                                    approved
                                        ? "Hide Review"
                                        : "Approve Review"
                                }
                            </button>


                            <button
                                class="delete-btn"
                                type="button"
                                onclick="deleteReview('${escapeJS(review.id)}')"
                            >
                                Delete
                            </button>

                        </div>

                    </article>
                `;

            }
        ).join("");
}


/* =========================================================
   TOGGLE REVIEW
========================================================= */

async function toggleReview(
    id,
    currentState
) {

    const {
        error
    } =
        await supabaseClient
            .from("reviews")
            .update({
                approved:
                    !currentState
            })
            .eq("id", id);


    if (error) {

        console.error(
            "Review update error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    await loadReviews();
}


/* =========================================================
   DELETE REVIEW
========================================================= */

async function deleteReview(id) {

    if (
        !confirm(
            "Delete this review permanently?"
        )
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("reviews")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Review delete error:",
            error
        );

        alert(
            error.message
        );

        return;
    }


    await loadReviews();
}


/* =========================================================
   STORAGE
========================================================= */

async function removeStorageFile(
    filePath
) {

    if (!filePath) {
        return;
    }


    let cleanPath =
        filePath;


    if (
        cleanPath.startsWith(
            STORAGE_PUBLIC_URL
        )
    ) {

        cleanPath =
            cleanPath.replace(
                `${STORAGE_PUBLIC_URL}/`,
                ""
            );
    }


    const {
        error
    } =
        await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .remove([
                cleanPath
            ]);


    if (error) {

        console.warn(
            "Storage deletion warning:",
            error
        );
    }
}


/* =========================================================
   STORAGE PUBLIC URL
========================================================= */

function getPublicStorageUrl(
    filePath
) {

    if (!filePath) {
        return "";
    }


    if (
        filePath.startsWith(
            "http://"
        ) ||
        filePath.startsWith(
            "https://"
        )
    ) {

        return filePath;
    }


    return `${STORAGE_PUBLIC_URL}/${filePath}`;
}


/* =========================================================
   SANITIZE FILENAME
========================================================= */

function sanitizeFilename(
    filename
) {

    return String(filename)
        .toLowerCase()
        .replace(
            /[^a-z0-9._-]/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ESCAPE JAVASCRIPT
========================================================= */

function escapeJS(value) {

    return String(value ?? "")
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );
}