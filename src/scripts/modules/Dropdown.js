import $ from 'jquery';

export default class CustomDropDown {
    constructor($el) {
        console.log('init custom drop down');
        const activeClass = 'active';
        const $selector = $el.find('select:not(.hide)');
        const selectSelector = 'select-dropdown';
        const showClass = 'show';
        const handler = function () {
            const $el = $(this);
            const val = $el.find(':checked').val();

            if (val !== '') {
                $el.addClass(activeClass);
            } else {
                $el.removeClass(activeClass);
            }
        };
        const closeDropdown = function () {
            const $el = $(this);

            $el.removeClass(showClass);
            $el.parents('.input-wrapper').removeClass('active');
        };

        $('body').click(function (e) {
            const $target = $(e.target);
            if (
                $target.is('select') ||
                $target.is('.select-dropdown') ||
                $target.is('.select-dropdown li')
            )
                return;
            closeDropdown.call($(`.${selectSelector}`));
        });

        $selector.each(function () {
            handler.call(this);

            const $select = $(this);
            const $options = $select.children();
            const $customOptions = $('<ul class="select-dropdown"></ul>');

            $options.each(function () {
                const val = $(this).val();
                const text = $(this).text();
                const availability =
                    typeof $(this).attr('disabled') !== 'undefined'
                        ? false
                        : true;

                $customOptions.append(
                    `<li data-value="${val}" data-name="${text}" data-available="${availability}">${text}</li>`
                );
            });

            console.log($select.parent().find('ul').length);
            if ($select.parent().find('ul').length < 1) {
                $select.parent().append($customOptions);
            }

            const $customOptionChildren = $customOptions.children('li');
            $customOptionChildren.click(function (e) {
                e.stopPropagation();
                if (!GlobalObj.utilities.isMobile()) {
                    const $li = $(this);
                    const value = $li.data('value');

                    $select.val(value);
                    closeDropdown.call($li.parents(`.${selectSelector}`));
                }
            });

            $select.on('mousedown', function (e) {
                if (!GlobalObj.utilities.isMobile()) {
                    e.preventDefault();
                    e.stopPropagation();

                    const $el = $(this);

                    $(`.${selectSelector}`).removeClass(showClass);
                    $(this)
                        .siblings(`.${selectSelector}`)
                        .toggleClass(showClass);
                    $el.parents('.input-wrapper').addClass('active');
                }
            });
        });

        $selector.on('change', handler);
    }
}
