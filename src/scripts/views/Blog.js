import $ from 'jquery';

import 'Lib/jquery.viewport';
import 'slick-carousel';
import 'scrolltofixed';

import OneVideo from 'Modules/OneVideo';
import IndentedImageGrid from 'Modules/IndentedImageGrid';
import Accordion from 'Modules/Accordion';

export default class BlogView {
    constructor({ $el }) {
        console.log('init unbreakable, training page / blog');

        this.$content = $el;
        this.$el = $el;
        this.$body = $('body');
        this.$pager = this.$el.find('.collection-pagination');
        this.$productGrid = this.$el.find('.posts-wrapper');
        this.$products = this.$productGrid.find('.blog-post');

        // Unbreakable landing page
        this.heroViewChange();
        // Unbreakable landing page
        this.initVideoBG();
        // this.initVideo();

        this.initLoadMore();

        // If we are on a blog category
        if (this.$body.hasClass('template-blog')) {
            //this.infinityScroll();
            this.tagNavigator();

            $(window).on('load', () => {
                this.anchorToListingWhenTagged();
            });
        }
        

        if (this.$body.find('.indented-grid-image-module')?.length) {
            this.initIndentedImageGrid();
        }

        // Accordion functionality
        Accordion(
            $('.static-page-accordion .nav-accordion-title'),
            'nav-accordion-wrap',
            'opened'
        );
    }

    initVideo() {
        const $videoBoxes = this.$content.find('.video-box');
        console.log('Init Blog Videos ', $videoBoxes.length, $(this.$el));

        new OneVideo({
            $el: $videoBoxes,
            isResponsive: false,
            bgVideo: false,
            autoplay: false,
        });
    }

    initVideoBG() {
        const $videoBoxes = this.$content.find('.video-box');
        console.log('Init Blog BG Videos');

        new OneVideo({
            $el: $videoBoxes,
            isResponsive: false,
            bgVideo: true,
            autoplay: true,
        });
    }

    heroViewChange() {
        this.$heroModule = this.$content.find('.unbreakable-hero');

        $('.hero-slide').on('mouseenter', (e) => {
            $(e.currentTarget).siblings().removeClass('active');
            $(e.currentTarget).addClass('active');
        });
    }

    tagNavigator() {
        const blogTagNav = this.$content.find(
            '.tag-nav ul:not(.slick-initialized)'
        );
        console.log('blogTagNav ', blogTagNav);

        blogTagNav.slick({
            dots: false,
            infinite: false,
            speed: 600,
            slidesToShow: 1,
            slidesToScroll: 1,
            variableWidth: true,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: GlobalObj.responsiveSizes.large,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 2,
                    },
                },
            ],
        });
    }

    anchorToListingWhenTagged() {
        const blogPath = location.pathname;
        if (blogPath.indexOf('tagged') > -1) {
            const tagNav =
                $('.tag-nav').offset().top - $('.site-header').height() - 100;
            $('html, body').animate({ scrollTop: tagNav }, 400);
        }
    }

    infinityScroll() {
        var loadMore = function (prev) {
            // Passing param to determin whether loading next page or prev
            var addPage = function (d) {
                console.log('add page');
                var $content = $(d).find('.article-list');
                var $pager = $content.find('.collection-pagination');
                var $newItems = $content.find('.posts-wrapper .blog-post');
                var loadingPageNum = GlobalObj.utilities.getUrlParam(
                    self.url,
                    'page'
                );
                var afterAppend = function (index, item) {
                    $(item).data('page', loadingPageNum);

                    if (index == $newItems.length - 1) {
                        // Perform re-init of product grid if needed
                        // GlobalObj.rebuildListing();

                        GlobalObj.isLoading = false;

                        if (prev) {
                            loadMore(true); // Recursive!!
                            // $('html, body').animate({
                            //     scrollTop: self.$productGrid.prop("scrollHeight")
                            // }, 0);
                        } else {
                            return false;
                        }
                    }
                };

                GlobalObj.pagerStack.push(self.url);

                console.log('$newItems', $newItems);
                if (!GlobalObj.isFinished) {
                    self.$pager = $pager;
                    $newItems.prependTo(self.$productGrid).each(afterAppend);
                } else {
                    self.$pager.replaceWith($pager);
                    self.$pager = $pager;
                    $newItems.appendTo(self.$productGrid).each(afterAppend);
                    window.history.pushState(null, null, self.url);
                }
            }; //addPage

            // Start of Load More
            if (!GlobalObj.isLoading) {
                const status = prev ? 'prev' : 'next';
                //self.url = self.$pager.find(`.${status} a`).attr('href');
                if (GlobalObj.isFinished) {
                    // Load next page
                    self.url = self.$pager.find('.next a').length
                        ? self.$pager.find('.next a').attr('href')
                        : '';
                } else {
                    // Load prev page
                    self.url = self.$pager.find('.prev a').length
                        ? self.$pager.find('.prev a').attr('href')
                        : '';
                }

                if ($.inArray(self.url, GlobalObj.pagerStack) == -1 && self.url) {
                    console.log('load ' + status);
                    GlobalObj.isLoading = true;
                    $.get(self.url).done(addPage);
                } else {
                    if (prev) {
                        GlobalObj.isFinished = true;
                        console.log('load prev finished');
                    } else {
                        $('#loadmore').addClass('disabled');
                        return false;
                    }
                }
            }
        };

        // Load Prev Page Trigger
        loadMore(true);

        // Load Next Page Triggers
        $(document).on('click', '.collection-load-more', function () {
            console.log('LOAD MORE?');
            loadMore();
        });
        // Uncomment the following to allow automatic pagination
        // if ($('#loadmore:in-viewport').length) {
        //     loadMore();
        // }
        // $(window).on('scroll.listview', function () {
        //     if ($('#loadmore:in-viewport').length) {
        //         loadMore();
        //     }
        // });
    }

    /*
     * initLoadMore
     *
     * When "Load More" button is clicked
     * load next page of blog articles
     *
     */
    initLoadMore() {
        const $loadMore = $('.collection-load-more');
        const loadMoreEvent = new CustomEvent('spartanLazyLoadUpdate');
        let totalPages;
        let currentPage = 1;
        console.log('INIT LOAD MORE');

        const loadNextPage = async function () {
            totalPages = $(this).data('total-pages') ?? -1;

            if (currentPage < totalPages) {
                try {
                    const response = await fetch(
                        `${location.pathname}?page=${++currentPage}`,
                        {
                            credentials: 'same-origin',
                        }
                    );
                    const data = await response.text();
                    const $content = $(data).find('.article-list');
                    const $newItems = $content.find(
                        '.posts-wrapper .blog-post'
                    );
                    console.log(`loaded page ${currentPage}`);

                    $('.posts-wrapper').append($newItems);

                    // Send custom event to tell global view to update lazy load
                    // Event captured in views/view-global.js:90
                    $('body')[0].dispatchEvent(loadMoreEvent);

                    // Hide button when no more pages
                    if (currentPage >= totalPages) $loadMore.hide();
                } catch (err) {
                    console.error(err);
                }
            }
        };

        $loadMore.click(loadNextPage);
    }

    initIndentedImageGrid() {
        IndentedImageGrid(this.$content);
    }
}
