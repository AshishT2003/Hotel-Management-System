import { runBillingTests } from './billing.test.ts';
import { runSearchTests } from './search.test.ts';

async function main() {
  console.log('====================================================');
  console.log('  GRAND HORIZON HOTEL — CLIENT TEST SUITE EXECUTION');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // 1. Billing calculations
  console.log('--- Suite 1: Billing & Pricing Calculation Tests ---');
  const billingResults = runBillingTests();
  for (const r of billingResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${r.name}: ${r.error}`);
    }
  }

  // 2. Search filtering (<50ms benchmark)
  console.log('\n--- Suite 2: Universal Search & Latency Benchmark Tests ---');
  const searchResults = runSearchTests();
  for (const r of searchResults) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${r.name}: ${r.error}`);
    }
  }

  console.log('\n====================================================');
  console.log(`  TOTAL: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
