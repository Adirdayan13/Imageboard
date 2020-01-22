(function() {
    new Vue({
        el: "#main",
        data: {
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
            }
        }
    });
})();
