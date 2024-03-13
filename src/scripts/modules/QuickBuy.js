// Import all dependencies here
import $ from 'jquery';
import OneSwatches from 'Modules/OneSwatches';

export default class QuickBuy {
    constructor( { $el } ) {
        console.log('init Quick Buy');

        this.$el = $el;
        this.$products = this.$el.find('.item');

        this.$productList = this.$products.filter( (items) => {
			return $(this).find('.quick-buy-container') && !$(this).hasClass('qb-initialized');
        })

        this.quickBuyInit();
    }

    quickBuyInit() {
        const self = this;
        this.$productList.each(function (item) {
			let $product = $(this);

			if ($product.find('.quick-buy-container').length && !$product.hasClass('qb-initialized') ) {
				const   $form = $product.find('form'),
				        pid = $product.data('id'),
				        pdata = $product.find('[data-product-json]').length ? JSON.parse($product.find('[data-product-json]').html()) : false;

				// Init product variant selection and swatches
				new Shopify.OptionSelectors('productSelect-' + pid, {
					product: pdata,
					onVariantSelected: ShopifyAPI.selectCallback,
					enableHistoryState: false
				});

                // Disable by now
				new OneSwatches({ 
                    $el: $product, 
                    preSelect: false, 
                    product: pdata, 
                    disableImageUpdate: true 
                });
				
				$product.addClass('qb-initialized');
			}

        });

        $('.quick-buy-trigger').on('click', function(e){
            e.stopPropagation();
            e.preventDefault();

            const $curr = $(e.currentTarget);
            const $item = $curr.parents('.item');
            
            self.$products.find('.quick-buy-container').removeClass('active');
            $item.find('.quick-buy-container').toggleClass('active');

        })

        $('.quick-buy-close').on('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            const $curr = $(e.currentTarget);
            const $item = $curr.parents('.item');
            $item.find('.quick-buy-container').removeClass('active');
        });


    }
}
