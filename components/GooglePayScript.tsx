'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function GooglePayScript() {
  useEffect(() => {
    const initGooglePay = () => {
      if (typeof window !== 'undefined' && (window as any).google?.payments?.api) {
        const googlePayClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
        const cardPaymentMethod = {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          }
        };
        const clientConfiguration = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [cardPaymentMethod]
        };
        const onGooglePaymentsButtonClicked = () => {
          console.log('Google Pay button clicked');
          const tokenizationSpec = {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          };
          const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA']
              },
              tokenizationSpecification: tokenizationSpec
            }],
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: '1.00',
              currencyCode: 'USD'
            },
            merchantInfo: {
              merchantName: 'SNecc Bar'
            }
          };
          const processPayment = (paymentData: any) => {
            console.log('Processing payment:', paymentData);
            // Handle payment processing here
          };
          googlePayClient
            .loadPaymentData(paymentDataRequest)
            .then(function(paymentData: any){
              processPayment(paymentData);
            })
            .catch(function(err: any){
              console.error('Load payment data error:', err);
            });
        };
        googlePayClient.isReadyToPay(clientConfiguration)
        .then(function(response: any){
          if(response.result){
            console.log('Google Pay is ready');
            const button = googlePayClient.createButton({
              buttonColor: 'default',
              buttonType: 'long',
              onClick: onGooglePaymentsButtonClicked
            });
            document.body.appendChild(button);
          }
        }).catch(function(err: any){
          console.error('Google Pay error:', err);
        });
      }
    };

    if (typeof window !== 'undefined') {
      if ((window as any).google?.payments?.api) {
        initGooglePay();
      } else {
        window.addEventListener('google-pay-loaded', initGooglePay);
      }
    }
  }, []);

  return (
    <Script
      src="https://pay.google.com/gp/p/js/pay.js"
      onLoad={() => {
        window.dispatchEvent(new Event('google-pay-loaded'));
      }}
    />
  );
}
