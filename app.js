Vue.component('product-details', {
    props: ['id', 'title', 'description', 'features', 'price', 'stock'],
    template: '#product-details-template',
    computed: {
        stockColor() {
            let available = {
                color: 'green'
            }
            let notAvailable = {
                color: 'red'
            }
            return this.stock ? available : notAvailable;
        }
    },
    methods: {
        addNewItem() {
            this.$emit('add-to-cart', [this.id, this.title]);
        }
    }
})

Vue.component('product-image', {
    props: ['images'],
    template: '#product-image-template',
    data() {
        return {
            preview: '',
        }
    },
    created() {
        this.preview = this.images[0].url;
    }
})

const app = new Vue({
    el: '#app',
    data: {
        loading: true,
        id: '',
        title: '',
        description: '',
        features: '',
        price: 0,
        inStock: true,
        images: []
    },
    methods: {
        addToCart(productDetails) {
            alert(`El producto ${productDetails[1]} con ID ${productDetails[0]} ha sido añadido al carrito`);
        }
    },
    created() {
        fetch('product.json')
            .then(response => response.json())
            .then(product => {
                this.id = product.id;
                this.title = product.title;
                this.description = product.description;
                this.features = product.features;
                this.price = product.price;
                this.inStock = product.inStock;
                this.images = product.images;
                this.loading = false;
            })
    }
})