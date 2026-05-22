const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  const timestamp = Date.now();
  const email = `tester_${timestamp}@ethara.ai`;
  const name = 'Ethara E2E Tester';
  const password = 'password123';
  const role = 'ADMIN';

  console.log('🚀 Starting Auth E2E Integration Verification...\n');

  try {
    // 1. SIGNUP TEST
    console.log('--- 1. Testing SIGNUP ---');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, role }),
    });

    const signupData = await signupResponse.json() as any;
    if (signupResponse.status !== 201) {
      throw new Error(`Signup failed with status ${signupResponse.status}: ${JSON.stringify(signupData)}`);
    }
    console.log('✅ Signup Successful!');
    console.log(`Registered User: ${signupData.data.user.name} (${signupData.data.user.email})`);

    // 2. LOGIN TEST
    console.log('\n--- 2. Testing LOGIN with correct credentials ---');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json() as any;
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.data.token;
    console.log('✅ Login Successful!');
    console.log(`Token received: ${token.substring(0, 15)}...`);

    // 3. GET /me TEST WITH VALID TOKEN
    console.log('\n--- 3. Testing GET /me with valid JWT session ---');
    const meResponse = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const meData = await meResponse.json() as any;
    if (meResponse.status !== 200) {
      throw new Error(`GET /me failed with status ${meResponse.status}: ${JSON.stringify(meData)}`);
    }
    console.log('✅ GET /me Profile retrieved successfully!');
    console.log(`Profile User: ${meData.data.user.name} | Role: ${meData.data.user.role}`);

    // 4. LOGIN REJECTION TEST WITH WRONG PASSWORD
    console.log('\n--- 4. Testing LOGIN rejection on incorrect credentials ---');
    const badLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' }),
    });

    const badLoginData = await badLoginResponse.json() as any;
    if (badLoginResponse.status === 401) {
      console.log('✅ Rejection Successful! HTTP 401 Unauthorized returned.');
      console.log(`Error Message: "${badLoginData.message}"`);
    } else {
      throw new Error(`Expected login to be rejected with 401, but got ${badLoginResponse.status}`);
    }

    // 5. GET /me REJECTION TEST WITH INVALID TOKEN
    console.log('\n--- 5. Testing GET /me rejection on invalid token ---');
    const badMeResponse = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-xyz',
      },
    });

    const badMeData = await badMeResponse.json() as any;
    if (badMeResponse.status === 401) {
      console.log('✅ Rejection Successful! HTTP 401 Unauthorized returned.');
      console.log(`Error Message: "${badMeData.message}"`);
    } else {
      throw new Error(`Expected GET /me to be rejected with 401, but got ${badMeResponse.status}`);
    }

    console.log('\n🎉 ALL E2E AUTH INTEGRATION TESTS PASSED TRIUMPHANTLY! 🎉');
  } catch (error: any) {
    console.error('\n❌ E2E Integration Test failed:', error.message);
    process.exit(1);
  }
}

runTests();

export {};
