import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import OneTabSystem from 'Modules/module-oneTabSystem';

export default Backbone.View.extend({
    initialize: function (opts) {
        console.log('init utility page');

        var self = this;
        self.$content = self.$el;
        self.$linksContainer = self.$content.find('.utility-nav .links');

        self.initTabSystem();
        self.initUtilityNav();
    },

    events: {},

    initTabSystem: function () {
        OneTabSystem.init({
            el: $('.utility-content'),
        });
    },

    initUtilityNav: function () {
        var self = this;
        var events = {
            'click .utility-nav .select-link': function (e) {
                self.$linksContainer.toggleClass('opened');
            },
        };
        _.extend(self.events, events);
        self.delegateEvents();
    },

    destroy: function () {
        var self = this;
        self.undelegateEvents();
    },

    isMobile: function () {
        if (GlobalObj.responsive == 'small') {
            return true;
        }
        return false;
    },
});
