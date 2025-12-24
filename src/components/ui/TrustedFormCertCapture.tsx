import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

export type TrustedFormCertRef = {
  certify: () => void;
  reset: () => void;
};

type Props = {
  baseUrl: string;
  onCertUrl: (certUrl: string) => void;
  onError?: (error: unknown) => void;
};

type TrustedFormMessage =
  | { type: 'trustedform_cert'; certUrl: string }
  | { type: 'trustedform_error'; error?: unknown };

export const TrustedFormCertCapture = forwardRef<TrustedFormCertRef, Props>(
  ({ baseUrl, onCertUrl, onError }, ref) => {
    const didSendRef = useRef(false);
    const webViewRef = useRef<WebView>(null);

    const html = useMemo(() => {
      // These names match the common implementation snippet the team shared.
      const certFieldId = 'xxTrustedFormCertUrl';
      const pingFieldId = 'xxTrustedFormPingUrl';
      const cacheBust = Date.now();

      // TrustedForm typically populates cert url on/after a form submit event.
      // We include a dummy form and allow the app to trigger a submit to generate the cert.
      return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TrustedForm</title>
  </head>
  <body>
    <form id="tf_form" action="#" method="post">
      <input type="hidden" id="${certFieldId}" name="${certFieldId}" value="" />
      <input type="hidden" id="${pingFieldId}" name="${pingFieldId}" value="" />
      <button id="tf_submit" type="submit" style="display:none">submit</button>
    </form>

    <script type="text/javascript">
      (function() {
        function post(payload) {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          } catch (e) {
            // ignore
          }
        }

        // Prevent navigation on submit; we only want the submit event.
        try {
          var form = document.getElementById('tf_form');
          if (form) {
            form.addEventListener('submit', function(e) { e.preventDefault(); });
          }
        } catch (e) {
          // ignore
        }

        try {
          var tf = document.createElement('script');
          tf.type = 'text/javascript';
          tf.async = true;
          tf.src = 'https://api.trustedform.com/trustedform.js?field=${certFieldId}&ping_field=${pingFieldId}&l=' + ${cacheBust} + Math.random();
          tf.onerror = function() {
            post({ type: 'trustedform_error', error: 'trustedform.js failed to load' });
          };
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(tf, s);
        } catch (e) {
          post({ type: 'trustedform_error', error: String(e) });
        }

        var tries = 0;
        var maxTries = 200; // ~20s at 100ms
        var timer = setInterval(function() {
          tries++;
          var el = document.getElementById('${certFieldId}');
          var value = (el && el.value) ? String(el.value) : '';

          if (value && value.indexOf('https://cert.trustedform.com/') === 0) {
            clearInterval(timer);
            post({ type: 'trustedform_cert', certUrl: value });
            return;
          }

          if (tries >= maxTries) {
            clearInterval(timer);
            post({ type: 'trustedform_error', error: 'timeout waiting for cert_url' });
          }
        }, 100);
      })();

      // Called from React Native via injectJavaScript.
      window.__TP_CERTIFY_TRUSTEDFORM__ = function() {
        try {
          var btn = document.getElementById('tf_submit');
          if (btn) btn.click();
          return true;
        } catch (e) {
          try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'trustedform_error', error: String(e) })); } catch (_) {}
          return false;
        }
      };
    </script>
  </body>
</html>`;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        certify: () => {
          webViewRef.current?.injectJavaScript(
            `try { if (window.__TP_CERTIFY_TRUSTEDFORM__) { window.__TP_CERTIFY_TRUSTEDFORM__(); } } catch (e) { true; }\ntrue;`
          );
        },
        reset: () => {
          didSendRef.current = false;
          webViewRef.current?.reload();
        },
      }),
      []
    );

    const onMessage = (event: WebViewMessageEvent) => {
      if (didSendRef.current) return;

      try {
        const data = JSON.parse(event.nativeEvent.data) as TrustedFormMessage;
        if (data?.type === 'trustedform_cert' && typeof data.certUrl === 'string' && data.certUrl.length) {
          didSendRef.current = true;
          onCertUrl(data.certUrl);
          return;
        }

        if (data?.type === 'trustedform_error') {
          onError?.(data.error);
        }
      } catch (e) {
        onError?.(e);
      }
    };

    return (
      <View style={styles.hidden} pointerEvents="none">
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl }}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
        />
      </View>
    );
  }
);

TrustedFormCertCapture.displayName = 'TrustedFormCertCapture';

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -1000,
    top: -1000,
  },
});
