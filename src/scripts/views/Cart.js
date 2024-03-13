import $ from 'jquery';

const { getCookie, setCookie } = GlobalObj.utilities;

const cartNotice = function () {
    const $cartNotice = $('#CartNotice');
    const $oosItems = $('.out-of-stock-items');
    const cookieEnabled = 'cookie-enabled';
    const cookieName = 'hideCartNotice';
    const noticeCookie = getCookie(cookieName);

    if ($cartNotice.data(cookieEnabled) && !noticeCookie) {
        $cartNotice.addClass('show');
    }

    const fadeAnimation = function ($el) {
        $el.animate(
            {
                opacity: 0,
            },
            300,
            'swing',
            function () {
                $(this).hide();
            }
        );
    };

    $cartNotice.find('.cart-notice__close').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $el = $(this);
        const $parent = $el.parents('#CartNotice');

        if ($parent.data(cookieEnabled)) {
            console.log('hide cart notice');
            const cookieDuration = $el.data('cookie-duration') || null;
            setCookie(cookieName, true, cookieDuration);
        }

        fadeAnimation($parent);
    });

    $oosItems.find('.icon-close').click(function () {
        fadeAnimation($oosItems);
    });
};

export default function () {
    console.log('Init Cart');

    $(function () {
        cartNotice();
    });
}
