import $ from 'jquery';
// import OneVideo from 'Modules/OneVideo';

export default class HpImageModule {
    constructor(wrapper) {
        console.log('Init Hero Module 🏞');
        const $wrapper = $(wrapper);
        const $videos = $wrapper.find('.video-box');
        const $slides = $wrapper.find('.slides-wrapper');

        // console.log('$slides?.length', $slides?.length);

        if ($slides?.length) {
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

        // if ($videos?.length) {
        //     new OneVideo({
        //         $el: $videos,
        //         isResponsive: false,
        //         bgVideo: true,
        //         autoplay: true,
        //     });
        // }

    }
}
