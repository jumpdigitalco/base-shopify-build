import $ from 'jquery';

export default class ViewHome {
    constructor({ $el }) {
        console.log('init home');

        this.$el = $el;
        this.$content = this.$el;
        this.$body = $('body');
        this.$moduleImageModule = this.$content.find('.module-hero');

        // this.init();
    }

    async init() {
        if (this.$moduleImageModule.length > 0) {
            const { default: HpImageModule } = await import(
                'Modules/HpImageModule'
            );
            new HpImageModule(this.$moduleImageModule);
        }

        if( this.$body.find('.collection-products .item').length > 0 ){
            //this.quickShopInit();
            //this.quickBuyInit();
        }

    }

    async quickShopInit() {
        const { default: QuickShop } = await import('Modules/QuickShop');
        new QuickShop();
    }

    async quickBuyInit() {
        const { default: QuickBuy } = await import('Modules/QuickBuy');
        new QuickBuy( { $el: this.$body.find('.collection-products') } );
    }
}
