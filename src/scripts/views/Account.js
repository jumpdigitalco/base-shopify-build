import $ from 'jquery';
import OneContact from 'Modules/OneContact';

let urlPath = window.location.pathname.toLowerCase();
let urlHash = window.location.hash.toLowerCase();

export default function AccountView() {
    console.log('init account view');

    if (urlPath === '/account/login') {
        // Login page
        const $accountLogin = $('.account.account-login');
        const $accountRecover = $('.account.account-recover-password');

        if (urlHash.indexOf('recover') >= 0) {
            $accountRecover.removeClass('hide');
        } else {
            $accountLogin.removeClass('hide');
        }

        $('.RecoverPassword').on('click', function () {
            $accountRecover.removeClass('hide');
            $accountLogin.addClass('hide');
        });

        $('.HideRecoverPasswordLink').on('click', function () {
            $accountLogin.removeClass('hide');
            $accountRecover.addClass('hide');
        });
    } else if (urlPath === '/account/register') {
        // Register page
    } else if (urlPath === '/account/invalid_token') {
        // Reset error page
        $('.account.account-error').removeClass('hide');
    } else if (urlPath === '/account/addresses') {
        // Addresses page

        if (Shopify) {
            // Initialize observers on address selectors, defined in shopify_common.js
            new Shopify.CountryProvinceSelector(
                // eslint-disable-next-line no-new
                'AddressCountryNew',
                'AddressProvinceNew',
                {
                    hideElement: 'AddressProvinceContainerNew',
                }
            );

            if (!$('.address-list-empty').length) {
                // Initialize each edit form's country/province selector
                $('.address-country-option').each(function () {
                    var formId = $(this).data('form-id');
                    var countrySelector = 'AddressCountry_' + formId;
                    var provinceSelector = 'AddressProvince_' + formId;
                    var containerSelector =
                        'AddressProvinceContainer_' + formId;
                    new Shopify.CountryProvinceSelector(
                        countrySelector,
                        provinceSelector,
                        {
                            // eslint-disable-next-line no-new
                            hideElement: containerSelector,
                        }
                    );
                });

                // Initialize each addresses delete action
                $('.address-delete').on('click', function () {
                    var $el = $(this);
                    var formId = $el.data('form-id');
                    var confirmMessage = $el.data('confirm-message');

                    if (
                        confirm(
                            confirmMessage ||
                                'Are you sure you wish to delete this address?'
                        )
                    ) {
                        Shopify.postLink('/account/addresses/' + formId, {
                            // eslint-disable-next-line no-alert
                            parameters: { _method: 'delete' },
                        });
                    }
                });
            }

            var toggleAddressForm = function (e) {
                var $curr = $(e.currentTarget);
                var formId = $curr.data('form-id');
                var $formContainer = $('#EditAddress_' + formId);
                if ($formContainer.length) {
                    $formContainer.fadeToggle();
                }
            };
            $('.address-edit-toggle, .address-new-toggle').on(
                'click',
                function (e) {
                    toggleAddressForm(e);
                }
            );
        }
    }

    // Form validation
    new OneContact({
        $el: $('.account-wrapper form').parent(),
        submitType: 'custom',
        errorMsg: 'error',
        successMsg: 'success',
        requiredMsg: 'Required field.',
        errorEmail: 'Please provide a correct email address',
        onSubmit: function (e) {
            var $curr = $(e.currentTarget);
            var $form = $curr;

            if ($form.find('.fieldset.dob').length) {
                var $dobFieldset = $form.find('.fieldset.dob');
                var $dobField = $dobFieldset.find('#Dob');
                var dobMonth = $dobFieldset.find('#DobMonth').val();
                var dobDay = $dobFieldset.find('#DobDay').val();
                if (dobMonth && dobDay) {
                    $dobField
                        .val(dobMonth + '/' + dobDay)
                        .removeAttr('disabled');
                }
            }

            return true;
        },
    });
}
