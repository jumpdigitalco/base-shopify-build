import $ from 'jquery';
import 'Lib/jquery.viewport';
import ViewCollectionNav from 'Views/CollectionNav';
import GlobalView from './Global';

export default class Collection {
    constructor({ $el }) {

        const $productCollection = $('.product-collection');
        const $productCollectionNav = $('.collection-nav');

        if ($productCollectionNav.length)
            new ViewCollectionNav({ $el: $productCollection });

        if ($productCollection.length && $productCollection.data('quickshop')) {
            // Enable quickview functionality
            window.onload = () => {
                this.quickShopInit();
            }
        }

        if ( $productCollection.length && $productCollection.data('quickbuy') ) {
            //this.quickBuyInit();
        }

        this.collection, this.rebuilt, this.quickbuy = false;

        this.$el = $el;
        this.$productCollection = $('.product-collection');
        this.$pager = this.$el.find('.collection-pagination');
        this.$productGrid = this.$el.find('.collection-products');
        this.$products = this.$productGrid.find('.item');

        this.infinityScroll();
        this.rebuildListing();
        this.validatePassKey();
        
        if (this.$el.find('.collection-intro.bottom .collection-desc').height() > 240) {
            this.$el.find('.collection-intro.bottom').addClass('expandable');
            this.$el.find('.toggle-description').addClass('active');
        }
        $('.toggle-description').click((e) => {
            e.preventDefault();
            this.$el.find('.collection-intro.bottom').toggleClass('expand');
        });

        // $('.clear-filters').click(function (e) {
        //     e.preventDefault();
        //     window.location.href = $('#product-collection').data('url');
        // });

        const self = this;
    }

    rebuildListing(){
        
        if (this.rebuilt) {
            console.log('rebuilt listing page');
        } else {
            console.log('init listing page');
        }    
    
        this.collection && this.collection.destroy();

        if ( this.$productCollection.length ) {
            // this.collection = new Collection({el: $('#MainContent') });
            $('body').trigger('lazyloadShouldUpdate');
        }
        
        this.quickbuy && this.quickbuy.destroy();
        if ( this.$productCollection.length && this.$productCollection.data('quickbuy') ) {
            this.quickBuyInit();
            if (typeof ReloadSmartWishlist !== "undefined" && $.isFunction(ReloadSmartWishlist)) ReloadSmartWishlist();
            GlobalObj.GlobalView.removeHoverProductsOnMobile();
        }
    
        if (!this.rebuilt) this.rebuilt = true;

    }

    async quickBuyInit() {
        console.log('quickBuyInit')
        const { default: QuickBuy } = await import('Modules/QuickBuy');
        new QuickBuy( { $el: $(document).find('.product-collection') } );
    }

    async quickShopInit() {
        const { default: QuickShop } = await import('Modules/QuickShop');
        new QuickShop();
    }

    infinityScroll() {
        const self = this;

        $('.item a:not(.quick-shop-trigger)').click(function (e) {
            e.preventDefault();

            const $curr = $(e.currentTarget);
            const $item = $curr.parents('.item');
            const pageIndex = $item.data('page');

            if (pageIndex) {
                const currentUrl = GlobalObj.utilities.getUrlParam(
                    window.location.href,
                    'page',
                    pageIndex
                );
                window.history.pushState(null, null, currentUrl);
            }
            window.location.href = $curr.prop('href');
        });
        // Passing param to determin whether loading next page or prev

        const loadMore = function (prev) {

            const addPage = (d) => {
                const $content = $(d).find('.product-collection');
                const $pager = $content.find('.collection-pagination');
                const $newItems = $content.find('.collection-products .item');
                self.full_url = location.pathname + location.search;
                self.url = location.pathname + location.search;
                const loadingPageNum = GlobalObj.utilities.getUrlParam(
                    self.url,
                    'page'
                );
                const afterAppend = function (index, item) {
                    $(item).data('page', loadingPageNum);

                    if (index === $newItems.length - 1) {
                        // Perform re-init of product grid if needed
                        self.rebuildListing();

                        // Need to re-init ajax cart
                        $('.add-to-cart-form').off('submit');

                        ajaxCart.init({
                            formSelector: '.add-to-cart-form',
                            addToCartSelector: '.add-to-cart-btn',
                            cartContainer: '.minicart-container',
                            cartCountSelector: '.minicart-count',
                            cartCostSelector: '.minicart-cost',
                            moneyFormat: theme.moneyFormat,
                        });

                        GlobalObj.isLoading = false;

                        if (prev) {
                            loadMore(true); // Recursive!!
                        } else {
                            return false;
                        }
                    }
                };

                console.log('new page', self.url);
                GlobalObj.pagerStack.push(self.url);

                if (!GlobalObj.isFinished) {
                    self.$pager = $pager;
                    $newItems.prependTo(self.$productGrid).each(afterAppend);
                } else {
                    self.$pager.replaceWith($pager);
                    self.$pager = $pager;
                    $newItems.appendTo(self.$productGrid).each(afterAppend);
                    window.history.pushState(null, null, self.url);
                }
            };

            // Start of Load More
            if (!GlobalObj.isLoading) {
                const status = prev ? 'prev' : 'next';

                console.log('GlobalObj.isFinished', GlobalObj.isFinished)

                if (GlobalObj.isFinished) {
                    // Load next page
                    self.url = $(document).find('.collection-pagination .next a').length
                        ? $(document).find('.collection-pagination .next a').attr('href')
                        : '';
                } else {
                    // Load prev page
                    self.url = $(document).find('.collection-pagination .prev a').length
                        ? $(document).find('.collection-pagination .prev a').attr('href')
                        : '';
                }
                
                console.log('GlobalObj.pagerStack',GlobalObj.pagerStack);
                console.log('self.url',self.url);

                if (!GlobalObj.pagerStack.includes(self.url) && self.url) {
                    console.log('load ', status);
                    GlobalObj.isLoading = true;
                    $.get(self.url).done(addPage);
                } else {
                    if (prev) {
                        GlobalObj.isFinished = true;
                        console.log('load prev finished');
                    } else {
                        $('#loadmore').addClass('disabled');
                        return false;
                    }
                }
            }
        };

        // Load Prev Page Trigger
        loadMore(true);

        // Load Next Page Triggers
        if ($('#loadmore:in-viewport').length) {
            loadMore();
        }
        $(window).on('scroll.listview', function () {
            if ($('#loadmore:in-viewport').length) {
                loadMore();
            }
        });
    }

    validatePassKey() {
        const self = this;

        this.$passKeyForm = this.$el.find('.collection-requires-pass');
        if(this.$passKeyForm.length > 0){
            const collectionPassKey = GlobalObj.collection_passKey;
            const collectionPasskeyVar = 'collection-passkey-' + this.$passKeyForm.data('collection');
            const validatePasskey = sessionStorage.getItem(collectionPasskeyVar);
            
            if( validatePasskey == 'true' ){
                this.$passKeyForm.removeClass('loading not-authorized');
            }else{
                this.$passKeyForm.removeClass('loading');
            }

            this.$passKeyForm.find('.module-cta').on('click', function(e){
                const formValue = self.$passKeyForm.find('#collection-passkey');
                formValue.parent().removeClass('input-error');
                console.log('formValue', formValue.val());
                if(formValue.val() == collectionPassKey){
                    self.$passKeyForm.removeClass('not-authorized');
                    sessionStorage.setItem(collectionPasskeyVar, true);
                }else{
                    formValue.parent().addClass('input-error');
                }
            });

        }

    }
}
