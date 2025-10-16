# InviteLink

InviteLink is a smart event access and guest management system built for precise, modern event control — starting with Nikahs and weddings.  
It replaces guesswork and gate chaos with QR/NFC invites, automated guest tracking, and real-time SMS notifications.

---

## 🎯 Overview

Each guest receives an invite card that includes:
- A **QR code** (and optionally an **NFC tag**) linked to their unique InviteLink.
- Their invite encodes who they are and how many guests (+1s) they can bring.

Guests scan or tap the invite to open the RSVP page where they:
- Confirm attendance
- Register their plus-ones (limited to their allowance)
- Choose parking options

At the event:
- **Security scans** QR or NFC codes for entry.
- **Wristbands** allow re-entry validation.
- **Admin dashboard** displays attendance, missing guests, and live status.
- **Automated SMS alerts** remind guests 10 mins before start time, notify late arrivals, and even offer parking promos.

---

## 🧩 Key Features

### 1. Smart Invites
- Unique QR/NFC code for every invite.
- Encodes guest name, invite ID, and allowed plus-ones.
- Optional printed or digital delivery.

### 2. RSVP System
- Scan → RSVP page → submit.
- Collects guest name, phone, plus-ones, parking preference.
- Saves to Firestore or Supabase.

### 3. Event Dashboard
- Real-time overview:
  - Total invites
  - RSVP count
  - Checked-in guests
  - Missing attendees
- "Call All" and "Text Missing" actions via Twilio.

### 4. SMS Automations
- “Event begins in 10 mins” reminder.
- “Event started” message to unscanned guests.
- Optional “Ringo parking promo” messages.

### 5. Guest Experience Add-ons
- Helpdesk number printed on invite — staff can RSVP for guests.
- Guests’ plus-ones receive separate personalized links.
- Magic NFC tap experience for seamless check-in.

---

## ⚙️ Tech Stack

|| Layer | Technology |
|-------|-------------|
| **Frontend** | React Native |
| **Backend** | C# (.NET) |
| **Database** | Azure Free Tier Database |
| **Deployment** | GitHub Actions, Azure, Terraform |

---

## 🧱 Build Plan

1. **Stage 1 — Setup**
   - Initialize Next.js app with Tailwind.
   - Connect Firestore/Supabase.
   - Add QR code generator utility.

2. **Stage 2 — RSVP Flow**
   - `/rsvp` page with guest form.
   - Store RSVP data.
   - Auto-generate guest QR/NFC link.

3. **Stage 3 — Dashboard**
   - `/admin` page showing live RSVP & attendance.
   - Twilio SMS integration.

4. **Stage 4 — Check-In Flow**
   - QR scan endpoint marks guests as checked in.
   - NFC tap works the same way.

5. **Stage 5 — Automations**
   - Schedule Twilio texts for reminders and “event started” notifications.

6. **Stage 6 — Physical Invites (Optional)**
   - Print and mail QR/NFC cards with personalized details.

---

## 🚀 Goals
- Eliminate unregistered guests.
- Streamline RSVP and check-in.
- Make every event as organized as an airport boarding system — but classy.

---

## 🧠 For Developers
InviteLink is built with scalability in mind — adaptable for weddings, conferences, and any event needing structured access control.  
Start by running:

```bash
npx create-next-app invitellink
cd invitellink
npm install firebase qrcode twilio
npm run dev
```

---

# InviteLink Infrastructure

This repository contains the infrastructure setup for deploying the InviteLink application to Azure using Kubernetes (AKS) and GitHub Actions for CI/CD.

## Infrastructure Overview

- **Azure Kubernetes Service (AKS)**: Hosts the application and backend services.
- **Azure Container Registry (ACR)**: Stores Docker images for the application and backend.
- **Terraform**: Used for defining and provisioning the infrastructure.
- **GitHub Actions**: Automates the CI/CD pipeline for building, pushing, and deploying the application.

## Folder Structure

- `infra/`: Contains Terraform configuration files for Azure infrastructure.
- `.github/workflows/`: Contains GitHub Actions workflows for CI/CD.

## Prerequisites

1. Install [Terraform](https://developer.hashicorp.com/terraform/downloads).
2. Install [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
3. Authenticate Azure CLI:
   ```bash
   az login
   ```
4. Set the Azure subscription:
   ```bash
   az account set --subscription "<your-subscription-id>"
   ```

## Steps to Deploy

1. Navigate to the `infra/` directory and initialize Terraform:
   ```bash
   terraform init
   ```
2. Plan the infrastructure:
   ```bash
   terraform plan
   ```
3. Apply the infrastructure:
   ```bash
   terraform apply
   ```
4. Push changes to the repository to trigger the GitHub Actions pipeline.

## CI/CD Pipeline

The GitHub Actions pipeline performs the following steps:
1. Builds Docker images for the frontend and backend.
2. Pushes the images to Azure Container Registry (ACR).
3. Deploys the application to Azure Kubernetes Service (AKS).

---

For detailed documentation, refer to the `docs/` folder.
# InviteLink
