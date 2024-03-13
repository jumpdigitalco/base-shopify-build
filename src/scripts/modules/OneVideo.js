/*
	OneVideo 2.0.0 Usage (Webpack)
	Yang @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import Player from '@vimeo/player';
import { sleep } from 'App/helpers';

export default class OneVideoView {
    constructor({
        $el,
        isResponsive,
        bgVideo,
        autoplay,
        controls,
        hidePoster,
        overrideLoop,
        videoDelay,
    }) {
        this.$el = $el;
        this.$videoBoxes = this.$el;
        this.isResponsive = isResponsive ?? false;
        this.bgVideo = bgVideo ?? false;
        this.autoplay = autoplay ?? false;
        this.controls = controls ?? false;
        this.hidePoster = hidePoster ?? true;
        this.overrideLoop = overrideLoop;
        this.videoDelay = videoDelay ?? 0;
        this.players = new Array();

        this.initVideos();
    }

    initVideos() {
        const $youtubeVideos = this.$videoBoxes.filter(
            '[data-video-type="youtube"]'
        );
        const $nonYoutubeVideos = this.$videoBoxes.filter(
            ':not([data-video-type="youtube"])'
        );

        const videoBoxCallback = (box) => {

            const $box = $(box);
            const boxId = $box.attr('id');
            const type = $box.data('video-type');
            const videoId = $box.data('video-id');
            let videoSrc = $box.data('video-src');

            console.log('videoSrc', videoSrc);
            console.log(' GlobalObj.utilities.isMobile',  GlobalObj.utilities.isMobile() );
            console.log('mobile video?', $box.data('mobile-video-src') )

            if( GlobalObj.utilities.isMobile() && typeof $box?.data('mobile-video-src') !== 'undefined' ){
                videoSrc = $box.data('mobile-video-src')
            }

            console.log('videoSrc 2', videoSrc);

            if (type == 'youtube') {
                console.log('LOAD YOUTUBE');
                this.loadYoutubePlayer(videoId, $box, boxId);
            } else if (type == 'vimeo') {
                console.log('LOAD VIMEO PLAYER');
                this.loadVimeoPlayer(videoId, videoSrc, $box, boxId);
            } else if (this.bgVideo && type != 'vimeo' && type != 'youtube') {
                console.log(
                    'LOAD HOST PLAYER ',
                    videoId,
                    videoSrc,
                    $box,
                    boxId
                );
                this.loadHostPlayer(videoId, videoSrc, $box, boxId);
            } else {
                console.log('LOAD NO PLAYER');
            }
        };

        // If youtube videos, init on api ready

        // console.log( typeof(YT) );
        // console.log( 'YT',YT );

        if (
            $youtubeVideos.length &&
            (typeof YT === 'undefined' || typeof YT.Player === 'undefined')
        ) {
            $.getScript('//www.youtube.com/iframe_api');
            window.onYouTubeIframeAPIReady = () => {
                // console.log('onYouTubeIframeAPIReady')
                for (let box of $youtubeVideos) {
                    videoBoxCallback(box);
                }
            };
        }

        for (let box of $nonYoutubeVideos) {
            videoBoxCallback(box);
        }
    }

    async loadHostPlayer(_, video_src, $video_box) {
        // Works for vimeo or self-hosted videos
        let id;
        let $videoWrapper = $video_box;
        // 0.6 is default for product video
        const videoRatio = $videoWrapper.data('ratio')
            ? $videoWrapper.data('ratio')
            : 0.6;
        const $playerCtl = $videoWrapper
            .parents('.video-wrapper')
            .find('.video-ui');

        const responsive = function (r) {
            const wrapperRatio = $videoWrapper.width() / $videoWrapper.height();
            if (wrapperRatio >= r) {
                $videoWrapper.find('video').css({
                    width: '100%',
                    height: $videoWrapper.width() / r,
                });
            } else {
                $videoWrapper.find('video').css({
                    height: '100%',
                    width: $videoWrapper.height() * r,
                });
            }
        };

        const videoDelay = $video_box.data('video-delay');
        if (videoDelay > 0) await sleep(videoDelay);

        let $video;
        if (this.autoplay) {
            const video = `
            <video
                preload="metadata" ${this.overrideLoop ? '' : 'loop'}
                muted
                autoplay
                playsinline
            >
                <source src="${video_src}" type="video/mp4">
            </video>`;

            $video = $(video);
        } else {
            const video = `
            <video
                preload="metadata" ${this.overrideLoop ? '' : 'loop'}
                muted
                playsinline
            >
                <source src="${video_src}" type="video/mp4">
            </video>`;
            $video = $(video);
        }
        // $playerCtl.text('Play');
        $video_box.prepend($video);

        const theVideo = $video[0];
        theVideo.muted = true;

        $video.on('play', function () {
            console.log('playing video');
            $video.isPlaying = true;
            $video_box.find('iframe').css({
                opacity: '1',
            });
            $playerCtl.css({
                'z-index': '3',
            });

            $video_box
            .find('iframe')
            .css({
                visibility: 'visible',
                opacity: '1',
            })
            $video_box.addClass('playing')
            .removeClass('paused');

            $playerCtl.find('.video-ctl').text('Pause');
            $playerCtl.removeClass('paused').addClass('playing');
            console.log('play the video!');
        });
        $video.on('pause', function () {
            console.log('pausing video');
            $video.isPlaying = false;
            $video_box
            .find('iframe')
            .css({
                visibility: 'hidden',
                opacity: '0',
            })
            $video_box.addClass('paused')
                .removeClass('playing');

            $playerCtl.find('.video-ctl').text('Play');
            $playerCtl.removeClass('playing').addClass('paused');
            console.log('pause the video!');
        });

        function toggleVideo() {
            if ($video.isPlaying) {
                theVideo.pause();
                // $playerCtl.text('Play');
                $playerCtl.removeClass('playing').addClass('paused');
            } else {
                theVideo.play();
                // $playerCtl.text('Pause');
                $playerCtl.removeClass('paused').addClass('playing');
            }
        }

        $video.on('click', function () {
            toggleVideo();
        });

        if ($playerCtl.length) {
            // $playerCtl.text('Pause');
            // $playerCtl.removeClass('paused').addClass('playing');
            $playerCtl.on('click', function () {
                // console.log('player control');
                toggleVideo();
            });
        }

        $video.on('bufferend', function () {
            // console.log("video buffered");
            if (self.isResponsive) {
                responsive(videoRatio);
            }
            console.log('init video');
        });

        if (self.isResponsive) {
            $(window).resize(function () {
                clearTimeout(id);
                id = setTimeout(function () {
                    responsive(videoRatio);
                }, 400);
            });
        }
    }

    loadVimeoPlayer(_, video_src, $video_box, video_box_id) {
        let id;
        let options;
        let vmplayer;
        let $iframe;
        let $videoWrapper = $video_box;

        // 0.6 is default for product video
        const videoRatio = $videoWrapper.data('ratio')
            ? $videoWrapper.data('ratio')
            : 0.6;
        const $playerCtl = $videoWrapper.siblings('.video-ui');

        const responsive = function (r) {
            const wrapperRatio = $videoWrapper.width() / $videoWrapper.height();
            // console.log(wrapperRatio + '/' + r);
            if (wrapperRatio >= r) {
                $videoWrapper.find('iframe').css({
                    width: '100%',
                    height: $videoWrapper.width() / r,
                });
            } else {
                $videoWrapper.find('iframe').css({
                    height: '100%',
                    width: $videoWrapper.height() * r,
                });
            }
        };

        // if (GlobalObj.utilities.isMobile()) {
        //     options = {
        //         id: video_id,
        //         byline: false,
        //         portrait: false,
        //         title: false,
        //         loop: false,
        //         background: true,
        //     };
        //     vmplayer = new Player(video_box_id, options);
        // } else {
            const query = [
                'title=0',
                'byline=0',
                'portrait=1',
                'autoplay=1',
                'loop=1',
                'controls=0',
                'background=1',
            ];

            const iframe = `
            <iframe
                loading="lazy"
                frameborder="0"
                src="${video_src}?${query.join('&')}">'
            `;
            $iframe = $(iframe);
            $video_box.html($iframe);
            vmplayer = new Player($iframe);
        // }

        if ($playerCtl.length) {
            // if (!GlobalObj.utilities.isMobile()) {
                $playerCtl.find('.video-ctl').text('Pause');
                $playerCtl.removeClass('paused').addClass('playing');
                $playerCtl.find('.video-ctl').on('click', function () {
                    if (vmplayer.isPlaying) {
                        vmplayer.pause();
                        $playerCtl.find('.video-ctl').text('Play');
                        $playerCtl.removeClass('playing').addClass('paused');
                    } else {
                        vmplayer.play();
                        $playerCtl.find('.video-ctl').text('Pause');
                        $playerCtl.removeClass('paused').addClass('playing');
                    }
                });
            // } else {
                // $playerCtl.text('Play');
                // $playerCtl.removeClass('playing').addClass('paused');
                // $playerCtl.on('click', function () {
                //     if (vmplayer.isPlaying) {
                //         vmplayer.pause();
                //     }
                //     vmplayer.play();
                // });
            // }
        }

        vmplayer.setVolume(0);
        vmplayer.on('play', function () {
            vmplayer.isPlaying = true;
            // if (GlobalObj.utilities.isMobile()) {
                $video_box.find('iframe').css({
                    opacity: '1',
                });
                $playerCtl.css({
                    'z-index': '3',
                });

                $video_box
                .find('iframe')
                .css({
                    visibility: 'visible',
                    opacity: '1',
                })
                $video_box.addClass('playing')
                .removeClass('paused');

                $playerCtl.find('.video-ctl').text('Pause');
                $playerCtl.removeClass('paused').addClass('playing');


            // }
            console.log('played vm video!');
        });
        vmplayer.on('pause', function () {
            vmplayer.isPlaying = false;
            // if (GlobalObj.utilities.isMobile()) {
                $video_box
                    .find('iframe')
                    .css({
                        visibility: 'hidden',
                        opacity: '0',
                    })
                $video_box.addClass('paused')
                    .removeClass('playing');

                $playerCtl.find('.video-ctl').text('Play');
                $playerCtl.removeClass('playing').addClass('paused');
            // }
            console.log('pause vm video!');
        });
        vmplayer.on('loaded', function () {
            if (self.isResponsive) {
                responsive(videoRatio);
            }
            console.log('init vm video');
        });

        if (this.isResponsive) {
            $(window).resize(function () {
                clearTimeout(id);
                id = setTimeout(function () {
                    responsive(videoRatio);
                }, 400);
            });
        }
    }

    loadYoutubePlayer(video_id, $video_box, video_box_id) {
        const $videoParent = $video_box.parent('.video-wrapper');
        const $videoParentBlock = $videoParent.parent('.video-block');
        const $videoControls = $videoParent.find('.video-ctl');
        const playingClass = 'playing';
        const pausedClass = 'paused';

        if (GlobalObj.utilities.isSafari) {
            // console.log('am on safari');
            this.autoplay = false;
            $videoParent.addClass('paused no-autoplay');
        }

        const videoActions = (actionName) => {
            if (actionName === 'play') {
                $videoParent.addClass(playingClass).removeClass(pausedClass);
                $videoParentBlock
                    .addClass(playingClass)
                    .removeClass(pausedClass);
                if (this.hidePoster) {
                    $videoParent.addClass('hide-poster');
                }
                $videoControls.addClass(playingClass).removeClass(pausedClass);
            } else {
                $videoParent.removeClass(playingClass).addClass(pausedClass);
                $videoParentBlock
                    .removeClass(playingClass)
                    .addClass(pausedClass);
                $videoControls.removeClass(playingClass).addClass(pausedClass);
            }
        };

        // console.log('this.bgVideo:', this.bgVideo );

        const playerVars = {
            autoplay: this.autoplay, // Auto-play the video on load
            controls: ~this.bgVideo & 1, // Show pause/play buttons in player
            loop: this.bgVideo, // Run the video in a loop
            playlist: video_id, // Needed to loop the video
            showinfo: 0, // Hide the video title
            modestbranding: 1, // Hide the Youtube Logo
            fs: 0, // Hide the full screen button
            autohide: 1, // Hide video controls when playing
            rel: 0,
        };

        // console.log('playerVars', playerVars);
        console.log('create youtube player, video_id', video_id);
        const self = this;

        let player = new YT.Player(video_box_id, {
            videoId: video_id, // YouTube Video ID
            width: 1440, // Player width (in px)
            height: 1080, // Player height (in px)
            playerVars,
            events: {
                onReady: (e) => {
                    console.log('YT ready');
                    if (this.bgVideo && this.autoplay) e.target.mute();
                    if (this.bgVideo && this.autoplay !== false) {
                        // console.log('play the video');
                        $videoParent.addClass('playing');
                        e.target.playVideo();
                    }
                },
                onStateChange: (e) => {
                    if (
                        e?.target?.getPlayerState &&
                        e?.target?.getPlayerState() == 1
                    ) {
                        // console.log('playing');
                        videoActions.call(self, 'play');
                    } else {
                        // console.log('paused');
                        videoActions.call(self);
                        $videoParent.removeClass('playing');
                    }
                },
            },
        });

        this.player = player;
        this.players.push(player);

        // console.log('player init: ', player, player.getPlayerState)
        // console.log('VIDEO CTLS: ', $videoControls)
        console.log('this.players', this.players);

        $videoControls.click(function () {
            if (player.getPlayerState && player.getPlayerState() === 1) {
                player.pauseVideo();
                // videoActions('');
            } else {
                player.playVideo();
                // videoActions('play');
            }
        });
    }
}
