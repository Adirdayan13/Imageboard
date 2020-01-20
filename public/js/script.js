(function() {
    new Vue({
        el: "#main",
        data: {
            heading: "Welcome!",
            greetee: "Kitty",
            className: "pretty",
            url: "https://spiced.academy",
            candy: null
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
                    console.log(res.data);
                    vueInstance.candy = res.data;
                })
                .catch(function(err) {
                    console.log("error in axios get :", err);
                });
        },
        updated: function() {
            console.log("updated", this.greetee);
        },
        methods: {
            sayHello: function() {
                console.log("Hello, " + this.greetee);
            },
            changeName: function(name) {
                for (var i = 0; i < this.candy.length; i++) {
                    if (this.candy[i].name == name) {
                        this.candy[i].name = "baci";
                    }
                }
                this.sayHello();
            }
        }
    });
})();
