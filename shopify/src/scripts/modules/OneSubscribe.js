import $ from 'jquery';

import OneContact from 'Modules/OneContact';
export default class OneSubscribeView {
    constructor({
        $el,
        integrationType,
        errorMsg,
        successMsg,
        requiredMsg,
        errorEmail,
        delay,
        cookieDays,
        cookieEnabled,
    }) {
        console.log('init subscribe');

        if (!$el?.length) return false;

        this.$modal = $el;
        this.enabled = this.$modal.data('enabled');
        this.integrationType = integrationType ?? this.$modal.data('type');
        this.errorMsg = errorMsg ?? this.$modal.data('errormsg');
        this.successMsg = successMsg ?? this.$modal.data('successmsg');
        this.errorRequired = requiredMsg ?? this.$modal.data('requiredmsg');
        this.errorEmail = errorEmail ?? this.$modal.data('erroremail');
        this.delay = delay ?? this.$modal.data('delay');
        this.days = cookieDays ?? this.$modal.data('cookiedays');
        this.cookieEnabled = cookieEnabled ?? this.$modal.data('cookieenabled');
        this.$form = this.$modal.find('form');

        if (!this.enabled) {
            console.log('init subscribe modal: Disabled');
            return false;
        } else {
            this.initModal();
            // this.initForm();
            console.log('init subscribe modal: Enabled');
        }

        // Events
        $('.close, .continue-shopping .cta-1').click(() => this.close(true));
        $('.global-message a').click((e) => {
            e.preventDefault();
            const $curr = $(e.currentTarget);
            if ($curr.attr('href')) {
                window.open($curr.attr('href'));
            }
        });
        $('.global-message').click(() =>
            this.$form.parent().removeClass('submitted error success')
        );
    }

    async initModal() {
        const { default: OneDrawer } = await import('Modules/OneDrawer');
        const self = this;

        console.log('Init Subscribe Modal');
        this.subscribeDrawer = new OneDrawer({
            drawerElem: '#SubscribeModal',
            triggerEvent: 'click',
            triggerElem: '.subscribe-modal-trigger',
            openCallback: function(){
                console.log('Open Subscribe Modal');
            }
        });

        if (
            theme.configs.cookieBannerEnabled &&
            GlobalObj.utilities.getCookie('acceptcookieterm')
        ) {
            // If cookie banner enabled and accepted
            console.log('this', this);
            // setTimeout(function () {
                console.log('open the cookieBanner');
                this.open();
            // }, this.delay);
        } else if (!theme.configs.cookieBannerEnabled) {
            // If cookie banner disabled
            setTimeout(function () {
                // this.open();

                console.log('subscribe open function', self.cookieEnabled, self.subscribeDrawer );
                if (
                    !GlobalObj.utilities.getCookie('hidesubscriptionmodal') ||
                    !self.cookieEnabled
                ) {
                    self.subscribeDrawer.openDrawer();
                    // $('.subscribe-modal-trigger').trigger('click')
                }
            }, this.delay);
        }
    }

    initForm() {
        const submitType =
            this.integrationType === 'klaviyo' ? 'custom' : 'json';

        new OneContact({
            $el: this.$modal,
            submitType: submitType,
            errorMsg: this.errorMsg,
            successMsg: this.successMsg,
            requiredMsg: this.errorRequired,
            errorEmail: this.errorEmail,
            onSubmit: function (e) {
                console.log(e);
            },
            successCallback: (data) => {
                console.log('form success');
                this.submitCallBack(true, data);
            },
            errorCallback: (err) => {
                console.log('form error');
                this.submitCallBack(false, err);
            },
        });
    }

    open() {
        console.log('open function', this.cookieEnabled );
        if (
            !GlobalObj.utilities.getCookie('hidesubscriptionmodal') ||
            !this.cookieEnabled
        ) {
            this.subscribeDrawer.openDrawer();
        }
    }

    close(setCookie) {
        this.subscribeDrawer.closeDrawer();
        if (setCookie && this.cookieEnabled) {
            GlobalObj.utilities.setCookie('hidesubscriptionmodal', true, this.days);
        }
    }

    submitCallBack(isSuccess, data) {
        const errorHandling = function ($form, msg, flag) {
            const $container = $form.parent();
            const $globalMsg = $container.find('.global-message');
            msg = '<span>' + msg + '</span>';

            if ($globalMsg.length) {
                $globalMsg.html(msg);
            } else {
                $container.append(
                    '<p class="global-message">' + msg + '</span>'
                );
                $globalMsg = $container.find('.global-message');
            }

            $container.removeClass('submitted error success');

            if (flag === 'success') {
                // Clear up the form
                const $inputs = $form.find('.group input');

                for (let input of $inputs) {
                    const $input = $(input);

                    if (
                        $input.attr('type') != 'checkbox' &&
                        $input.attr('type') != 'radio'
                    ) {
                        $input.val('');
                    } else if ($input.attr('type') == 'checkbox') {
                        $input.removeAttr('checked');
                    }
                }

                $container.addClass('submitted success');
            } else if (flag === 'error') {
                $container.addClass('submitted error');
            }
        };

        errorHandling(this.$form, '', '');

        if (isSuccess) {
            if (data.result == 'success' || data.success) {
                // Successed!
                errorHandling(this.$form, this.successMsg, 'success');

                const delay = Math.max(this.delay, 3000);

                setTimeout(() => {
                    this.close(true);
                }, delay);
            } else {
                errorHandling(this.$form, data.msg, 'error');
            }
        } else {
            errorHandling(this.$form, this.errorMsg, 'error');
        }
    }
}
