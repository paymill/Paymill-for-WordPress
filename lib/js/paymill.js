// Visible log messages.
function printLogMessage(message) {
	//document.getElementById("paymill_payment_errors").textContent += message + "\n";
	console.log(message);
}

function paymill_embed_pcidss3_frame(){
	// Prepare container element, either ID or DOM element - all variants are useable.
	var frameContainer    = jQuery('#paymill_form_credit');

	// Prepare callback for when the frame has failed or finished loading.
	var frameCallback = function(error) {
		if (error) {
			// In practice: Handle the error and retry loading the frame.
			printLogMessage(error.apierror + ": " + error.message);
		} else {
			// In practice: Maybe hide the frame first and fade it in now.
			printLogMessage("frame loaded");
		}
	};
	
	printLogMessage("loading frame …");
	paymill.embedFrame(
		frameContainer,
		{
			lang: paymill_lang.lang // default: en, other languages: de, fr, it, es, pt
		},
		frameCallback
	);
}


// Load embedded credit card frame in an iframe.
var paymill_youshallpass = false;

jQuery(window).load(function() {
	jQuery('body').on('updated_checkout', function(){
		console.log('checkout updated, reload frame...');
		if(paymill_pcidss3 == 1 && jQuery('#paymill_form_credit').length == 1){
			paymill_embed_pcidss3_frame();
		}
	});
});

function bridgePreparePayment(){
		console.log('paymill bridge started');
		
		// check which payment method is active
		if(
			(
				jQuery('#paymill_form_credit').css("display") != 'none' &&
				((jQuery('#paymill_card_number').length > 0 && jQuery('#paymill_card_number').val() != '')
				|| paymill_pcidss3 == 1)
			) &&
			(
				jQuery('#payment_method_paymill').is(':checked') ||
				jQuery('.wgm-second-checkout input[name=payment_method]').val() == 'paymill' ||
				jQuery("#mgm_paymill_form").length != 0 ||
				paymill_shop_name == 'cart66' ||
				paymill_shop_name == 'paybutton'
			)
		){
			console.log('credit card form started being processed');
			
			if(paymill_pcidss3 == 1){
				console.log('pcidss3 detected');
				
				paymill.createTokenViaFrame({
					amount_int: jQuery('.paymill_amount').val(),
					currency: jQuery('.paymill_currency').val(),
					email:jQuery('#billing_email').val()
				}, function(error, result) {
					if (error) {
						// shows error
						if(typeof paymill_lang[error.apierror] != 'undefined'){
							error_text = paymill_lang[error.apierror];
							if(typeof error.message != 'undefined'){
								error_text = error_text+": "+error.message.replace(/\+/g,' ');
							}
							
							jQuery(".paymill_payment_errors").text(error_text);
						}else{
							jQuery(".paymill_payment_errors").text(error.apierror);
						}
						jQuery(paymill_form_checkout_submit_id).show();
						jQuery('form.checkout').unblock();
					} else {
						var token = result.token;
						console.log('Token successfully generated: '+token);
						jQuery(".paymill_payment_errors").text("");
						
						var form = jQuery(paymill_form_checkout_id);
						form.append("<input type='hidden' name='paymillToken' id='paymillToken' value='" + token + "'/>"); // insert token into form
						console.log('submit form start');
						console.log('token length: '+jQuery('#paymillToken').length);
						console.log('form'+paymill_form_checkout_id);
						form.removeClass('processing');
						form.submit();
						console.log('submit form end');
					}
				});
			}else{
				if (false == paymill.validateCardNumber(jQuery('#paymill_card_number').val())) {
					jQuery(".paymill_payment_errors").text(paymill_lang.validateCardNumber);
					jQuery(paymill_form_checkout_submit_id).show();
					return false;
				}

				if (false == paymill.validateExpiry(jQuery('#paymill_card_expiry_month').val(), jQuery('#paymill_card_expiry_year').val())) {
					jQuery(".paymill_payment_errors").text(paymill_lang.validateExpiry);
					jQuery(paymill_form_checkout_submit_id).show();
					return false;
				}
				
				if (false == paymill.validateCvc(jQuery('#paymill_card_cvc').val())) {
					jQuery(".paymill_payment_errors").text(paymill_lang.validateCvc);
					jQuery(paymill_form_checkout_submit_id).show();
					return false;
				}

				paymill.createToken({
					number:jQuery('#paymill_card_number').val(),
					exp_month:jQuery('#paymill_card_expiry_month').val(),
					exp_year:jQuery('#paymill_card_expiry_year').val(),
					cvc:jQuery('#paymill_card_cvc').val(),
					cardholder:jQuery('#paymill_holdername_c').val(),
					amount_int:jQuery('.paymill_amount').val(),
					currency:jQuery('.paymill_currency').val(),
					email:jQuery('#billing_email').val()
				}, function (error, result) {
					if(error){
						// shows error
						if(typeof paymill_lang[error.apierror] != 'undefined'){
							jQuery(".paymill_payment_errors").text(paymill_lang[error.apierror]);
						}else{
							jQuery(".paymill_payment_errors").text(error.apierror);
						}
						jQuery(paymill_form_checkout_submit_id).show();
					}else{
						var token = result.token;
						console.log('Token successfully generated: '+token);
						jQuery(".paymill_payment_errors").text("");
						
						var form = jQuery(paymill_form_checkout_id);
						form.append("<input type='hidden' name='paymillToken' id='paymillToken' value='" + token + "'/>"); // insert token into form
						form.submit();
					}
					if(paymill_shop_name == 'shopplugin'){
						jQuery(paymill_form_checkout_submit_id).show();
					}
				});
			}
		}else if(jQuery('#paymill_form_sepa').css("display") != 'none' || (jQuery('#paymill_sepa_iban').length > 0 && jQuery('#paymill_sepa_iban').val() != '') && (jQuery('#payment_method_paymill').is(':checked') || jQuery('.wgm-second-checkout input[name=payment_method]').val() == 'paymill' || jQuery("#mgm_paymill_form").length != 0)){
			console.log('sepa form started being processed');
			
			if (false == paymill.validateIban(jQuery('#paymill_sepa_iban').val())){
				console.log(paymill_lang.validateIBAN);
				jQuery(".paymill_payment_errors").text(paymill_lang.validateIBAN);
				jQuery(paymill_form_checkout_submit_id).show();
				return false;
			}

			if (false == paymill.validateBic(jQuery('#paymill_sepa_bic').val())){
				console.log(paymill_lang.validateBIC);
				jQuery(".paymill_payment_errors").text(paymill_lang.validateBIC);
				jQuery(paymill_form_checkout_submit_id).show();
				return false;
			}
			
			paymill.createToken({
				iban:jQuery('#paymill_sepa_iban').val(),
				bic:jQuery('#paymill_sepa_bic').val(),
				accountholder:jQuery('#paymill_holdername_s').val(),
				amount_int:jQuery('.paymill_amount').val(),
				currency:jQuery('.paymill_currency').val(),
				email:jQuery('#billing_email').val()
			}, function (error, result){
				if (error){
					console.log(error.apierror);
					// shows error
					if(typeof paymill_lang[error.apierror] != 'undefined'){
						jQuery(".paymill_payment_errors").text(paymill_lang[error.apierror]);
					}else{
						jQuery(".paymill_payment_errors").text(error.apierror);
					}
					jQuery(paymill_form_checkout_submit_id).show();
				}else{
					var token = result.token;
					console.log('Token successfully generated: '+token);
					jQuery(".paymill_payment_errors").text("");
					
					var form = jQuery(paymill_form_checkout_id);
					form.append("<input type='hidden' name='paymillToken' id='paymillToken' value='" + token + "'/>"); // insert token into form
					form.submit();
				}
			});
		}else if(jQuery('#paymill_form_elv').css("display") != 'none' || (jQuery('#paymill_elv_number').length > 0 && jQuery('#paymill_elv_number').val() != '') && (jQuery('#payment_method_paymill').is(':checked') || jQuery('.wgm-second-checkout input[name=payment_method]').val() == 'paymill' || jQuery("#mgm_paymill_form").length != 0)){
			console.log('elv form started being processed');
			
			if (false == paymill.validateAccountNumber(jQuery('#paymill_elv_number').val())) {
				jQuery(".paymill_payment_errors").text(paymill_lang.validateAccountNumber);
				jQuery(paymill_form_checkout_submit_id).show();
				return false;
			}

			if (false == paymill.validateBankCode(jQuery('#paymill_elv_bank_code').val())) {
				jQuery(".paymill_payment_errors").text(paymill_lang.validateBankCode);
				jQuery(paymill_form_checkout_submit_id).show();
				return false;
			}
			
			paymill.createToken({
				number:jQuery('#paymill_elv_number').val(),
				bank:jQuery('#paymill_elv_bank_code').val(),
				accountholder:jQuery('#paymill_holdername_e').val(),
				amount_int:jQuery('.paymill_amount').val(),
				currency:jQuery('.paymill_currency').val(),
				email:jQuery('#billing_email').val()
			}, function (error, result) {
				if (error) {
					// shows error
					jQuery(".paymill_payment_errors").text(paymill_lang[error.apierror]);
					jQuery(paymill_form_checkout_submit_id).show();
				} else {
					var token = result.token;
					console.log('Token successfully generated: '+token);
					jQuery(".paymill_payment_errors").text("");
					
					var form = jQuery(paymill_form_checkout_id);
					form.append("<input type='hidden' name='paymillToken' value='" + token + "'/>"); // insert token into form
					form.submit();
				}
			});
		// PayPal: Checksum needs to be created serverside
		}else if(jQuery('#paymill_form_paypal').css("display") != 'none' && jQuery('#payment_method_paymill').is(':checked')){
			console.log('paypal form started being processed');
			var form = jQuery(paymill_form_checkout_id);
			form.append('<input type="hidden" name="paypal_via_paymill" id="paypal_via_paymill" value="1" />');
			form.submit();
			return true;
		// paymill payment form seems not to be used on this order, so let other payment channels complete that form.
		}else if(!jQuery('#payment_method_paymill').is(':checked')){
			console.log('no paymill form selected');
			var form = jQuery(paymill_form_checkout_id);
			form.submit();
			return true;
		}
		return false;
	}

function paymill_woocommerce_checkout(event){
	if(jQuery('#payment_method_paymill').is(':checked')){
		console.log(paymill_form_checkout_id+' triggered via checkout_place_order');
		
		// set delivery date
		if(jQuery.datepicker && jQuery("#e_deliverydate").length != 0){
			var datefield					= jQuery('#e_deliverydate').datepicker('getDate');
			var datefield_unix_js			= parseInt(jQuery.datepicker.formatDate('@',datefield));
			if(datefield_unix_js > 0){
				var datefield_offset_unix_js	= datefield.getTimezoneOffset() * 60000;
				var datefield_timezone_unix_js	= datefield_unix_js - datefield_offset_unix_js;
				var currentDate					= datefield_timezone_unix_js / 1000;

				if(jQuery("#paymill_delivery_date").length > 0){
					jQuery('#paymill_delivery_date').val(currentDate);
				}else{
					jQuery(paymill_form_checkout_id).append('<input type="hidden" name="paymill_delivery_date" id="paymill_delivery_date" value="'+currentDate+'" />');
				}
			}
		}
		console.log('token length: '+jQuery('#paymillToken').length);
		if(jQuery('#paymillToken').length > 0 || jQuery('#paypal_via_paymill').length > 0){
			return true;
		}else{
			bridgePreparePayment();
			console.log('token length: '+jQuery('#paymillToken').length);
			if(jQuery('#paymillToken').length > 0){
				return true;
			}else{
				return false;
			}
		}
	}else{
		return true; // nothing to do here
	}
}

jQuery(document).ready(function(){
	if(typeof paymill_shop_name != 'undefined'){
		if((paymill_shop_name == 'woocommerce' || jQuery('body').hasClass('woocommerce-checkout'))){
			if(jQuery('body').hasClass('woocommerce-multistep-checkout')){
				jQuery('body').on('click', paymill_form_checkout_submit_id, function(event){
					return paymill_woocommerce_checkout(event);
				});
			}else{
				jQuery(paymill_form_checkout_id).on('checkout_place_order', function(event){
					return paymill_woocommerce_checkout(event);
				});
			}
		}
		else if(paymill_shop_name == 'shopplugin'){
			jQuery('body').on('submit', paymill_form_checkout_id, function(event) {
				event.preventDefault();
				jQuery(paymill_form_checkout_submit_id).hide();
				bridgePreparePayment();
			});
		}
		else if(paymill_shop_name != 'woocommerce'){
			jQuery('body').on('click', paymill_form_checkout_submit_id, function(event) {
				event.preventDefault();
				jQuery(paymill_form_checkout_submit_id).hide();
				var result = bridgePreparePayment();
				if(result == false){
					jQuery(paymill_form_checkout_submit_id).show();
				}
			});
		}
	}
	
	// display credit cart icons
	jQuery('body').on('change', '#paymill_card_number', function() {
		var cc_type = paymill.cardType(jQuery('#paymill_card_number').val());

		if(cc_type != ''){
			jQuery('#paymill_card_number').show().css("padding-left","55px");
		}
		
		if(cc_type == 'Visa'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -240px");
		}else if(cc_type == 'MasterCard'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -210px");
		}else if(cc_type == 'American Express'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -180px");
		}else if(cc_type == 'Diners Club'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -150px");
		}else if(cc_type == 'Discover'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -120px");
		}else if(cc_type == 'JCB'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -90px");
		}else if(cc_type == 'Maestro'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -60px");
		}else if(cc_type == 'UnionPay'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 -30px");
		}else if(cc_type == 'cb'){
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 0");
		}else{
			jQuery('#paymill_card_number').show().css("backgroundPosition","0 30px");
			jQuery('#paymill_card_number').show().css("padding-left","");
		}
	});

	// Payment Type Form Switcher
	jQuery('body').on('click', '#paymill_form_switch_credit', function() {
		jQuery('#paymill_form_elv').hide('slow');
		jQuery('#paymill_form_switch_elv').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_sepa').hide('slow');
		jQuery('#paymill_form_switch_sepa').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_paypal').hide('slow');
		jQuery('#paymill_form_switch_paypal').removeClass('paymill_form_switch_active');
		
		jQuery('#paymill_form_credit').show('slow');
		jQuery('#paymill_form_switch_credit').addClass('paymill_form_switch_active');
		
		if(paymill_pcidss3 == 1){
			paymill_embed_pcidss3_frame();
		}
	});
	jQuery('body').on('click', '#paymill_form_switch_sepa', function() {
		jQuery('#paymill_form_credit').hide('slow');
		jQuery('#paymill_form_switch_credit').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_elv').hide('slow');
		jQuery('#paymill_form_switch_elv').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_paypal').hide('slow');
		jQuery('#paymill_form_switch_paypal').removeClass('paymill_form_switch_active');
		
		jQuery('#paymill_form_sepa').show('slow');
		jQuery('#paymill_form_switch_sepa').addClass('paymill_form_switch_active');
	});
	jQuery('body').on('click', '#paymill_form_switch_elv', function() {
		jQuery('#paymill_form_credit').hide('slow');
		jQuery('#paymill_form_switch_credit').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_sepa').hide('slow');
		jQuery('#paymill_form_switch_sepa').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_paypal').hide('slow');
		jQuery('#paymill_form_switch_paypal').removeClass('paymill_form_switch_active');
		
		jQuery('#paymill_form_elv').show('slow');
		jQuery('#paymill_form_switch_elv').addClass('paymill_form_switch_active');
	});
	jQuery('body').on('click', '#paymill_form_switch_paypal', function() {
		jQuery('#paymill_form_credit').hide('slow');
		jQuery('#paymill_form_switch_credit').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_sepa').hide('slow');
		jQuery('#paymill_form_switch_sepa').removeClass('paymill_form_switch_active');
		jQuery('#paymill_form_elv').hide('slow');
		jQuery('#paymill_form_switch_elv').removeClass('paymill_form_switch_active');
		
		jQuery('#paymill_form_paypal').show('slow');
		jQuery('#paymill_form_switch_paypal').addClass('paymill_form_switch_active');
	});
	
	// Paymill Pay Button	
	jQuery('#paymill_total_number').formatCurrency({
		decimalSymbol: paymill_lang.decimalSymbol,
		digitGroupSymbol: paymill_lang.digitGroupSymbol,
		symbol: ' '+paymill_lang.symbol,
		negativeFormat: paymill_lang.currency_format,
		positiveFormat: paymill_lang.currency_format
	});
	jQuery('.paymill_price').formatCurrency({
		decimalSymbol: paymill_lang.decimalSymbol,
		digitGroupSymbol: paymill_lang.digitGroupSymbol,
		symbol: ' '+paymill_lang.symbol,
		negativeFormat: paymill_lang.currency_format,
		positiveFormat: paymill_lang.currency_format
	});
	
	function PaymillPayButtonCalcTotal(){
		var paymill_pay_button_sum = 0;
		jQuery.each(jQuery('select[name^="paymill_quantity"]'), function() {
			var index = jQuery(this).attr('name').match(/\[(\d+)\]/);
			if (index) { index = index[1]; }
			
			if(jQuery('.paymill_price_calc_'+index).html()){
				paymill_pay_button_sum = paymill_pay_button_sum+(Number(jQuery(this).val())*Number(jQuery('.paymill_price_calc_'+index).html()));
			}
		});
		
		var shipping = jQuery('.paymill_shipping option:selected').attr('data-deliverycosts');
		
		paymill_pay_button_sum = paymill_pay_button_sum+Number(shipping);
		
		jQuery('#paymill_total_number').html(paymill_pay_button_sum);
		jQuery('#paymill_total').val(Math.round(paymill_pay_button_sum*100));
		jQuery('#paymill_total_number').formatCurrency({
			decimalSymbol: paymill_lang.decimalSymbol,
			digitGroupSymbol: paymill_lang.digitGroupSymbol,
			symbol: ' '+paymill_lang.symbol,
			negativeFormat: paymill_lang.currency_format,
			positiveFormat: paymill_lang.currency_format
		});
	}

	jQuery('body').on('click', '.paymill_pay_button', function() {
		PaymillPayButtonCalcTotal();
	});
	
	jQuery('.paymill_shipping').change(function(){
		PaymillPayButtonCalcTotal();
	});
	
	PaymillPayButtonCalcTotal();

});