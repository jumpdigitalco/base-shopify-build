import $ from 'jquery';
import OneTabSystem from 'Modules/OneTabSystem';

export default class UtilityView {
    constructor({ $el }) {
        console.log('init utility page');

        this.$content = $el;
        this.$linksContainer = this.$content.find('.utility-nav .links');

        this.initTabSystem();
        this.initUtilityNav();
    }

    initTabSystem() {
        new OneTabSystem({
            $el: $('.utility-content'),
        });
    }

    initUtilityNav() {
        $('.utility-nav .select-link').click(() => {
            this.$linksContainer.toggleClass('opened');
        });
    }
}
