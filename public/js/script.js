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
                comments: []
            };
        },
        mounted: function() {
            this.mounted();
        },
        watch: {
            id: function() {
                console.log("we are in watch !");
                console.log("this.id: ", this.id);
                if (isNaN(this.id)) {
                    console.log("we are in if");
                    this.closeModal();
                }
                this.mounted();

                // another problem we need to deal with is if the user try to go
                // to an image that dosent exist
                // we want to look at the response from the server, if the response
                // is certain think close the model
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
                        console.log("results from selectedImage: ", res.data);
                        vueInstance.username = res.data.username;
                        vueInstance.title = res.data.title;
                        vueInstance.description = res.data.description;
                        vueInstance.url = res.data.url;
                        console.log("res.data from mounted: ", res.data);
                        if (res.data == "") {
                            vueInstance.closeModal();
                        }
                    })
                    .catch(function(err) {
                        console.log("error in axios get image: ", err);
                    });

                axios
                    .get("/comment/" + this.id)
                    .then(function(results) {
                        console.log(
                            "resultsssss from axios GET comment: ",
                            results.data
                        );
                        vueInstance.comments = results.data;
                        // for (var i = 0; i < results.data.length; i++) {
                        //     vueInstance.comments.push(results.data[i]);
                        // }
                    })
                    .catch(function(err) {
                        console.log("error from GET comment: ", err);
                    });
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
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            selectedImage: location.hash.slice(1),
            heading: "Image Board",
            latest: "Share your favourite picture",
            images: null,
            title: "",
            description: "",
            username: "",
            file: null,
            lastId: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this;
            addEventListener("hashchange", function() {
                vueInstance.selectedImage = location.hash.slice(1);
                console.log(
                    "selectedimage from mounted: ",
                    vueInstance.selectedImage
                );
            });
            axios
                .get("/images")
                .then(function(res) {
                    vueInstance.images = res.data;
                    vueInstance.lastId = res.data[res.data.length - 1].id;
                    console.log("lastId: ", vueInstance.lastId);
                    // if (vueInstance.selectedimage == undefined) {
                    //     console.log("we are in if GET /images");
                    //     this.closeModal();
                    // }
                })
                .catch(function(err) {
                    console.log("error in axios get images: ", err);
                });
        },
        methods: {
            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);
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
