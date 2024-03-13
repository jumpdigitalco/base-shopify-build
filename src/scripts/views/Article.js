import $ from 'jquery';
import 'slick-carousel';
import 'scrolltofixed';
import AOS from 'aos';

import OneVideo from 'Modules/OneVideo';

export default class ArticleView {
    constructor({ $el }) {
        console.log('init article');

        this.$content = $el;
        this.$body = $('body');
        this.$moduleImageModule = this.$content.find('.module-hero');

        this.initVideo();
        this.imageCarousel();
        this.sidebarScrollFix();
    }

    imageCarousel() {
        this.$galleries = this.$content.find('.featured-gallery.default');

        for (let gallery of this.$galleries) {
            this.$galleryContainer = $(gallery);
            this.$galleryMain = this.$galleryContainer.find('.gallery-main');
            this.$galleryThumbs = this.$galleryContainer.find(
                '.gallery-thumbs'
            );

            console.log('id gallery:', this.$galleryMain.attr('id'));
            console.log('id galleryThumbs:', this.$galleryThumbs.attr('id'));

            this.$galleryMain.slick({
                dots: false,
                arrows: true,
                infinite: false,
                slidesToShow: 1,
                fade: true,
                centerMode: false,
                focusOnSelect: true,
                lazyLoad: 'ondemand',
                asNavFor: `#${this.$galleryThumbs.attr('id')}`,
            });

            this.$galleryThumbs.slick({
                dots: false,
                arrows: false,
                infinite: false,
                slidesToShow: 4,
                fade: false,
                focusOnSelect: true,
                lazyLoad: 'ondemand',
                asNavFor: `#${this.$galleryMain.attr('id')}`,
            });
        }

        AOS.refresh();
    }

    initVideo() {
        this.$videoBoxes = this.$content.find('.video-box');

        new OneVideo({
            $el: this.$videoBoxes,
            isResponsive: false,
            bgVideo: false,
            autoplay: false,
        });
    }

    sidebarScrollFix() {
        let $elemToFix = this.$content.find('.article-sidebar');
        let $socialShareFix = this.$content.find('.social-sharing');
        if (!GlobalObj.utilities.isMobile()) {
            const scrollToFixOpts = {
                removeOffsets: true,
                dontSetWidth: true,
                zIndex: 1,
                marginTop: function () {
                    let marginTop = $('header.site-header').outerHeight() > 160 ? 160 : $('header.site-header').outerHeight();
                    return marginTop;
                },
                fixed: function () {
                    $(this).removeClass('unfixed');
                    $(this).addClass('fixed');
                },
                unfixed: function () {
                    $(this).removeClass('fixed');
                    $(this).addClass('unfixed');
                },
                limit: function () {
                    let limit =
                        // $('.article-bottom').offset().top -
                        // $(window).height() -
                        // 50;

                        $('.article-bottom').offset().top -
                        $(this).height();
                    
                    // console.log('limit', limit);

                    // if (!limit) {
                    //     limit = 0.01;
                    // }
                    return limit;
                }
            };
            this.$currentFixItems = $elemToFix.scrollToFixed(scrollToFixOpts);
            this.$currentFixItems2 = $socialShareFix.scrollToFixed(
                scrollToFixOpts
            );
        }
    }
}
