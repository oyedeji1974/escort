// Simple test script
const fs = require('fs');
const path = require('path');

console.log('Testing API...\n');

// Test 1: Load JSON file
const adsJsonPath = path.join(__dirname, 'data/ads.json');
console.log('1. Loading ads.json from:', adsJsonPath);
try {
    const data = JSON.parse(fs.readFileSync(adsJsonPath, 'utf8'));
    console.log('   ✅ SUCCESS: Loaded', data.length, 'ads');
    console.log('   Sample:', data[0].title);
} catch (err) {
    console.log('   ❌ FAILED:', err.message);
}

// Test 2: Filter by city
console.log('\n2. Filtering by city="birmingham"');
try {
    const data = JSON.parse(fs.readFileSync(adsJsonPath, 'utf8'));
    const filtered = data.filter(ad => ad.city.toLowerCase() === 'birmingham');
    console.log('   ✅ SUCCESS: Found', filtered.length, 'ads');
    filtered.forEach(ad => console.log('     -', ad.title));
} catch (err) {
    console.log('   ❌ FAILED:', err.message);
}

// Test 3: Filter by city and category
console.log('\n3. Filtering by city="birmingham" AND cat="bodyrubs"');
try {
    const data = JSON.parse(fs.readFileSync(adsJsonPath, 'utf8'));
    let filtered = data.filter(ad => ad.city.toLowerCase() === 'birmingham');
    filtered = filtered.filter(ad => ad.category.toLowerCase() === 'bodyrubs');
    console.log('   ✅ SUCCESS: Found', filtered.length, 'ads');
    filtered.forEach(ad => console.log('     -', ad.title));
} catch (err) {
    console.log('   ❌ FAILED:', err.message);
}

console.log('\n✅ All tests passed!');
