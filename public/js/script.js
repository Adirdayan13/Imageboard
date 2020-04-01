(function() {
    Vue.component("first-component", {
        template: "#template",
        props: ["postTitle", "id"],
        data: function() {
            return {
                username: null,
                title: null,
                description: null,
                url: null,
                comment: null,
                usernameComment: null,
                comments: [],
                nextId: null,
                prevId: null
            };
        },
        mounted: function() {
            this.mounted();
            this.selectImage();

            var vueInstance = this;
            addEventListener("keydown", function(e) {
                if (e.keyCode == 27) {
                    vueInstance.closeModal();
                }
                if (e.keyCode == 37) {
                    vueInstance.nextImage(vueInstance);
                }
                if (e.keyCode == 39) {
                    vueInstance.previousImage(vueInstance);
                }
            });
        },
        watch: {
            id: function() {
                if (isNaN(this.id)) {
                    this.closeModal();
                }
                this.mounted();
            }
        },
        methods: {
            mounted: function() {
                var vueInstance = this;
                if (isNaN(vueInstance.id)) {
                    vueInstance.closeModal();
                }
                axios
                    .get("/selectedimage/" + this.id)
                    .then(function(res) {
                        vueInstance.username = res.data.username;
                        vueInstance.title = res.data.title;
                        vueInstance.description = res.data.description;
                        vueInstance.url = res.data.url;
                        if (res.data == "") {
                            vueInstance.closeModal();
                        }
                    })
                    .catch(function(err) {
                        console.log("error in axios get image: ", err);
                    });

                axios
                    .get("/comment/" + this.id)
                    .then(results => {
                        vueInstance.comments = results.data;
                    })
                    .catch(function(err) {
                        console.log("error from GET comment: ", err);
                    });
                this.selectImage();
            },
            nextImage: function(next) {
                if (next.nextId != null) {
                    next.imageId = next.nextId;
                    location.hash = "#" + next.imageId;
                }
            },
            previousImage: function(prev) {
                if (prev.prevId != null) {
                    prev.imageId = prev.prevId;
                    location.hash = "#" + prev.imageId;
                }
            },
            selectImage: function() {
                var vueInstance = this;
                axios
                    .get("/selectImage/" + vueInstance.id)
                    .then(function(results) {
                        vueInstance.nextId = results.data[0].nextID;
                        vueInstance.prevId = results.data[0].previousID;
                    })
                    .catch(function(err) {
                        console.log("error in selectImage: ", err);
                    });
            },
            closeModal: function() {
                this.$emit("close", this.count);
            },
            addComment: function() {
                var vueInstance = this;
                axios
                    .post("/comment", {
                        id: this.id,
                        username: this.usernameComment,
                        comment: this.comment
                    })
                    .then(function(results) {
                        vueInstance.comments.push(results.data);
                    })
                    .catch(function(err) {
                        console.log("error from POST /comment: ", err);
                    });
            },
            deletePictureAndComments: function(e) {
                e.preventDefault();
                var vueInstance = this;
                axios
                    .get("/delete/" + this.id)
                    .then(function() {
                        vueInstance.$emit("renderagain", vueInstance.id);
                        vueInstance.closeModal();
                    })
                    .catch(function(err) {
                        console.log("error in delete: ", err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            selectedImage: location.hash.slice(1),
            heading: "Imageboard",
            latest: "Share your favourite pictures",
            toobig: null,
            images: null,
            title: "",
            description: "",
            username: "",
            file: null,
            lastId: null,
            comment2: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this;
            addEventListener("hashchange", function() {
                vueInstance.selectedImage = location.hash.slice(1);
            });

            this.getPictures();
        },
        methods: {
            refresh: function() {
                this.getPictures();
            },
            getPictures: function() {
                var vueInstance = this;
                axios
                    .get("/images")
                    .then(function(res) {
                        if (res.data.length >= 10) {
                            document
                                .getElementById("showmore")
                                .classList.remove("displaynone");
                        }
                        vueInstance.images = res.data;
                        vueInstance.lastId = res.data[res.data.length - 1].id;
                    })
                    .catch(function(err) {
                        console.log("error in axios get images: ", err);
                    });
            },
            handleClick: function(e) {
                e.preventDefault();
                // we need to use FormData to send file to the server
                const fileAndInput = document.querySelector(".file-and-submit");
                const loading = document.querySelector(".loading");
                const tooBig = document.querySelector(".too-big");
                tooBig.classList.add("displaynone");
                fileAndInput.classList.add("displaynone");
                loading.classList.remove("displaynone");
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var vueInstance = this;
                axios
                    .post("/upload", formData)
                    .then(function(res) {
                        document.querySelector(".file").value = "";
                        vueInstance.images.unshift(res.data);
                        fileAndInput.classList.remove("displaynone");
                        loading.classList.add("displaynone");
                    })
                    .catch(function(err) {
                        console.log("error in POST /upload: ", err);
                        vueInstance.toobig =
                            "File is too big max upload size is 5MB";
                        fileAndInput.classList.remove("displaynone");
                        tooBig.classList.remove("displaynone");
                        loading.classList.add("displaynone");
                    });
            },
            handleChange: function(e) {
                this.file = e.target.files[0];
            },
            closeMe: function() {
                this.selectedImage = null;
                location.hash = "";
                // history.replaceState(null, null, " ");
            },
            imageclick: function(id) {
                this.selectedImage = id;
            },
            showmore: function(e) {
                var vueInstance = this;
                e.preventDefault();
                axios
                    .get("/nextImages/" + this.lastId)
                    .then(function(results) {
                        vueInstance.lastId =
                            results.data[results.data.length - 1].id;
                        for (var j = 0; j < results.data.length; j++) {
                            vueInstance.images.push(results.data[j]);
                            if (
                                results.data[j].id == results.data[j].lowestId
                            ) {
                                document
                                    .getElementById("showmore")
                                    .classList.add("displaynone");
                            }
                        }
                    })
                    .catch(function(err) {
                        console.log("error in GET showmore: ", err);
                    });
            }
        }
    });
})();
