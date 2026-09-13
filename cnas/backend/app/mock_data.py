import random
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Entity, Relationship, Case, Event, AuditLog, MissionTransfer

def seed_database(db: Session):
    # Ensure demo mission transfers exist even if database was previously seeded
    if db.query(MissionTransfer).count() == 0:
        demo_code_1 = "GARUDA#9941"
        code_hash_1 = hashlib.sha256(f"CBI_SALT_{demo_code_1}_2026".encode()).hexdigest()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
        first_case = db.query(Case).first()
        demo_transfer_1 = MissionTransfer(
            operation_name="OPERATION CHAKRAVYUH",
            code_word_hash=code_hash_1,
            case_id=first_case.id if first_case else 1,
            outgoing_officer_name="SP Kabir Rao, IPS",
            outgoing_officer_badge="CBI-HQ-8841-DL",
            outgoing_officer_rank="Superintendent of Police",
            outgoing_officer_department="Special Crime & Cyber Forensics Wing",
            outgoing_officer_clearance="LEVEL-V TOP SECRET // LES",
            outgoing_officer_zone="CBI HQ, Lodhi Road, New Delhi",
            outgoing_officer_service_no="IPS-2012-7729",
            handover_notes="Handing over prime custody of interstate Hawala & Cyber Syndicate dossier. All burner intercept logs and shell bank accounts cataloged. Target Vikram Malhotra has moved assets to Manesar transit hub.",
            target_officer_name="DSP Vikram Deshmukh",
            target_officer_badge="CBI-SCB-4092-MB",
            status="LOCKED_PENDING",
            failed_attempts=0,
            max_attempts=3,
            created_at=now_str,
            updated_at=now_str,
            payload_json={
                "case_id": first_case.id if first_case else 1,
                "case_title": first_case.title if first_case else "Operation Iron Grid",
                "status": "Active",
                "description": "Cross-state illicit syndicate communication network operating via burner lines.",
                "entities_count": 8,
                "events_count": 5
            }
        )
        db.add(demo_transfer_1)
        db.commit()

    # Check if main dataset already seeded
    if db.query(Entity).count() > 0:
        return

    print("Seeding database with realistic investigation data...")

    # 1. Create Cases (~15 cases)
    case_templates = [
        ("Operation Iron Grid", "Active", "Cross-state illicit syndicate communication network operating via burner lines.", "2025-01-15"),
        ("Case #2024-ND-89: Hawala Matrix", "Active", "Unregulated high-frequency financial routing across shell firms.", "2024-11-20"),
        ("The Bengaluru Crypto Heist", "Under Review", "Simulated intrusion and wallet drain linked to offshore accounts.", "2024-12-05"),
        ("Operation Falcon Wing", "Critical", "Interstate trafficking and vehicle fleet routing between Delhi-NCR and Mumbai.", "2025-02-01"),
        ("Case #2025-MH-104: Ghost Callers", "Active", "VoIP spoofing ring extorting high-net-worth accounts.", "2025-01-28"),
        ("Operation Dark Port", "Active", "Cross-border container smuggling and false bill of lading ring.", "2024-10-12"),
        ("The Cyber Syndicate V3", "Under Review", "Malware deployment targeting banking gateway endpoints.", "2024-09-30"),
        ("Case #2025-HYD-55: Tech Park Extortion", "Active", "Ransomware extortion targeting corporate leadership.", "2025-02-14"),
        ("Project Nightfall", "Closed", "Counterfeit currency distribution network dismantled in Old Delhi.", "2024-08-10"),
        ("Operation Silver Line", "Active", "Precious metal tax evasion and shell logistics conduit.", "2024-12-18"),
        ("Case #2025-DL-302: Red Fort Espionage", "Critical", "Unauthorized drone surveillance and encrypted data transmission.", "2025-01-05"),
        ("Operation Golden Route", "Active", "Smuggled bullion movement via domestic luxury bus networks.", "2024-11-02"),
        ("Case #2024-BLR-401: Cloud Breach", "Closed", "Unauthorized AWS credential leak and database extortion.", "2024-07-22"),
        ("The Mumbai Port Shell Link", "Under Review", "Customs evasion ring utilizing 12 front companies.", "2025-02-10"),
        ("Operation Shadow Hawk", "Active", "Armed syndicate coordinating via encrypted peer-to-peer radios.", "2025-02-22"),
    ]

    cases = []
    for title, status, desc, created in case_templates:
        c = Case(title=title, status=status, description=desc, created_at=created)
        db.add(c)
        cases.append(c)
    db.commit()

    # 2. Create Entities (64 distinct entities across 4 major cells)
    raw_entities = [
        # --- Cluster 1: North Syndicate (Delhi / NCR / Punjab) ---
        ("Kabir Khan", "Person", {"role": "Syndicate Boss / Kingpin", "alias": "K-7", "citizenship": "Indian", "phone": "+91-98110-11223", "risk_level": "Extreme"}, 0.96),
        ("Vikram Malhotra", "Person", {"role": "Financial Laundering Operative", "alias": "The Accountant", "citizenship": "Indian", "phone": "+91-98110-44556", "risk_level": "High"}, 0.88),
        ("Pooja Singhal", "Person", {"role": "Logistics Dispatcher", "alias": "Madam P", "phone": "+91-98110-77889", "risk_level": "Medium"}, 0.65),
        ("Tariq Sheikh", "Person", {"role": "Enforcer", "alias": "Tiger", "phone": "+91-98110-99001", "risk_level": "High"}, 0.78),
        ("DL-01-AB-9988 (Toyota Fortuner)", "Vehicle", {"plate": "DL-01-AB-9988", "make": "Toyota", "color": "Matte Black", "registered_owner": "Swift Translines"}, 0.72),
        ("DL-04-XY-4512 (Hyundai Creta)", "Vehicle", {"plate": "DL-04-XY-4512", "make": "Hyundai", "color": "White", "registered_owner": "Pooja Singhal"}, 0.45),
        ("+91-98110-11223 (Burner Prim)", "Phone", {"carrier": "Airtel Delhi", "imei": "864501048892101", "status": "Active"}, 0.85),
        ("+91-98110-44556 (Encrypted Line)", "Phone", {"carrier": "Jio Delhi", "imei": "864501048892102", "status": "Active"}, 0.80),
        ("HDFC Acc #908129031", "Account", {"bank": "HDFC Bank", "branch": "Connaught Place, New Delhi", "balance": "₹4.2 Cr", "status": "Frozen"}, 0.82),
        ("ICICI Shell Acc #330192831", "Account", {"bank": "ICICI Bank", "branch": "Karol Bagh, New Delhi", "balance": "₹1.8 Cr", "status": "Flagged"}, 0.75),
        ("Old Delhi Safehouse #4", "Location", {"city": "New Delhi", "address": "Chandni Chowk Lane 4", "coordinates": "28.6562,77.2410", "type": "Safehouse"}, 0.80),
        ("Gurugram Corporate Front (Apex Trading)", "Organization", {"cin": "U72200HR2020PTC081234", "sector": "Commodities Import", "director": "Vikram Malhotra"}, 0.76),
        ("Rohit Rawat", "Person", {"role": "Courier", "alias": "Rocket", "phone": "+91-98110-33211", "risk_level": "Medium"}, 0.58),
        ("Haryana Transit Warehouse", "Location", {"city": "Manesar", "address": "NH-48 Logistics Hub", "coordinates": "28.3512,76.9428", "type": "Warehouse"}, 0.62),

        # --- Cluster 2: West Financial & Hawala Hub (Mumbai / Gujarat) ---
        ("Rahul Verma", "Person", {"role": "Hawala Broker Chief", "alias": "RV Mumbai", "phone": "+91-98200-55441", "risk_level": "Very High"}, 0.92),
        ("Sameer Merchant", "Person", {"role": "Customs Clearing Agent", "alias": "Sam", "phone": "+91-98200-88112", "risk_level": "High"}, 0.74),
        ("Fatima Zaidi", "Person", {"role": "Foreign Remittance Handler", "alias": "FZ", "phone": "+91-98200-99334", "risk_level": "High"}, 0.81),
        ("MH-02-CD-7744 (Mercedes E-Class)", "Vehicle", {"plate": "MH-02-CD-7744", "make": "Mercedes-Benz", "color": "Silver", "registered_owner": "Verma Diamond Exports"}, 0.68),
        ("GJ-01-EE-1290 (Tata Truck Fleet)", "Vehicle", {"plate": "GJ-01-EE-1290", "make": "Tata Heavy", "color": "Yellow", "registered_owner": "Merchant Cargo"}, 0.52),
        ("+91-98200-55441 (Secured Line)", "Phone", {"carrier": "Vodafone Idea Mumbai", "imei": "358921049921001", "status": "Active"}, 0.84),
        ("+91-98200-99334 (Satellite SIM)", "Phone", {"carrier": "Thuraya Satellite", "imei": "990012049921002", "status": "Active"}, 0.89),
        ("Axis Hawala Conduit Acc #771290", "Account", {"bank": "Axis Bank", "branch": "Zaveri Bazaar, Mumbai", "balance": "₹8.9 Cr", "status": "Monitored"}, 0.91),
        ("Kotak Offshore Holding Acc #550211", "Account", {"bank": "Kotak Mahindra", "branch": "Bandra Kurla Complex", "balance": "₹14.5 Cr", "status": "Active"}, 0.87),
        ("Zaveri Bazaar Vault & Office", "Location", {"city": "Mumbai", "address": "Kalbadevi Road, Zaveri Bazaar", "coordinates": "18.9500,72.8300", "type": "Trading Hub"}, 0.79),
        ("Nhava Sheva Port Dock Yard #3", "Location", {"city": "Navi Mumbai", "address": "JNPT Terminal 2", "coordinates": "18.9498,72.9510", "type": "Port Facility"}, 0.77),
        ("Verma Diamond Exports Pvt Ltd", "Organization", {"cin": "U36911MH2018PTC099123", "sector": "Gems & Jewelry", "director": "Rahul Verma"}, 0.84),
        ("Merchant Cargo Movers", "Organization", {"cin": "U60200MH2019PTC087654", "sector": "Freight Forwarding", "director": "Sameer Merchant"}, 0.69),
        ("Farhan Qureshi", "Person", {"role": "Port Handler", "alias": "Ustaad", "phone": "+91-98200-11229", "risk_level": "Medium"}, 0.54),

        # --- Cluster 3: South Cyber & Crypto Cell (Bengaluru / Hyderabad) ---
        ("Arjun Mehta", "Person", {"role": "Darknet Administrator", "alias": "Cipher0x", "phone": "+91-98450-12345", "risk_level": "Very High"}, 0.94),
        ("Priya Sharma", "Person", {"role": "Cryptocurrency Mixer Operator", "alias": "ByteQueen", "phone": "+91-98450-67890", "risk_level": "High"}, 0.86),
        ("Karthik Reddy", "Person", {"role": "VoIP Gateway Technician", "alias": "K-Reddy", "phone": "+91-98450-44332", "risk_level": "Medium"}, 0.64),
        ("KA-03-MG-5566 (BMW 330i)", "Vehicle", {"plate": "KA-03-MG-5566", "make": "BMW", "color": "Portimao Blue", "registered_owner": "Arjun Mehta"}, 0.56),
        ("TS-09-FA-8899 (Tesla Model 3)", "Vehicle", {"plate": "TS-09-FA-8899", "make": "Tesla", "color": "Pearl White", "registered_owner": "Priya Sharma"}, 0.59),
        ("+91-98450-12345 (Burner e-SIM)", "Phone", {"carrier": "Airtel Karnataka", "imei": "860012048991200", "status": "Encrypted"}, 0.88),
        ("+91-98450-67890 (VoIP Virtual #)", "Phone", {"carrier": "Twilio Cloud", "imei": "000000000000000", "status": "Virtual"}, 0.79),
        ("Tether Cold Wallet (0x7a3...f91)", "Account", {"chain": "Ethereum / Tron", "address": "0x7a3b4e99f01828a1c92b8d00f91", "balance": "$3.4M USDT", "type": "Crypto Cold Storage"}, 0.93),
        ("Monero Master Pool (48bX...9kL)", "Account", {"chain": "Monero", "address": "48bX99201928ab01928c019289kL", "balance": "14,200 XMR", "type": "Privacy Pool"}, 0.95),
        ("Indiranagar Tech Lab Hub", "Location", {"city": "Bengaluru", "address": "100 Feet Road, Indiranagar", "coordinates": "12.9784,77.6408", "type": "Tech Lab"}, 0.70),
        ("HITEC City Server Farm", "Location", {"city": "Hyderabad", "address": "Phase 2, Madhapur, HITEC City", "coordinates": "17.4474,78.3762", "type": "Data Center"}, 0.83),
        ("NovaCore Cybersecurity Labs", "Organization", {"cin": "U72900KA2021PTC109923", "sector": "IT & Cloud Solutions", "director": "Arjun Mehta"}, 0.81),
        ("BitTrace Technologies", "Organization", {"cin": "U72200TS2022PTC099881", "sector": "Blockchain Analytics (Front)", "director": "Priya Sharma"}, 0.78),
        ("Naveen Iyer", "Person", {"role": "Infrastructure SRE", "alias": "Proxy", "phone": "+91-98450-99881", "risk_level": "Medium"}, 0.51),

        # --- Cluster 4: East Cross-Border Transit & Logistics (Kolkata / Siliguri / Northeast) ---
        ("Ananya Das", "Person", {"role": "Customs Broker & Document Forger", "alias": "Didi", "phone": "+91-98300-11998", "risk_level": "High"}, 0.83),
        ("Subhash Roy", "Person", {"role": "Border Conduit Commander", "alias": "Roy Da", "phone": "+91-98300-44771", "risk_level": "High"}, 0.80),
        ("Bikramjit Sen", "Person", {"role": "River Logistics Operator", "alias": "Capt Sen", "phone": "+91-98300-88223", "risk_level": "Medium"}, 0.67),
        ("WB-02-AK-1100 (Mahindra Scorpio)", "Vehicle", {"plate": "WB-02-AK-1100", "make": "Mahindra", "color": "Navy Blue", "registered_owner": "Eastern Transit"}, 0.50),
        ("WB-19-TR-7821 (Ashok Leyland Cargo)", "Vehicle", {"plate": "WB-19-TR-7821", "make": "Ashok Leyland", "color": "Red", "registered_owner": "Subhash Roy"}, 0.63),
        ("+91-98300-11998 (Bangla Border Roam)", "Phone", {"carrier": "Grameenphone Roaming", "imei": "861129038812001", "status": "Active"}, 0.76),
        ("+91-98300-44771 (Encrypted Signal)", "Phone", {"carrier": "Airtel Kolkata", "imei": "861129038812002", "status": "Active"}, 0.71),
        ("State Bank Trade Acc #1092831", "Account", {"bank": "State Bank of India", "branch": "Park Street, Kolkata", "balance": "₹3.1 Cr", "status": "Active"}, 0.65),
        ("Howrah Inland Container Depot", "Location", {"city": "Kolkata", "address": "Shalimar Yard, Howrah", "coordinates": "22.5600,88.3100", "type": "Transit Terminal"}, 0.68),
        ("Petrapole Border Transit Depot", "Location", {"city": "North 24 Parganas", "address": "NH-112 Indo-Bangla Border", "coordinates": "23.0800,88.8700", "type": "Border Checkpoint"}, 0.82),
        ("Eastern Silk & Logistics Hub", "Organization", {"cin": "U63000WB2017PTC077123", "sector": "Cross Border Logistics", "director": "Ananya Das"}, 0.73),
        ("Bayan Shipping Lines", "Organization", {"cin": "U61100WB2020PTC099411", "sector": "River Marine Freight", "director": "Bikramjit Sen"}, 0.61),

        # --- Key Inter-Cluster Bridge Entities (Super Connectors) ---
        ("Swift Global Logistics Ltd", "Organization", {"cin": "U60231DL2015PLC066551", "sector": "Nationwide Multi-modal Freight", "ceo": "Rajeev Singhania", "notes": "Links North, West, and East freight corridors."}, 0.95),
        ("Hawala Clearing House Alpha", "Organization", {"type": "Informal Financial Network", "jurisdiction": "Multi-city", "turnover": "₹150+ Cr / month", "notes": "Connects Vikram Malhotra (North) to Rahul Verma (West)."}, 0.97),
        ("DarkPool Mixer Node #9", "Organization", {"type": "Decentralized Escrow", "protocol": "Zero-Knowledge Mixer", "notes": "Used by Arjun Mehta to convert Hawala funds to Monero."}, 0.96),
        ("Safehouse Cyber Hub Jaipur", "Location", {"city": "Jaipur", "address": "Tonk Road, Jaipur", "coordinates": "26.9124,75.7873", "type": "Interstate Meeting Hub"}, 0.75),
        ("Ahmedabad Bullion Clearing House", "Location", {"city": "Ahmedabad", "address": "Manek Chowk, Ahmedabad", "coordinates": "23.0225,72.5714", "type": "Bullion Hub"}, 0.77),
        ("Sunil 'Bhai' Deshmukh", "Person", {"role": "Interstate Fixer & Politico Broker", "alias": "Bhaijaan", "phone": "+91-98999-00001", "risk_level": "Critical"}, 0.98),
        ("+91-98999-00001 (High-Priority Flag)", "Phone", {"carrier": "Encrypted Private Node", "imei": "999999999999999", "status": "Monitored 24/7"}, 0.97),
        ("National Hawala Bridge Acc #999000", "Account", {"bank": "Foreign Shell Correspondent", "country": "Mauritius/Dubai", "balance": "$12.8M USD", "type": "Correspondent Ledger"}, 0.98),
    ]

    entity_records = []
    for name, etype, attrs, risk in raw_entities:
        ent = Entity(name=name, type=etype, attributes=attrs, risk_score=risk)
        db.add(ent)
        entity_records.append(ent)
    db.commit()

    # Build name -> entity map for creating explicit, deterministic high-value relationships
    e_map = {e.name: e for e in entity_records}

    # 3. Create ~150 Realistic Relationships
    relationships_data = [
        # --- Cluster 1 Internal Relationships (North) ---
        ("Kabir Khan", "Vikram Malhotra", "associate_of", 1.0, 1),
        ("Kabir Khan", "Pooja Singhal", "associate_of", 0.9, 1),
        ("Kabir Khan", "Tariq Sheikh", "commands", 1.0, 1),
        ("Kabir Khan", "+91-98110-11223 (Burner Prim)", "owns", 1.0, 1),
        ("Kabir Khan", "DL-01-AB-9988 (Toyota Fortuner)", "uses", 0.8, 4),
        ("Kabir Khan", "Old Delhi Safehouse #4", "co_located", 0.9, 11),
        ("Vikram Malhotra", "Gurugram Corporate Front (Apex Trading)", "owns", 1.0, 2),
        ("Vikram Malhotra", "HDFC Acc #908129031", "controls", 1.0, 2),
        ("Vikram Malhotra", "ICICI Shell Acc #330192831", "transacted_with", 0.9, 2),
        ("Vikram Malhotra", "+91-98110-44556 (Encrypted Line)", "owns", 1.0, 1),
        ("Pooja Singhal", "DL-04-XY-4512 (Hyundai Creta)", "owns", 1.0, 4),
        ("Pooja Singhal", "Haryana Transit Warehouse", "co_located", 0.8, 4),
        ("Pooja Singhal", "Rohit Rawat", "commands", 0.8, 4),
        ("Tariq Sheikh", "Old Delhi Safehouse #4", "co_located", 0.8, 9),
        ("Tariq Sheikh", "Rohit Rawat", "associate_of", 0.7, 9),
        ("Rohit Rawat", "Haryana Transit Warehouse", "co_located", 0.7, 4),
        ("Gurugram Corporate Front (Apex Trading)", "HDFC Acc #908129031", "transacted_with", 0.95, 2),
        ("Gurugram Corporate Front (Apex Trading)", "Swift Global Logistics Ltd", "transacted_with", 0.85, 2),
        ("+91-98110-11223 (Burner Prim)", "+91-98110-44556 (Encrypted Line)", "called", 0.9, 1),
        ("+91-98110-44556 (Encrypted Line)", "HDFC Acc #908129031", "associated_with", 0.6, 2),

        # --- Cluster 2 Internal Relationships (West / Mumbai Hawala) ---
        ("Rahul Verma", "Verma Diamond Exports Pvt Ltd", "owns", 1.0, 2),
        ("Rahul Verma", "Sameer Merchant", "associate_of", 0.9, 6),
        ("Rahul Verma", "Fatima Zaidi", "associate_of", 0.95, 2),
        ("Rahul Verma", "+91-98200-55441 (Secured Line)", "owns", 1.0, 5),
        ("Rahul Verma", "MH-02-CD-7744 (Mercedes E-Class)", "owns", 0.9, 2),
        ("Rahul Verma", "Zaveri Bazaar Vault & Office", "co_located", 1.0, 2),
        ("Rahul Verma", "Axis Hawala Conduit Acc #771290", "controls", 1.0, 2),
        ("Fatima Zaidi", "Kotak Offshore Holding Acc #550211", "controls", 1.0, 2),
        ("Fatima Zaidi", "+91-98200-99334 (Satellite SIM)", "owns", 1.0, 5),
        ("Fatima Zaidi", "Zaveri Bazaar Vault & Office", "co_located", 0.8, 2),
        ("Sameer Merchant", "Merchant Cargo Movers", "owns", 1.0, 6),
        ("Sameer Merchant", "Farhan Qureshi", "commands", 0.85, 6),
        ("Sameer Merchant", "Nhava Sheva Port Dock Yard #3", "co_located", 0.9, 6),
        ("Farhan Qureshi", "Nhava Sheva Port Dock Yard #3", "co_located", 0.9, 6),
        ("Farhan Qureshi", "GJ-01-EE-1290 (Tata Truck Fleet)", "operates", 0.8, 6),
        ("Merchant Cargo Movers", "GJ-01-EE-1290 (Tata Truck Fleet)", "owns", 1.0, 6),
        ("Verma Diamond Exports Pvt Ltd", "Axis Hawala Conduit Acc #771290", "transacted_with", 1.0, 2),
        ("Axis Hawala Conduit Acc #771290", "Kotak Offshore Holding Acc #550211", "transacted_with", 0.95, 2),
        ("+91-98200-55441 (Secured Line)", "+91-98200-99334 (Satellite SIM)", "called", 0.88, 5),

        # --- Cluster 3 Internal Relationships (South Cyber / Crypto) ---
        ("Arjun Mehta", "NovaCore Cybersecurity Labs", "owns", 1.0, 3),
        ("Arjun Mehta", "Priya Sharma", "associate_of", 0.95, 3),
        ("Arjun Mehta", "Karthik Reddy", "commands", 0.85, 8),
        ("Arjun Mehta", "+91-98450-12345 (Burner e-SIM)", "owns", 1.0, 7),
        ("Arjun Mehta", "Tether Cold Wallet (0x7a3...f91)", "controls", 1.0, 3),
        ("Arjun Mehta", "Monero Master Pool (48bX...9kL)", "transacted_with", 0.9, 3),
        ("Arjun Mehta", "Indiranagar Tech Lab Hub", "co_located", 0.95, 7),
        ("Arjun Mehta", "KA-03-MG-5566 (BMW 330i)", "owns", 0.8, 3),
        ("Priya Sharma", "BitTrace Technologies", "owns", 1.0, 3),
        ("Priya Sharma", "Tether Cold Wallet (0x7a3...f91)", "transacted_with", 0.95, 3),
        ("Priya Sharma", "+91-98450-67890 (VoIP Virtual #)", "owns", 1.0, 8),
        ("Priya Sharma", "TS-09-FA-8899 (Tesla Model 3)", "owns", 0.7, 8),
        ("Priya Sharma", "HITEC City Server Farm", "co_located", 0.9, 8),
        ("Karthik Reddy", "+91-98450-67890 (VoIP Virtual #)", "operates", 0.9, 8),
        ("Karthik Reddy", "Naveen Iyer", "associate_of", 0.75, 7),
        ("Naveen Iyer", "HITEC City Server Farm", "co_located", 0.85, 7),
        ("NovaCore Cybersecurity Labs", "Indiranagar Tech Lab Hub", "located_at", 1.0, 7),
        ("BitTrace Technologies", "HITEC City Server Farm", "located_at", 1.0, 8),
        ("+91-98450-12345 (Burner e-SIM)", "+91-98450-67890 (VoIP Virtual #)", "called", 0.8, 8),
        ("Tether Cold Wallet (0x7a3...f91)", "Monero Master Pool (48bX...9kL)", "transacted_with", 0.95, 3),

        # --- Cluster 4 Internal Relationships (East Border / Transit) ---
        ("Ananya Das", "Eastern Silk & Logistics Hub", "owns", 1.0, 10),
        ("Ananya Das", "Subhash Roy", "associate_of", 0.9, 10),
        ("Ananya Das", "Bikramjit Sen", "associate_of", 0.75, 6),
        ("Ananya Das", "+91-98300-11998 (Bangla Border Roam)", "owns", 1.0, 10),
        ("Ananya Das", "State Bank Trade Acc #1092831", "controls", 1.0, 10),
        ("Ananya Das", "Petrapole Border Transit Depot", "co_located", 0.85, 10),
        ("Subhash Roy", "WB-19-TR-7821 (Ashok Leyland Cargo)", "owns", 0.9, 10),
        ("Subhash Roy", "+91-98300-44771 (Encrypted Signal)", "owns", 1.0, 10),
        ("Subhash Roy", "Petrapole Border Transit Depot", "co_located", 0.95, 10),
        ("Bikramjit Sen", "Bayan Shipping Lines", "owns", 1.0, 6),
        ("Bikramjit Sen", "Howrah Inland Container Depot", "co_located", 0.85, 6),
        ("Bikramjit Sen", "WB-02-AK-1100 (Mahindra Scorpio)", "owns", 0.7, 6),
        ("Eastern Silk & Logistics Hub", "State Bank Trade Acc #1092831", "transacted_with", 0.9, 10),
        ("Eastern Silk & Logistics Hub", "Howrah Inland Container Depot", "located_at", 0.8, 10),
        ("+91-98300-11998 (Bangla Border Roam)", "+91-98300-44771 (Encrypted Signal)", "called", 0.85, 10),

        # --- CRITICAL Cross-Cluster Bridges (Connecting the 4 Networks) ---
        # Bridge 1: North (Vikram) <--> West (Rahul Verma) via Hawala Clearing House
        ("Vikram Malhotra", "Hawala Clearing House Alpha", "member_of", 0.95, 2),
        ("Rahul Verma", "Hawala Clearing House Alpha", "member_of", 0.98, 2),
        ("HDFC Acc #908129031", "Hawala Clearing House Alpha", "transacted_with", 0.9, 2),
        ("Axis Hawala Conduit Acc #771290", "Hawala Clearing House Alpha", "transacted_with", 0.92, 2),
        ("Vikram Malhotra", "Rahul Verma", "transacted_with", 0.88, 2),
        ("+91-98110-44556 (Encrypted Line)", "+91-98200-55441 (Secured Line)", "called", 0.85, 5),

        # Bridge 2: West (Rahul/Fatima) <--> South (Arjun/Priya) via Crypto Mixer
        ("Rahul Verma", "DarkPool Mixer Node #9", "transacted_with", 0.92, 3),
        ("Fatima Zaidi", "DarkPool Mixer Node #9", "transacted_with", 0.89, 3),
        ("Arjun Mehta", "DarkPool Mixer Node #9", "controls", 0.98, 3),
        ("Priya Sharma", "DarkPool Mixer Node #9", "operates", 0.94, 3),
        ("Kotak Offshore Holding Acc #550211", "Tether Cold Wallet (0x7a3...f91)", "transacted_with", 0.88, 3),
        ("+91-98200-55441 (Secured Line)", "+91-98450-12345 (Burner e-SIM)", "called", 0.79, 7),

        # Bridge 3: North (Pooja/Kabir) <--> East (Ananya/Subhash) via Swift Logistics
        ("Swift Global Logistics Ltd", "Haryana Transit Warehouse", "operates", 0.88, 4),
        ("Swift Global Logistics Ltd", "Howrah Inland Container Depot", "operates", 0.9, 10),
        ("Swift Global Logistics Ltd", "DL-01-AB-9988 (Toyota Fortuner)", "owns", 0.75, 4),
        ("Pooja Singhal", "Swift Global Logistics Ltd", "associate_of", 0.82, 4),
        ("Ananya Das", "Swift Global Logistics Ltd", "transacted_with", 0.86, 10),
        ("DL-01-AB-9988 (Toyota Fortuner)", "Howrah Inland Container Depot", "co_located", 0.7, 10),

        # Bridge 4: West (Sameer/Farhan) <--> East (Bikramjit) via Maritime Logistics
        ("Merchant Cargo Movers", "Bayan Shipping Lines", "partner_with", 0.84, 6),
        ("Sameer Merchant", "Bikramjit Sen", "associate_of", 0.78, 6),
        ("GJ-01-EE-1290 (Tata Truck Fleet)", "Howrah Inland Container Depot", "co_located", 0.72, 6),

        # Bridge 5: The Kingpin / Master Fixer Links (Sunil 'Bhai' Deshmukh & National Hawala Bridge)
        ("Sunil 'Bhai' Deshmukh", "Kabir Khan", "associate_of", 0.96, 15),
        ("Sunil 'Bhai' Deshmukh", "Rahul Verma", "associate_of", 0.98, 15),
        ("Sunil 'Bhai' Deshmukh", "Arjun Mehta", "associate_of", 0.92, 15),
        ("Sunil 'Bhai' Deshmukh", "Ananya Das", "associate_of", 0.90, 15),
        ("Sunil 'Bhai' Deshmukh", "+91-98999-00001 (High-Priority Flag)", "owns", 1.0, 15),
        ("Sunil 'Bhai' Deshmukh", "National Hawala Bridge Acc #999000", "controls", 1.0, 15),
        ("Sunil 'Bhai' Deshmukh", "Safehouse Cyber Hub Jaipur", "co_located", 0.85, 15),
        ("Sunil 'Bhai' Deshmukh", "Ahmedabad Bullion Clearing House", "co_located", 0.88, 12),
        ("Kabir Khan", "Safehouse Cyber Hub Jaipur", "co_located", 0.8, 15),
        ("Rahul Verma", "Ahmedabad Bullion Clearing House", "co_located", 0.85, 12),
        ("+91-98999-00001 (High-Priority Flag)", "+91-98110-11223 (Burner Prim)", "called", 0.92, 15),
        ("+91-98999-00001 (High-Priority Flag)", "+91-98200-55441 (Secured Line)", "called", 0.95, 15),
        ("+91-98999-00001 (High-Priority Flag)", "+91-98450-12345 (Burner e-SIM)", "called", 0.89, 15),
        ("National Hawala Bridge Acc #999000", "HDFC Acc #908129031", "transacted_with", 0.91, 15),
        ("National Hawala Bridge Acc #999000", "Axis Hawala Conduit Acc #771290", "transacted_with", 0.96, 15),
        ("National Hawala Bridge Acc #999000", "Tether Cold Wallet (0x7a3...f91)", "transacted_with", 0.94, 15),
        ("National Hawala Bridge Acc #999000", "State Bank Trade Acc #1092831", "transacted_with", 0.87, 15),

        # Extra dense interconnections
        ("Old Delhi Safehouse #4", "+91-98110-11223 (Burner Prim)", "co_located", 0.8, 1),
        ("Zaveri Bazaar Vault & Office", "+91-98200-55441 (Secured Line)", "co_located", 0.85, 2),
        ("Indiranagar Tech Lab Hub", "+91-98450-12345 (Burner e-SIM)", "co_located", 0.85, 7),
        ("Petrapole Border Transit Depot", "+91-98300-11998 (Bangla Border Roam)", "co_located", 0.8, 10),
        ("Vikram Malhotra", "DL-01-AB-9988 (Toyota Fortuner)", "passenger_in", 0.65, 4),
        ("Rahul Verma", "Kotak Offshore Holding Acc #550211", "beneficiary_of", 0.92, 2),
        ("Arjun Mehta", "BitTrace Technologies", "consults_for", 0.75, 3),
        ("Ananya Das", "WB-02-AK-1100 (Mahindra Scorpio)", "passenger_in", 0.6, 6),
        ("Rohit Rawat", "+91-98110-33211", "owns", 1.0, 4),
        ("Farhan Qureshi", "+91-98200-11229", "owns", 1.0, 6),
        ("Naveen Iyer", "+91-98450-99881", "owns", 1.0, 7),
        ("Subhash Roy", "Eastern Silk & Logistics Hub", "operations_head", 0.8, 10),
        ("Pooja Singhal", "Gurugram Corporate Front (Apex Trading)", "secretary_of", 0.7, 2),
        ("Sameer Merchant", "Axis Hawala Conduit Acc #771290", "transacted_with", 0.72, 2),
        ("Karthik Reddy", "Indiranagar Tech Lab Hub", "co_located", 0.8, 7),
        ("Fatima Zaidi", "Ahmedabad Bullion Clearing House", "visited", 0.77, 12),
        ("Kabir Khan", "Ahmedabad Bullion Clearing House", "visited", 0.75, 12),
        ("Tariq Sheikh", "Haryana Transit Warehouse", "visited", 0.7, 4),
        ("Rohit Rawat", "DL-04-XY-4512 (Hyundai Creta)", "operates", 0.75, 4),
        ("Bikramjit Sen", "Petrapole Border Transit Depot", "inspected", 0.65, 10),
    ]

    base_time = datetime.now() - timedelta(days=180)
    for idx, (src_name, tgt_name, rel_type, weight, case_id) in enumerate(relationships_data):
        if src_name in e_map and tgt_name in e_map:
            ts = (base_time + timedelta(days=idx % 180, hours=(idx * 7) % 24)).strftime("%Y-%m-%d %H:%M:%S")
            rel = Relationship(
                source_entity_id=e_map[src_name].id,
                target_entity_id=e_map[tgt_name].id,
                relation_type=rel_type,
                weight=weight,
                timestamp=ts,
                case_id=case_id
            )
            db.add(rel)
    db.commit()

    # 4. Create ~40 Realistic Geo-tagged Timeline Events across Indian cities
    event_templates = [
        # Delhi NCR Cluster
        ("Kabir Khan", 1, "Encrypted satellite ping intercepted near Old Delhi safehouse.", "2024-09-12 14:30:00", 28.6562, 77.2410),
        ("Vikram Malhotra", 2, "Wire transfer of ₹1.8 Cr initiated from Connaught Place branch.", "2024-09-28 11:15:00", 28.6315, 77.2167),
        ("DL-01-AB-9988 (Toyota Fortuner)", 4, "Toll plaza scan at Kherki Daula Toll, NH-48 heading to Jaipur.", "2024-10-04 22:45:00", 28.3842, 76.9740),
        ("Pooja Singhal", 4, "Meeting documented at Manesar logistics warehouse terminal.", "2024-10-18 16:20:00", 28.3512, 76.9428),
        ("Tariq Sheikh", 9, "Physical surveillance confirmed suspect presence near Red Fort corridor.", "2024-11-01 09:40:00", 28.6562, 77.2410),
        ("Rohit Rawat", 4, "Vehicle handoff intercepted by highway patrol near Gurugram cyber hub.", "2024-11-15 19:10:00", 28.4900, 77.0800),
        ("Kabir Khan", 11, "High-frequency radio transmitter activated in Civil Lines, Delhi.", "2024-12-01 02:15:00", 28.6800, 77.2200),
        ("Old Delhi Safehouse #4", 1, "Raid executed; seizure of 14 burner SIM cards and ledgers.", "2025-01-08 04:30:00", 28.6562, 77.2410),

        # Mumbai / West Cluster
        ("Rahul Verma", 2, "Hawala cash courier collection reported in Zaveri Bazaar.", "2024-09-15 18:00:00", 18.9500, 72.8300),
        ("Fatima Zaidi", 2, "Offshore telegraphic transfer authorization signed at BKC complex.", "2024-10-02 14:00:00", 19.0600, 72.8600),
        ("Sameer Merchant", 6, "Customs container release clearance forged at Nhava Sheva Port.", "2024-10-22 08:30:00", 18.9498, 72.9510),
        ("MH-02-CD-7744 (Mercedes E-Class)", 2, "Automatic Number Plate Recognition hit on Bandra-Worli Sea Link.", "2024-11-10 20:50:00", 19.0368, 72.8172),
        ("Farhan Qureshi", 6, "Cargo shift detected at JNPT container yard under false manifest.", "2024-11-29 01:10:00", 18.9498, 72.9510),
        ("Verma Diamond Exports Pvt Ltd", 2, "Bulk consignment of industrial rough diamonds cleared without GST.", "2024-12-14 11:30:00", 18.9520, 72.8320),
        ("Rahul Verma", 12, "High-value meeting at Ahmedabad bullion trade market.", "2025-01-12 17:00:00", 23.0225, 72.5714),
        ("GJ-01-EE-1290 (Tata Truck Fleet)", 6, "Highway checkpoint crossing at Surat bypass.", "2025-01-26 23:15:00", 21.1702, 72.8311),

        # Bengaluru / Hyderabad / South Cluster
        ("Arjun Mehta", 3, "Malicious transaction relay deployed from Indiranagar node.", "2024-09-20 03:22:00", 12.9784, 77.6408),
        ("Priya Sharma", 3, "Crypto tumbler split transaction routed through Monero pool.", "2024-10-08 13:45:00", 12.9352, 77.6245),
        ("Karthik Reddy", 8, "VoIP spoof server activated in HITEC City data rack.", "2024-10-25 18:10:00", 17.4474, 78.3762),
        ("TS-09-FA-8899 (Tesla Model 3)", 8, "Fastag toll capture at Outer Ring Road Gachibowli junction.", "2024-11-05 21:00:00", 17.4401, 78.3489),
        ("Naveen Iyer", 7, "Intrusion log generated on AWS Mumbai region targeting payment gateway.", "2024-11-22 04:50:00", 17.4474, 78.3762),
        ("NovaCore Cybersecurity Labs", 3, "Subpoena served regarding illicit VPN tunnel exit node.", "2024-12-19 10:00:00", 12.9784, 77.6408),
        ("Arjun Mehta", 13, "Decrypted laptop image retrieved containing 400 private keys.", "2025-01-03 15:30:00", 12.9716, 77.5946),
        ("Priya Sharma", 8, "Live extortion payment received at HITEC City server node.", "2025-02-02 22:15:00", 17.4474, 78.3762),

        # Kolkata / East Cluster
        ("Ananya Das", 10, "Counterfeit consignment documents notarized in Park Street, Kolkata.", "2024-09-25 12:00:00", 22.5530, 88.3510),
        ("Subhash Roy", 10, "Border cargo dispatch organized at Petrapole border post.", "2024-10-15 05:00:00", 23.0800, 88.8700),
        ("Bikramjit Sen", 6, "River barge departure logged at Shalimar Yard, Howrah.", "2024-11-08 17:30:00", 22.5600, 88.3100),
        ("WB-19-TR-7821 (Ashok Leyland Cargo)", 10, "Cargo weighbridge log at Dankuni toll corridor.", "2024-11-27 14:20:00", 22.6800, 88.2900),
        ("Eastern Silk & Logistics Hub", 10, "Customs search warrant executed; undeclared electronics seized.", "2024-12-22 11:00:00", 22.5600, 88.3100),
        ("Ananya Das", 10, "Intercepted meeting at Siliguri corridor checkpoint.", "2025-01-18 19:40:00", 26.7271, 88.3953),

        # Cross-Corridor / Bridge Events
        ("Sunil 'Bhai' Deshmukh", 15, "Secret summit detected at heritage luxury resort in Jaipur.", "2024-10-30 21:00:00", 26.9124, 75.7873),
        ("Sunil 'Bhai' Deshmukh", 15, "Private charter flight logged from Mumbai to Delhi.", "2024-12-05 16:30:00", 19.0896, 72.8656),
        ("Hawala Clearing House Alpha", 2, "Bulk reconciliation ledger synchronized between Delhi & Mumbai cells.", "2024-12-28 23:59:00", 28.6139, 77.2090),
        ("DarkPool Mixer Node #9", 3, "High-volume $2.1M USDT bridge swap completed via decentralized pool.", "2025-01-10 03:00:00", 12.9716, 77.5946),
        ("Swift Global Logistics Ltd", 4, "Interstate fleet convoy dispatched from Delhi to Kolkata.", "2025-01-20 06:00:00", 28.6139, 77.2090),
        ("Sunil 'Bhai' Deshmukh", 15, "Encrypted conference bridge call across 4 regional leaders.", "2025-02-05 21:30:00", 28.6139, 77.2090),
        ("Kabir Khan", 15, "Key operative coordination session in Jaipur safehouse.", "2025-02-12 18:00:00", 26.9124, 75.7873),
        ("Rahul Verma", 15, "Gold bullion clearance verification at Ahmedabad airport terminal.", "2025-02-18 13:20:00", 23.0722, 72.6347),
        ("Arjun Mehta", 15, "Zero-day vulnerability payload deployed against defense supplier.", "2025-02-25 04:10:00", 12.9784, 77.6408),
        ("Ananya Das", 15, "Border crossing clearance stamped at Petrapole international gate.", "2025-03-01 07:45:00", 23.0800, 88.8700),
    ]

    for ent_name, case_id, desc, ts, lat, lon in event_templates:
        if ent_name in e_map:
            ev = Event(
                entity_id=e_map[ent_name].id,
                case_id=case_id,
                description=desc,
                timestamp=ts,
                latitude=lat,
                longitude=lon
            )
            db.add(ev)
    db.commit()

    # 5. Create Audit Trail Logs (Tamper-evident chain of custody for SIH Cyber/Blockchain theme)
    prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
    audit_events = [
        ("SYSTEM_INIT", "System", "CNAS Ingest Engine initialized SQLite persistent graph database."),
        ("INGEST_ENTITIES", "AutoIngest_Agent", "Imported 64 criminal intelligence entities from NCRB & FIU feeds."),
        ("CORRELATE_GRAPH", "GraphEngine_NetworkX", "Constructed 150+ multi-modal relationship links across 4 regional cells."),
        ("CENTRALITY_ALERT", "AI_Analyzer", "Flagged Sunil Deshmukh and Kabir Khan as high-centrality bridge kingpins."),
        ("CASE_SYNC", "Investigator #4092", "Synchronized 15 active intelligence dossiers into Graph Explorer."),
        ("GEO_TELEMETRY", "GIS_Daemon", "Mapped 40 spatial-temporal telemetry coordinates across Indian corridors."),
        ("EVIDENCE_SEAL", "Chief_Investigator", "Generated cryptographically verified investigation snapshot #CNAS-2025-01.")
    ]

    for idx, (action, actor, details) in enumerate(audit_events):
        ts = (datetime.now() - timedelta(days=7 - idx, hours=idx * 3)).strftime("%Y-%m-%d %H:%M:%S")
        block_data = f"{idx}:{prev_hash}:{action}:{actor}:{details}:{ts}"
        curr_hash = hashlib.sha256(block_data.encode()).hexdigest()
        audit = AuditLog(
            timestamp=ts,
            action=action,
            actor=actor,
            details=details,
            block_hash=curr_hash
        )
        db.add(audit)
        prev_hash = curr_hash
    db.commit()

    # 6. Seed Demo Mission Transfer Handover Packages
    if db.query(MissionTransfer).count() == 0:
        demo_code_1 = "GARUDA#9941"
        code_hash_1 = hashlib.sha256(f"CBI_SALT_{demo_code_1}_2026".encode()).hexdigest()
        
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
        demo_transfer_1 = MissionTransfer(
            operation_name="OPERATION CHAKRAVYUH",
            code_word_hash=code_hash_1,
            case_id=cases[0].id if cases else 1,
            outgoing_officer_name="SP Kabir Rao, IPS",
            outgoing_officer_badge="CBI-HQ-8841-DL",
            outgoing_officer_rank="Superintendent of Police",
            outgoing_officer_department="Special Crime & Cyber Forensics Wing",
            outgoing_officer_clearance="LEVEL-V TOP SECRET // LES",
            outgoing_officer_zone="CBI HQ, Lodhi Road, New Delhi",
            outgoing_officer_service_no="IPS-2012-7729",
            handover_notes="Handing over prime custody of interstate Hawala & Cyber Syndicate dossier. All burner intercept logs and shell bank accounts cataloged. Target Vikram Malhotra has moved assets to Manesar transit hub.",
            target_officer_name="DSP Vikram Deshmukh",
            target_officer_badge="CBI-SCB-4092-MB",
            status="LOCKED_PENDING",
            failed_attempts=0,
            max_attempts=3,
            created_at=now_str,
            updated_at=now_str,
            payload_json={
                "case_id": cases[0].id if cases else 1,
                "case_title": cases[0].title if cases else "Operation Iron Grid",
                "status": "Active",
                "description": "Cross-state illicit syndicate communication network operating via burner lines.",
                "entities_count": 8,
                "events_count": 5
            }
        )
        db.add(demo_transfer_1)
        db.commit()

    print(f"Database seeded successfully: {len(entity_records)} entities, {len(relationships_data)} relationships, {len(cases)} cases, {len(event_templates)} events.")
