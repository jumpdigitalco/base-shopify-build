// import { Debounce } from 'App/helpers';

/**
 * Header.
 *
 * Code related to header logic
 *
 */
export default class Header {
    constructor() {
        this.$body = $('body');
        this.$header = $('header.site-header');
        this.$promoBanner = this.$header.find('.promo-banner');

        this.initPromoBanner();
        this.mobileHideHeaderOnScroll();
        
    }

    /*
     * mobileHideHeaderOnScroll.
     *
     * On mobile, in order to free up screen space, we hide the header when the user scrolls down
     * and re-show the header when the user scrolls up, or returns to the top of the page.
     */

    initPromoBanner() {
        const cookieEnabled = this.$promoBanner.data('cookieenabled');
        const cookieDays = this.$promoBanner.data('days');

        if (
            this.$promoBanner.length > 0 &&
            this.$promoBanner.hasClass('top-banner')
        ) {
            //  && this.$body.hasClass('template-index')
            if (!GlobalObj.utilities.getCookie('promo_banner')) {
                this.$body.addClass('promo-banner-active');
                this.$promoBanner.addClass('activate');
            }
        }

        $('.close-promo').click(() => {
            this.$promoBanner.slideUp(200);
            this.$body.removeClass('promo-banner-active');
            this.$promoBanner.removeClass('activate');

            if (!GlobalObj.utilities.getCookie('promo_banner') && cookieEnabled) {
                GlobalObj.utilities.setCookie('promo_banner', 'shown', cookieDays);
            }
        });

        if(this.$promoBanner.hasClass('slick')){
            this.$promoBanner.slick({
                dots: false,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                centerPadding: '20px',
                mobileFirst: true,
                autoplay: true,
                autoplaySpeed: 7000
            });

        }

    }

    mobileHideHeaderOnScroll() {
        const $selector = $('header.site-header, body');
        const mobileHeaderHeight = $('header.site-header').outerHeight();
        const upClass = 'scroll-up';
        const downClass = 'scroll-down';
        // const debounce = new Debounce();
        let lastScrollPosition = 0;

        // On mobile scroll, show/hide header depending on direction
        // async
        $(document).on('scroll', function () {
            // Escape if not on mobile
            if (!GlobalObj.utilities.isMobile) return;

            const scrollTop = $(this).scrollTop();
            const offset = scrollTop - lastScrollPosition; // Difference between last  scroll even and current event
            let scrollDirection;

            if (scrollTop > 70){
                $selector.addClass('scrolling');
            }else{
                $selector.removeClass('scrolling');
            }

            if (offset > 0) {
                scrollDirection = 'down';
            } else if (offset < 0) {
                scrollDirection = 'up';
            }

            lastScrollPosition = scrollTop; // Save new scroll position now that we've determined the direction

            // Debounce so that we're not checking the scroll position a million times a second
            // await debounce.waitForTimeout();

            // If the page top offset falls within the height of the header at the top of the page,
            // return to default state (show the header)
            if (scrollTop < mobileHeaderHeight) {
                $selector.removeClass(downClass).removeClass(upClass);
            }
            // The user is scrolling down
            else if (scrollDirection === 'down') {
                $selector.removeClass(upClass);
                $selector.addClass(downClass);
            }
            // The user is scrolling up
            else if (scrollDirection === 'up') {
                $selector.removeClass(downClass);
                $selector.addClass(upClass);
            }
        });
    }
}
