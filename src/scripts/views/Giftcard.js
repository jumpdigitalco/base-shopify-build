import $ from 'jquery';
import whenDomReady from 'when-dom-ready';

export default function GiftCardView() {
    console.log('init giftcard');

    const config = {
        qrCode: '#QrCode',
        printButton: '#PrintGiftCard',
        giftCardCode: '.giftcard__code',
    };

    const $qrCode = $('#QrCode');

    // Where is QRCode defined???
    new QRCode($qrCode[0], {
        text: $qrCode.attr('data-identifier'),
        width: 120,
        height: 120,
    });

    $(config.printButton).on('click', function () {
        window.print();
    });

    // Auto-select gift card code on click, based on ID passed to the function
    $(config.giftCardCode).on(
        'click',
        {
            element: 'GiftCardDigits',
        },
        selectText
    );

    function selectText(evt) {
        const text = document.getElementById(evt.data.element);

        if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}
