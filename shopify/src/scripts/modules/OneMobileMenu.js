/*
  OneMobileMenu 2.0.0 Usage (Webpack)
  yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
export default class OneMobileMenuView {
    constructor({ $el, openCallback, closeCallback }) {
        console.log('INIT MOBILE MENU');

        this.$mobileNav = $el;
        this.$currentActive = false;
        this.openCallback = openCallback;
        this.closeCallback = closeCallback;

        $el.on('terminate-inner-action', () => {
            console.log('terminate inner action');
            this.$currentActive.find('.back-to a').trigger('click');
        });
        $('[data-trigger]').click((e) => {
            console.log('data trigger click');
            if (GlobalObj.utilities.isMobile()) {
                this.dataTrigger(e);
            }
        });
        $('.back-to a').click((e) => this.backToA.bind(this));

        $el.find('.expandable > *:not(.children)').click((e) => {
            console.log('click expandable inner');
            this.expandableClick(e);
        });
    }

    dataTrigger(e) {
        e.preventDefault();

        const $trigger = $(e.currentTarget);
        const target = $trigger.data('trigger');
        const $target = this.$mobileNav.find(`[data-target="${target}"]`);

        if ($target.length) {
            if ($trigger.parent().hasClass('active')) {
                $trigger.parent().removeClass('active');
                $target.removeClass('active');
                this.$mobileNav.removeClass('slide-menu-opened');
                this.closeCallback();

                this.$currentActive = null;
            } else {
                $trigger.parent().addClass('active');
                $target.addClass('active');
                this.$mobileNav.addClass('slide-menu-opened');
                this.openCallback();

                if ($target.find('input').length) {
                    setTimeout(function () {
                        $target.find('input').focus();
                    }, 100);
                }

                this.$currentActive = $target;
            }
        }
    }
    backToA(e) {
        e.preventDefault();
        const $backToBtn = $(e.currentTarget).parent();
        const $target = $backToBtn.parent();
        const trigger = $target.data('target');
        const $trigger = this.$mobileNav.find(
            '[data-trigger="' + trigger + '"]'
        );

        this.$mobileNav.removeClass('slide-menu-opened');
        this.closeCallback();
        $target.removeClass('active');
        $trigger.removeClass('active');

        this.$currentActive = false;
    }

    expandableClick(e) {
        const $targetNavLink = $(e.target).closest('.nav-link');
        const $trigger = $(e.currentTarget);

        if (
            $targetNavLink.parent().hasClass('level-2') &&
            !$targetNavLink.parent().hasClass('has-children')
        )
            return;

        e.preventDefault();

        const $parent = $trigger.parent();
        const $target = $trigger.next('.children');
        const $activeExp = $parent.next('.expandable.active');

        // if ($activeExp.length) {
        //     $activeExp.find('> *:not(.children)').trigger('click');
        // };

        $parent.siblings().removeClass('active');

        $parent.toggleClass('active');

        // $target.slideToggle();
    }
}
