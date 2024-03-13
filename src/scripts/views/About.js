import 'slick-carousel';
import OneVideo from 'Modules/OneVideo';

export default class AboutView {
    constructor({ $el }) {
        console.log('init about page');

        this.$content = $el;
        this.$moduleE = this.$content.find('.about-module-e');
        this.$moduleF = this.$content.find('.about-module-f');

        if (this.$moduleE.length > 0) {
            this.moduleE();
        }
        if (this.$moduleF.length > 0) {
            this.moduleF();
        }
    }

    moduleE() {
        const $videos = this.$moduleE.find('.video-wrapper');

        new OneVideo({
            $el: $videos,
            isResponsive: false,
            bgVideo: true,
            autoplay: false,
        });
    }

    moduleF() {
        const $productSlider = this.$moduleF.find('.product-slider.slick');
        const $editorialSlider = this.$moduleF.find('.editorial-slider.slick');
        const $editorialTitleSlider = this.$moduleF.find(
            '.editorial-title-slider.slick'
        );

        $productSlider.slick({
            dots: false,
            infinite: true,
            speed: 600,
            centerMode: true,
            centerPadding: '40px',
            slidesToShow: 2,
            arrows: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: GlobalObj.responsiveSizes.medium,
                    settings: {
                        centerPadding: '80px',
                        slidesToShow: 4,
                    },
                },
                {
                    breakpoint: GlobalObj.responsiveSizes.large,
                    settings: {
                        centerPadding: '100px',
                        slidesToShow: 5,
                    },
                },
            ],
        });

        if ($editorialSlider.length && $editorialTitleSlider.length) {
            $editorialSlider.slick({
                dots: true,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                mobileFirst: true,
                asNavFor: $editorialTitleSlider,
            });

            $editorialTitleSlider.slick({
                dots: false,
                infinite: true,
                speed: 600,
                slidesToShow: 1,
                arrows: false,
                mobileFirst: true,
                asNavFor: $editorialSlider,
            });
        }
    }
}
