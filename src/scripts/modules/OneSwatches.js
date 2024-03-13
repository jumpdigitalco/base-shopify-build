/*
	OneSwatches 2.2.0 Usage (Webpack)
	Yang @onerockwell
	Adding option availablity check

	OneSwatches 2.1.0 Usage
	Yang @onerockwell
	Adding option availablity check
	
	OneSwatches 2.0.0 Usage
	Yang @onerockwell
	
	OneSwatches 1.0.0 Usage
	Yang & Patrick @onerockwell
*/

// Import all dependencies here
import $ from 'jquery';
import { sleep } from 'App/helpers';

export default class OneSwatchesView {
    constructor({ $el, product, disableImageUpdate, preSelect }) {
        console.log('OneSwatchesView started');

        this.$el = $el;
        this.optionsMapMix = {};
        this.optionsFlowStr = ['', '', ''];
        this.$content = this.$el;
        this.$media = disableImageUpdate ? this.$content.find('.product-media'): '';
        this.$optionSelects = this.$content.find('.single-option-selector');
        this.$optionSwatches = this.$content.find(
            '.oneswatch:not(.oneswatch-linked) .swatches'
        );
        this.disableImageUpdate = disableImageUpdate;

        if (product) {
            this.buildOptionMaps(product);
            window.optionsMapMix = this.optionsMapMix;
        }

        // PreSelect
        if (preSelect) {
            this.$content.find('.single-option-selector').trigger('change');
        } else {
            for (let select of this.$content.find('.single-option-selector')) {
                if ($(select).siblings('label').length) {
                    $(select)
                        .prepend(
                            `
                            <option value="">
                                ${$(select).siblings('label').text()}
                            </option>
                        `
                        )
                        .val('');
                } else {
                    var label = 'Size'; // Hard coded single select
                    $(select)
                        .prepend('<option value="">' + label + '</option>')
                        .val('');
                }
            }
            // Check for variants with only one option and pre select them
            (async () => {
                await sleep(500);
                let singleOptionselector = this.$content.find('.single-option');

                for (let select of singleOptionselector) {
                    $(select).find('.swatch').click();
                }
            })();
        }

        // Single select
        console.log('this.$optionSelects', this.$optionSelects,  this.$optionSelects.length);
        if (this.$optionSelects.length === 1) {
            this.updateOptionsInSelector();
        }

        // Click outside to close
        $(window)
            .not('.oneswatch')
            .on('click', function (e) {
                $('.oneswatch').removeClass('opened');
            });

        $('.oneswatch').click(this.swatchDropdown);
        $('.single-option-selector').on(
            'change',
            this.dropdownHandle.bind(this)
        );
        $('.oneswatch:not(.oneswatch-linked) .swatches .swatch').click(
            this.swatchHandle.bind(this)
        );
        $('.oneswatch-linked .swatches .swatch:not(".active")').click(
            this.swatchHandleLink.bind(this)
        );
    }

    swatchDropdown(e) {
        // Dropdown control
        e.stopPropagation();
        e.preventDefault();

        const $curr = $(e.currentTarget);
        $curr.siblings('.oneswatch').removeClass('opened');
        $curr.toggleClass('opened');
    }

    swatchHandleLink(e) {
        const isAjax = false;
        const $curr = $(e.currentTarget);
        const url = $curr.attr('href');

        /*
            Due to preventDefault function, we need to handle the actual link click event manually. 
            Either trigger an ajax content update request or redirect to the link url.
            */

        if ($curr.data('ajax')) {
            isAjax = true;
            $('body').trigger('ajax-reload-inner', [url]);
        }

        if (!isAjax) {
            window.location.href = url;
        }
    }

    swatchHandle(e) {
        // Swatch click control
        let $dropdown,
            $curr = $(e.currentTarget),
            $parent = $curr.closest('.swatches'),
            $form = $curr.closest('form'),
            $label = $parent.siblings('.swatch-label'),
            selectAttr = $parent.data('name'),
            selectIndex = $parent.data('option'),
            val = $curr.data('name');

            // console.log('swatch handle',  $form)

        if ($curr.hasClass('active')) {
            return false;
        }

        if ($form.attr('id').split('-').length > 1) {
            // PLP
            const selectorArray = $form.attr('id').split('-');
            const pid = selectorArray[1];
            console.log('swatch handle pid:',  pid)
            $dropdown = $(`#productSelect-${pid}-option-${selectIndex}`);
        } else {
            // PDP
            $dropdown = $(`#productSelect-option-${selectIndex}`);
        }
        // console.log('dropdown: ', $dropdown, val)

        $dropdown.val(val);
        $dropdown.change();

        // if (self.isMobile()) {
        this.updateLabel($label, selectAttr, val);
        // }
    }

    dropdownHandle(e) {
        // console.log('dropdownHandle', e);
        this.updateOptionsInSelector(e);
        this.updateSwatches(e);
    }

    updateSwatches(e) {
        var self = this,
            $curr = $(e.currentTarget),
            $form = $curr.closest('form'),
            selectedValue = $curr.val(),
            optionIndexArray = $curr.data('option').split('option'),
            optionIndex = optionIndexArray[1] - 1; // Please make sure all dropdown has a valid data-option attribute
        // console.log(optionIndexArray[1]);

        var $swatchContainer = $form.find(
                '.swatches[data-option="' + optionIndex + '"]'
            ),
            $label = $swatchContainer.siblings('.swatch-label'),
            $selectedSwatch = $swatchContainer
                .find('.swatch')
                .filter(function (index) {
                    return $(this).data('select') == selectedValue;
                }),
            selectAttr = $swatchContainer.data('name');

        $swatchContainer.find('.swatch').removeClass('active');
        if ($selectedSwatch && !$selectedSwatch.hasClass('active')) {
            $selectedSwatch.addClass('active');

            if($form.attr('id').split('-').length > 1){//PLP
                //Add to cart upon selecting the size
                // $form.find('.add-to-cart-btn').trigger('click');
            }
        }

        // if (self.isMobile()) {
        // }

        this.updateLabel($label, selectAttr, selectedValue);
        self.updateImage(e, selectAttr);
    }

    updateLabel($label, attr, value) {
        const _attr = attr.toLowerCase();
        let _value = value.replace('SM', 'S').replace('MD','M').replace('LG','L');

        if (_attr !== 'title' && _attr !== 'value')
            _value = `${attr}: ${_value}`;

        $label.text(_value);
    }

    updateImage(e, attribute) {
        var self = this,
            $curr = $(e.currentTarget), // Shopify select dropdown
            $form = $curr.closest('form'),
            $media = self.$content.find('.product-media'),
            selectedValue = $curr.val(),
            canUpdateColor = false;

            // console.log('selectedValue', selectedValue);

        attribute = attribute.replace(/\-| |\_|\//g, '').toLowerCase();

        // console.log('attribute:', attribute);

        if ( attribute.indexOf("color") >= 0
        // 	|| attribute.indexOf("finish") >= 0
        // 	|| attribute.indexOf("size") >= 0
        // 	|| attribute.indexOf("weight") >= 0
        ) {
            canUpdateColor = true;
        }

        // console.log('canUpdateColor:', canUpdateColor);
        // console.log('self.disableImageUpdate:', self.disableImageUpdate);

        // P2: Please update this part for X
        if (!self.disableImageUpdate) {
            // Only apply when color got selected
            if ($form.attr('id').split('-').length > 1) {
                // PLP
                var $selectedSwatch = $form.find(
                    '.swatches [data-select="' + selectedValue + '"]'
                );
                var imageSrc = $selectedSwatch.length
                    ? $selectedSwatch.data('image')
                    : false;
                if (imageSrc) {
                    $form
                        .parents('.item')
                        .find('.product-image')
                        .attr('src', imageSrc);
                }
            } else if (selectedValue?.length > 0) {
                // PDP
                selectedValue = selectedValue
                    .replace(/\-|\_|\//g, '')
                    .replace(/ /g, '-')
                    .toLowerCase();

                console.log('selectedValue:', selectedValue);
                // console.log('$selectedThumbs:', $selectedThumbs);

                var $thumbnails = $media.find(
                    '#ProductMediaThumbs .image-thumbnail'
                );
                var $mainImages = $media.find(
                    '#ProductMediaImages .image-slide'
                );

                var $selectedThumbs = $thumbnails.filter(function (index) {
                    if(canUpdateColor){
                        return $(this).data('variant-option-value') == selectedValue;
                    }else{
                        return $(this).data('image-variant') == selectedValue;
                    }
                });
                if ($selectedThumbs.length) {
                    if(canUpdateColor){
                        console.log('Update color images');

                        // Hide all variant images that arent either no-variant or non the selected color

                        // Images are shown on mobile for both regular and e-pdp

                        $mainImages.removeClass('display active').addClass('nodisplay');
                        $mainImages.filter('[data-variant-option-value="noval"],[data-variant-option-value="' + selectedValue + '"]').removeClass('nodisplay').addClass('display');

                        if($('.product-detail-container').hasClass('enhanced-v1')){
                            $mainImages.not('[data-variant-option-value="' + selectedValue + '"]').appendTo('#ProductMediaImages .images-wrapper');
                        }else{
                            $media.find('#ProductMediaImages .images-wrapper').slick('slickUnfilter');

                            // Filter the slick slider shown for the regular PDP
                            $media.find('#ProductMediaImages .images-wrapper .slick-slide').removeClass('display');
                            $media.find('#ProductMediaImages .images-wrapper .image-slide').filter('[data-variant-option-value="noval"],[data-variant-option-value="' + selectedValue + '"]').parents('.slick-slide').addClass('display');

                            $media.find('#ProductMediaImages .images-wrapper').slick('slickFilter','.display');

                            setTimeout(function(){
                                $media.find('.image-thumbnail.display').first().addClass('active');
                                $(window).trigger('resize');
                            },300)
                        }

                        // Note: $thumbnails container is the one shown on enhnaced pdp as the mian container
                        $thumbnails.removeClass('display active').addClass('nodisplay');
                        $thumbnails.filter('[data-variant-option-value="noval"],[data-variant-option-value="' + selectedValue + '"]').removeClass('nodisplay').addClass('display');

                        if($('.product-detail-container').hasClass('enhanced-v1')){
                            $thumbnails.not('[data-variant-option-value="' + selectedValue + '"]').appendTo('#ProductMediaThumbs .images-wrapper');
                        }

                    }else{
                        $media
                            .find('[data-image-variant="no-variant"]')
                            .addClass('display');

                        $thumbnails
                            .filter('[data-image-variant="' + selectedValue + '"]')
                            .first()
                            // .trigger('click');
                            .trigger('variantImageChange');
                    }

                    /* FOLLOWING CODE MAKES THE IMAGE SWATCH WORK, FILTERING IMAGES BASED ON VARIANT SELECTION */
                    // Unselect and mark all slides are not displayed
                    // $media.find('[data-image-variant]').not('[data-image-variant="no-variant"]').removeClass('display').addClass('nodisplay');
                    // $media.find('#ProductMediaImages').find('.slick-slide').removeClass('display').addClass('nodisplay');
                    // $media.find('#ProductMediaImages .images-wrapper').slick('slickUnfilter');

                    // // Mark selected variant as ready to display
                    // $media.find('[data-image-variant="'+ selectedValue +'"]').removeClass('nodisplay').addClass('display');
                    // $media.find('#ProductMediaImages').find('.display').parents('.slick-slide').removeClass('nodisplay').addClass('display');

                    // $thumbnails.filter('.display').first().trigger('click');
                    // $media.find('#ProductMediaImages .images-wrapper').slick('slickFilter','.display');
                }
            }
        }
    }

    buildOptionMaps(product) {
        // console.log(product);
        // Building our mapping object.
        //
        // 04/26/21 nick.arcuri@spartan.com - no idea what this code does, but its so verbose that
        // i think it could probably be trimmed down and made much more readable. There is a log
        // of repeated code
        //

        for (let i = 0; i < product.variants.length; i++) {
            const variant = product.variants[i];

            if (variant.available) {
                // For each option
                for (let k = 0; k < product.options.length; k++) {
                    // k is option index

                    // Gathering values for the 1st option.
                    this.optionsMapMix[k] = this.optionsMapMix[k] || [];

                    switch (k) {
                        case 0: // Order: 0-1-2
                            // Gathering values for the 2nd option.
                            if (product.options.length == 1) {
                                var key = variant.options[k];
                                this.optionsMapMix[k] =
                                    this.optionsMapMix[k] || [];
                                this.optionsMapMix[k].push(
                                    variant.options[0].toString()
                                );
                            }
                            if (product.options.length > 1) {
                                var key = variant.options[k];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[1]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                            // Gathering values for the 3rd option.
                            if (product.options.length === 3) {
                                var key =
                                    variant.options[k] +
                                    ' / ' +
                                    variant.options[1];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[2]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                            break;
                        case 1: // Order: 1-0-2
                            // Gathering values for the 2nd option.
                            if (product.options.length > 1) {
                                var key = variant.options[k];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[0]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                            // Gathering values for the 3rd option.
                            if (product.options.length === 3) {
                                var key =
                                    variant.options[k] +
                                    ' / ' +
                                    variant.options[0];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[2]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                            break;
                        case 2: // Order: 2-0-1
                            // Gathering values for the 2nd option.
                            if (product.options.length > 1) {
                                var key = variant.options[k];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[0]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                            // Gathering values for the 3rd option.
                            if (product.options.length === 3) {
                                var key =
                                    variant.options[k] +
                                    ' / ' +
                                    variant.options[0];
                                this.optionsMapMix[k][key] =
                                    this.optionsMapMix[k][key] || [];
                                this.optionsMapMix[k][key].push(
                                    variant.options[1]
                                );
                                this.optionsMapMix[k][key] = Shopify.uniq(
                                    this.optionsMapMix[k][key]
                                );
                            }
                    }
                }
            }
        }
    }

    updateOptionsInSelector(e) {
        // console.log('updateOptionsInSelector', e);
        const optionsfilter = function (
            options,
            optionsArray,
            value,
            resultsArray
        ) {
            if (options && options.length) {
                for (let option of options) {
                    if (!resultsArray.includes(option)) {
                        resultsArray.push(option);
                        const key = `${value} / ${option}`;
                        const newOptions = optionsArray[key];

                        optionsfilter(
                            newOptions,
                            optionsArray,
                            value,
                            resultsArray
                        );
                    }
                }
            } else {
                return resultsArray;
            }
        };

        // console.log('$.isEmptyObject(this.optionsMapMix)', $.isEmptyObject(this.optionsMapMix));
        if (!Object.keys(this.optionsMapMix).length) {
            this.$optionSwatches.find('.swatch').addClass('disabled');
            return false;
        }

        if (!e) {
            console.log('For single select update without passing event');
            // For single select update without passing event
            var $selector = this.$optionSelects,
                $options = $selector.find('option'),
                optionArray = this.optionsMapMix[0],
                availableOptions = [];

            // Update select options
            $selector.val('');
            $options.attr('disabled', 'disabled');
            $options = $options.filter(function (index, elem) {
                return $.inArray($(elem).attr('value'), optionArray) != -1;
            });
            if ($options && $options.length) {
                $options.removeAttr('disabled');
            }

            // Update swatches
            var $linkedSwatch = this.$optionSwatches;
            var $swatches = $linkedSwatch.find('.swatch').addClass('disabled');
            $swatches = $swatches.filter(function (index, elem) {
                var swatchValue = String($(elem).data('select'));
                return $.inArray(swatchValue, optionArray) != -1;
            });
            if ($swatches && $swatches.length)
                $swatches.removeClass('disabled');
            return false;
        } else {
            // console.log('For multi selects update using event trigger');
            // For multi selects update using event trigger

            if( $(e.currentTarget).attr('id') != this.$optionSelects.attr('id')){
                // console.log('its a diff product, dont loop it');
                return false;
            }

            var $curr = $(e.currentTarget),
                availableOptions = [],
                selectorValue = $curr.val(),
                selectorIndex = this.$optionSelects.index($curr),
                optionArray = this.optionsMapMix[selectorIndex],
                results = optionArray[selectorValue];

            // Here we need to 'flatrize' the available options
            availableOptions.push(selectorValue);
            optionsfilter(
                results,
                optionArray,
                selectorValue,
                availableOptions
            );

            // Should the values array also check selected values? For 3 selections, we need to check the selected value agains the avaliable mitrix

            // this.optionsFlowStr[selectorIndex] = selectorValue;
            // console.log(this.optionsFlowStr);

            // _.each(this.$optionSelects, function(select){
            // 	var $selector = $(select);
            // 	var initialValue = $selector.val();
            // 	var currIndex = this.$optionSelects.index($selector);
            // 	var $options = $selector.find('option');
            //
            // 	if (currIndex !== selectorIndex && initialValue) {
            // 		console.log('also chose: ' + initialValue);
            // 	}
            // });

            // console.log('Available options: ' + availableOptions);

            // Update the other two select dropdowns and swatches
            for (let select of this.$optionSelects) {
                const $selector = $(select);
                const initialValue = $selector.val();
                const currIndex = this.$optionSelects.index($selector);
                const $options = $selector.find('option');

                if (currIndex !== selectorIndex) {
                    // Update select options
                    // console.log('Initial value: ' + initialValue);

                    // Clean up
                    if (!availableOptions.length) {
                        $selector.val('');
                        $options.attr('disabled', 'disabled');
                        $options = $options.filter(function (index, elem) {
                            return (
                                $.inArray(
                                    $(elem).attr('value'),
                                    availableOptions
                                ) != -1
                            );
                        });
                        if ($options && $options.length) {
                            $options.removeAttr('disabled');
                        }
                    }
                    // Clean up done

                    if ($.inArray(initialValue, availableOptions) !== -1) {
                        $selector.val(initialValue);
                    }

                    // Update swatches
                    var $linkedSwatch = this.$optionSwatches.filter(function (
                        index,
                        elem
                    ) {
                        return $(elem).data('option') == currIndex;
                    });
                    var $swatches = $linkedSwatch
                        .find('.swatch')
                        .addClass('disabled')
                        .removeClass('active');
                    $swatches = $swatches.filter(function (index, elem) {
                        var swatchValue = String($(elem).data('select'));
                        return $.inArray(swatchValue, availableOptions) != -1;
                    });
                    if ($swatches && $swatches.length)
                        $swatches.removeClass('disabled');
                    var $selectedSwatch = $swatches.filter(
                        '[data-select="' + initialValue + '"]'
                    );
                    if ($selectedSwatch && $selectedSwatch.length)
                        $selectedSwatch.addClass('active');
                }
            }

            return false;
        }
    }
}
