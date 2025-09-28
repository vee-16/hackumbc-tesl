#!/usr/bin/env node
/**
 * Test script for the AI Support Ticket System
 * Run with: node test-system.js
 */

const testTickets = [
  {
    text: "My laptop won't start and the screen stays black when I press the power button",
    expectedType: "hardware",
    expectedUrgency: "high"
  },
  {
    text: "Excel keeps crashing when I try to open large spreadsheet files",
    expectedType: "software", 
    expectedUrgency: "medium"
  },
  {
    text: "I can't connect to the office WiFi network from my computer",
    expectedType: "network",
    expectedUrgency: "medium"
  },
  {
    text: "I forgot my password and can't log into my email account",
    expectedType: "account",
    expectedUrgency: "high"
  },
  {
    text: "Could you please help me set up a new printer when you have time?",
    expectedType: "other",
    expectedUrgency: "low"
  }
]

async function testClassification() {
  console.log('🧪 Testing AI Support Ticket Classification System')
  console.log('='.repeat(60))
  
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000'
  
  // Test health endpoint
  try {
    console.log('\n🔍 Testing health endpoint...')
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    const health = await healthResponse.json()
    
    console.log(`✅ Health Status: ${health.status}`)
    console.log(`🎯 Classifier Ready: ${health.classifier_ready}`)
    console.log(`🤖 AI Assistant Ready: ${health.assistant_ready}`)
    console.log(`🗄️ Database Connected: ${health.supabase_connected}`)
    
    if (health.status !== 'healthy') {
      console.log('⚠️ System not fully healthy, but continuing tests...')
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`)
    console.log('Make sure the development server is running: npm run dev')
    return
  }
  
  // Test classification for each ticket
  console.log('\n🎯 Testing Ticket Classification...')
  let correctClassifications = 0
  
  for (let i = 0; i < testTickets.length; i++) {
    const ticket = testTickets[i]
    console.log(`\n📝 Test ${i + 1}: "${ticket.text.substring(0, 50)}..."`)
    
    try {
      // Classify ticket
      const classifyResponse = await fetch(`${baseUrl}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ticket.text })
      })
      
      if (!classifyResponse.ok) {
        throw new Error(`Classification failed: ${classifyResponse.statusText}`)
      }
      
      const classifyData = await classifyResponse.json()
      const classification = classifyData.classification
      
      console.log(`   🏷️ Type: ${classification.type} (expected: ${ticket.expectedType})`)
      console.log(`   🚨 Urgency: ${classification.urgency} (expected: ${ticket.expectedUrgency})`)
      console.log(`   📊 Confidence: ${(classification.confidence_type * 100).toFixed(1)}% / ${(classification.confidence_urgency * 100).toFixed(1)}%`)
      
      // Check accuracy
      const typeCorrect = classification.type === ticket.expectedType
      const urgencyCorrect = classification.urgency === ticket.expectedUrgency
      
      if (typeCorrect && urgencyCorrect) {
        console.log('   ✅ Classification correct!')
        correctClassifications++
      } else {
        console.log('   ⚠️ Classification differs from expected')
      }
      
      // Test AI assistance
      console.log('   🤖 Testing AI assistance...')
      const assistResponse = await fetch(`${baseUrl}/api/assist/${classification.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: ticket.text,
          ticket_id: classifyData.ticket_id 
        })
      })
      
      if (assistResponse.ok) {
        const assistData = await assistResponse.json()
        const assistance = assistData.assistance
        
        console.log(`   📋 Assistance Type: ${assistance.type}`)
        if (assistance.type === 'ai_generated') {
          console.log(`   🎯 AI Model: ${assistance.model}`)
          console.log(`   📄 Response: ${assistance.response.substring(0, 100)}...`)
        } else {
          console.log(`   📄 Fallback: ${assistance.analysis.substring(0, 100)}...`)
        }
        console.log('   ✅ Assistance generated successfully!')
      } else {
        console.log('   ❌ Assistance generation failed')
      }
      
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Correct Classifications: ${correctClassifications}/${testTickets.length}`)
  console.log(`📈 Accuracy: ${(correctClassifications / testTickets.length * 100).toFixed(1)}%`)
  
  if (correctClassifications === testTickets.length) {
    console.log('\n🎉 All tests passed! Your system is working perfectly.')
  } else {
    console.log('\n⚠️ Some classifications differ from expected.')
    console.log('This is normal for keyword-based classification.')
    console.log('Consider upgrading to your full ML models for better accuracy.')
  }
  
  console.log('\n🚀 Next Steps:')
  console.log('1. Visit http://localhost:3000 to use the web interface')
  console.log('2. Set up Supabase for database storage')
  console.log('3. Deploy to Vercel for free hosting')
  console.log('4. Upgrade to your full ML models for better accuracy')
}

// Run the tests
testClassification().catch(console.error)
