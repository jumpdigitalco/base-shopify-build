/*
	OneZoom 2.2.0 Usage (Webpack)
	
	2.0.0 adding webpack
	2.1.0 adding in frame zooming
	
	Yang@onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import 'jquery.panzoom';
import 'Lib/jquery.doubletap';

export default class OneZoomView {
    constructor({ el, mainImage, thumbImage }) {
        this.zoomEngaging = false;
        this.zoomInFrame = true;
        this.$productMedia = el;
        this.$mainImage = mainImage;
        this.$thumbImage = thumbImage;

        this.buildDesktopZoom();
        this.buildMobileZoom();

        $(document).on('click','.image-slide:not(.media-video)',
            this.desktopZoomHandle.bind(this)
        );
        $(document).on('click','#onezoom.opened',this.desktopZoomClose.bind(this));
        $(document).on(
            'click','.image-slide:not(.media-video), #onezoom',
            this.mobileZoomHandle.bind(this)
        );
        $(document).on('click','.onezoom-close', this.mobileZoomOut.bind(this));
    }

    buildDesktopZoom() {
        this.$zoomContainer = $('<div id="onezoom"></div>');
        this.$zoomContainer.appendTo(this.$productMedia);
    }

    buildMobileZoom() {
        this.zoomMobileEngaging = false;
        this.$zoomMobileContainer = $('<div id="onezoom-mobile"></div>');
        this.$zoomMobileContainer.appendTo(this.$productMedia);
    }

    desktopZoomHandle(e) {
        console.log('desktopZoomHandle');
        e.preventDefault();

        if (!GlobalObj.utilities.isMobile()) {
            console.log('DESKTOP ZOOM');
            const $curr = $(e.currentTarget);
            const imageUrl = $curr.attr('data-zoom-image');
            let $zoomContainerInFrame;
            let $zoomImageContainer;

            if (this.zoomInFrame) {
                console.log('ZOOM IN FRAME');
                // As inframe
                function setPosition(e) {
                    const offset = $zoomImageContainer.offset();
                    const relativeX =
                        ((e.pageX - offset.left) * 100) /
                        $zoomContainerInFrame.width();
                    const relativeY =
                        ((e.pageY - offset.top) * 100) /
                        $zoomContainerInFrame.height();
                    const position = relativeX + '%' + ' ' + relativeY + '%';
                    $zoomImageContainer.css('background-position', position);
                }

                if ($curr.find('.onezoom-frame').length) {
                    // Close
                    $zoomContainerInFrame = $curr.find('.onezoom-frame');
                    $zoomContainerInFrame.off('mousemove');
                    $zoomContainerInFrame.remove();
                } else {
                    console.log('OPEN');
                    // Open

                    $zoomImageContainer = $(
                        '<div class="onezoom-image">'
                    )

                    $zoomContainerInFrame = $(
                        '<div class="onezoom-frame loading-image">'
                    )
                    .append($zoomImageContainer)
                    .appendTo($curr);

                    $('<img/>')
                        .attr('src', imageUrl)
                        .on('load', function () {
                            $(this).remove();
                            setPosition(e);
                            $zoomContainerInFrame.removeClass('loading-image');
                            $zoomImageContainer.css(
                                'background-image',
                                'url(' + imageUrl + ')'
                            );

                            $zoomImageContainer.on('mousemove', (e) => {
                                setPosition(e);
                            });
                        });
                }
            } else {
                // As pop-up
                const $zoomImage = $(
                    '<img class="zoomed-image" src="' + imageUrl + '" />'
                );
                this.$zoomContainer.html($zoomImage);

                $zoomImage.on('load', () => {
                    this.$zoomContainer.removeClass('loading-image');
                });

                if (!this.zoomEngaging) {
                    this.zoomStatus('engage');
                    this.$zoomContainer.addClass('opened loading-image');
                }
            }
        }
    }

    desktopZoomClose(e) {
        this.$zoomContainer.on('transitionend', () => {
            this.$zoomContainer.off('transitionend');
            this.$zoomContainer.html('');
            this.zoomStatus('disengage');
        });
        this.$zoomContainer.removeClass('opened');
    }

    mobileZoomHandle(e) {
        console.log('mobileZoomHandle');
        if (GlobalObj.utilities.isMobile()) {
            if (this.$zoomMobileEngaging) {
                console.log('Mobile ZOOM OUT');
                this.mobileZoomOut();
            } else {
                console.log('Mobile ZOOM IN');
                this.mobileZoomeIn(e);
            }
        }
    }

    mobileZoomeIn(e) {
        const $curr = $(e.currentTarget);
        const $currImage = $curr.find('img');
        const $bigImage = $('<img src="' + $curr.attr('data-zoom-image') + '" />');

        this.$zoomMobileCloseIcon = $('<div class="onezoom-close"></div>');
        this.$zoomMobileContainer
            .addClass('opened loading-image')
            .html($bigImage);
        this.$zoomMobileContainer.prepend(this.$zoomMobileCloseIcon);

        // get proper coordinates for touchend event
        if (e.changedTouches) {
            e = e.changedTouches[0];
        }

        $bigImage.on('load', () =>
            this.$zoomMobileContainer.removeClass('loading-image')
        );

        $bigImage.on('load', () => {
            $bigImage.panzoom({
                contain: 'automatic',
                minScale: 1,
                maxScale: 5,
            });

            const rate = $bigImage.width() / $currImage.width();
            const pan = {
                x:
                    (this.$mainImage.offset().left - e.pageX) * rate +
                    $currImage.width() / 2,
                y:
                    (this.$mainImage.offset().top - e.pageY) * rate +
                    $currImage.height() / 2,
            };
            $bigImage.panzoom('pan', pan.x, pan.y);
        });

        // mark as zoomed
        this.$zoomMobileEngaging = true;
    }

    mobileZoomOut(e) {
        if (!this.$zoomMobileContainer) {
            return false;
        }
        this.$zoomMobileContainer.on('transitionend', () => {
            this.$zoomMobileContainer.off('transitionend');
            this.$zoomMobileContainer.html('');
            this.$zoomMobileEngaging = false;
        });
        this.$zoomMobileContainer.removeClass('opened');
    }

    zoomStatus(opt) {
        if (opt === 'engage') {
            this.zoomEngaging = true;
            $('html').addClass('zooming');
        } else if (opt == 'disengage') {
            this.zoomEngaging = false;
            $('html').removeClass('zooming');
        }
    }
}
