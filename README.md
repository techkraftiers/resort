# Resort Landing Page Backend

This project adds a minimal backend to the existing `resort.html` frontend.

## What it does

- Serves `resort.html` as a static page
- Provides API endpoints for dynamic About/Timeless content
- Accepts booking submissions at `/bookings`
- Saves booking data to `bookings.json`

## Setup

Open a terminal in this folder and run:

```bash
npm install
```

Then start the server:

```bash
npm start
```

Open in browser:

```text
http://localhost:3000
```

## API

- `GET /content/about`
- `GET /content/timeless`
- `POST /bookings`

Booking payload example:

```json
{
  "fullName": "Jane Doe",
  "mobile": "+91 1234567890",
  "email": "jane@example.com",
  "roomType": "Deluxe Room",
  "message": "Looking to book a family stay.",
  "timestamp": "2026-06-04T12:00:00.000Z"
}
```
