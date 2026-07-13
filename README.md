# Absen API

Absen API adalah REST API untuk sistem absensi sekolah yang mendukung autentikasi berbasis JWT, pencatatan kehadiran siswa, izin siswa dan guru, monitoring kehadiran secara real-time, rekap laporan PDF/Excel, serta push notification menggunakan Firebase Cloud Messaging (FCM). API dibangun menggunakan Node.js, Express, Sequelize, dan MariaDB.

## Features

- Authentication JWT
- Role Admin
- Role Teacher
- Role Student
- Attendance
- Student Permission
- Teacher Permission
- Attendance Monitoring
- Reports (PDF & Excel)
- Firebase Push Notification
- Cron Notification
- APK Distribution

## Tech Stack

- Node.js
- Express
- Sequelize
- MariaDB
- Firebase Admin SDK
- JWT
- Multer
- PM2
- node-cron
- PDFKit
- XLSX

## Requirements

- Node.js 22+
- MariaDB 11+
- npm
- Git

## Installation

git clone ...

cd absen-api

npm install

## Environment Variables

Copy:

.env.example

menjadi

.env

Lalu sesuaikan:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASS

UPLOAD_ROOT

JWT_SECRET

dan lain-lain.

## Firebase Configuration

1. Masuk Firebase Console
2. Generate Service Account
3. Simpan file JSON ke:

src/config/

Catatan:
File tersebut bersifat rahasia dan sudah masuk .gitignore.

## Database

Buat database:

absensi_sumpay

Import migration / sync sequelize

Seed admin

npm run seed:admin

## Running

Development

npm run dev

Production

pm2 start src/server.js --name absen-api

## Project Structure

src/
config/
controllers/
middlewares/
models/
routes/
seed/
services/
utils/

## Upload Directory

uploads/
teacher-permissions/
student-permissions/

## API Features

- Login
- Attendance
- Permission
- Reports
- Monitoring
- Dashboard

## Backup & Restore

Lihat folder:

docs/

atau

restore.md

restore-gdrive.md

## License
