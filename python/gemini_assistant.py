#!/usr/bin/env python3
"""
Gemini AI Assistant Module
Provides specialized assistance for different ticket types using Google's free Gemini API
"""

import os
import json
from typing import Dict, Any

class GeminiAssistant:
    def __init__(self):
        """Initialize the Gemini assistant"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.client = None
        
        # Initialize Gemini client if API key is available
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel('gemini-pro')
                print("✅ Gemini AI connected successfully")
            except ImportError:
                print("⚠️ Gemini AI library not installed. Install with: pip install google-generativeai")
            except Exception as e:
                print(f"⚠️ Gemini AI connection failed: {e}")
        else:
            print("⚠️ GEMINI_API_KEY not found. Set environment variable for AI assistance.")
    
    def _get_system_prompt(self, ticket_type: str) -> str:
        """Get the system prompt for a specific ticket type"""
        prompts = {
            "hardware": """
You are a Hardware Support Specialist. Analyze the hardware issue and provide helpful troubleshooting steps.

Guidelines:
- Focus on hardware-related problems (computers, printers, monitors, etc.)
- Provide step-by-step troubleshooting instructions
- Consider safety precautions when handling hardware
- Suggest when professional repair might be needed
- Be clear and concise in your explanations

Format your response as:
- **Problem Analysis**: Brief explanation of the likely cause
- **Immediate Steps**: 2-3 quick things to try first
- **Detailed Troubleshooting**: Step-by-step instructions
- **When to Escalate**: Signs that professional help is needed
""",
            
            "software": """
You are a Software Support Specialist. Help users resolve software-related issues and application problems.

Guidelines:
- Focus on software applications, operating systems, and programs
- Provide clear step-by-step instructions
- Consider different operating systems (Windows, Mac, Linux)
- Suggest alternative solutions when possible
- Include relevant keyboard shortcuts or commands

Format your response as:
- **Issue Summary**: What's likely causing the problem
- **Quick Fixes**: 1-2 immediate things to try
- **Detailed Solution**: Step-by-step resolution process
- **Prevention Tips**: How to avoid this issue in the future
""",
            
            "network": """
You are a Network Support Specialist. Help users with connectivity and network-related issues.

Guidelines:
- Focus on internet, WiFi, VPN, and network connectivity problems
- Provide troubleshooting for both home and office networks
- Consider different devices (computers, phones, tablets)
- Include router/modem troubleshooting when relevant
- Suggest when to contact ISP or network administrator

Format your response as:
- **Connection Analysis**: What might be causing the network issue
- **Basic Checks**: Simple connectivity tests to perform
- **Advanced Troubleshooting**: More detailed network diagnostics
- **Contact Information**: When to reach out to ISP or IT support
""",
            
            "account": """
You are an Account Support Specialist. Help users with login, password, and account access issues.

Guidelines:
- Focus on authentication, password resets, and account access
- Prioritize security best practices
- Provide guidance for different platforms and services
- Consider two-factor authentication and security measures
- Be mindful of privacy and security concerns

Format your response as:
- **Security Assessment**: Potential security implications
- **Immediate Actions**: Steps to regain access safely
- **Account Recovery**: Detailed recovery process
- **Security Recommendations**: How to prevent future issues
""",
            
            "other": """
You are a General Support Specialist. Provide helpful assistance for various types of support requests.

Guidelines:
- Adapt your response to the specific type of issue presented
- Provide general troubleshooting approaches
- Suggest appropriate resources or specialists when needed
- Be helpful and professional in your guidance
- Consider escalation paths for complex issues

Format your response as:
- **Issue Classification**: What type of problem this appears to be
- **General Approach**: Overall strategy for resolution
- **Specific Steps**: Actionable instructions to follow
- **Additional Resources**: Where to find more help if needed
"""
        }
        
        return prompts.get(ticket_type, prompts["other"])
    
    def _get_fallback_response(self, ticket_text: str, ticket_type: str) -> Dict[str, Any]:
        """Provide a fallback response when Gemini is not available"""
        fallback_responses = {
            "hardware": {
                "analysis": "This appears to be a hardware-related issue that may require physical troubleshooting.",
                "steps": [
                    "Check all physical connections and cables",
                    "Restart the affected device",
                    "Check for any error lights or unusual sounds",
                    "Try the device on a different power outlet"
                ],
                "escalation": "If the issue persists, contact your IT support team or consider professional repair services."
            },
            
            "software": {
                "analysis": "This seems to be a software-related issue that can often be resolved through troubleshooting.",
                "steps": [
                    "Close and restart the affected application",
                    "Check for software updates",
                    "Restart your computer",
                    "Run the application as administrator (if on Windows)"
                ],
                "escalation": "If the problem continues, check the software vendor's support documentation or contact their support team."
            },
            
            "network": {
                "analysis": "This appears to be a network connectivity issue that may affect internet or local network access.",
                "steps": [
                    "Check if other devices can connect to the network",
                    "Restart your router/modem by unplugging for 30 seconds",
                    "Forget and reconnect to the WiFi network",
                    "Run network diagnostics on your device"
                ],
                "escalation": "If connectivity issues persist, contact your Internet Service Provider or network administrator."
            },
            
            "account": {
                "analysis": "This seems to be an account access or authentication issue.",
                "steps": [
                    "Try resetting your password using the 'Forgot Password' option",
                    "Check if your account has been locked or suspended",
                    "Verify you're using the correct username/email",
                    "Clear your browser cache and cookies"
                ],
                "escalation": "If you still can't access your account, contact the service provider's customer support directly."
            },
            
            "other": {
                "analysis": "This appears to be a general support request that may require further investigation.",
                "steps": [
                    "Document the exact error message or symptoms",
                    "Note when the issue first occurred",
                    "Try restarting the affected system or application",
                    "Check if the issue affects other users or systems"
                ],
                "escalation": "For complex issues, consider contacting specialized technical support or your IT department."
            }
        }
        
        response = fallback_responses.get(ticket_type, fallback_responses["other"])
        
        return {
            "type": "fallback",
            "ticket_type": ticket_type,
            "analysis": response["analysis"],
            "recommended_steps": response["steps"],
            "escalation_guidance": response["escalation"],
            "note": "This is an automated response. For personalized assistance, please ensure Gemini AI is configured."
        }
    
    def get_assistance(self, ticket_text: str, ticket_type: str) -> Dict[str, Any]:
        """Get AI assistance for a support ticket"""
        
        # If Gemini is not available, return fallback response
        if not self.client:
            return self._get_fallback_response(ticket_text, ticket_type)
        
        try:
            # Prepare the prompt
            system_prompt = self._get_system_prompt(ticket_type)
            user_prompt = f"""
Support Ticket: {ticket_text}

Please analyze this {ticket_type} support ticket and provide helpful assistance following the format specified in your instructions.
"""
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            
            # Generate response using Gemini
            response = self.client.generate_content(full_prompt)
            
            if response and response.text:
                return {
                    "type": "ai_generated",
                    "ticket_type": ticket_type,
                    "response": response.text.strip(),
                    "model": "gemini-pro"
                }
            else:
                print("⚠️ Empty response from Gemini")
                return self._get_fallback_response(ticket_text, ticket_type)
                
        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            return self._get_fallback_response(ticket_text, ticket_type)
    
    def is_ready(self) -> bool:
        """Check if the assistant is ready to provide AI responses"""
        return self.client is not None

# Test the assistant if run directly
if __name__ == "__main__":
    assistant = GeminiAssistant()
    
    # Test with different ticket types
    test_tickets = [
        ("My laptop won't turn on and the power light isn't working", "hardware"),
        ("Excel keeps crashing when I try to open large files", "software"),
        ("I can't connect to the office WiFi network", "network"),
        ("I forgot my password and can't log into my email", "account"),
        ("I need help setting up a new printer", "other")
    ]
    
    for ticket_text, ticket_type in test_tickets:
        print(f"\n{'='*60}")
        print(f"Testing {ticket_type.upper()} ticket:")
        print(f"'{ticket_text}'")
        print(f"{'='*60}")
        
        assistance = assistant.get_assistance(ticket_text, ticket_type)
        
        if assistance["type"] == "ai_generated":
            print("🤖 AI Response:")
            print(assistance["response"])
        else:
            print("🔧 Fallback Response:")
            print(f"Analysis: {assistance['analysis']}")
            print(f"Steps: {', '.join(assistance['recommended_steps'])}")
            print(f"Escalation: {assistance['escalation_guidance']}")
        
        print(f"\nResponse type: {assistance['type']}")
        print(f"Ticket type: {assistance['ticket_type']}")
    
    print(f"\n🔍 Assistant ready: {assistant.is_ready()}")
