from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from datetime import datetime
import csv
import codecs
from io import StringIO
from pymongo import UpdateOne
import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "Plumbers API is running"}

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://mongo:27017/plumbers")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.plumbers

# Email Configuration (Load from Environment Variables)
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "your-email@gmail.com")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "your-app-password")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)

# --- Helpers ---

def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Models ---

class Client(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    address1: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    alarm_code: Optional[str] = None
    filter_system: Optional[str] = None
    sewage: Optional[str] = None
    photos: Optional[List[str]] = []
    cottage: Optional[bool] = False
    boathouse: Optional[bool] = False
    cabin_1: Optional[bool] = False
    cabin_2: Optional[bool] = False
    garage: Optional[bool] = False
    cottage_system_id: Optional[str] = None
    boathouse_system_id: Optional[str] = None
    cabin_1_system_id: Optional[str] = None
    cabin_2_system_id: Optional[str] = None
    garage_system_id: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class Employee(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "Plumber"
    color: str = "#3b82f6"

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class Crew(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    color: str = "#10b981"
    members: List[str] = []

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class Task(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: Optional[str] = "Legacy Task"
    category: Optional[str] = "General"
    description: Optional[str] = None
    base_price: Optional[float] = 0.0
    estimated_duration: Optional[int] = 60  # Duration in minutes
    inventory_ids: Optional[List[str]] = []

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class Job(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    work_order_number: Optional[str] = None
    client_id: Optional[str] = None
    crew_id: Optional[str] = None
    task_id: Optional[str] = None
    inventory_ids: Optional[List[str]] = []
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    recurrence: Optional[str] = "one_time"
    status: Optional[str] = "scheduled"
    notes: Optional[str] = None
    priority: Optional[str] = "Medium"
    job_type: Optional[str] = "Service"
    technician_id: Optional[str] = None
    client_signature: Optional[str] = None # Base64 encoded image

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class InventoryItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: Optional[str] = "Unknown Item"
    category: Optional[str] = "General"
    model_number: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = 0
    unit: Optional[str] = "pcs"
    cost_price: Optional[float] = 0.0
    selling_price: Optional[float] = 0.0

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class InvoiceItem(BaseModel):
    description: Optional[str] = "Item"
    quantity: Optional[float] = 1.0
    unit_price: Optional[float] = 0.0

class Invoice(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    invoice_number: Optional[str] = None
    client_id: Optional[str] = None
    job_id: Optional[str] = None
    issue_date: Optional[datetime] = Field(default_factory=datetime.now)
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    items: Optional[List[InvoiceItem]] = []
    total_amount: Optional[float] = 0.0
    status: Optional[str] = "Draft" # Draft, Sent, Paid, Overdue
    paid_date: Optional[datetime] = None
    client_signature: Optional[str] = None # Base64 encoded image

    @validator('issue_date', 'due_date', 'paid_date', pre=True)
    def empty_str_to_none(cls, v):
        if not v or str(v).strip() == "" or v == "null":
            return None
        # Handle YYYY-MM-DD format by appending time
        if isinstance(v, str) and len(v) == 10:
            return f"{v}T00:00:00"
        return v

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

# --- Routes ---

# Clients
@app.get("/clients", response_model=List[Client])
async def get_clients():
    clients = await db["clients"].find().to_list(1000)
    return [fix_id(c) for c in clients]

@app.post("/clients", response_model=Client)
async def create_client(client: Client):
    new_client = await db["clients"].insert_one(client.dict(exclude={"id"}))
    created = await db["clients"].find_one({"_id": new_client.inserted_id})
    return fix_id(created)

@app.post("/clients/import")
async def import_clients(file: UploadFile = File(...)):
    # Increase CSV field size limit to handle large fields
    csv.field_size_limit(sys.maxsize)

    content = await file.read()
    
    # Try decoding with utf-8-sig (standard), then latin-1 (Excel default)
    try:
        text = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        text = content.decode('latin-1')
        
    f = StringIO(text)

    try:
        dialect = csv.Sniffer().sniff(text[:4096])
        f.seek(0)
        csvReader = csv.DictReader(f, dialect=dialect)
    except csv.Error:
        f.seek(0)
        csvReader = csv.DictReader(f)

    # Normalize headers: map lowercase/stripped headers to actual CSV headers
    header_map = {h.lower().strip(): h for h in csvReader.fieldnames if h} if csvReader.fieldnames else {}

    def get_val(keys):
        if isinstance(keys, str): keys = [keys]
        for k in keys:
            actual = header_map.get(k)
            if actual and row.get(actual): return row.get(actual).strip()
        return None

    operations = []
    skipped_count = 0
    for row in csvReader:
        # Extract raw values first
        raw_data = {
            "name": get_val(["name", "client", "client name", "customer", "customer name", "full name", "contact", "contact name", "company", "company name"]),
            "address1": get_val(["address1", "address 1", "street", "street address", "address"]),
            "address2": get_val(["address2", "address 2", "unit", "apt", "suite", "apartment"]),
            "city": get_val(["city", "town"]),
            "province": get_val(["province", "state", "region", "territory"]),
            "postal_code": get_val(["postal_code", "postal code", "zip", "zip code"]),
            "phone": get_val(["phone", "phone number", "mobile", "cell", "main phone", "pone number"]),
            "alt_phone": get_val(["alt_phone", "alt phone", "alternate phone", "work phone", "home phone", "alt. phone"]),
            "email": get_val(["email", "e-mail", "email address", "main email"]),
            "notes": get_val(["notes", "comments", "note", "description"]),
            "alarm_code": get_val(["alarm code", "alarm", "gate code", "code"]),
            "filter_system": get_val(["filter system", "filter", "filters"]),
            "sewage": get_val(["sewage", "septic", "sewage system"]),
            "photos": [get_val(["photo", "photos", "image"])] if get_val(["photo", "photos", "image"]) else [],
            "cottage": bool(get_val(["cottage"])),
            "boathouse": bool(get_val(["boathouse"])),
            "cabin_1": bool(get_val(["cabin 1", "cabin1"])),
            "cabin_2": bool(get_val(["cabin 2", "cabin2"])),
            "garage": bool(get_val(["garage"]))
        }
        
        if raw_data["name"]:
            # Filter out None/Empty values to perform a "Safe Update"
            # This prevents overwriting existing database data with empty CSV cells
            update_data = {k: v for k, v in raw_data.items() if v is not None and v != "" and v != []}
            
            if update_data:
                operations.append(UpdateOne({"name": raw_data["name"]}, {"$set": update_data}, upsert=True))
        else:
            skipped_count += 1

    if operations:
        await db["clients"].bulk_write(operations)
    return {"message": f"Processed {len(operations)} clients. Skipped {skipped_count} rows (missing name)."}

@app.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client: Client):
    result = await db["clients"].update_one({"_id": ObjectId(client_id)}, {"$set": client.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    updated = await db["clients"].find_one({"_id": ObjectId(client_id)})
    return fix_id(updated)

@app.delete("/clients/{client_id}")
async def delete_client(client_id: str):
    result = await db["clients"].delete_one({"_id": ObjectId(client_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

# Employees
@app.get("/employees", response_model=List[Employee])
async def get_employees():
    employees = await db["employees"].find().to_list(1000)
    return [fix_id(e) for e in employees]

@app.post("/employees", response_model=Employee)
async def create_employee(employee: Employee):
    new_emp = await db["employees"].insert_one(employee.dict(exclude={"id"}))
    created = await db["employees"].find_one({"_id": new_emp.inserted_id})
    return fix_id(created)

@app.put("/employees/{emp_id}", response_model=Employee)
async def update_employee(emp_id: str, employee: Employee):
    result = await db["employees"].update_one({"_id": ObjectId(emp_id)}, {"$set": employee.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    updated = await db["employees"].find_one({"_id": ObjectId(emp_id)})
    return fix_id(updated)

@app.delete("/employees/{emp_id}")
async def delete_employee(emp_id: str):
    result = await db["employees"].delete_one({"_id": ObjectId(emp_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

# Crews
@app.get("/crews", response_model=List[Crew])
async def get_crews():
    crews = await db["crews"].find().to_list(1000)
    return [fix_id(c) for c in crews]

@app.post("/crews", response_model=Crew)
async def create_crew(crew: Crew):
    new_crew = await db["crews"].insert_one(crew.dict(exclude={"id"}))
    created = await db["crews"].find_one({"_id": new_crew.inserted_id})
    return fix_id(created)

@app.put("/crews/{crew_id}", response_model=Crew)
async def update_crew(crew_id: str, crew: Crew):
    result = await db["crews"].update_one({"_id": ObjectId(crew_id)}, {"$set": crew.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Crew not found")
    updated = await db["crews"].find_one({"_id": ObjectId(crew_id)})
    return fix_id(updated)

@app.delete("/crews/{crew_id}")
async def delete_crew(crew_id: str):
    result = await db["crews"].delete_one({"_id": ObjectId(crew_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crew not found")
    return {"message": "Crew deleted"}

# Tasks (Library of Services)
@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    tasks = await db["tasks"].find().to_list(1000)
    return [fix_id(t) for t in tasks]

@app.post("/tasks", response_model=Task)
async def create_task(task: Task):
    new_task = await db["tasks"].insert_one(task.dict(exclude={"id"}))
    created = await db["tasks"].find_one({"_id": new_task.inserted_id})
    return fix_id(created)

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task: Task):
    result = await db["tasks"].update_one({"_id": ObjectId(task_id)}, {"$set": task.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = await db["tasks"].find_one({"_id": ObjectId(task_id)})
    return fix_id(updated)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db["tasks"].delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# Jobs (Scheduler Events)
@app.get("/jobs", response_model=List[Job])
async def get_jobs():
    jobs = await db["jobs"].find().to_list(1000)
    return [fix_id(j) for j in jobs]

@app.post("/jobs", response_model=Job)
async def create_job(job: Job):
    if not job.work_order_number:
        today_str = datetime.now().strftime("%Y%m%d")
        prefix = f"WO-{today_str}-"
        
        # Find the last job created today to increment the counter
        last_job = await db["jobs"].find_one(
            {"work_order_number": {"$regex": f"^{prefix}"}},
            sort=[("work_order_number", -1)]
        )
        
        sequence = 1
        if last_job and "work_order_number" in last_job:
            try:
                last_seq = int(last_job["work_order_number"].split("-")[-1])
                sequence = last_seq + 1
            except (ValueError, IndexError):
                pass

        job.work_order_number = f"{prefix}{sequence:03d}"

    new_job = await db["jobs"].insert_one(job.dict(exclude={"id"}))
    created = await db["jobs"].find_one({"_id": new_job.inserted_id})
    return fix_id(created)

@app.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, job: Job):
    result = await db["jobs"].update_one({"_id": ObjectId(job_id)}, {"$set": job.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    updated = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    return fix_id(updated)

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await db["jobs"].delete_one({"_id": ObjectId(job_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted"}

# Inventory
@app.get("/inventory", response_model=List[InventoryItem])
async def get_inventory():
    items = await db["inventory"].find().to_list(1000)
    return [fix_id(i) for i in items]

@app.post("/inventory", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItem):
    new_item = await db["inventory"].insert_one(item.dict(exclude={"id"}))
    created = await db["inventory"].find_one({"_id": new_item.inserted_id})
    return fix_id(created)

@app.post("/inventory/import")
async def import_inventory(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode('utf-8-sig')  # Handle BOM
    f = StringIO(text)

    try:
        dialect = csv.Sniffer().sniff(text[:4096])
        f.seek(0)
        csvReader = csv.DictReader(f, dialect=dialect)
    except csv.Error:
        f.seek(0)
        csvReader = csv.DictReader(f)

    header_map = {h.lower().strip(): h for h in csvReader.fieldnames if h} if csvReader.fieldnames else {}

    def get_val(keys):
        if isinstance(keys, str): keys = [keys]
        for k in keys:
            actual = header_map.get(k)
            if actual and row.get(actual): return row.get(actual).strip()
        return None

    operations = []
    for row in csvReader:
        qty_str = get_val(["quantity", "qty", "stock"])
        cost_str = get_val(["cost_price", "cost", "unit cost"])
        sell_str = get_val(["selling_price", "price", "retail", "selling price"])

        item_data = {
            "name": get_val(["name", "item", "item name", "product", "product name", "part", "part name"]),
            "category": get_val("category") or "General",
            "model_number": get_val(["model_number", "model", "sku"]),
            "description": get_val(["description", "desc"]),
            "quantity": int(qty_str) if qty_str and qty_str.isdigit() else 0,
            "unit": get_val("unit") or "pcs",
            "cost_price": float(cost_str) if cost_str else 0.0,
            "selling_price": float(sell_str) if sell_str else 0.0
        }
        if item_data["name"]:
            operations.append(UpdateOne({"name": item_data["name"]}, {"$set": item_data}, upsert=True))

    if operations:
        await db["inventory"].bulk_write(operations)
    return {"message": f"Processed {len(operations)} items"}

@app.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItem):
    result = await db["inventory"].update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db["inventory"].find_one({"_id": ObjectId(item_id)})
    return fix_id(updated)

@app.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str):
    result = await db["inventory"].delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# Invoices
@app.get("/invoices", response_model=List[Invoice])
async def get_invoices():
    invoices = await db["invoices"].find().to_list(1000)
    return [fix_id(i) for i in invoices]

@app.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: Invoice):
    if not invoice.invoice_number:
        if invoice.job_id:
            job = await db["jobs"].find_one({"_id": ObjectId(invoice.job_id)})
            if job and job.get("work_order_number"):
                invoice.invoice_number = job["work_order_number"].replace("WO-", "INV-")

    if not invoice.invoice_number:
        invoice.invoice_number = f"INV-{int(datetime.now().timestamp())}"
    new_invoice = await db["invoices"].insert_one(invoice.dict(exclude={"id"}))
    created = await db["invoices"].find_one({"_id": new_invoice.inserted_id})
    return fix_id(created)

@app.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, invoice: Invoice):
    result = await db["invoices"].update_one({"_id": ObjectId(invoice_id)}, {"$set": invoice.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    updated = await db["invoices"].find_one({"_id": ObjectId(invoice_id)})
    return fix_id(updated)

@app.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    result = await db["invoices"].delete_one({"_id": ObjectId(invoice_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted"}

@app.post("/invoices/{invoice_id}/email")
async def email_invoice(invoice_id: str, file: UploadFile = File(...)):
    # 1. Fetch Invoice and Client
    invoice = await db["invoices"].find_one({"_id": ObjectId(invoice_id)})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    client = await db["clients"].find_one({"_id": ObjectId(invoice.get("client_id"))})
    if not client or not client.get("email"):
        raise HTTPException(status_code=400, detail="Client does not have an email address")

    client_email = client["email"]
    invoice_number = invoice.get("invoice_number", "Invoice")

    # 2. Construct Email
    msg = MIMEMultipart()
    msg['From'] = SMTP_FROM
    msg['To'] = client_email
    msg['Subject'] = f"Invoice {invoice_number} from Plumbers App"

    body = f"Dear {client.get('name', 'Client')},\n\nPlease find attached invoice {invoice_number}.\n\nThank you for your business."
    msg.attach(MIMEText(body, 'plain'))

    # 3. Attach PDF
    pdf_content = await file.read()
    part = MIMEApplication(pdf_content, Name=f"{invoice_number}.pdf")
    part['Content-Disposition'] = f'attachment; filename="{invoice_number}.pdf"'
    msg.attach(part)

    # 4. Send via SMTP
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        # Update status to Sent
        await db["invoices"].update_one({"_id": ObjectId(invoice_id)}, {"$set": {"status": "Sent"}})
        return {"message": f"Invoice sent to {client_email}"}
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
