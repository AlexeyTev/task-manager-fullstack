# 📝 Task Manager App

A full-stack task manager application built with **Spring Boot**, **React**, and **MySQL**, featuring:

- ✅ OTP-based secure login via email
- 🧾 User-specific task lists
- 📎 File attachments uploaded to AWS S3 (with size/type restrictions)
- 🖱️ Drag-and-drop reordering using DnD Kit
- 🔒 Basic input validation for security

---

## 🛠️ Tech Stack

### Backend:
- **Java** with **Spring Boot**
- **Spring Data JPA** + **Hibernate**
- **MySQL** (local dev DB)
- **Amazon S3 SDK** (v2) for file uploads
- **JavaMailSender** (OTP via email)

### Frontend:
- **React**
- **Axios** for API communication
- **DnD Kit** for drag-and-drop reordering
- **CSS3** custom styling based on modern portfolio aesthetics

---

## ⚙️ Features

| Feature | Description |
|--------|-------------|
| OTP Login | Users receive a 6-digit OTP via email to log in |
| Tasks CRUD | Create, read, update (mark done/undone), delete |
| S3 File Uploads | Uploads are stored and served from S3 (images, PDFs, audio) |
| Drag & Drop | Reorder tasks on the frontend |
| File Validation | Rejects `.exe` and large or invalid files |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Java 21+
- MySQL 8+
- AWS account with S3 bucket
- Mailtrap (for dev) or Gmail (App Password)

### Backend Setup

1. Clone the repo and navigate to `/backend`
2. Configure `application.properties` (add credentials manually, do not commit!)
3. Run:
   ```bash
   ./mvnw spring-boot:run
