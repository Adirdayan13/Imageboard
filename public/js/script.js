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
                commentsofcomment: [],
                nextId: null,
                prevId: null
            };
        },
        mounted: function() {
            this.mounted();
            this.fetchCommentsOfComment();
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
                    console.log("we are in if");
                    this.closeModal();
                }
                this.mounted();
            }
        },
        methods: {
            mounted: function() {
                var vueInstance = this;
                if (isNaN(vueInstance.id)) {
                    console.log("we are in if");
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
                        this.fetchCommentsOfComment();
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
                        // console.log("vueInstance.nextId: ", vueInstance.nextId);
                        // console.log("vueInstance.prevId: ", vueInstance.prevId);
                    })
                    .catch(function(err) {
                        console.log("error in selectImage: ", err);
                    });
            },
            fetchCommentsOfComment: function() {
                var vueInstance = this;
                vueInstance.comments.forEach(comment => {
                    axios
                        .get("/getCommentsOfComment/" + comment.id)
                        .then(results => {
                            for (var i = 0; i < results.data.length; i++) {
                                vueInstance.commentsofcomment[comment.id] =
                                    results.data[i];
                                comment.comments = results.data[i];
                            }
                        })
                        .catch(err => {
                            console.log(
                                "error from getCommentsOfComment: ",
                                err
                            );
                        });
                });
            },
            getCommentsOfComment: function(id) {
                return this.commentsofcomment[id];
            },
            closeModal: function() {
                console.log("closeModal clicked worked");
                this.$emit("close", this.count);
            },
            addComment: function() {
                var vueInstance = this;
                console.log("comment !");
                console.log("id: ", this.id);
                axios
                    .post("/comment", {
                        id: this.id,
                        username: this.usernameComment,
                        comment: this.comment
                    })
                    .then(function(results) {
                        vueInstance.comments.push(results.data);
                        console.log("results from POST comment: ", results);
                    })
                    .catch(function(err) {
                        console.log("error from POST /comment: ", err);
                    });
            },
            addCommentOfComment: function(id, i) {
                // var vueInstance = this;
                axios
                    .post("/commentofcomment", {
                        comment_id: id,
                        username: document.querySelector(`.username${i}`).value,
                        comment: document.querySelector(`.comment${i}`).value
                    })
                    .then(function(results) {
                        console.log(
                            "results from addCommentOfComment: ",
                            results
                        );
                    })
                    .catch(function(err) {
                        console.log("error from addCommentOfComment: ", err);
                    });
            },
            deletePictureAndComments: function(e) {
                e.preventDefault();
                var vueInstance = this;
                console.log("we are in delete picture");
                axios
                    .get("/delete/" + this.id)
                    .then(function(res) {
                        console.log("res from delete :", res);
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
            heading: "Synthagram",
            latest: "Share your favourite synth picture",
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

            this.getSynths();
        },
        methods: {
            refresh: function() {
                this.getSynths();
            },
            getSynths: function() {
                var vueInstance = this;
                axios
                    .get("/images")
                    .then(function(res) {
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
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var vueInstance = this;
                axios
                    .post("/upload", formData)
                    .then(function(res) {
                        console.log("response from POST /upload: ", res);
                        vueInstance.images.unshift(res.data);
                    })
                    .catch(function(err) {
                        console.log("error in POST /upload: ", err);
                        vueInstance.toobig =
                            "File is too big max upload size is 2MB";
                    });
            },
            handleChange: function(e) {
                console.log("handleChange is running");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },
            closeMe: function(count) {
                this.selectedImage = null;
                location.hash = "";
                // history.replaceState(null, null, " ");
                console.log("i need to close the modal", count);
                console.log("this.selectedImage: ", this.selectedImage);
            },
            imageclick: function(id) {
                this.selectedImage = id;
                console.log("id: ", id);
                console.log("this.selectedImage: ", this.selectedImage);
            },
            showmore: function(e) {
                var vueInstance = this;
                console.log("this.lastId: ", this.lastId);
                e.preventDefault();
                axios
                    .get("/nextImages/" + this.lastId)
                    .then(function(results) {
                        console.log(
                            "lastId: ",
                            results.data[results.data.length - 1].id
                        );
                        vueInstance.lastId =
                            results.data[results.data.length - 1].id;
                        for (var j = 0; j < results.data.length; j++) {
                            vueInstance.images.push(results.data[j]);
                            if (
                                results.data[j].id == results.data[j].lowestId
                            ) {
                                document
                                    .getElementById("showmore")
                                    .classList.add("hidden");
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
