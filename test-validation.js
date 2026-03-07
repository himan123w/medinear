/**
 * 🧪 Comprehensive Input Validation Test Suite
 * Tests all validation features in the MediNear platform
 */

const { validator } = require('./middleware/validationMiddleware');

console.log('\n====================================================');
console.log('🧪 MediNear Input Validation Test Suite');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(description, callback) {
  try {
    const result = callback();
    if (result) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${description}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${description} - ${error.message}`);
    failed++;
  }
}

// ============================================
// Email Validation Tests
// ============================================
console.log('\n📧 Email Validation Tests\n' + '─'.repeat(50));

test('Valid email: test@example.com', () => 
  validator.isValidEmail('test@example.com') === true
);

test('Valid email: user.name@company.co.in', () => 
  validator.isValidEmail('user.name@company.co.in') === true
);

test('Invalid email: not-an-email', () => 
  validator.isValidEmail('not-an-email') === false
);

test('Invalid email: @example.com', () => 
  validator.isValidEmail('@example.com') === false
);

test('Invalid email: test@', () => 
  validator.isValidEmail('test@') === false
);

test('Invalid email: spaces in email', () => 
  validator.isValidEmail('test @example.com') === false
);

// ============================================
// Phone Validation Tests
// ============================================
console.log('\n📱 Phone Validation Tests\n' + '─'.repeat(50));

test('Valid phone: 9876543210', () => 
  validator.isValidPhone('9876543210') === true
);

test('Valid phone: +919876543210', () => 
  validator.isValidPhone('+919876543210') === true
);

test('Valid phone: 91-9876543210', () => 
  validator.isValidPhone('91-9876543210') === true
);

test('Invalid phone: 123', () => 
  validator.isValidPhone('123') === false
);

test('Invalid phone: abcdefghij', () => 
  validator.isValidPhone('abcdefghij') === false
);

// ============================================
// Password Strength Tests
// ============================================
console.log('\n🔒 Password Strength Tests\n' + '─'.repeat(50));

test('Strong password: Test@123', () => 
  validator.isStrongPassword('Test@123') === true
);

test('Strong password: MyP@ssw0rd', () => 
  validator.isStrongPassword('MyP@ssw0rd') === true
);

test('Weak password: password', () => 
  validator.isStrongPassword('password') === false
);

test('Weak password: 12345678', () => 
  validator.isStrongPassword('12345678') === false
);

test('Weak password: Password (no special char)', () => 
  validator.isStrongPassword('Password123') === false
);

test('Weak password: Test@ (too short)', () => 
  validator.isStrongPassword('Test@1') === false
);

// ============================================
// String Sanitization Tests
// ============================================
console.log('\n🧹 String Sanitization Tests\n' + '─'.repeat(50));

test('Sanitize removes HTML tags', () => {
  const input = '<script>alert("xss")</script>Hello';
  const output = validator.sanitizeString(input);
  return output === 'scriptalert("xss")/scriptHello';
});

test('Sanitize trims whitespace', () => {
  const input = '  Hello World  ';
  const output = validator.sanitizeString(input);
  return output === 'Hello World';
});

test('Sanitize limits length to 1000 chars', () => {
  const input = 'a'.repeat(2000);
  const output = validator.sanitizeString(input);
  return output.length === 1000;
});

test('Sanitize handles non-string input', () => {
  const output = validator.sanitizeString(12345);
  return output === '';
});

// ============================================
// Number Sanitization Tests
// ============================================
console.log('\n🔢 Number Sanitization Tests\n' + '─'.repeat(50));

test('Sanitize number: valid number', () => 
  validator.sanitizeNumber(50) === 50
);

test('Sanitize number: string number', () => 
  validator.sanitizeNumber('50') === 50
);

test('Sanitize number: below min (default 0)', () => 
  validator.sanitizeNumber(-10) === 0
);

test('Sanitize number: above max (default 1000000)', () => 
  validator.sanitizeNumber(2000000) === 1000000
);

test('Sanitize number: custom range', () => 
  validator.sanitizeNumber(150, 0, 100) === 100
);

test('Sanitize number: NaN returns 0', () => 
  validator.sanitizeNumber('not-a-number') === 0
);

// ============================================
// Object Validation Tests
// ============================================
console.log('\n📋 Object Validation Tests\n' + '─'.repeat(50));

test('Valid object against schema', () => {
  const obj = {
    name: 'Test User',
    email: 'test@example.com',
    age: 25
  };
  const schema = {
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'string' },
    age: { required: true, type: 'number', min: 18, max: 100 }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === true && result.errors.length === 0;
});

test('Invalid object: missing required field', () => {
  const obj = {
    name: 'Test User'
  };
  const schema = {
    name: { required: true },
    email: { required: true }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === false && result.errors.includes('email is required');
});

test('Invalid object: wrong type', () => {
  const obj = {
    age: 'twenty-five'
  };
  const schema = {
    age: { type: 'number' }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === false && result.errors.some(e => e.includes('must be number'));
});

test('Invalid object: below minimum', () => {
  const obj = {
    age: 15
  };
  const schema = {
    age: { min: 18 }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === false && result.errors.some(e => e.includes('must be at least 18'));
});

test('Invalid object: exceeds maximum', () => {
  const obj = {
    price: 150
  };
  const schema = {
    price: { max: 100 }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === false && result.errors.some(e => e.includes('must be at most 100'));
});

test('Invalid object: pattern mismatch', () => {
  const obj = {
    phone: '123'
  };
  const schema = {
    phone: { pattern: /^[0-9]{10}$/ }
  };
  const result = validator.validateObject(obj, schema);
  return result.isValid === false && result.errors.some(e => e.includes('format is invalid'));
});

// ============================================
// Summary
// ============================================
console.log('\n====================================================');
console.log('📊 Test Summary');
console.log('====================================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
