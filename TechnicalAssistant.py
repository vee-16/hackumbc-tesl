#TECHNICAL SUPPORT ASSISTANT
#IMPORT GEMINI MODEL
#USE THE SCRIPT ABOVE TO CLASSIFY THE TICKET
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
MODEL = "meta-llama/Llama-2-7b-chat-hf"
Ticket = ""
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL,torch_dtype=torch.float16,device_map="auto")
prompt = "You are a technical support assistant. You ONLY handle technical problems. Ignore and reject any non-technical requests. For each ticket you will be given the user input, so the exact problem they are having. Provide a short explanation (1-3) sentences of why you rated the urgency that way. Suggest the first troubleshooting step. If you do not understand the problem, output \'Let me redirect you to a technician'\
format your response as: Reason <short explanation of why the customer was having the problem.> Next step/steps: <troubleshooting steps> "
#Tokenize
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
#Generate
outputs = model.generate(**inputs, max_new_tokens=200, temperature=0.2,top_p=0.9)

#decode
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)