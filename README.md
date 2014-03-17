-*- coding: utf-8, tab-width: 2 -*-

PAYMILL for WordPress
=====================
* Contributors: Matthias Reuter
* Donate link:
* Tags: paymill, creditcard, elv, payment, woocommerce, paybutton, ecommerce, debitcard, subscriptions
* Requires at least: 3.5
* Tested up to: 3.8
* Stable tag: 1.5.2
* License: [GPLv3 or later](http://www.gnu.org/licenses/gpl-3.0.html)

With PAYMILL you are able to provide credit card based payments for your customers.
German users can use ELV payment, too.

Plugin Description
==================

This plugin currently allows:

* Payment Gateway for WooCommerce, including subscription support
* Payment Gateway for ShopPlugin
* Pay Button. including subscription support

Features in Development:

* Payment Gateway for Magic Members (70% done) - beta for subscriptions included

Service Description
===================

PAYMILL offers the fastest and easiest way to accept payments online.
The innovative payment solution enables online businesses and services to integrate payments into their websites within a very short time.
The developer-friendly REST API is flexibly integrable.
Customize the check-out process the way you want or use the PAYMILL PayButton which allows an even easier integration.
Super-fast account activation within a few days only.
Top-notch customer support.
Subscriptions supported and Mobile SDKs for iOS and Android available.
Accept payments in up to 100 currencies.
All major card brands like MasterCard, VISA, American Express, Diner's Club, Maestro etc. supported.
Available in 39 countries across Europe so far.

Installation
============

There is a manual included in English and German as PDF, but in short:

1. Upload `paymill`-directory to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Register a free account on https://www.paymill.com/
4. Insert TEST Api Keys for testing purposes in plugin settings
5. If you are happy how the plugin works, enable your live account on https://www.paymill.com/ - this could take a couple of days.
6. After your paymill account has been activated for LIVE mode, switch your account to live and replace your TEST API Keys with your LIVE API Keys in plugin settings.

actions
-------
* paymill_paybutton_client_created
* paymill_paybutton_client_updated
* paymill_paybutton_subscription_created
* paymill_paybutton_order_complete

filters
-------
* paymill_paybutton_order_desc
* paymill_paybutton_email_text

Customizing the Pay Button
--------------------------

The Pay Button is made for customizing and you should make intensive use of CSS to cutomize it. Examples:

```css
/* hide country selection */
.paymill_shipping { display: none; }

/* hide company name */
.paymill_address div:nth-child(2) { display: none; }
```

Additionally, you may want to replace the default order form with your own.
Create a custom theme file on `THEME_DIR/paymill/pay_button.php`,
it will replace `/paymill/lib/tpl/pay_button.php`.


Missing some feature?
=====================

Please use the [plugin support forum on WordPress.org](http://wordpress.org/support/plugin/paymill).
If feasible, we'll add your request to our todo list.
Please note that we can't give any time estimates for that list or any feature request.

Hire the author
---------------
Nevertheless, feel free to hire the plugin author [Matthias Reuter](mailto:info@straightvisions.com) if you need to:
* get a customization
* get a feature rapidly / on time
* get a custom WordPress plugin developed to exactly fit your needs.
