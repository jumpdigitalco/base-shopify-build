// Bundled with webpack
// import $ from 'jquery';

// Not seeing this being used anywhere in the project
// import 'Lib/jquery.onmutate';
import whenDomReady from 'when-dom-ready';

/*
 * WARNING !!!!!!!!!!
 * Do not use regular ES6 imports in this file!
 * In order to speed up page load, use webpack's dynamic import:
 * https://webpack.js.org/guides/code-splitting/#dynamic-imports
 *
 * This allows the subsequent modules to be loaded when-needed and chunked
 * on a per-page basis.
 *
 * Importing everything at the top of the file leads to all of these modules
 * being loaded on every page in one giant bundle.
 *
 */

export default class Router {
    constructor() {
        whenDomReady(async () => {
            console.log('Body created, routing...', $);

            if (process.env.NODE_ENV !== 'production') {
                // Logs all calls to preventDefault / stopPropagation in an user-friendly way
                const logEventMethodCall = (event, methodName) => {
                    const MinimumMeaninfulSelectors = 3; // how much meaningful items we want in log message
                    const target = event.target;

                    const selector = (function computeSelector() {
                        const parentSelectors = [];
                        let node = target;
                        let minimumSelectors = 0;
                        do {
                            const meaningfulSelector = node.id
                                ? `#${node.id}`
                                : (node.classList?.length ?? 0) > 0
                                ? `.${Array.prototype.join.call(
                                      node.classList,
                                      '.'
                                  )}`
                                : undefined;
                            if (meaningfulSelector) minimumSelectors++;
                            const nodeSelector = `${node.tagName.toLowerCase()}${
                                meaningfulSelector ? meaningfulSelector : ''
                            }`;
                            parentSelectors.unshift(nodeSelector);
                            node = node.parentNode;
                        } while (
                            node &&
                            node !== document &&
                            minimumSelectors < MinimumMeaninfulSelectors
                        );
                        return parentSelectors.join(' > ');
                    })();

                    console.debug(
                        `${event.type}.${methodName}() on ${selector}`,
                        event
                    );
                };

                const oldEPD = Event.prototype.preventDefault;
                Event.prototype.preventDefault = function () {
                    logEventMethodCall(this, 'preventDefault');
                    oldEPD.call(this);
                };
            }

            const $body = $('body');
            const bodyClass = $body.attr('class');
            const tempSuffix = $body.data('tempsuffix') ?? '';

            if ($body.hasClass('template-checkout') === false) {
                console.log('LOAD GLOBAL VIEW');
                const { default: GlobalView } = await import('Views/Global');
                GlobalObj.GlobalView = new GlobalView();
                
            } else {
                console.log('LOAD CHECKOUT VIEW');
                const { default: CheckoutView } = await import('Views/Checkout');
                new CheckoutView();
            }

            // if ($body.hasClass('template-index')) {
                // const { default: ViewHome } = await import('Views/Home');
                // new ViewHome({ $el: $('#MainContent') });
            // }

            if ($body.hasClass('template-product')) {
                const { default: ViewProduct } = await import('Views/Product');
                new ViewProduct({ $el: $('.product-detail-container') });
            }

            if (
                ($body.hasClass('template-collection') ||
                    $body.hasClass('template-search')) &&
                $body.data('tempsuffix') != 'lookbook'
            ) {
                const { default: Collection } = await import(
                    'Views/Collection'
                );
                new Collection({ $el: $('#MainContent') });
            }

            if ($body.hasClass('template-giftcard')) {
                const { default: GiftCardView } = await import(
                    'Views/Giftcard'
                );

                GiftCardView();
            }

            if ( $body.hasClass('template-blog') ) {
                const { default: BlogView } = await import('Views/Blog');
                new BlogView({ $el: $('#MainContent') });
            }

            if ($body.hasClass('template-suffix-styles')) {
                const { default: ViewStyleGuide } = await import(
                    'Views/StyleGuide'
                );
                new ViewStyleGuide({ $el: $('.style-guide-wrapper') });
            }

            if ($body.data('tempsuffix') == 'about') {
                const { default: AboutView } = await import('Views/About');
                new AboutView({ $el: $('#MainContent') });
            }

            if (
                $body.hasClass('template-suffix-utility') ||
                $body.hasClass('template-404')
            ) {
                const { default: UtilityView } = await import('Views/Utility');
                new UtilityView({ $el: $('#MainContent') });
            }

            if (
                $body.hasClass('template-customers-login') ||
                $body.hasClass('template-customers-register') ||
                $body.hasClass('page-reset-account') ||
                $body.hasClass('page-addresses') ||
                $body.hasClass('page-orders')
            ) {
                const { default: AccountView } = await import('Views/Account');
                AccountView();
            }

            if ($body.hasClass('template-article')) {
                const { default: ArticleView } = await import('Views/Article');
                new ArticleView({ $el: $('#MainContent') });
            }

            if ($body.hasClass('page-your-shopping-cart')) {
                const { default: CartView } = await import('Views/Cart');
                CartView();
            }

            if (
                $body.hasClass('template-suffix-collections') ||
                $body.find('.landing-page').length > 0 ||
                $body.find('.main-store-locator').length > 0
            ) {
                const { default: StaticPageView } = await import(
                    'Views/StaticPage'
                );
                new StaticPageView();
            }
        });
    }
}
