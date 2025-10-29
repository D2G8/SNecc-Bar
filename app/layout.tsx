import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SNecc Bar',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>SNecc Bar</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <Script src="https://pay.google.com/gp/p/js/pay.js" onLoad={() => {
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
      }} />
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )


}
