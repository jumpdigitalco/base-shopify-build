import $ from 'jquery';
import OneDrawer from 'Modules/OneDrawer';

export default class OneCookieBannerView {
    constructor({ $el, cookieDays }) {
        console.log('init cookie banner');
        this.$cookieBanner = $el;
        this.days = cookieDays ?? this.$cookieBanner.data('days');

        this.initModal();

        $('.accept').click(this.close_accept.bind(this));
        $('.close').click(this.close.bind(this));
    }

    initModal() {
        this.cookieBannerDrawer = new OneDrawer({
            dontCloseWhenClickOutside: true,
            drawerElem: '#' + this.$cookieBanner.attr('id'),
            triggerEvent: 'click',
            triggerElem: '.cookie-banner-trigger',
            closeCallback: function (e) {
                if (GlobalObj.subscribeModal) {
                    GlobalObj.subscribeModal.open();
                }
            },
        });

        if (!localStorage.getItem('acceptcookieterm')) {
            this.open();
        }
    }

    open() {
        $('body').addClass('cookie-not-accepted');
        this.cookieBannerDrawer.openDrawer();
    }

    close_accept() {
        localStorage.setItem('acceptcookieterm', true);//, this.days

        $('body').removeClass('cookie-not-accepted');

        this.cookieBannerDrawer.closeDrawer();
    }

    close() {
        $('body').removeClass('cookie-not-accepted');
        this.cookieBannerDrawer.closeDrawer();
    }
}
