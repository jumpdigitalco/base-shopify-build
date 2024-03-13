import $ from 'jquery';

export default class Parallax {
    constructor(settings = {}) {
        this.headerHeight = $('.site-header').outerHeight();
        this.settings = Object.assign(
            {
                // The offset above the content, where the animation will begin
                topOffset: 0,
                parent: null, // Base top offset from parent element
                el: $('[data-parallax]'), // The parent element whose content will be parallaxed
                debug: false, // Output some extra info
                scrollDivisor: 2,
            },
            settings
        ); // Merge settings argument with default values
        console.log('Parallax settings: ', this.settings);

        this.watchScroll();

        if (this.settings.debug) this.initDebug();

        return this.settings;
    }

    watchScroll() {
        for (let el of this.settings.el) {
            const $el = $(el);
            const $parent = $el.parents(this.settings.parent);
            const topOffsetSetting = this.settings.topOffset;
            const elOffset = this.settings.parent
                ? $parent.offset().top - topOffsetSetting
                : $el.offset().top - topOffsetSetting;
            const topOffset = elOffset - topOffsetSetting;
            console.log('topoffset: ', elOffset);

            $(document).scroll(() => {
                const windowScrollTop =
                    $(window).scrollTop() + this.headerHeight;

                if (
                    this.isWithinOffsetBounds(
                        windowScrollTop,
                        topOffset,
                        elOffset
                    )
                ) {
                    this.calculateParallaxOffset(
                        $el,
                        windowScrollTop,
                        topOffset,
                        topOffsetSetting
                    );
                } else if (
                    this.isAboveOffsetBounds(windowScrollTop, elOffset)
                ) {
                    $el.css({
                        opacity: 0,
                        transform: `translateY(${topOffsetSetting}px)`,
                    });
                } else if (
                    this.isBelowOffsetBounds(windowScrollTop, topOffset)
                ) {
                    $el.css({
                        opacity: 1,
                        transform: `translateY(${this.topOffset}px)`,
                    });
                }
            });

            $el.css({
                transform: `translateY(${
                    topOffsetSetting / this.settings.scrollDivisor
                }px)`,
                opacity: 0,
            });
        }
    }

    isWithinOffsetBounds(windowScrollTop, topOffset, elOffset) {
        //console.log(windowScrollTop >= topOffset, windowScrollTop <= (elOffset + 10))
        return windowScrollTop >= topOffset && windowScrollTop <= elOffset + 10;
    }

    isAboveOffsetBounds(windowScrollTop, elOffset) {
        return windowScrollTop <= elOffset + 10;
    }

    isBelowOffsetBounds(windowScrollTop, topOffset) {
        return windowScrollTop >= topOffset;
    }

    calculateParallaxOffset($el, windowScrollTop, topOffset, topOffsetSetting) {
        const heightOffset = Math.ceil(
            topOffsetSetting - (windowScrollTop - topOffset)
        );
        let percentage = (1 - heightOffset / topOffsetSetting) * 100;
        console.log(
            `heightOffset: ${heightOffset / this.settings.scrollDivisor}`
        );

        $el.css({
            transform: `translateY(${
                heightOffset / this.settings.scrollDivisor
            }px)`,
            opacity: percentage / 100,
        });
    }

    initDebug() {
        $(window).scroll(() => {
            const windowScrollTop = $(window).scrollTop() + this.headerHeight;

            console.log('Scroll top: ', windowScrollTop);
        });
    }
}
