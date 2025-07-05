// Simple API test script to debug Tailscale API issues
import { getTailscaleClient } from './tailscale';

async function testTailscaleAPI() {
  console.log('🧪 Testing Tailscale API Connection...\n');
  
  const client = getTailscaleClient();
  if (!client) {
    console.error('❌ No Tailscale client - missing API key or tailnet');
    return;
  }

  // Test basic API connectivity
  try {
    console.log('🔍 Testing API connectivity...');
    const devices = await client.getDevices();
    console.log(`✅ Success! Found ${devices.length} devices`);
    
    devices.forEach(device => {
      console.log(`  - ${device.name} (${device.os}) - ${device.online ? 'Online' : 'Offline'}`);
    });
    
  } catch (error: any) {
    console.error('❌ API test failed:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('403')) {
      console.log('\n🔐 Permission Issue Detected');
      console.log('Your API key needs these exact scopes:');
      console.log('  • devices (full access)');
      console.log('  • Or at minimum: devices:read');
      console.log('\nTo fix:');
      console.log('1. Go to https://login.tailscale.com/admin/settings/keys');
      console.log('2. Delete your current API key');
      console.log('3. Create a new one with "devices" scope checked');
      console.log('4. Update your TAILSCALE_API_KEY secret');
    } else if (error.message.includes('401')) {
      console.log('\n🔑 Authentication Issue');
      console.log('Check your API key and tailnet name');
    } else if (error.message.includes('404')) {
      console.log('\n🔍 Tailnet Not Found');
      console.log('Check your TAILSCALE_TAILNET value');
    }
  }
}

// Run the test
testTailscaleAPI().catch(console.error);