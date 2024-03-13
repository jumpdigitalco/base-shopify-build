import $ from 'jquery';
import OneVideo from 'Modules/OneVideo';
import TabbedContent from 'Modules/TabbedContent';
import OneTabSystem from 'Modules/OneTabSystem';

export default class StaticPage {
    constructor() {
        this.$body = $('body');
        this.$content = $('.landing-page');
        this.$modalContent = $('.modal-content');

        console.log('landing-page');

        if ($('.landing-page').length > 0) {
            this.initVideos();
            this.initTabSystem();
            // this.initTabbedContent();
            this.sliderwithButtons();
            this.imageSlider();
            this.imageTiles();
            this.imageCarousel();
            this.collectionHighlightCarousel();
            
            if(this.$content.find('.module-mix-and-match .mix-and-match-collection').length > 0){
                this.mixAndMatchInit();
            }
            if(this.$body.find('.quick-shop-trigger').length > 0){
                this.quickShopInit();
            }
        }

        if (this.$body.find('.main-store-locator').length > 0) {
            this.storeLocatorImport();
        }

    }

    async storeLocatorImport(){
        const { default: storeLocator } = await import('Modules/StoreLocator');
        new storeLocator( '.map-container', '.location-options-container' );
    }

    async quickShopInit() {
        console.log('Landing page quickShopInit');
        const { default: QuickShop } = await import('Modules/QuickShop');
        new QuickShop();
    }

    async mixAndMatchInit() {
        console.log('mixAndMatchInit');
        const { default: OneSwatches } = await import('Modules/OneSwatches');

        const $mixAndMatchCollection = this.$content.find('.mix-and-match-collection');
        const $productList = this.$content.find('.product-options-selector');

        // 1. Build the synced sliders
        $mixAndMatchCollection.each(function () {
            const $slider = $(this);
            const $optionsSlider = $slider.next('.mix-and-match-product-selection-info');

            console.log( `[data-info-carousel="${$slider.data('product-carousel')}"]` );

            $slider.slick({
                dots: false,
                infinite: true,
                centerMode: true,
                centerPadding: '0px',
                speed: 600,
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                focusOnSelect: true,
                asNavFor: `[data-info-carousel="${$slider.data('product-carousel')}"]`,
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                        }
                    }
                ]
            })
            .on('afterChange', (_, __, currentSlide) => {
                console.log('currentSlide', currentSlide);
            });

            $optionsSlider.slick({
                dots: false,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                fade: true,
                // asNavFor: `.${$slider.attr('class')}`
            });

        });

        $('.options-selector-toggle').click(() => {
            $(this).parents('.mix-and-match-collection-wrapper').first().find('.mix-and-match-product-selection-info').toggleClass('active');
        });

        // 2. Enable the swatches
        console.log('$productList', $productList);

        $productList.each(function ( item ) {

			const $product = $(this);
			const   $form = $product.find('form'),
			        pid = $product.data('id'),
			        pdata = $product.find('[data-product-json]').length ? JSON.parse($product.find('[data-product-json]').html()) : false;
                    
			// Init product variant selection and swatches
			new Shopify.OptionSelectors('productSelect-' + pid, {
				product: pdata,
				onVariantSelected: ShopifyAPI.selectCallback,
				enableHistoryState: false
			});
			new OneSwatches({
                $el: $product, 
                preSelect: false, 
                product: pdata, 
                disableImageUpdate: true 
            });
			
			$product.addClass('qb-initialized');

        });

    }

    imageSlider(){
        const $moduleSlider = this.$content.find('.image-slider');

        $moduleSlider.slick({
            dots: true,
            infinite: true,
            speed: 600,
            slidesToShow: 1,
            arrows: false,
            mobileFirst: true
        });
    }

    sliderwithButtons(){
        const $moduleSlider = this.$content.find('.module-slider-with-buttons .slides-wrapper');

        $moduleSlider.slick({
            dots: false,
            infinite: true,
            speed: 600,
            slidesToShow: 1,
            arrows: true,
            mobileFirst: true
        });
    }

    imageTiles(){
        const $moduleSlider = this.$content.find('.module-image-tiles .slides-wrapper');

        $moduleSlider.slick({
            dots: false,
            infinite: true,
            speed: 600,
            slidesToShow: 1,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: GlobalObj.responsiveSizes.medium,
                    settings: "unslick"
                }
            ]
        });
    }

    imageCarousel(){
        const $moduleSlider = this.$content.find('.module-image-carousel .grid-wrapper');

        $moduleSlider.slick({
            dots: true,
            infinite: true,
            speed: 600,
            slidesToShow: $moduleSlider.data('mobile-slides') || 1,
            slidesToScroll: $moduleSlider.data('mobile-slides') || 1,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: GlobalObj.responsiveSizes.medium,
                    settings: {
                        slidesToShow: $moduleSlider.data('desktop-slides') || 3,
                        slidesToScroll: $moduleSlider.data('desktop-slides') || 3
                    }
                }
            ]
        });
    }

    collectionHighlightCarousel(){
        const $productSlider = this.$body.find('.products-carousel .collection-products.collection-carousel');

        $productSlider.slick({
            dots: true,
            infinite: true,
            speed: 600,
            centerMode: false,
            centerPadding: '20px',
            slidesToShow: 2,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: GlobalObj.responsiveSizes.medium,
                    settings: {
                        slidesToShow: this.$body.hasClass('template-index') ? 3 : 4
                    },
                },
                {
                    breakpoint: GlobalObj.responsiveSizes.large,
                    settings: {
                        slidesToShow: 4
                    },
                },
            ],
        });
    }

    initVideos() {
        const $heroVideos = this.$content.find(
            '.video-wrapper.bg-video .video-box'
        );
        const $videos = this.$content.find(
            '.video-wrapper:not(.bg-video) .video-box'
        );

        // Hero videos
        new OneVideo({
            $el: $heroVideos,
            isResponsive: true,
            bgVideo: true,
            autoplay: true,
            hidePoster: false,
        });

        // other videos
        new OneVideo({
            $el: $videos,
            isResponsive: true,
            bgVideo: false,
            autoplay: false,
            hidePoster: true,
        });

        /*
        this.$posterImages = this.$content.find('.video-wrapper picture');

        if (this.$posterImages.length) {
            this.$posterImages.click(function () {
                const $pic = $(this);
                $pic.hide();
                $pic.siblings('.video-ui').find('.video-ctl').click();
            });
        }
        */
    }

    initTabSystem() {

        new TabbedContent({ $el: $('.size-chart') });
        new OneTabSystem({
            $el: $('.utility-content'),
        });
    }

    initTabbedContent() {
        new TabbedContent({ $el: this.$content });

        if ($('.slick-carousel').length) {
            $('.slick-carousel').slick({
                draggable: true,
                dots: true,
            });
        }
    }

    // TODO:
    initModalContent() {}
}
