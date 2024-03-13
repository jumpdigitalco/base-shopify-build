/*
    OneTabSystem 2.0.0 Usage (Webpack)
    Handles accordion and tab (response to accordion on small screen) together
    Yang @onerockwell
    */

// Import all dependencies here
import $ from 'jquery';

export default class OneTabSystemView {
    constructor({ $el }) {
        this.$el = $el ?? $('body');
        this.accordionsAndTabs();
    }

    systemUpdate(e) {
        const $title = $(e.currentTarget);
        const $container = $title.parents('.tab-accordion-system');
        const $system = $title.parent('.system');
        const target = $title.data('target');
        const $targetTitle = $container.find(
            `.system-title[data-target="${target}"]`
        );
        const $targetContent = $container.find(
            `.system-content[data-target="${target}"]`
        );
        const $targetSystem = $targetTitle.parent('.system');

        const isTab = $container.hasClass('tab-container');

        $system.siblings().removeClass('active');
        $system
            .siblings()
            .find('.system-content')
            .removeClass('fadeIn animated');

            console.log('system update')

        if (isTab) {
            $targetSystem.addClass('active');
            if (!GlobalObj.utilities.isMobile()) {
                $targetContent.addClass('fadeIn animated');
            }
        } else {
            $targetSystem.toggleClass('active');
        }
    }

    accordionsAndTabs() {
        $('.tab-accordion-system .system-title').click((e) => {
            this.systemUpdate(e);
        });
    }
}
