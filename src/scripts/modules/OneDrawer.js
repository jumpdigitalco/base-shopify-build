/*
	OneDrawer 2.5.1 Usage (Webpack Update)
	Yang @onerockwell
	
	V2 Change log
	- Adding modal support
	- Adding closeOtherDrawers method when open up a new drawer
	- Adding global drawer stack for better accessibility
	- Adding dontCloseWhenClickOutside as an option
	- Adding dontShowOverlay as an option, default to false
	
	const drawerCtl = new OneDrawer({
		drawerElem: '#drawer',          // Your drawer class or id. If left empty, will use default drawer modal
		drawerModalId: 'modal-id',// Your drawer modal special id, which allow you to style and/or targetting the particular modal
        drawerModalClasses: '<classses>',
		drawerContent: [HTML],			// Assign html as drawer modal content.
		triggerEvent: 'click',          // Trigger event
		triggerElem: '.drawer-toggle',  // Your drawer trigger id 
		openCallback: function(){ alert('opened!'); }        // You can add drawer open 
		closeCallback: function(){ alert('closed!'); }        // You can add drawer close callback function here
		events: {                       // Accept events key pairs 
			'click form button' : function(e){
				e.preventDefault();
				var $form = $(e.currentTarget).parent('form');
				if ($form.find('input').val()) {
					// Note: 'this' represent the OneDrawer object not the current view, coloseDrawer() is an native member function of OneDrawer
					this.closeDrawer(); 
					$form.submit();
				}
			}
		}
	});
*/

import $ from 'jquery';

const DEFAULT_TEMPLATE = require('Templates/template-oneDrawerDefault.html');

export default class OneDrawer {
    constructor({
        drawerElem,
        drawerContent,
        drawerModalId,
        drawerModalClasses,
        triggerElem,
        initCallback,
        openCallback,
        closeCallback,
        events,
        dontCloseWhenClickOutside,
        dontShowOverlay,
    }) {
        console.log('init OneDrawer');

        this.triggerEvent = 'click'; // settings.triggerEvent; // Force using click for drawers
        this.drawerOpened = false;
        this.drawerElem = drawerElem;
        this.drawerContent = drawerContent;
        this.drawerModalId = drawerModalId;
        this.drawerModalClasses = drawerModalClasses;
        this.triggerEvent = 'click'; // triggerEvent; // Force using click for drawers
        this.triggerElem = triggerElem;
        this.initCallback = initCallback;
        this.openCallback = openCallback;
        this.closeCallback = closeCallback;
        this.eventsAdditional = events ?? {};
        this.dontCloseWhenClickOutside = dontCloseWhenClickOutside ?? false;
        this.dontShowOverlay = dontShowOverlay ?? false;
        this.isModal = this.drawerElem ? false : true;
        this.$body = $('body');

        console.log('drawerElem', this.drawerElem);
        console.log('drawerModalId', this.drawerModalId);

        if (this.drawerElem) {
            this.$drawer = $(this.drawerElem);
        } else if (this.drawerContent) {
            // Use default modal template
            const content = this.buildTemplate({
                id: this.drawerModalId,
                classes: this.drawerModalClasses,
                body: this.drawerContent,
            });
            this.$drawer = $(content).appendTo('body');
            this.drawerElem =
                '.' + this.$drawer.attr('class').replace(' ', '.');
        }

        if (!GlobalObj.drawerStack) {
            GlobalObj.drawerStack = [];
        }
        if (!this.dontCloseWhenClickOutside) {
            GlobalObj.drawerStack.push(this);
        }
		
		// Global events
        // console.log('this.dontCloseWhenClickOutside', this.dontCloseWhenClickOutside);
		// if (!this.dontCloseWhenClickOutside) {
		// 	$(document).on(this.triggerEvent + ' keyup', function (e) {
		// 		console.log('drawer: click on window');
		// 		if ( e.type == this.triggerEvent || (e.type == 'keyup' && e.keyCode == 27) ) {
		// 			this.closeDrawer(true);
		// 		}
		// 	});
		// }

        // Trigger event
        $(this.triggerElem).on(this.triggerEvent, (e) => {
            // console.log('classes', $(e.currentTarget).attr('class'));
            // console.log('this.triggerElem', this.triggerElem);
            e.stopPropagation();
            e.preventDefault();
            this.drawerCtl();
        });

        // Drawer event
        $(this.drawerElem).on(this.triggerEvent, (e) =>{
            if(!$(e.target).hasClass('ajaxcart__qty-remove') && !$(e.target).hasClass('ajaxcart__qty-adjust') && !$(e.target).hasClass('close-drawer')){
                e.stopPropagation()
            }
        });

        $(`${this.drawerElem} .drawer-close, ${this.drawerElem} .close-drawer`).on(this.triggerEvent, (e) => {
            console.log('click to close drawer')
            e.stopPropagation();
            e.preventDefault();
            this.closeDrawer();
        });

        if (this.initCallback) this.initCallback();
    }

    drawerCtl(forceClose) {
        console.log('drawerCtl', this.$drawer.attr('class'));
        if (!this.$drawer.hasClass('opened')) {
            this.openDrawer();
        } else {
            this.closeDrawer();
        }
    }

    openDrawer() {
        console.log('openDrawer');
        this.closeOtherDrawers();

        if (!this.dontShowOverlay) {
            this.$body.trigger('drawer-opt');
        }

        // Not sure what this is?? "drawer" is not defined, so this will throw an error
        // Either way, z-index should be set in css, not here
        // if (this.isModal) {
        //     drawer.css('z-index','1002');
        // }
        this.$drawer.addClass('opened');
        this.$drawer.attr('aria-hidden', 'false');
        if (this.openCallback) this.openCallback();
        this.drawerOpened = true;

        console.log('drawer classes', this.$drawer.attr('class'));
    }

    closeDrawer(force) {
        console.log('closeDrawer', force)
        if (force) {
            if (this.$drawer.hasClass('inner-action-engaged')) {
                this.$drawer.trigger('terminate-inner-action');
            }
            if (this.$drawer.hasClass('opened')) {
                console.log('Close drawer and force terminate inner action');
                this.$body.removeClass(
                    'show-overlay drawer-opt cookie-not-accepted'
                );
                if (this.isModal) {
                    this.$drawer.on('transitionend', function () {
                        this.$drawer.off('transitionend');
                        this.$drawer.css('z-index', '-1');
                    });
                }
                this.$drawer.removeClass('opened');
                this.$drawer.attr('aria-hidden', 'true');
                if (this.closeCallback) this.closeCallback();
            }
        } else {
            if (this.$drawer.hasClass('inner-action-engaged')) {
                this.$drawer.trigger('terminate-inner-action');
            } else if (this.$drawer.hasClass('opened')) {
                console.log('Close drawer');
                this.$body.removeClass(
                    'show-overlay drawer-opt cookie-not-accepted'
                );
                if (this.isModal) {
                    this.$drawer.on('transitionend', () => {
                        this.$drawer.off('transitionend');
                        this.$drawer.css('z-index', '-1');
                    });
                }
                this.$drawer.removeClass('opened');
                this.$drawer.attr('aria-hidden', 'true');
                if (this.closeCallback) this.closeCallback();
            }
        }
        this.drawerOpened = false;
    }

    closeOtherDrawers() {
        console.log('closeOtherDrawers', this.$drawer)
        console.log('GlobalObj.drawerStack', GlobalObj.drawerStack)
        for (let drawer of GlobalObj.drawerStack) {
            if (drawer.drawerOpened) {
                drawer.closeDrawer(true);
            }
        }
    }
	
	destroy() {
		if (this.$drawer && this.$drawer.hasClass('drawer-modal')) {
			this.$drawer.remove();
		}
	}

    buildTemplate(content, type) {
        /*
         *
         * I have no clue what this even is. If ever type is set to an empty string (not even null),
         * this code would fail because typeTemplate would be undefined
         *
         */
        // var self = this,
        //     typeTemplate;

        // switch(type) {
        //     case '':
        //         break;
        //     default:
        //         typeTemplate = DEFAULT_TEMPLATE;
        //         break;
        // };

        // return typeTemplate({content: content});
        return DEFAULT_TEMPLATE({ content });
    }
}
