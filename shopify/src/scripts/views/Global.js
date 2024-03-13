import $ from 'jquery';

import 'jquery-hoverintent';
import 'Lib/matchMedia';
import LazyLoad from 'vanilla-lazyload';
import AOS from 'aos';
import 'node_modules/slick-carousel';

import TabbedContent from 'Modules/TabbedContent';
import OneDrawer from 'Modules/OneDrawer';
import OneMobileMenu from 'Modules/OneMobileMenu';
import CustomDropDown from 'Modules/Dropdown';
import Header from 'Views/header';

GlobalObj.utilities.mediaCheck = function (entryCallback, exitCallback) {
    if (!entryCallback) {
        entryCallback = function () {};
    }
    if (!exitCallback) {
        exitCallback = function () {};
    }
    mediaCheck({
        media: GlobalObj.breakpoint,
        entry: entryCallback,
        exit: exitCallback,
    });
};

GlobalObj.utilities.isSafari = /constructor/i.test(window.HTMLElement) ||
    (function (p) {
        return p.toString() === '[object SafariRemoteNotification]';
    })(
        !window['safari'] ||
            (typeof safari !== 'undefined' && safari.pushNotification)
    );

export default class GlobalView {
    constructor() {
        console.log('INIT GLOBAL VIEW');
        GlobalObj.pagerStack = [];
        GlobalObj.isLoading = false;
        GlobalObj.isFinished = false;

        this.$body = $('body');
        this.$header = $('header.site-header');
        this.$footer = $('footer.site-footer');
        this.$miniCart = $('#MiniCart');
        this.$mobileNav = $('#MobileNav');
        this.$searchBar = $('#SearchBar');
        this.$promoBanner = this.$header.find('.promo-banner');
        this.$navi = this.$header.find('nav');
        this.$menuToggle = this.$header.find('.menu-toggle');

        this.searchInlineMode = true; // Set false to use search modal, set true to use inline search mode.
        this.miniCartAsDropdown = false; // Set false to use drawer, set true to use dropdown on Desktop (drawer on Mobile).
        this.useSlideInMenuForLevel2 = false; // Set false to use accordion for all nav levels on Mobile, set true to use the slide-in-menu for level 2.
        
        this.initNavi();
        this.initUtilities();
        this.initSearch();
        this.initMiniCart();
        this.initMobileMenu();
        this.localeSelector();
        if (GlobalObj.utilities.isSafari) {
            this.$body.addClass('is-safari');
        }

        new Header();

        this.initLocationModal();
        this.initSubscribe();
        this.initCookieBanner();
        this.initFooter();

        this.inputSetup();
        // this.selectSetup();
        this.toTopBar();
        this.initTabs();
        this.animateElementsbyAOS();

        this.lazyLoad = new LazyLoad({
            // threshold: 50,
            elements_selector: '[data-bg], img, picture, video',
        });

        this.moduleHero();
        this.productsCarousel();
        this.hotSpotsModule();
        this.splitContentModule();

        // init global slick sliders
        $('[data-slick]').not('.slick-initialized').slick({
            slidesToShow: 1,
            dots: false,
            arrows: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 5000
        });

        window.onload = () => {
            console.log('window loaded');
            if(this.$body.hasClass('template-index')){
                this.initCountdownBanner();
            }
            this.initVideos();
            this.limeSpotOverrides();
            this.removeHoverProductsOnMobile();
        }

        // Close drawers on outside click
        $(document).on('click', '#global-overlay', function () {
            window.GlobalObj.drawerStack.forEach((i) => i.closeDrawer());
        });

        this.$body.on('lazyloadShouldUpdate', () => {
            console.log('LAZY LOAD UPDATE');
            this.lazyLoad.update();
        });

        $('body')[0].addEventListener('lazyloadShouldUpdate', () => {
            console.log('LazyLoad Update');
            this.lazyLoad.update();
        });

        this.$body.on(
            'drawer-opt menu-opt-in menu-opt-out',
            this.bodyClassCtl.bind(this)
        );

        // Intercept checkout button, BOLD discounts has a click handler on
        // any link that has 'checkout' in it. This code returns those links
        // back to their original functionality
        $('body a[href*="checkout"]').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            window.location.href = $(this).prop('href');

            return false;
        });
            
        $(document).on('afterAddToCart.ajaxCart', function(evt, cart) {
            console.log('afterAddToCart.ajaxCart');
        });

        if (Shopify.designMode) {
            this.designMode()
        }

    }

    designMode() {
        const self = this;

        // .on('shopify:section:load', SectionShouldGetLaidAgain)
        // .on('shopify:section:unload', DO_YOUR_STUFF)
        // .on('shopify:section:select', DO_YOUR_STUFF
        // .on('shopify:section:deselect', DO_YOUR_STUFF)
        // .on('shopify:block:select', DO_YOUR_STUFF)
        // .on('shopify:block:deselect', DO_YOUR_STUFF);

        document.addEventListener('shopify:section:load', function(event) {
            self.lazyLoad.update();
            /* Do something */
            console.log('shopify:section:load - hacer algo!', event);

            if(event.target.querySelector('.module-hero')){
                self.moduleHero();
            }else if(event.target.querySelector('.tabbed-product-carousel')){
                self.productsCarousel();
            }else if(event.target.querySelector('.hotspots-module')){
                self.hotSpotsModule();
            }else if(event.target.querySelector('.split-image-content-module')){
                self.splitContentModule();
            }

        });
    }

    animateElementsbyAOS() {
        AOS.init({
            offset: 0,
            duration: 300,
            easing: 'linear',
        });
    }

    bodyClassCtl(e) {
        // Please prevent operation on more then one drawer at the same time
        const { type } = e;

        if (type === 'drawer-opt') {
            this.$body.toggleClass('drawer-opt');
            this.$body.toggleClass('show-overlay');
        } else {
            if (type === 'menu-opt-in') {
                this.$body.addClass('show-overlay');
            } else if (type === 'menu-opt-out') {
                this.$body.removeClass('show-overlay');
            }
        }
    }

    async initCookieBanner() {
        if ($('.cookie-banner').length) {
            const { default: OneCookieBanner } = await import(
                'Modules/OneCookieBanner'
            );
            GlobalObj.cookieBanner = new OneCookieBanner({
                $el: $('.cookie-banner'),
            });
        }
    }

    initNavi() {
        const self = this;
        this.$rawNav = this.$navi;

        const $slideInMenu = $('<div class="slide-in-menu"></div>');
        const $clonedNavi = this.$navi.clone();

        const $hasDropdown = this.$rawNav.find('.has-dropdown');
        for (let child of $hasDropdown) {
            const $child = $(child);
            const $dropdown = $child.find('.dropdown');

            // $dropdown.find('.lv2-image').remove();

            if (this.useSlideInMenuForLevel2) {
                $dropdown.appendTo($slideInMenu);
                $child.find('.dropdown').remove();
            } else {
                // $dropdown.appendTo($child);
                // $child.find('.dropdown-wrapper').remove();
                // $child.find('.nav-link').removeAttr('data-trigger');
                // $child.addClass('expandable');
            }
        }
        
        if (this.useSlideInMenuForLevel2) {
            $slideInMenu.appendTo($clonedNavi);
        }
        this.$mobileNav.find('.header-utilities').before($clonedNavi);

        // Logic to toggle desktop menu
        const $desktopMenuToggle = this.$header.find('.block-mobile-nav button');
        const $desktopMenu = this.$header.find('#shopify-section-navigation');

        $desktopMenuToggle.on('click', function(e){
            if(!GlobalObj.utilities.isMobile()){
                if(!$(e.currentTarget).hasClass('is-active')){
                    self.$body.addClass('desktop-menu-opened')
                    $desktopMenuToggle.addClass('is-active');
                    $desktopMenu.addClass('opened');
                }else{
                    self.$body.removeClass('desktop-menu-opened');
                    $desktopMenuToggle.removeClass('is-active')
                    $desktopMenu.removeClass('opened');
                }
            }
        });
    }

    initUtilities() {
        const self = this;

        // Header dropdown hover control (Larger screen)
        this.$header.hoverIntent({
            over: function () {
                // if (!GlobalObj.utilities.isMobile()) {
                    $(this).addClass('active');

                    if (self.miniCartTimer) {
                        // Check if minicart close timer exists, if so kill it.
                        console.log('kill timer');
                        clearTimeout(self.miniCartTimer);
                        self.miniCartTimer = null;
                    }
                // }
            },
            out: function () {
                // if (!GlobalObj.utilities.isMobile()) {
                    $(this).removeClass('active');
                // }
            },
            sensitivity: 100,
            selector: '.has-dropdown:not(.block-search)',
        });
    }

    initSearch() {
        const self = this;

        self.searchCtl = new OneDrawer({
            drawerElem: '#' + self.$searchBar.attr('id'),
            triggerEvent: 'click',
            triggerElem: 'header .search-toggle',
            openCallback: function () {
                // $('.block-search').addClass('active');
                $('body').addClass('search-open');
                setTimeout(function () {
                    self.$searchBar.find('input').focus();
                }, 100);
            },
            closeCallback: function () {
                // $('.block-search').removeClass('active');
                $('body').removeClass('search-open');
            },
            events: {
                'click .search-form button': function (e) {
                    console.log('click in search form');
                    e.preventDefault();
                    var $form = $(e.currentTarget).parent('form');

                    if ($form.find('input').val()) {
                        this.closeDrawer();
                        $form.submit();
                    } else {
                        // May be show error message ...
                    }
                },
            },
        });

        if(document.querySelector('.predictive-search')){
            this.predictiveSearch();            
        }

        this.$mobileNav.on('click', '.search-form .icon-close', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const $close = $(this);

            $close.siblings('#SearchMobile').val('').blur();
            $close.hide();
        });

        // Hide/show clear button on mobile search input
        this.$mobileNav.find('#SearchMobile').on('input', function () {
            const $el = $(this);
            const $iconClose = $el.siblings('.icon-close');

            if ($el.val().length) {
                $iconClose.css('display', 'flex');
            } else {
                $iconClose.css('display', 'none');
            }
        });
    }

    initMobileMenu() {
        const self = this;

        // if (GlobalObj.utilities.isMobile()) {
            this.mobileMenuCtl = new OneDrawer({
                drawerElem: '#' + self.$mobileNav.attr('id'),
                triggerEvent: 'click',
                triggerElem: 'header .menu-toggle',
                openCallback: function () {
                    self.$body.addClass('slide-menu-opened');
                    self.$menuToggle.addClass('is-active');
                },
                closeCallback: () => {
                    this.$menuToggle.removeClass('is-active');
                    self.$body.removeClass('slide-menu-opened');
                    this.$mobileNav.find('.expandable.active').each(function () {
                        $(this).children('.nav-link').click();
                    });
                },
            });
        // }

        this.mobileInnerMenuCtl = new OneMobileMenu({
            $el: self.$mobileNav,
            openCallback: () => {
                //console.log('add inner-action-engaged')
                //self.$mobileNav.addClass('inner-action-engaged');
                this.$menuToggle
                    .find('.animated-hamburger')
                    .addClass('inner-action-engaged');
            },
            closeCallback: (e) => {
                //console.log('remove inner-action-engaged');
                //self.$mobileNav.removeClass('inner-action-engaged');
                this.$menuToggle
                    .find('.animated-hamburger')
                    .removeClass('inner-action-engaged');
            },
        });
    }

    initMiniCart() {
        const self = this;
        const miniCartDrawerInit = function () {
            console.log('init minicart as drawer');
            return new OneDrawer({
                drawerElem: '#' + self.$miniCart.attr('id'),
                triggerEvent: 'click',
                triggerElem: 'header .block-minicart',
                openCallback: function () {
                    ajaxCart.load();
                },
            });
        };
        
        const miniCartDropdownOpen = function(){
            self.$body.trigger('menu-opt-in');
            self.$header.find('.block-minicart').addClass('active');
        }
        const miniCartDropdownClose = function(){
            self.$header.find('.block-minicart').removeClass('active');
            self.$body.trigger('menu-opt-out');
        }

        this.miniCartCtl = miniCartDrawerInit();

        ajaxCart.init({
            formSelector: '.add-to-cart-form',
            addToCartSelector: '.add-to-cart-btn',
            cartContainer: '.minicart-container',
            cartCountSelector: '.minicart-count',
            cartCostSelector: '#CartCost',
            moneyFormat: theme.moneyFormat,
        });

        if (self.miniCartAsDropdown) {
            // Init minicart as Dropdown on Desktop
            ajaxCart.load();

            GlobalObj.utilities.mediaCheck(
                function () {
                    if (self.miniCartCtl) {
                        console.log('minicart drawer destory');
                        self.miniCartCtl.destroy();
                        self.miniCartCtl = false;
                    }
                },
                function () {
                    if (!self.miniCartCtl) {
                        self.miniCartCtl = miniCartDrawerInit();
                    }
                }
            );
        }

        // $(document).on('afterAddToCart.ajaxCart', function(evt, cart) {
        //     console.log('afterAddToCart.ajaxCart with jQuery', this.miniCartCtl);
        //     // this.miniCartCtl.openDrawer();

        //     if (this.miniCartCtl) {
        //         this.miniCartCtl.openDrawer();
        //         self.miniCartTimer = setTimeout(function(){ this.miniCartCtl.closeDrawer(); }, 3000);
        //     } else {
        //         miniCartDropdownOpen();
        //         self.miniCartTimer = setTimeout(function(){ miniCartDropdownClose(); }, 3000);
        //     }
        // });

        document.body.addEventListener('afterAddToCart.ajaxCart', (evt, cart) => {
            const self = this;
            console.log('afterAddToCart.ajaxCart with JS', cart);
            // this.miniCartCtl.openDrawer();

            if (this.miniCartCtl) {
                this.miniCartCtl.openDrawer();
                self.miniCartTimer = setTimeout(function(){ self.miniCartCtl.closeDrawer(); }, 6000);
            } else {
                miniCartDropdownOpen();
                self.miniCartTimer = setTimeout(function(){ miniCartDropdownClose(); }, 6000);
            }
        });

        document.body.addEventListener('adjustCartCallback.ajaxCart', (evt, cart) => {
            const self = this;
            console.log('adjustCartCallback.ajaxCart with JS', cart);
        });

        $(document).on('click', '#MiniCart .close-drawer', function(e){
            $('#MiniCart .drawer-close').trigger('click')
        });

    }

    async initSubscribe() {
        if ($('.subscribe-modal').length) {
            const { default: OneSubscribe } = await import(
                'Modules/OneSubscribe'
            );
            GlobalObj.subscribeModal = new OneSubscribe({
                $el: $('.subscribe-modal'),
            });
        }
    }

    async initLocationModal(){
        const self = this;
        const validatedLocaleStorageVar = 'validatedLocale';
        const validatedLocale = sessionStorage.getItem(validatedLocaleStorageVar);
        const allowedCountries = GlobalObj.redirectPopUp.allowed_countries.split(',');
        const popup_title = GlobalObj.redirectPopUp.title;
        const popup_info = GlobalObj.redirectPopUp.info;
        const popup_btn_continue = GlobalObj.redirectPopUp.btn_continue;
        const popup_btn_redirect = GlobalObj.redirectPopUp.btn_redirect;

        const isAdmin = Shopify?.designMode || $('#admin-bar-iframe').length > 0 || $('#preview-bar-iframe').length > 0 || $('shopify-editor').length > 0 || $('#OnlineStoreEditorShopifyGlobalData').length > 0 || $('#OnlineStoreEditorData').length > 0;

        // console.log('initLocationModal');
        // console.log($('#admin-bar-iframe').length > 0 );
        // console.log($('#preview-bar-iframe').length > 0 );
        // console.log($('shopify-editor').length > 0 );
        // console.log($('#OnlineStoreEditorShopifyGlobalData').length > 0);
        // console.log($('#OnlineStoreEditorData').length > 0);
        // console.log('isAdmin', isAdmin);

        const redirectClose = function(sessionCountryName){
            $(document).on('click', '.redirect-modal .drawer-close, .redirect-modal .continue', function(e){
                console.log('redirectClose');
                sessionStorage.setItem( validatedLocaleStorageVar , sessionCountryName );
                $('body').removeClass('redirect-modal-open');
                self.redirectModal.closeDrawer()
            })
        }

        const redirectPopUp = function(destinationURL, currentCountry){
            console.log(`show the popup, user navigating from ${currentCountry}, redirect to: ${destinationURL}`);

            const fullRedirectUrl = destinationURL + location.pathname + `?utm_source=${location.hostname}&utm_campaign=site_redirect&utm_medium=site_redirect`;

            redirectClose(currentCountry);

            //Mod to activate modal only under mouse and touch start event (user actions)
            $(document).on('scroll touchstart mouseenter mousemove', function(){
                if(!$('body').hasClass('redirect-modal-open') && !isAdmin && !sessionStorage.getItem(validatedLocaleStorageVar)){
                    self.redirectModal = new OneDrawer({
                        drawerContent: `
                        <div class="module module-heading">
                            <div class="module-intro">
                                <div class="headlines-wrap">
                                    <h2 class="headline">${popup_title}</h2>
                                    <div class="caption">${popup_info.replace('{country_name}', currentCountry )}</div>
                                    <div class="actions">
                                        <a href="${fullRedirectUrl}" class="cta-outline redirect" role="button">${popup_btn_redirect}</a>
                                        <a href="#" class="cta-2 continue" role="button">${popup_btn_continue}</a>
                                    </div>
                                </div>
                            </div>
                        </div>`,
                        drawerModalId: 'redirectModal',
                        drawerModalClasses: 'redirect-modal',
                        dontCloseWhenClickOutside: true,
                        initCallback: function () {
                            console.log('do something after init');                            
                            $('body').addClass('redirect-modal-open');
                            this.$currentModal = this;
                            this.$currentModal.openDrawer();
                        },
                        openCallback: function () {
                            // setTimeout(function () {
                            //     console.log('redirect users to another country => '+ destinationURL + location.pathname)
                            //     window.location.href = destinationURL + location.pathname;
                            // }, 3000);
                        }
                    });
                }
            })
        }

        // Validate if user agent is a search bot
        const botPattern = "(googlebot\/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)";

        const re = new RegExp(botPattern, 'i');
        const userAgent = navigator.userAgent;
        
        if((validatedLocale || allowedCountries.includes( validatedLocale ) )|| re.test(userAgent) || isAdmin ){
            // Do nothing
        }else{
            await $.getJSON("https://www.maaji.co/browsing_context_suggestions.json", function(data) {
                console.log('Data geo', data);
                const sessionCountry = data.detected_values.country.handle;
                const sessionCountryName = data.detected_values.country_name;

                if( allowedCountries.includes( sessionCountry ) ){
                    console.log('Navigation allowed', sessionCountry);
                    sessionStorage.setItem( validatedLocaleStorageVar , sessionCountryName );
                }else if( sessionCountry == "CO"){
                    console.log('Session from Colombia, re direct to local site');
                    redirectPopUp("https://co.maaji.co", sessionCountryName);
                }else{
                    console.log('Navigation Not allowed, display message and redirect');
                    redirectPopUp("https://maaji.co", sessionCountryName);
                }

            });
        }
    }

    async initCountdownBanner() {
        const self = this;
        let countdownInProgress = false;

        const { default: countdown } = await import(
            'Lib/countdown.js'
        );

        self.$headerCountdown = self.$body.find('.header-countdown');
        console.log('init header countdown banner');

        let target = $('.countdown-timer');
        let from_time = ' 00:00:00';
        let to_time = ' 23:59:59';

        target.each(function (i, e) {
            console.log('target:', $(this).attr('id'));
            var singleCountdown = $(this);
            if (singleCountdown) {
                if (
                    singleCountdown.data('date_from') &&
                    singleCountdown.data('date_to')
                ) {
                    if (singleCountdown.data('date_from').indexOf(':') > -1) {
                        from_time = '';
                    }
                    if (singleCountdown.data('date_to').indexOf(':') > -1) {
                        to_time = '';
                    }
                    createCountdownTimer(
                        singleCountdown,
                        singleCountdown.data('date_from') + from_time,
                        singleCountdown.data('date_to') + to_time
                    );
                } else {
                    console.log(
                        'From date and to date are required to create countdown timer'
                    );
                }
            } else {
                console.log('Target element for countdown timer not found');
            }
        });

        if (self.$headerCountdown.length > 0) {
            // if(self.$body.hasClass('template-index')){
            self.$body.addClass('header-countdown-active');
            self.$headerCountdown.addClass('activate');
            // }
        }

        function createCountdownTimer(target, date_from_str, date_to_str) {
            if (countdownInProgress) {
                console.log('Countdown is already in progress...');
                return false;
            }

            date_from_str = date_from_str.replace(/-/g, '/');
            date_to_str = date_to_str.replace(/-/g, '/');

            let now = new Date();
            now.toLocaleString('en-US', { timeZone: 'America/New_York' });
            let start = new Date(date_from_str);
            start.toLocaleString('en-US', { timeZone: 'America/New_York' });

            let diffStart = now - start;
            if (diffStart < 0) {
                console.log('Sale has not started yet');
                return false;
            }

            let end = new Date(date_to_str);
            end.toLocaleString('en-US', { timeZone: 'America/New_York' });
            let diffEnd = end - now;

            if (diffEnd < 0) {
                console.log('Sale has ended');
                return false;
            }

            // parent is hidden by default if it contains a countdown timer
            let parent = target.parent();
            // parent.show();

            function createCountdownHTML(ts, target) {
                // target.innerHTML = '';
                target.empty();

                let elms = [];
                let measurements = ['days', 'hours', 'minutes', 'seconds'];
                for (let m of measurements) {
                    if (ts.hasOwnProperty(m)) {
                        var timeNumElm = document.createElement('span');
                        timeNumElm.classList.add('time-num');
                        timeNumElm.textContent =
                            ts[m] > 9 ? ts[m] : '0' + ts[m];

                        var timeLabelElm = document.createElement('span');
                        timeLabelElm.classList.add('time-label');

                        m = m.replace('minutes', 'mins').replace('seconds', 'secs').replace('minute', 'min').replace('second', 'sec')

                        timeLabelElm.textContent = m;

                        elms.push(timeNumElm);
                        elms.push(timeLabelElm);

                        // console.log(timeNumElm, timeLabelElm);

                        target.append(timeNumElm);
                        target.append(timeLabelElm);
                    }
                }
                return elms;
            }

            // var timerId = countdown(moment(date_to_str + " 00:00:00 EST"), function(ts){ createCountdownHTML(ts, target); });
            var timerId = countdown(end, function (ts) {
                createCountdownHTML(ts, target);
            });

            if (timerId) {
                countdownInProgress = true;
            }
            // window.clearInterval(timerId);
        }//createCountdownTimer
    }

    initFooter() {
        var self = this;
        $('footer.site-footer .footer-menu .footer-block-title').click(function (e) {
            // if (GlobalObj.utilities.isMobile()) {
                var $curr = $(e.currentTarget).parent();
                var $activeSiblings = $curr.siblings('.footer-menu.opened');
                if ($activeSiblings.length) {
                    $activeSiblings.removeClass('opened');
                }
                $curr.toggleClass('opened');
            // }
        });
    }

    initPromoModalPopup() {
        console.log('init promo modal popup');

        // TODO: hide if 'subscribed cookie' for this promo is set - see yesmail? hide for a while if user declines?

        const $modalPopup = $('#promo-modal-popup');
        const $modalPopupCloseButton = $modalPopup.find('.close-modal-popup');
        const $showYesmailSubscribeFormButton = $modalPopup.find(
            '.show-yesmail-signup'
        );
        const $yesmailSubscribeForm = $modalPopup.find(
            '.yesmail-subscribe-wrapper'
        );
        const $initCTAButtons = $modalPopup.find('.init-cta');

        $showYesmailSubscribeFormButton.on('click', function () {
            $initCTAButtons.toggle();
            $yesmailSubscribeForm.toggle();
        });

        $modalPopupCloseButton.on('click', function (e) {
            $modalPopup.fadeOut(1000);
        });

        var seconds = 0;

        if ($modalPopup.data('display_after')) {
            let s = $modalPopup.data('display_after') * 1;
            if (Number.isInteger(s)) {
                if (s > 0) {
                    seconds = s;
                }
            }
        }

        window.setTimeout(
            function ($elm) {
                $elm.removeClass('inactive');
            },
            seconds * 1000,
            $modalPopup
        );
        return true;
    }

    productsCarousel(){
        const $productSlider = this.$body.find('.products-carousel .collection-products.slick-carousel');

        $productSlider.each(function () {
            let slidesToShowLarge = 4;
            if( !$(this).hasClass('slick-initialized') ){
                $(this).slick({
                    infinite: true,
                    speed: 600,
                    centerPadding: '20px',
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    arrows: true,
                    dots: true,
                    responsive: [
                        {
                            breakpoint: GlobalObj.responsiveSizes.medium,
                            settings: "unslick",
                        }
                    ],
                });
            }
        });

        const $featuredProductsCarousel = this.$body.find('.module-split-with-products .featured-products:not(products-1)');

        $featuredProductsCarousel.each(function(e){
            if($(this).parents('.module-split-with-products').hasClass('format-slick-carousel')){
                $(this).slick({
                    dots: false,
                    infinite: true,
                    speed: 600,
                    centerMode: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    mobileFirst: true,
                    responsive: [
                        {
                            breakpoint: GlobalObj.responsiveSizes.medium,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            },
                        }
                    ],
                });
            }else if( !$(this).hasClass('slick-initialized') ){
                $(this).slick({
                    dots: true,
                    infinite: true,
                    speed: 600,
                    centerMode: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    mobileFirst: true,
                    responsive: [
                        {
                            breakpoint: GlobalObj.responsiveSizes.medium,
                            settings: "unslick",
                        }
                    ],
                });
            }
        });
       
    }

    initTabs() {
        console.log('initTabs');
        new TabbedContent({ $el: this.$body.find('.tabbed-product-carousel') });
    }

    /*
     * Check input on blur/input, if not empty add active class
     */
    inputSetup() {
        const activeClass = 'active';
        const $selector = this.$body.find(
            'textarea, input:not([type="checkbox"]):not([type="radio"])'
        );
        const handler = function () {
            const $el = $(this);

            if ($el.val().length) {
                $el.addClass(activeClass);
            } else {
                $el.removeClass(activeClass);
            }
        };

        $selector.each(function () {
            handler.call(this);
        });

        $selector.on('blur', handler).on('input', handler);
    }

    selectSetup() {
        new CustomDropDown(this.$body);
    }

    toTopBar() {
        const toTopBarElement = document.querySelectorAll('.to-top-btn, .to-top-bar');

        if(toTopBarElement){
            toTopBarElement.forEach(element => {          
                // Add a click event listener to the element.
                element.addEventListener('click', () => {
                    // Scroll to the top of the page.
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        }
    }

    localeSelector() {

        this.$localeSelectors = this.$body.find('.multi-selectors__item');

        this.$localeSelectors.find('.disclosure__toggle').on('click', function(e){
           
            $(e.currentTarget).parents('.multi-selectors__item').siblings().removeClass('opened');
            $(e.currentTarget).parents('.multi-selectors__item').toggleClass('opened');

            $(e.currentTarget).parents('.multi-selectors__item').hasClass('opened')? $(e.currentTarget).attr('aria-expanded', true) : $(e.currentTarget).attr('aria-expanded', false)
            
        })

        //Check if Weglot is available to do the site translation
        this.$localeSelectors.find('.disclosure-list__option:not([aria-current])').on('click', function(e){
            const selectedSelector = $(e.currentTarget);
            e.preventDefault();
            
            const newvalue = selectedSelector.attr('data-value');
            console.log('new value', newvalue)
            selectedSelector.parents('.multi-selectors__item').find('[data-disclosure-input]').val(newvalue)

            if (window.Weglot?.initialized && selectedSelector.parents('.multi-selectors__item').hasClass('language-selector')) {

                Weglot.switchTo( newvalue );
                setTimeout(function(){
                    selectedSelector.parents('form').trigger('submit');
                },1000)                
                    
            }else{
                selectedSelector.parents('form').trigger('submit');
            }
        })

    }//localeSelector

    async predictiveSearch(){
        const { default: PredictiveSearch } = await import(
            'Modules/predictiveSearch'
        );

        new PredictiveSearch( {
            $el: this.$body
        } )

    }//predictiveSearch

    async initVideos() {
        const $videos = this.$body.find('.video-box');

        if ($videos?.length) {
            const { default: OneVideo } = await import(
                'Modules/OneVideo'
            );

            new OneVideo({
                $el: $videos,
                // isResponsive: false,
                bgVideo: true,
                autoplay: true,
            });
        }
    }

    moduleHero() {
        this.$moduleImageModule = this.$body.find('.module-hero');
        if (this.$moduleImageModule.length > 0) {
            const $wrapper = this.$moduleImageModule;
            const $videos = $wrapper.find('.video-box');
            const $slides = $wrapper.find('.slides-wrapper');

            console.log('$slides', $slides);

            if ($slides?.length > 1 && $slides.hasClass('slick')) {
                $slides.slick({
                    dots: true,
                    infinite: true,
                    autoplay: $slides.attr('data-speed') == 0 ? false : true,
                    autoplaySpeed: $slides.attr('data-speed') || 3000,
                    speed: 600,
                    slidesToShow: 1,
                    arrows: !$slides.hasClass('hide-arrows') ?? true,
                });
            }
        }
    }

    hotSpotsModule(){
        const self = this;
        this.$hotspotsModules = this.$body.find('.hotspots-module .hotspots-products');
    
        this.$hotspotsModules.each(function () {
            if( !$(this).hasClass('slick-initialized') ){
                $(this).slick({
                    infinite: true,
                    speed: 600,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    arrows: true,
                    dots: true
                });
            }
        });

        $('.hotspots-button').on('click', function(e){
            e.preventDefault();
            let $spotsSlider = $(e.currentTarget).parents('.hotspots-wrapper').find('.hotspots-products');
            let $selectedSpotIndex = parseInt($(e.currentTarget).attr('data-button') - 1);

            self.$hotspotsModules.slick('slickGoTo', $selectedSpotIndex);
        })

    }//hotSpotsModule

    splitContentModule(){
        const $splitContentModule = this.$body.find('.split-image-content-module.as-slider');

        $splitContentModule.each(function () {
            if(!$(this).hasClass('slick-initialized')){
                $(this).slick({
                    infinite: true,
                    speed: 600,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: false,
                    arrows: true,
                    dots: true
                });
            }
        });
    }

    limeSpotOverrides(){
        function borrarNombreLS(){
            //setTimeout(() => {
            let nameProduct = document.querySelectorAll('.ls-title');
            //console.log('Titulos' + ' ' + nameProduct[0].innerHTML);;
            nameProduct.forEach(el => {
                if(el.innerHTML.includes('MAAJI')){
                    el.innerHTML = el.innerHTML.slice(6);
                }else if(el.innerHTML.includes('Maaji')){
                    el.innerHTML = el.innerHTML.slice(6);
                }
            })
            //}, 1000);
        };
        //borrarNombreLS();
        
        var bubble1 = document.querySelector('#MainContent');
        new MutationObserver(() => {
            borrarNombreLS();
        }).observe(bubble1, { subtree: true, childList: true })
    }
    removeHoverProductsOnMobile(){
        if(GlobalObj.utilities.isMobile()){
            console.log('Es mobile')
            document.querySelectorAll('.product-image-wrapper.with-hover').forEach((a)=>{a.classList.remove('with-hover')})
        }
    }

}