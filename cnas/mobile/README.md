# 📱 CNAS Mobile — Criminal Network Analysis System
### CBI Law Enforcement & Intelligence Mobile Application (Flutter)

A dedicated, high-performance, dark law-enforcement mobile application designed for handheld officer investigations, field telemetry tracking, suspect radar searches, and AI-powered criminal network analysis.

---

## 🌟 Key Features

1. **Holographic CBI Smart ID Card & Clearance**:
   - Biometric touch scan & Level-4 clearance authorization.
2. **Tactical Command Dashboard**:
   - Level-4 Critical threat status gauge, live investigation stats, primary target cards.
3. **Suspect & Telecom Radar**:
   - Real-time phone number, alias, and IMEI tracker with linked associate networks and movement history.
4. **Network Graph & Cluster Explorer**:
   - Centrality ranking, betweenness scores, and cartel subgroup filters.
5. **Investigation Cases Dossier**:
   - Active case files, evidence chronology, and suspect links.
6. **GIS Spatial-Temporal Telemetry**:
   - Live location logs, coordinates lookup, and cell tower pin tracking.
7. **CBI Neural Knowledge Assistant**:
   - Natural language investigation queries with neural graph reasoning.
8. **Official Tactical Intelligence Dossier**:
   - Print-ready classified tactical summary sheet with SHA-256 digital forensic seal.

---

## 🌐 Connected Production Backend

The mobile application is pre-configured to communicate directly with your live Render backend:
- **Live API Base**: `https://sih-gctv.onrender.com/api`
- **Fallback / Local Base**: `http://10.0.2.2:8000/api` (Android emulator) or local IP.

---

## 🚀 How to Run the Flutter App

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) installed and added to your `PATH`.
- Android Studio / VS Code with Flutter extension, or a connected physical Android/iOS phone.

### Step 1: Navigate to Mobile Folder
```bash
cd cnas/mobile
```

### Step 2: Install Flutter Dependencies
```bash
flutter pub get
```

### Step 3: Run on Connected Device / Emulator
```bash
flutter run
```

### Step 4: Build Release APK for Android
```bash
flutter build apk --release
```
The generated APK will be available in:
`build/app/outputs/flutter-apk/app-release.apk`
