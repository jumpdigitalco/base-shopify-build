/*
	OneContact 2.0.0 Usage (Webpack)
	Yang @onerockwell
	
	OneContact.init({
		el: $('.contact-form-container'),
		submitType: 'json' || 'default',
		errorMsg: 'Oops, something wrong happened, please try again later',
		successMsg: 'Thank you and welcome to Safiyaa. You will receive an email to confirm your subscription shortly.',
		requiredMsg: 'Error: required field',
		errorEmail: 'Error: please ensure formatting is correct',
		successCallback: function(d){},
		errorCallback: function(err){}
	});
	
*/

// Import all dependencies here
import $ from 'jquery';
export default class OneContactView {
    constructor({
        $el,
        submitType,
        errorMsg,
        successMsg,
        errorEmail,
        onSubmit,
        successCallback,
        errorCallback,
        requiredMsg,
    }) {
        console.log('init contact form');

        this.$el = $el;
        this.$form = this.$el.find('form');
        this.submitType = submitType ?? 'default';
        this.errorMsg =
            errorMsg ??
            'Oops, something wrong happened, please try again later';
        this.successMsg =
            successMsg ??
            'Thank you for your interest! We will be in touch soon.';
        this.errorRequired = requiredMsg ?? 'This is a required field';
        this.errorEmail =
            errorEmail ?? 'Please review the field formatting';
        this.onSubmit = onSubmit ?? false;

        const successCallbackDefault = (d) => console.log(d);
        const errorCallbackDefault = (err) => console.error(err);

        this.successCallback = successCallback ?? successCallbackDefault;
        this.errorCallback = errorCallback ?? errorCallbackDefault;

        // this.submisionCtl();

        $('input.required').on('blur', this.validation);
    }

    submisionCtl() {
        let callback = (e) => {
            console.log('submit callback', e, e.preventDefault(), this.validation(e));
            e.preventDefault();
            if (this.validation(e)) {
                console.log('Submit the form via this.submitType', e, this.submitType);
                if (this.submitType == 'json') {
                    this.formSubmitJSON(e);
                } else {
                    this.formSubmit(e);
                }
            } else {
                return false;
            }
        };

        if (this.submitType === 'custom') {
            callback = (e) => {
                if (this.validation(e)) {
                    this.onSubmit(e);
                } else {
                    return false;
                }
            };
        }

        this.$form.on('submit', function(e){
            e.preventDefault();
            callback(e);
        })

        // this.$form.submit(callback);
    }

    validation(e) {
        console.log('validation');
        const $curr = $(e.currentTarget);
        let $requiredFields = $curr.find('input.required');

        const errorHandling = function ($container, msg) {
            if ($container.find('.error-msg').length) {
                $container.find('.error-msg').text(msg);
            } else {
                $container.append(`<span class="error-msg">${msg}</span>`);
            }
        };
        let passValidation = true;

        if ($curr.hasClass('required')) {
            $requiredFields = $curr;
        }

        for (let input of $requiredFields) {
            const $input = $(input);
            const $parent = $input.parent();
            const value = $input.val();
            const isEmailField = $input.attr('type') == 'email' ? true : false;
            const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            console.log(' this.errorRequired', $input,  this.errorRequired, value.length, isEmailField);

            if (!value.length) {
                passValidation = false;
                $parent.addClass('input-error');
                errorHandling($parent, this.errorRequired);
            } else if (isEmailField) {
                if (!regex.test(value)) {
                    passValidation = false;
                    errorHandling($parent, this.errorEmail);
                } else {
                    $parent.removeClass('input-error');
                }
            } else {
                $parent.removeClass('input-error');
            }
        }

        console.log('passValidation', passValidation);

        return passValidation;
    }

    formSubmit(e) {
        console.log('formSubmit');

        const { $form } = this;

        $.ajax({
            async: true,
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            cache: false,
            error: this.errorCallback,
            success: (data) => {
                e.preventDefault();
                this.successCallback(data);
            },
        });
    }

    formSubmitJSON(e) {
        console.log('formSubmitJSON');
        e.preventDefault();
        const { $form } = this;

        // $.ajax({
        //     type: $form.attr('method'),
        //     url: $form.attr('action'),
        //     data: $form.serialize(),
        //     cache: false,
        //     dataType: 'json',
        //     contentType: 'application/json; charset=utf-8',
        //     error: this.errorCallback,
        //     success: (data) => {
        //         this.successCallback(data) 
        //     },
        // });

        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Accept': 'text/html, */*; q=0.01',
				'X-Requested-With': 'XMLHttpRequest'
            },
            error: this.errorCallback,
            success: (data) => {
                this.successCallback(data) 
            },
        });
    }
}
