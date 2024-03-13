// Import all dependencies here
import $ from 'jquery';
import ViewProduct from 'Views/Product';

export default class QuickShop {
    constructor() {
        console.log('init quickshop');
        this.quickshop();
    }

    quickshop() {
        /*
            Possible trigger of this function are :
            1. Click on '.quick-shop-trigger' which has data-url or href attribute.
            2. Click on '.swatch-linked' in quickshop container, which has data-url or href attribute.
            3. Direct call with 'event' object and target url as param.
        */
        const quickshopCtl = function (e, url) {
            console.log('quickshopCtl');

            e.stopPropagation();
            e.preventDefault();

            const $curr = $(e.currentTarget);
            let _url = url;

            if (url) {
                _url = `${url}?view=quickshop`;
            } else {
                _url = `${
                    $curr.data('url') || $curr.attr('href')
                }?view=quickshop`;
            }

            if (_url === '#?view=quickshop') {
                // Skip the empty URL
                return false;
            }

            if (this.$currentQuickshop) {
                this.$currentQuickshop.destroy();
            }

            console.log('this.$currentModal', this.$currentModal);

            $.ajax({
                async: true,
                type: 'GET',
                url: _url,
                cache: true,
                error: function (err) {
                    console.log(err);
                },
                success: async function (html) {
                    const $productDetail = $(html).find('.product-quickshop');
                    const quickshopHtml = $productDetail[0].outerHTML;
                    $productDetail.remove();

                    if (this.$currentModal) {
                        // Replace content html
                        this.$currentModal.$drawer
                            .find('.product-quickshop')
                            .remove();
                        this.$currentModal.$drawer
                            .find('.drawer-content')
                            .append(quickshopHtml);
                        this.$currentQuickshop = new ViewProduct({
                            el: $(
                                '.product-quickshop .product-detail-container'
                            ),
                        });
                    } else {
                        const { default: OneDrawer } = await import(
                            'Modules/OneDrawer'
                        );
                        new OneDrawer({
                            drawerContent: quickshopHtml,
                            drawerModalId: 'QuickShopDrawerModal',
                            triggerEvent: 'click',
                            triggerElem: '.quick-shop-hidden-trigger',
                            initCallback: function () {
                                this.$currentModal = this;
                                this.$currentModal.openDrawer();
                                $('body').addClass('quickshop-open');
                            },
                            openCallback: function () {
                                this.$currentQuickshop = new ViewProduct({
                                    $el: $(
                                        '.product-quickshop .product-detail-container'
                                    ),
                                });
                            },
                            closeCallback: function () {
                                if (this.$currentModal) {
                                    this.$currentModal.destroy();
                                    $('#QuickShopDrawerModal').remove();
                                    this.$currentModal = false;
                                    $('body').removeClass('quickshop-open');
                                }
                            },
                            events: {
                                'ajax-reload-inner': function (e, url) {
                                    quickshopCtl(e, url);
                                },
                            },
                        });
                    }
                },
            });
        };

        $(document).on('click', '.quick-shop-trigger', quickshopCtl);
        $(document).on('click', '.quick-shop-trigger-link',quickshopCtl);
    }

}
