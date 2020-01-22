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
            console.log("component mounted: ");
            console.log("my postTitle: ", this.postTitle);
            console.log("id: ", this.id);
            var imageThis = this;

            axios
                .get("/selectedimage/" + this.id)
                .then(function(res) {
                    imageThis.username = res.data.username;
                    imageThis.title = res.data.title;
                    imageThis.description = res.data.description;
                    imageThis.url = res.data.url;
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
                    console.log("this.comments: ", imageThis.comments);
                    for (var i = 0; i < results.data.length; i++) {
                        imageThis.comments.push(results.data[i]);
                    }
                })
                .catch(function(err) {
                    console.log("error from GET comment: ", err);
                });
        },
        methods: {
            closeModal: function() {
                console.log("closeModal clicked worked");
                this.$emit("close", this.count);
            },
            addComment: function() {
                console.log("comment !");
                console.log("id: ", this.id);
                axios
                    .post("/comment", {
                        id: this.id,
                        username: this.usernameComment,
                        comment: this.comment
                    })
                    .then(function(results) {
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
            selectedFruit: null,
            selectedImage: null,
            heading: "Image Board",
            latest: "Upload picture and see it appear on screen",
            images: null,
            title: "",
            description: "",
            username: "",
            file: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this;
            axios
                .get("/images")
                .then(function(res) {
                    vueInstance.images = res.data;
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
                var image = this;
                axios
                    .post("/upload", formData)
                    .then(function(res) {
                        console.log("response from POST /upload: ", res);
                        image.images.unshift(res.data);
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
                console.log("i need to close the modal", count);
                console.log("this.selectedImage: ", this.selectedImage);
            },
            imageclick: function(id) {
                this.selectedImage = id;
                console.log("id: ", id);
                console.log("this.selectedImage: ", this.selectedImage);
            }
        }
    });
})();
