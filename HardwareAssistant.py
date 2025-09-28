#HARDWARE SUPPORT ASSISTANT
#IMPORT GEMINI MODEL
#USE THE SCRIPT ABOVE TO CLASSIFY THE TICKET
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
MODEL = "meta-llama/Llama-2-7b-chat-hf"
Ticket = ""
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL,torch_dtype=torch.float16,device_map="auto")
prompt = """
You are a hardware support assistant. You ONLY handle issues related to hardware problems, including device malfunctions, hardware failures, and physical connectivity issues. Ignore and reject any non-hardware-related requests. For each ticket, you will be given the user’s input describing the issue. Provide a brief explanation (1-3 sentences) of why you rated the urgency the way you did, and suggest the first troubleshooting step or steps. If you do not understand the problem, output 'Let me redirect you to a hardware technician'.

Format your response as:
- Reason: <short explanation of why the user is experiencing the hardware issue.>
- Next step(s): <first troubleshooting step(s) to attempt.>
"""
#Tokenize
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
#Generate
outputs = model.generate(**inputs, max_new_tokens=200, temperature=0.2,top_p=0.9)

#decode
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)