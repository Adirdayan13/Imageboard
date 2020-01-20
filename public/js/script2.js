(function() {
    new Vue({
        el: "#main",
        data: {
            heading: "I <3 pixels",
            latest: "Latest images",
            images: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this;
            axios
                .get("/candy")
                .then(function(res) {
                    vueInstance.images = res.data;
                })
                .catch(function(err) {
                    console.log("error in axios get candy: ", err);
                });
        }
    });
})();
