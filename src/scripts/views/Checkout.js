// Author windsor.ortiz@spartan.com
// Converted to class component and moved into webpack bundle

import $ from 'jquery';
import 'scrolltofixed';

// a minimal jQuery library for reacting to innerHTML changes
// Sourced from https://jsfiddle.net/ecmanaut/jRbEz/
(function ($) {
    $.fn.change = function (cb, e) {
        e = e || { subtree: true, childList: true, characterData: true };
        $(this).each(function () {
            function callback(changes) {
                cb.call(node, changes, this);
            }
            var node = this;
            new MutationObserver(callback).observe(node, e);
        });
    };
})($);

export default class CheckoutView {
    constructor() {

        console.log('Checkout view');

        this.itemCounter();
        this.updateFlags();
        this.fixSidebar();

        $(
            '.order-summary__section--total-lines,.order-summary__section--discount'
        ).on('DOMSubtreeModified', () => {
            console.log('order-summary DOMSubtreeModified');
            this.updateFlags();
        });

        $('.product-thumbnail__image').map(function () {
            const src = $(this).attr('src');
            $(this).attr('src', src.replace('_small', '_300x'));
        });
    }

    itemCounter() {
        // var self = this;
        let itemCount = 0;
        const countDisplay = $('.sidebar__content--header').find('.item-count');

        $('.product-thumbnail__quantity').each(function (i, e) {
            itemCount += parseInt($(e).text());
            console.log(itemCount);
            if (itemCount === 1) {
                countDisplay.text(`(${itemCount})`);
            } else {
                countDisplay.text(`(${itemCount})`);
            }
        });
    }

    validateAddress() {
        // var regex = /\b[p](ost(al)?)?\.?(\s+)?([o](ffice)?)?\.?(\s+)?(box)?(\s+)?[\w]+\b/i;
        const regex = /\b(?:po\s+box|apo\s+box|postal\s+office|p.o.\s+box|post\s+office)\b/i;
        const $contactForm = $('[data-step="contact_information"]').find(
            'form'
        );
        const $addressField1 = $('#checkout_shipping_address_address1');
        const $addressField2 = $('#checkout_shipping_address_address2');
        const $fieldContainer = $('[data-address-field="address1"]');

        $contactForm.on('submit', function (e) {
            const test = regex.test($addressField1.val());
            const test2 = regex.test($addressField2.val());
            const errorMessage = `
                    <p
                        class="field__message field__message--error po-box-error"
                        id="error-for-address1">
                        Sorry! We are unable to ship to PO Boxes.
                    </p>
                `;
            const $errorMessage = $(errorMessage);

            if (test) {
                e.preventDefault();
                $('.po-box-error').remove();
                $fieldContainer.append($errorMessage);
                $errorMessage.css('display', 'block');
            }

            if (test2) {
                e.preventDefault();
                $('.po-box-error').remove();
                $fieldContainer.append($errorMessage);
                $errorMessage.css('display', 'block');
            }
        });
    } //validateAddress

    fixSidebar() {
        const $sideBar = $('.sidebar__content');
        console.log($sideBar.outerHeight(true));
        if (
            $sideBar.length > 0 &&
            $(window).width() > 1000 &&
            $(window).height() > $sideBar.outerHeight(true)
        ) {
            console.log('fixSidebar');
            $sideBar.addClass('scrollable');
            $sideBar[0].scrollTop = $sideBar[0].scrollHeight;
            
            $sideBar.scrollToFixed({
                bottom: 0,
                removeOffsets: true,
                zIndex: 9,
                dontSetWidth: true,
                marginTop: $('.site-header').outerHeight(true),
                limit: function(){
                    var limit = $('.main').offset().bottom - $sideBar.outerHeight(true);
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
        }
    } //fixSidebar

    updateFlags() {
        const product__description__property = $(
            '.product__description__property'
        );
        if (product__description__property.length) {
            product__description__property.each(function (index, ele) {
                //Somehow without the 1 second timeout the following updates won't work
                if ($(ele).html().indexOf('FINAL SALE') > 0) {
                    setTimeout(function () {
                        $('.product__description__property')
                            .eq(index)
                            .addClass('final-sale');
                        $('.product__description__property')
                            .eq(index)
                            .html(
                                '<div class="product-flags"><div class="flag final-sale"><span>FINAL SALE</span></div></div>'
                            );
                        $('.product__description__property')
                            .eq(index)
                            .css('display', 'block');
                    }, 1000);
                } //Final Sale

                if ($(ele).html().indexOf('Pre Order') > 0) {
                    var current_PO_text = $('.product__description__property')
                        .eq(index)
                        .html()
                        .replace('Pre Order, ', '');
                    setTimeout(function () {
                        $('.product__description__property')
                            .eq(index)
                            .html(current_PO_text);
                        $('.product__description__property')
                            .eq(index)
                            .addClass('pre-order');
                        $('.product__description__property').eq(index).prepend(`
                                <div class="product-flags">
                                    <div class="flag pre-order">
                                            <span>Pre-Order</span>
                                    </div>
                                </div>
                            `);
                    }, 1000);
                }
            });
        }
    } //updateFlags
}
