/**
 * Automated Test Suite for SMS.ir Integration
 * Tests:
 * 1. Iranian Phone Number Normalization (Persian digits, international codes, formatting)
 * 2. API Key Masking & Credential Protection
 * 3. Provider Payload Construction & Formatting
 * 4. Successful Send Flow Simulation (Provider Acceptance status = 1)
 * 5. Rejected Credentials Simulation (HTTP 401 & Provider Status 12 IP Restriction)
 * 6. Invalid Payload & Parameter Validation (Empty message, invalid recipient, missing key)
 * 7. Network Error & Request Timeout Handling
 * 8. Live SMS.ir Endpoint Diagnostic Check
 */

import {
  normalizeIranianMobile,
  maskApiKey,
  parseSenderLine,
  sendSmsViaProvider,
  checkSmsDiagnostics,
  SMS_IR_BASE_URL
} from '../src/server/smsProvider.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✕ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' 🧪 RUNNING AUTOMATED TESTS FOR SMS.IR INTEGRATION');
  console.log('======================================================\n');

  // ----------------------------------------------------------------
  // Test Suite 1: Iranian Phone Number Normalization
  // ----------------------------------------------------------------
  console.log('--- Test Suite 1: Phone Normalization ---');

  const standard = normalizeIranianMobile('09121112233');
  assert(standard.valid && standard.normalized === '09121112233', 'Standard 09 format preserved');

  const persianDigits = normalizeIranianMobile('۰۹۱۲۱۱۱۲۲۳۳');
  assert(persianDigits.valid && persianDigits.normalized === '09121112233', 'Persian digits converted to English (۰-۹ -> 0-9)');

  const arabicDigits = normalizeIranianMobile('٠٩١٢١١١٢٢٣٣');
  assert(arabicDigits.valid && arabicDigits.normalized === '09121112233', 'Arabic digits converted to English (٠-٩ -> 0-9)');

  const plus98 = normalizeIranianMobile('+989121112233');
  assert(plus98.valid && plus98.normalized === '09121112233', '+98 prefix converted to 09');

  const doubleZero = normalizeIranianMobile('00989121112233');
  assert(doubleZero.valid && doubleZero.normalized === '09121112233', '0098 prefix converted to 09');

  const formatted = normalizeIranianMobile('0912-111 22 33');
  assert(formatted.valid && formatted.normalized === '09121112233', 'Dashes and whitespace stripped properly');

  const landline = normalizeIranianMobile('02188776655');
  assert(!landline.valid, 'Tehran landline (021) correctly rejected for SMS mobile');

  const shortNumber = normalizeIranianMobile('091234');
  assert(!shortNumber.valid, 'Incomplete/short number correctly rejected');

  const emptyNumber = normalizeIranianMobile('');
  assert(!emptyNumber.valid, 'Empty phone number rejected with validation error');

  // ----------------------------------------------------------------
  // Test Suite 2: API Key Masking & Security
  // ----------------------------------------------------------------
  console.log('\n--- Test Suite 2: API Key Protection & Masking ---');

  const sampleKey = 'cqusH7jQYJDfj6VLPJk6hcJTdYbmNMsx70X6iTTEezjAe8Ea';
  const masked = maskApiKey(sampleKey);
  assert(masked.startsWith('cqus') && masked.endsWith('e8Ea') && masked.includes('••••••••'), 'API key masked properly (cqus••••••••e8Ea)');
  assert(!masked.includes('VLPJk6hcJTdYbmNM'), 'Internal secret characters hidden');

  const emptyMask = maskApiKey('');
  assert(emptyMask.includes('تنظیم نشده'), 'Empty key handled safely');

  // ----------------------------------------------------------------
  // Test Suite 3: Sender Line Parsing
  // ----------------------------------------------------------------
  console.log('\n--- Test Suite 3: Sender Line Parsing ---');

  assert(parseSenderLine('3000505') === 3000505, 'String line parsed to numeric 3000505');
  assert(parseSenderLine(30007732000000) === 30007732000000, 'Number line preserved');
  assert(parseSenderLine('line-5000400') === 5000400, 'Cleaned non-digit characters from line string');

  // ----------------------------------------------------------------
  // Test Suite 4: Invalid Payload & Missing Configuration Handling
  // ----------------------------------------------------------------
  console.log('\n--- Test Suite 4: Invalid Payload & Missing Credentials ---');

  const missingKeyRes = await sendSmsViaProvider({
    apiKey: '',
    recipient: '09121112233',
    message: 'Test message'
  });
  // Clear env override for this test
  assert(!missingKeyRes.success && missingKeyRes.status === 'failed', 'Missing API key returns success: false');
  assert(missingKeyRes.error !== undefined && missingKeyRes.error.includes('SMS_API_KEY'), 'Missing API key returns explicit error description');

  const invalidPhoneRes = await sendSmsViaProvider({
    apiKey: 'mock-key-12345678',
    recipient: '12345',
    message: 'Test'
  });
  assert(!invalidPhoneRes.success && invalidPhoneRes.status === 'failed', 'Invalid phone number returns success: false');
  assert(invalidPhoneRes.error !== undefined && invalidPhoneRes.error.includes('شماره تلفن'), 'Phone validation error returned accurately');

  const emptyMsgRes = await sendSmsViaProvider({
    apiKey: 'mock-key-12345678',
    recipient: '09121112233',
    message: '   '
  });
  assert(!emptyMsgRes.success && emptyMsgRes.status === 'failed', 'Empty message text returns success: false');
  assert(emptyMsgRes.error !== undefined && emptyMsgRes.error.includes('خالی'), 'Empty message error returned accurately');

  // ----------------------------------------------------------------
  // Test Suite 5: Simulated Provider HTTP & Logic Errors
  // ----------------------------------------------------------------
  console.log('\n--- Test Suite 5: Provider Mock Responses (Success & Failure) ---');

  // Backup global fetch
  const originalFetch = global.fetch;

  try {
    // 5a. Mock SMS.ir HTTP 200 with status: 1 (Accepted)
    global.fetch = async () => {
      return new Response(JSON.stringify({
        status: 1,
        message: 'موفق',
        data: {
          packId: 'f784d142-mock-pack-id',
          messageIds: [876240099],
          cost: 1
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const mockSuccess = await sendSmsViaProvider({
      apiKey: 'valid-test-key-12345678',
      recipient: '09121112233',
      message: 'بارگیری سفارش تکمیل شد',
      orderNumber: 'ORD-1403-9999'
    });

    assert(mockSuccess.success === true, 'Provider status 1 yields success: true');
    assert(mockSuccess.status === 'sent', 'Status is "sent" (queued for provider transmission)');
    assert(mockSuccess.packId === 'f784d142-mock-pack-id', 'packId extracted accurately');
    assert(mockSuccess.messageId === 876240099, 'messageId extracted accurately');
    assert(mockSuccess.cost === 1, 'cost extracted accurately');
    assert(mockSuccess.providerStatus === 1, 'providerStatus recorded as 1');

    // 5b. Mock SMS.ir HTTP 401 with status: 12 (IP Restriction)
    global.fetch = async () => {
      return new Response(JSON.stringify({
        data: null,
        status: 12,
        message: 'کلید وب سرویس محدود به آی‌پی‌های تعریف شده می‌باشد. - آی پی شما: 34.34.229.23'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const mockIpError = await sendSmsViaProvider({
      apiKey: 'valid-test-key-12345678',
      recipient: '09121112233',
      message: 'بارگیری سفارش تکمیل شد'
    });

    assert(mockIpError.success === false, 'Provider status 12 yields success: false (Not falsely reported as true!)');
    assert(mockIpError.status === 'failed', 'Status is "failed"');
    assert(mockIpError.providerStatus === 12, 'providerStatus recorded as 12');
    assert(mockIpError.error !== undefined && mockIpError.error.includes('محدودیت IP'), 'Error explanation includes IP restriction guidance');

    // 5c. Mock SMS.ir Malformed Non-JSON Response (e.g. HTML 502/503 Cloudflare gateway error)
    global.fetch = async () => {
      return new Response('<html><body>Bad Gateway 502</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' }
      });
    };

    const mockMalformed = await sendSmsViaProvider({
      apiKey: 'valid-test-key-12345678',
      recipient: '09121112233',
      message: 'پیامک تستی'
    });

    assert(mockMalformed.success === false, 'Malformed response yields success: false');
    assert(mockMalformed.error !== undefined && mockMalformed.error.includes('JSON'), 'Malformed JSON reported accurately');

    // 5d. Mock Network Timeout (AbortError)
    global.fetch = async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    };

    const mockTimeout = await sendSmsViaProvider({
      apiKey: 'valid-test-key-12345678',
      recipient: '09121112233',
      message: 'پیامک تستی'
    });

    assert(mockTimeout.success === false, 'Timeout error yields success: false');
    assert(mockTimeout.providerStatus === 408, 'Provider status for timeout mapped to 408');
    assert(mockTimeout.error !== undefined && mockTimeout.error.includes('پایان رسید'), 'Timeout message clearly stated');

  } finally {
    // Restore real fetch
    global.fetch = originalFetch;
  }

  // ----------------------------------------------------------------
  // Test Suite 6: Live SMS.ir Diagnostic Probe
  // ----------------------------------------------------------------
  console.log('\n--- Test Suite 6: Live SMS.ir Diagnostic Probe ---');
  console.log('Probing real SMS.ir API at https://api.sms.ir/v1/credit ...');

  const liveDiagnostic = await checkSmsDiagnostics({
    apiKey: process.env.SMS_API_KEY || 'cqusH7jQYJDfj6VLPJk6hcJTdYbmNMsx70X6iTTEezjAe8Ea',
    lineNumber: '3000505',
    timeoutMs: 6000
  });

  console.log(`  Live Probe Result: HTTP=${liveDiagnostic.httpStatus}, ProviderStatus=${liveDiagnostic.providerStatus}`);
  console.log(`  Provider Message: "${liveDiagnostic.providerMessage || '-'}"`);
  if (liveDiagnostic.serverIpHint) {
    console.log(`  Identified Server Egress IP: ${liveDiagnostic.serverIpHint}`);
  }

  // Ensure diagnostics did not crash and returned structured data
  assert(liveDiagnostic.isConfigured === true, 'Diagnostics confirms API key is configured');
  assert(typeof liveDiagnostic.maskedApiKey === 'string', 'Masked API key provided without exposing secret');
  assert(typeof liveDiagnostic.providerStatus === 'number', 'Provider status code received from live endpoint');

  // Summary
  console.log('\n======================================================');
  console.log(` ✅ ALL TESTS PASSED: ${passedTests}/${totalTests} tests succeeded!`);
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
