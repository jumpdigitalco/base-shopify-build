/*
    Filter and Sorter HTML structure
    <div class="collection-nav-block">
        <div class="nav-title">[title]</div>
        <div class="nav-content">
            <div class="nav-list-container">
                [drop down content]
            </div>
        </div>
    </div>
*/

import $ from 'jquery';
import OneDrawer from 'Modules/OneDrawer';
import TabbedContent from 'Modules/TabbedContent';
import Accordion from 'Modules/Accordion';
import LazyLoad from 'vanilla-lazyload';

import 'scrolltofixed';

export default class CollectionNavView {
    constructor({ $el }) {
        this.$collection = $el;
        this.$sorter = this.$collection.find('.collection-nav-block.sorting');
        this.$filter = this.$collection.find(
            '.collection-nav-block:not(.sorting)'
        );
        this.$category = this.$collection.find(
            '.collection-nav-block.category'
        );
        this.$mode = this.$collection.find('.collection-nav-block.mode');
        this.$body = $('body');
        this.$header = $('header.site-header');
        this.$footer = $('footer.site-footer');
        this.layout = this.$collection.data('layout');
        this.queryParams = Shopify.queryParams;
        this.$filterForms = $(document).find('.collection-nav-block.filters #filters-form');

        this.filters = {
            filter: '',
            search: '',
            filterData: [],
            forms: [],
            searchParamsInitial: window.location.search.slice(1),
            searchParamsPrev: window.location.search.slice(1)
        };

        this.lazyLoad = new LazyLoad({
            elements_selector: '[data-bg], img, picture',
        });

        console.log('this.filters', this.filters);

        this.navDropdown();
        this.modeSwitcher();
        // this.fixNav(); // replaced with position:sticky
        this.prepareParams();
        this.initSorting();
        this.initFiltering();
        // this.initCategories();
        this.initSearchCategories();
    }

    navDropdown() {
        /*
            The goal here is to use one dropdown handle for both PLP (one-column, two columns)
            layouts on both large and smaller screen.
            Handling total 4 situations.
            */
        const navDropdownCtl = function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('navDropdownCtl:', e);

            const $curr = $(e.currentTarget).parent();
            let $currentOpened;

            if (this.layout === 'one-column' && !GlobalObj.utilities.isMobile()) {
                $currentOpened = this.$collection
                    .find('.nav-dropdown.opened')
                    .not($curr);
            } else if (GlobalObj.utilities.isMobile()) {
                $currentOpened = this.$collection
                    .find('.collection-nav .opened')
                    .not($curr);
            } else {
                $('body, html').animate({
                    scrollTop: $curr.offset().top - 150,
                });
                $currentOpened = $curr.siblings('.opened');
            }

            $('.filter.opened').removeClass('opened');
            $currentOpened.removeClass('opened');
            console.log('$curr:', $curr);

            $curr.toggleClass('opened');
            this.$collection.find('.filter').removeAttr('open');

            if (
                GlobalObj.utilities.isMobile() &&
                $curr.hasClass('opened') &&
                !this.$body.hasClass('show-overlay')
            ) {
                this.$body.addClass('show-overlay collection-nav-opened');
            }else if(GlobalObj.utilities.isMobile()){
                this.closeDropdowns();
            }
        };

        $('.nav-title').click(navDropdownCtl.bind(this));
        // $('.filter-title').click(navDropdownCtl.bind(this));
        $('.collection-nav-block-close,.close-apply').click( function(){
            $('.collection-nav-block.filters .nav-title.nav-dropdown-title').trigger('click')
        } );

        // Click outside to close
        $(window).on('click', (e) => {
            const $target = $(e.target);
            const parentClass = 'nav-content';

            if (
                !$target.hasClass('filter-close') &&
                ($target.hasClass(parentClass) ||
                    $target.parents(`.${parentClass}`).length)
            ) {
                return;
            }
            this.closeDropdowns();
        });
    }

    fixNav() {
        // Consider improve the logic below
        // Consider better mobile fixed nav interaction with dynamic header interactions.
        const initScrollFix = () => {
            // Deactive current fixed nav
            if (this.$activeFixedNav) {
                this.$activeFixedNav.trigger('detach.ScrollToFixed');
            }

            this.$activeFixedNav = this.$collection.find(
                '.collection-nav'
            );

            // Fix it
            if (this.$activeFixedNav) {
                const self = this;

                // this.$activeFixedNav.scrollToFixed({
                //     zIndex: 1004,
                //     marginTop: function () {
                //         const promoBannerHeight = $('.promo-banner').length ? $('.promo-banner').outerHeight() : 0;
                        
                //             return $('header.site-header').outerHeight();
                //     },
                //     removeOffsets: true,
                //     dontSetWidth: true,
                //     limit: function () {
                //         return self.$footer.offset().top - $(this).height();
                //     },
                // });
            }
        };

        GlobalObj.utilities.mediaCheck(initScrollFix, initScrollFix);

        $(window).scroll((event) => {
            if (this.$activeFixedNav) {
                this.$activeFixedNav.removeClass('scroll-up');
                if (
                    GlobalObj.utilities.isMobile() &&
                    $('header.site-header').hasClass('scroll-up')
                ) {
                    this.$activeFixedNav.addClass('scroll-up');
                }
            }
        });
    }

    modeSwitcher() {
        // $('.mode .mode-switcher:not(.active)').click((e) => {
        $('.collection-nav-block.view-mode .view-size .layout').click((e) => {
            const $curr = $(e.currentTarget);
            const $currentActive = $curr.siblings('.layout');

            // console.log('click on layout changer', $curr.data('link'));

            $currentActive.removeClass('active');

            this.$collection.hide();
            this.$collection
                .removeClass( 'small large' )
                .addClass($curr.data('link'));
            this.$collection.fadeIn(300);

            $curr.addClass('active');
            this.closeDropdowns();
        });

        $('.collection-nav-block.view-mode .view-type .layout').click((e) => {
            const $curr = $(e.currentTarget);
            const $currentActive = $curr.siblings('.layout');

            // console.log('click on layout changer', $curr.data('link'));

            $currentActive.removeClass('active');

            this.$collection.hide();
            this.$collection
                .removeClass( 'default alternate' )
                .addClass($curr.data('link'));
            this.$collection.fadeIn(300);

            $curr.addClass('active');
            this.closeDropdowns();
        });
    }

    initSorting() {
        $('.collection-nav-block.sorting .filter').click((e) => {
            e.preventDefault();
            const $curr = $(e.currentTarget),
                sortVal = $curr.data('link');

            if (
                (Shopify.queryParams.sort_by &&
                    Shopify.queryParams.sort_by === sortVal) ||
                sortVal === ''
            ) {
                // Remove current sort
                delete Shopify.queryParams.sort_by;
            } else {
                $curr
                    .addClass('active')
                    .siblings('.filter')
                    .removeClass('active');
                Shopify.queryParams.sort_by = $curr.data('link');
            }

            // location.search = $.param(Shopify.queryParams);
            this.onSubmitHandler(event);
        });

        // Active Status
        let $selected;
        if (Shopify.queryParams.sort_by) {
            $selected = this.$sorter.find(
                `[data-link="${Shopify.queryParams.sort_by}"]`
            );
        } else if( this.$sorter.find(`.active`).length > 0 ){
            $selected = this.$sorter.find(`.active`);
        } else {
            $selected = this.$sorter.find(`[data-link="manual"]`);
        }

        this.$sorter
            .find('.filter-title')
            .find('.current-sort')
            .html(` ${$selected.children('span').html()}`);

        $selected.addClass('active');
    }

    initCategories() {
        console.log('INIT CATEGORIES');
        const drawer = '#banner-nav-drawer';
        new OneDrawer({
            drawerElem: drawer,
            triggerEvent: 'click',
            triggerElem: '.collection-banner',
            dontShowOverlay: true,
            openCallback: () =>
                GlobalObj.utilities.isMobile() && this.$body.trigger('drawer-opt'),
        });

        Accordion(
            $(
                `${drawer} .category-item.expandable.top > .category-accordion-title`
            ),
            'category-item'
        );
    }

    initSearchCategories() {
        const $el = $('.tabbed-module');
        const $collectionEl = $('.collection-products.items');
        const $tabbedModule = $('.tabbed-module');
        const $emptyResults = $(
            '<p style="width: 100%; margin: 20px 0 50px; text-align: center; display: none;">No Results</p>'
        );
        const $collectionNavTools = this.$collection.find(
            '.collection-nav.tools'
        );
        const showClass = 'show-result';
        const hideItems = () =>
            $collectionEl.find('.search-item').removeClass(showClass);
        const queryRegExp = /(|&)tab_filter=[a-z]*($|&)/i;

        if (!$el.length) return;

        $collectionEl.append($emptyResults);

        hideItems();

        const toggleProductNavTools = (show) => {
            if (show) {
                $collectionNavTools.show();
                $collectionNavTools.css('display', 'flex');
            } else {
                $collectionNavTools.hide();
            }
        };

        const updateResultCount = () => {
            $tabbedModule
                .find('.tabbed-title-wrap .tabbed-title')
                .each(function () {
                    const resultCount = $(
                        `.object-type-${$(this).data('target')}`
                    ).length;

                    $(this).find('.result-count').html(resultCount);
                });
        };

        /**
         *
         * parseQueryParam
         * @param String path: url to parse
         * @return String endPath: parse url with replaced tab_filter query param
         *
         */
        const parseQueryParam = (path, target) => {
            const splitPath = path.split('/');
            if (!splitPath.length) return path;

            let endPath = splitPath[splitPath.length - 1];
            if (queryRegExp.test(endPath))
                endPath = endPath.replace(queryRegExp, '');

            return `${endPath}${
                path.includes('?') ? '&' : '?'
            }`;//tab_filter=${target}
        };

        /**
         *
         * @param String target: Current tab
         *
         * Adds tab_filter query param to url on tab click
         *
         */
        const pushHistory = (target) => {
            const endPath = parseQueryParam(window.location.href, target);
            window.history.pushState({}, '', endPath);
        };

        const filter = function (target) {
            const $module = $(this).closest('.tabbed-module');
            console.log('parent: ', $module, $module.data('no-persist'));

            if ($module.data('no-persist')) return;

            hideItems();

            const items = $collectionEl.find(`.object-type-${target}`);
            if (items.length) {
                items.addClass(showClass);
                $emptyResults.hide();

                $('.collection-pagination .page a').each(function () {
                    const endPath = parseQueryParam(
                        $(this).attr('href'),
                        target
                    );
                    $(this).attr('href', `/${endPath}`);
                });

                toggleProductNavTools(target === 'product');
            } else {
                $emptyResults.show();
            }

            pushHistory(target);
            updateResultCount();
        };

        const onTabSelect = function () {
            const target = $(this).data('target');
            filter.call(this, target);
        };

        new TabbedContent({
            $el: this.$collection,
            onTabSelect,
        });

        // if query param, init with tab_filter
        const params = new URLSearchParams(
            document.location.search.substring(1)
        );
        const tabFilter = params.get('tab_filter');
        if (tabFilter) {
            $(`.tabbed-title[data-target="${tabFilter}"]`).click();
        }

        // init with currently active
        const $tabs = $el.find('.tabbed-title.active');

        if ($tabs.length) {
            const target = $tabs.first().data('target');
            console.log(`filter this: ${target}`);

            filter.call($('.tabbed-module'), target);
        }
    }

    ///--- Filter specific scripts
    prepareParams() {
        if (location.search.length) {
            for (
                var aKeyValue,
                    i = 0,
                    aCouples = location.search.substr(1).split('&');
                i < aCouples.length;
                i++
            ) {
                aKeyValue = aCouples[i].split('=');
                // console.log(aKeyValue);
                if (aKeyValue.length > 1) {
                    Shopify.queryParams[
                        decodeURIComponent(aKeyValue[0])
                    ] = decodeURIComponent(aKeyValue[1]);
                }
            }
        }

        // Clean the pagination
        delete Shopify.queryParams.page;
        delete Shopify.queryParams.showAll;

        if (!$.isEmptyObject(Shopify.queryParams)) {
            $('.collection-nav-block.clear-all').removeClass('hide');
            $('.clear-all.clear-all-sort').removeClass('hide');
        }
    }

    filter(e) {
        e.preventDefault();
        const $curr = $(e.currentTarget);
        const $filterParent = $curr.parents('.filter-wrapper');
        const $filterSelect = $filterParent.siblings('select');
        const filterVal = $curr.data('link');
        const filterSelectId = $filterSelect.prop('id')?.replace('-mobile', '');
        const filterIdString = `#${filterSelectId}, #${filterSelectId}-mobile`;
        const $filterSelects = $(filterIdString); // separate filters exist for desktop and mobile, but must be in sync

        /*
         * Ignore disabled filters
         */
        if ($curr.hasClass('disabled')) {
            return false;
        }

        /*
         * Unselect if active
         */
        if ($curr.hasClass('active')) {
            $curr.removeClass('active');
            $filterSelects.each(function () {
                $(this).val(null).change();
            });
        } else if (filterVal !== '') {
            /*
             * Valid filter
             */
            // Uneslect other active swatches in menu
            const $parentMenu = $curr.parents('.filter-swatches-wrapper');

            // Pseudo-click active swatches to toggle them off
            $parentMenu.find('.filter-swatch.active').each(function () {
                $(this).click();
            });

            $curr.addClass('active');
            $filterSelects.each(function () {
                $(this).val(filterVal).change();
            });
        } else {
            /*
             * Clear All button
             */
            if ($curr.hasClass('mobile-clear-all')) {
                // If found parent link for the fake collection filter, then go back to parent.
                if (this.parentCollectionLink) {
                    console.log('go back to :' + this.parentCollectionLink);
                    var newURL = this.parentCollectionLink;
                } else {
                    var newURL = '/collections/' + Shopify.collectionHandle;
                    var search = $.param(Shopify.queryParams);
                    if (search.length) {
                        newURL += '?' + search;
                    }
                }
                location.href = newURL;
            } else {
                const $parentMenu = $curr
                    .parent()
                    .siblings('.filter-swatches-wrapper');
                $parentMenu.find('.filter-swatch.active').each(function () {
                    $(this).click();
                });
                $curr.next('.filter-apply').click();
            }
        }
    }

    filterApply(e) {
        let newURL = `/collections/${Shopify.collectionHandle}/`;

        if (!Object.keys(this.filters).length) {
            // Close dropdown if no filters/search were selected
            return this.closeDropdowns();
        }

        if (this.filters.filter?.length) newURL += `${this.filters.filter}`;
        if (this.filters.search?.length) newURL += `?${this.filters.search}`;

        console.log('newURL', newURL);

        location.href = `${newURL}#product-collection`;
    }

    initFiltering() {

        Accordion(
            $(
                `.filter-title`
            ),
            'filter',
            'opened'
        );

        // Prepare the filters
        function debounce(fn, wait) {
            let t;
            return (...args) => {
              clearTimeout(t);
              t = setTimeout(() => fn.apply(this, args), wait);
            };
        }

        this.debouncedOnSubmit = debounce((event) => {
            // event.preventDefault();
            console.log('debouncedOnSubmit', event);
            this.onSubmitHandler(event);
        }, 500);

        this.$filterForms.on('click','.filter-price .facets__apply, input:not([type="number"])', this.debouncedOnSubmit.bind(this));

        // Build the fake 'Style' filter using main navigation, will be disabled for Phase 2
        this.navLinkFilters();

        // Show more toggle
        $(document).on('click','.button-show-more', (e)=> {
            $(e.currentTarget).parents('.filter-wrapper').toggleClass('showing-more');
        });

        const onHistoryChange = (event) => {
            console.log('onHistoryChange popstate', onHistoryChange);
            this.onSubmitHandler( event, false )
        }

        window.addEventListener('popstate', onHistoryChange);

    }//initFiltering

    onSubmitHandler( event, updateURLHash = true ){
        console.log('onSubmitHandler event:');
        const forms = [];

        //get the sort param and prepend it
        const $currentSort = $('.collection-nav-block.sorting .filter.active').data('link');
        forms.push(`sort_by=${$currentSort}`);

        this.$sorter.find('.current-sort')
            .html(`: ${$('.collection-nav-block.sorting .filter.active').text()}`);

        forms.push('filter.v.availability=1');

        $(document).find('.collection-nav-block.filters #filters-form').each((ind, form) => {
            forms.push(this.createSearchParams(form));
        })
        
        console.log('forms',forms)
        console.log('form params:', forms.join('&') );
        console.log(' this.filters',  this.filters);

        const searchParams = forms.join('&');
        const filterUrl = `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`;

        console.log('filterUrl', filterUrl);

        searchParams.length ? $('.clear-all-wrap').removeClass('hide') : $('.clear-all-wrap').addClass('hide');

        if (updateURLHash) history.pushState({ searchParams }, '', filterUrl);
        
        // Reload the page per each selection
        // window.location.reload()

        // Refresh content after each selection
        this.renderContent( filterUrl, event );
    }

    async renderContent(url, event){
        console.log('renderContent');
        console.log(' this.filters.filterData',  this.filters.filterData);
        //this.renderSectionFromFetch( url, event );

        this.$collection.addClass('content-loading');
        GlobalObj.isLoading = true;
        const filterDataUrl = element => element.url === url;

        if(this.filters.filterData.some(filterDataUrl) ){
            console.log('Bring it from cache');
            const html = this.filters.filterData.find(filterDataUrl).html;
            const parsedHtml = new DOMParser().parseFromString(html, 'text/html');

            this.$collection.find('#filters-form input[type="checkbox"]').removeAttr('disabled');
            this.$collection.find('#filters-form label.facet-checkbox--disabled').removeClass('facet-checkbox--disabled');
            this.$collection.find('#filters-form .disabled-filter').removeClass('disabled-filter');

            this.$collection.find('.collection-products').html( parsedHtml.querySelector('.collection-products').innerHTML );

            if(parsedHtml.querySelector('.collection-pagination')){
                this.$collection.find('.collection-pagination').html( parsedHtml.querySelector('.collection-pagination').innerHTML )
            }else{
                this.$collection.find('.collection-pagination').empty()
            }

            // Update filter titles
            let allFilterTitles = document.querySelectorAll('#filters-form summary.filter-title');
            parsedHtml.querySelectorAll('#filters-form summary.filter-title').forEach((element,index) => {
                // console.log('new filter title', element.innerHTML);
                allFilterTitles[index].innerHTML = element.innerHTML
            });

            // Update filter options
            parsedHtml.querySelectorAll('#filters-form label.facet-checkbox--disabled').forEach((element) => {
                document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"]` ).classList.add('facet-checkbox--disabled');
                document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"]` ).parentElement.classList.add('disabled-filter');
                document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"] input[type="checkbox"]` ).setAttribute('disabled', 'disabled')
            });

            // Update remove all - reset links
            let filterRemoveBtn = document.querySelectorAll('#filters-form facet-remove a[href]');
            parsedHtml.querySelectorAll('#filters-form facet-remove a[href]').forEach((element, index) => {
                filterRemoveBtn[index].setAttribute('href', element.getAttribute('href'))
            });

            // this.$collection.find('.filters-accordion.filters-wrapper').html( parsedHtml.querySelector('.filters-accordion.filters-wrapper').innerHTML );

            this.$body.trigger('lazyloadShouldUpdate');
            this.lazyLoad.update();
            this.quickBuyInit();
            this.$collection.removeClass('content-loading');
        }else{
            console.log('Fetch it');            

            try {
                const response = await fetch(url)
                .then(response => response.text())
                .then((responseText) => {
                    const html = responseText;
                    const parsedHtml = new DOMParser().parseFromString(html, 'text/html');

                    console.log('parsedHtml', parsedHtml)
    
                    this.filters.filterData = [... this.filters.filterData, { html, url }];
                    // FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
                    // FacetFiltersForm.renderFilters(html, event);

                    this.$collection.find('#filters-form input[type="checkbox"]').removeAttr('disabled');
                    this.$collection.find('#filters-form .disabled-filter').removeClass('disabled-filter');
                    this.$collection.find('#filters-form label.facet-checkbox--disabled').removeClass('facet-checkbox--disabled');

                    this.$collection.find('.collection-products').html( parsedHtml.querySelector('.collection-products').innerHTML )

                    //Update pagination options
                    if(parsedHtml.querySelector('.collection-pagination')){
                        this.$collection.find('.collection-pagination').html( parsedHtml.querySelector('.collection-pagination').innerHTML )
                    }else{
                        this.$collection.find('.collection-pagination').empty()
                    }

                    // Update filter titles
                    let allFilterTitles = document.querySelectorAll('#filters-form summary.filter-title');
                    parsedHtml.querySelectorAll('#filters-form summary.filter-title').forEach((element,index) => {
                        // console.log('new filter title', element.innerHTML);
                        allFilterTitles[index].innerHTML = element.innerHTML
                    });

                    // Update filter options
                    parsedHtml.querySelectorAll('#filters-form label.facet-checkbox--disabled').forEach((element) => {
                        document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"]` ).classList.add('facet-checkbox--disabled');
                        document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"]` ).parentElement.classList.add('disabled-filter');
                        document.querySelector( `#filters-form label[for="${element.getAttribute('for')}"] input[type="checkbox"]` ).setAttribute('disabled', 'disabled')
                    });

                    // Update remove all - reset links
                    let filterRemoveBtn = document.querySelectorAll('#filters-form facet-remove a[href]');
                    parsedHtml.querySelectorAll('#filters-form facet-remove a[href]').forEach((element, index) => {
                        filterRemoveBtn[index].setAttribute('href', element.getAttribute('href'))
                    });

                    // this.$collection.find('.filters-accordion.filters-wrapper').html( parsedHtml.querySelector('.filters-accordion.filters-wrapper').innerHTML );
    
                    //const resultsCount = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    
                    this.$body.trigger('lazyloadShouldUpdate');
                    this.lazyLoad.update();
                    this.quickBuyInit();
                    this.$collection.removeClass('content-loading');
    
                });
                console.log("Success:", response);
                GlobalObj.isLoading = false;
            } catch (error) {
                console.error("Error:", error);
                GlobalObj.isLoading = false;
            }
        }



    }//renderContent

    async quickBuyInit() {
        console.log('quickBuyInit after filtering')
        const { default: QuickBuy } = await import('Modules/QuickBuy');
        new QuickBuy( { $el: $(document).find('.product-collection') } );
    }

    createSearchParams(form) {
        const formData = new FormData(form);
        return new URLSearchParams(formData).toString();
    }

    navLinkFilters() {
        const $rawNav = GlobalObj.GlobalView.$rawNav?.clone();
        const currentUrl = this.$collection.data('url');
        this.parentCollectionLink = false;

        if(GlobalObj.GlobalView.$rawNav){

            // Build fake collection filter
            const $activeLink = $rawNav.find(`a[href="${currentUrl}"]`);

            if ($activeLink.length) {
                let $children = $activeLink.siblings('.children');
                if ($children.length) {
                    // console.log('on parent level!');
                    this.$filter
                        .find('.filter.collection .filter-swatches')
                        .html($children.html());
                    this.$filter.find('.filter.collection').show();
                } else if ($activeLink.parent().hasClass('level-3')) {
                    // console.log('on sub level!');
                    $children = $activeLink.parent().parent('.children');
                    if ($children.length) {
                        this.parentCollectionLink = $children
                            .siblings('.nav-link')
                            .attr('href');
                        $children
                            .find('a[href="' + currentUrl + '"]')
                            .addClass('active');
                        this.$filter
                            .find('.filter.collection .filter-swatches')
                            .html($children.html());
                        this.$filter.find('.filter.collection').show();
                        this.$filter.find('.clear-all').removeClass('hide hidden');
                    }
                }
            }

        }
    }

    closeDropdowns() {
        this.$body
            .removeClass('collection-nav-opened')
            .removeClass('show-overlay');
        this.$collection
            .find('.collection-nav-block.opened, .filter.opened')
            .removeClass('opened');
    }
}
