// import 'scrolltofixed';
import 'slick-carousel';

import $ from 'jquery';
import OneSwatches from 'Modules/OneSwatches';
import OneZoom from 'Modules/OneZoom';
import OneVideo from 'Modules/OneVideo';
import TabbedContent from 'Modules/TabbedContent';
import OneTabSystem from 'Modules/OneTabSystem';
import OneQuickShop from 'Modules/QuickShop';
// import OneQuickBuy from 'Modules/QuickBuy';

export default class ProductView {
    constructor({ $el }) {
        console.log('init product page');
        const selectors = {
            addToCart: '[data-add-to-cart]',
            addToCartText: '[data-add-to-cart-text]',
            comparePrice: '[data-compare-price]',
            comparePriceText: '[data-compare-text]',
            originalSelectorId: '[data-product-select]',
            priceWrapper: '[data-price-wrapper]',
            productFeaturedImage: '[data-product-featured-image]',
            productJson: '[data-product-json]',
            productPrice: '[data-product-price]',
            productThumbs: '[data-product-single-thumbnail]',
            singleOptionSelector: '[data-single-option-selector]',
        };

        this.$content = $el;
        this.$body = $('body');

        this.$media = this.$content.find('.product-media');
        this.$mainImage = this.$media.find('#ProductMediaImages');
        this.$thumbImage = this.$media.find('#ProductMediaThumbs');
        this.$mediaSlider = this.$mainImage.find('.images-wrapper');
        this.$thumbSlider = this.$thumbImage.find('.images-wrapper');

        this.$productCore = this.$content.find('.product-core');
        this.productJSON = this.$content.find(selectors.productJson).length
            ? JSON.parse(this.$content.find(selectors.productJson).html())
            : false;
        this.isGiftCard = this.$content.hasClass('gift-card');
        this.errorMsgSelector = '.variant-selection-error-msg';

        this.$productExtra = this.$content.find('.product-extra');

        // Features
        this.enableMiniCore = true;
        this.isScrollingLayout =
            this.$content.data('layout') == 'scrolling' ? true : false;
        this.isScrollingGrid = this.$content.hasClass('scrolling-grid');
        this.isSliderLayout =
            this.$content.data('layout') == 'slider' ? true : false;
        this.isQuickshopLayout =
            this.$content.data('layout') == 'quickshop' ? true : false;
        this.$videoThumb = this.$content.find(
            '.product-content-video .video-thumbnail'
        );

        if (!this.isGiftCard) {
            this.productMedia();
        }

        this.productCore();
        this.qtySelect();
        this.setupTabs();
        this.zoom();

        if (!this.isQuickshopLayout) {

        }

        if (!this.isGiftCard && !this.isQuickshopLayout) {
            this.sizeChart();
            // setTimeout(this.video.bind(this), 2000);
        }

        if (this.$content.find('.product-description-inner').height() > 270) {
            this.$content.find('.product-description').addClass('expandable');
            this.$content.find('.toggle-description').addClass('active');
        }

        if ($('.product-recommend').length){
            new OneQuickShop();
            //new OneQuickBuy({ $el: this.$body.find('.product-recommend') });

        };

        // Events
        $('.toggle-description').click((e) => {
            e.preventDefault();
            this.$content.find('.product-description').toggleClass('expand');
        });
        $('.toggle-images').click((e) => {
            e.preventDefault();
            this.$content.find('.product-media-images').toggleClass('expand');
        });

        $('.single-option .swatch-label').click((e) => {
            e.preventDefault();
        });

        $('.product-toggle').click((e) => {
            e.preventDefault();
            $(e.currentTarget).siblings().removeClass('active');
            $(e.currentTarget).toggleClass('active');
        });

        // On disabled a2c button click
        const self = this;
        $(document).on('click','.add-to-cart-btn',function (e) {
            const $el = $(this);
            if (!$el.hasClass('disabled')) return;

            e.preventDefault();

            // add loading state while stuff gets done
            $el.addClass('loading');

            // if (GlobalObj.utilities.isMobile()) {

                if($el.parents('#QuickShopDrawerModal').length > 0 ){
                    let sku = $el.parents('#QuickShopDrawerModal').find(
                        '.product-attribute-container'
                    );
                    let skuOffset =
                        sku.offset().top - $('.site-header').height() - 200;
    
                    $(document).find('#QuickShopDrawerModal .drawer-content').animate(
                        {
                            scrollTop: skuOffset,
                        },
                        400
                    );
                }else{
                    const sku = self.$productCore.find(
                        '.product-attribute-container'
                    );
                    const skuOffset =
                        sku.offset().top - $('.site-header').height() - 200;
    
                    $('html, body').animate(
                        {
                            scrollTop: skuOffset,
                        },
                        400
                    );
                }
                
            // }

            if (
                !self.$productCore
                    .find('.product-attribute-container')
                    .hasClass('single-variant')
            ) {
                e.preventDefault();
                const activeClass = 'active';

                let $errorMsg = self.$content.find(self.errorMsgSelector);

                // Show error message
                $errorMsg.addClass(activeClass);
                $el.removeClass('loading');

                // Wait ${timeTilRemove} before hiding the message again
                const timeTilRemove = 3000;
                setTimeout(() => {
                    $errorMsg.removeClass(activeClass);
                }, timeTilRemove);

                $(e.currentTarget).blur();
            }
        });
        
    }

    swatches() {
        // Init Shopify option selector
        // Option init and Swatch init needed to be separated
        let productSignleSelectorId = this.isQuickshopLayout
            ? 'productSelect-QS'
            : 'productSelect';

        let $addToCartBtn = this.$content.find('#AddToCart');
        let $errorMsg = this.$content.find('.variant-selection-error-msg');

        this.$content.find('.select-dropdown > li').click((e) => {
            const variantStatus = $(e.currentTarget).data('available');
            const selectedVal = $(e.currentTarget)
                .data('name')
                .replace('-Sold Out');

            this.$content
                .find(`.swatches [data-select="${selectedVal}"]`)
                .trigger('click');

            if (variantStatus) {
                $addToCartBtn.removeAttr('disabled');
                $('.membership-add').removeClass('disabled');
            } else {
                $addToCartBtn.attr('disabled', 'disabled');
                $('.membership-add').addClass('disabled');
            }
        });

        // Init product variant selection and swatches
        new Shopify.OptionSelectors(productSignleSelectorId, {
            product: this.productJSON,
            onVariantSelected: ShopifyAPI.selectCallback,
            enableHistoryState: this.isQuickshopLayout ? false : true,
        });

        new OneSwatches({
            $el: this.$content,
            preSelect: false,
            product: this.productJSON,
            disableImageUpdate: false,
        });

        const variantLabels = this.$content.find(
            '.selector-wrapper:not(.single-option) .swatch-label'
        );

        if (variantLabels.length) {
            let text = [];

            for (const label of variantLabels) {
                const $label = $(label);
                console.log('LABEL: ', $label);
                text.push($label.text());
            }

            text = text.join('/');

            $errorMsg.find('.variant-type').text(text);
            $addToCartBtn.attr('data-variant-title', text);
        }

        // If more than 2 colors, preselect the first one
        if ($('.swatches.colors button').length > 1) {
            $('.swatches.colors button:first-child').trigger('click');
        }

        // Hide error message if still present, when clicking on a valid option
        $('.swatches .swatch:not(.disabled)').click(() => {
            $(`${this.errorMsgSelector}.active`).removeClass('active');
        });
    }

    ajaxCart() {
        $('.add-to-cart-form').off('submit');

        ajaxCart.init({
            formSelector: '.add-to-cart-form',
            addToCartSelector: '.add-to-cart-btn',
            cartContainer: '.minicart-container',
            cartCountSelector: '.minicart-count',
            cartCostSelector: '.minicart-cost',
            moneyFormat: window.theme.moneyFormat,
        });
    }

    productMedia() {
        const self = this;
        console.log('productMedia');

        $('body').trigger('lazyloadShouldUpdate');

        if (this.$media.hasClass('slider')) {

            $('.image-thumbnail').click((e) => {
                e.preventDefault();
                const $curr = $(e.currentTarget);
                let index = $curr.data('index') - 1;
                console.log('INDEX: ', index, $curr);
    
                const zoomImg = $curr.data('index');
    
                if (
                    this.$media.hasClass('initialized') 
                ) {
                    // Search index
                    index = this.$media
                        .find(`[data-index="${zoomImg}"]`)
                        .parents('.slick-slide')
                        .index();
    
                    // console.log('slick go to', index);
                    $curr.siblings('.active').removeClass('active');
                    $curr.addClass('active');
                    this.$mediaSlider.slick('slickGoTo', index);
                }
            });
    
            $('.image-thumbnail').on('variantImageChange', function(e) {
                console.log('variantImageChange');
                e.preventDefault();
                const $curr = $(e.currentTarget);
                const index = $curr.data('index') - 1;
                console.log('INDEX: ', index, $curr);
            });

            this.$mediaSlider.on('init', () => {
                console.log('Slider initialized');
                this.$media.addClass('initialized');
                $(window).resize();

                if(self.isQuickshopLayout){
                    setTimeout(()=>{
                        this.$mediaSlider.slick('refresh');
                    },500)
                }
            });

            this.$mediaSlider
                .slick({
                    dots: true,
                    infinite: true,
                    centerMode: true,
                    speed: 600,
                    slidesToShow: 1,
                    arrows: true,
                    fade: true,
                    adaptiveHeight: true,
                })
                .on('afterChange', (_, __, currentSlide) => {
                    console.log('currentSlide', currentSlide);

                    let currentImageKey = this.$mediaSlider
                        .find('.slick-slide.slick-active')
                        .find('.image-slide')
                        .attr('data-index');

                    console.log('currentImageKey', currentImageKey);

                    this.$thumbSlider
                        .children('.image-thumbnail')
                        .removeClass('active');

                    this.$thumbSlider
                        .children(
                            `.image-thumbnail[data-index="${currentImageKey}"]`
                        )
                        .addClass('active');
                });
            
            if (!GlobalObj.utilities.isMobile() && this.$thumbSlider.find('.image-thumbnail').length > 5) {
                this.$thumbSlider.slick({
                    dots: false,
                    infinite: false,
                    speed: 600,
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    arrows: true,
                    vertical: true,
                    rows: 0,
                    asNavFor: '.product-media-images .images-wrapper',
                    responsive: [
                        {
                            breakpoint: 1280,
                            settings: {
                                slidesToShow: 5
                            },
                        }
                    ]
                });
            }
        }

    }

    productCore() {
        this.swatches();
        this.ajaxCart();

        if (!this.isQuickshopLayout) {
            if (this.isScrollingLayout && this.isScrollingGrid) {
                // this.productCoreScrollFixing();
            }

            let lastScrollPosition = 0;
            const addToCartButton = $('.prod-core-form__footer');
            const productCoreOffset = $('.scrolling-fix-stopper').offset().top;
            const addToCartTopOffset = addToCartButton.offset().top;
            const addToCartHeight = addToCartButton.height();
            const productCoreBaseHeight = $('.block-core').height();

            $(document).on('scroll', async function () {// Escape if not on mobile
                // if (!GlobalObj.utilities.isMobile) return;

                const scrollTop = $(this).scrollTop();

                const offset = scrollTop - lastScrollPosition; // Difference between last  scroll even and current event
                let scrollDirection;

                if( lastScrollPosition > ( productCoreOffset ) ){
                    // addToCartButton.addClass('is-fixed');
                    $('.block-core').height(productCoreBaseHeight)
                    $('.product-core').addClass('addtocart-fixed')
                }else{
                    // addToCartButton.removeClass('is-fixed');
                    $('.block-core').removeAttr('style');
                    $('.product-core').removeClass('addtocart-fixed')
                }

                lastScrollPosition = scrollTop;

            });
        }
    }

    productCoreScrollFixing() {
        const $scrollFixingCore = this.$productCore;
        let headerHeight = 120;

        // Not available on Mobile.
        GlobalObj.utilities.mediaCheck(
            function () {
                $scrollFixingCore.scrollToFixed({
                    zIndex: 2,
                    removeOffsets: true,
                    dontSetWidth: true,
                    marginTop: function () {
                        return headerHeight;
                    },
                    limit: function () {
                        var limit =
                            $('.scrolling-fix-stopper').offset().top -
                            $(this).height();
                        return limit;
                    },
                    fixed: function(){
                        $(this).removeClass('unFixed');
                        $(this).addClass('isFixed');
                    },
                    unfixed: function(){
                        $(this).removeClass('isFixed');
                        $(this).addClass('unFixed');
                    }
                });
            },
            function () {
                $scrollFixingCore.trigger('detach.ScrollToFixed');
            }
        );
    }

    productCoreMini() {
        const $miniCore = this.$productCore.find('.block-core');

        // Under scrolling layout, miniCore will only available on Small screen.
        const init = ($el) => {
            $el.scrollToFixed({
                zIndex: 2,
                removeOffsets: true,
                dontSetWidth: true,
                triggerAtBottom: true,
                marginTop: function () {
                    return $(this).height() * -1;
                },
                fixed: function () {
                    $(this).addClass('fixed-core fadeInUp animated');
                },
                unfixed: function () {
                    $(this).removeClass('fixed-core fadeInUp animated');
                },
            });
        };
        GlobalObj.utilities.mediaCheck(
            function () {
                $miniCore.trigger('detach.ScrollToFixed');

                if (!this.isScrollingLayout || this.isScrollingGrid) {
                    // console.log('init minicore');
                    init($miniCore);
                }
            },
            function () {
                $miniCore.trigger('detach.ScrollToFixed');
                init($miniCore);
            }
        );
    }

    qtySelect() {
        const $qtyButton = this.$productCore.find('.qty-btn');
        const offset = { 'qty-up': 1, 'qty-down': -1 };

        $qtyButton.click(function () {
            const $input = $(this).siblings('input[type="number"]');
            const currentVal = $input.val();
            const buttonOffset = offset[$(this).data('offset')];

            const sum = parseInt(currentVal) + buttonOffset;
            $input.val(sum > 1 ? sum : 1);
        });

        this.$productCore.find('input[type="number"]').change(function () {
            if (parseInt($(this).val()) < 1) {
                $(this).val(1);
            }
        });
    }

    zoom() {
        new OneZoom({
            el: this.$media,
            mainImage: this.$mainImage,
            thumbImage: this.$thumbImage,
        });
    }

    video() {
        const $videos = this.$content.find('.video-box');
        const videoParams = {
            $el: $videos,
            isResponsive: false,
            bgVideo: true,
            autoplay: true,
        };

        new OneVideo(videoParams);
        if (this.$videoThumb.length) {
            this.$videoThumb.click(function () {
                $(this).hide();
                $(this)
                    .parents('.product-content-video')
                    .find('.video-ctl')
                    .trigger('click');
                $(this)
                    .parents('.product-content-video')
                    .find('.content-wrapper')
                    .hide();
            });
        }
    }

    async sizeChart() {
        const { default: OneDrawer } = await import('Modules/OneDrawer');

        const sizeChartHtml = $('#SizeChartModal')[0].outerHTML;
        // $('#SizeChartModal').remove();

        new OneDrawer({
            drawerElem: '#SizeChartModal',
            // drawerContent: sizeChartHtml,
            // drawerModalId: 'SizeChartDrawerModal',
            triggerEvent: 'click',
            triggerElem: '.size-chart-trigger',
            initCallback: function(){
                new TabbedContent({ $el: $('#SizeChartModal') });
            }
            // openCallback: function(){},
            // closeCallback: function(){},
            // events: {}
        });

        new OneDrawer({
            drawerElem: '#BottomsChartModal',
            // drawerContent: sizeChartHtml,
            // drawerModalId: 'SizeChartDrawerModal',
            triggerEvent: 'click',
            triggerElem: '.bottoms-chart-trigger',
            initCallback: function(){
                new TabbedContent({ $el: $('#BottomsChartModal') });
            }
            // openCallback: function(){},
            // closeCallback: function(){},
            // events: {}
        });

        $('.chart-slider').slick({
                    dots: true,
                    infinite: true,
                    centerMode: true,
                    speed: 600,
                    slidesToShow: 1,
                    arrows: true,
                    fade: true,
                    adaptiveHeight: true,
        })
    }

    setupTabs() {
        new TabbedContent({ $el: this.$content.find('.block-meta') });
        new TabbedContent({ $el: this.$content.find('.recommended-tabs') });
        new OneTabSystem({ $el: this.$content });
    }
}
