# realtime-auction

AuctionHub is a full-stack real-time auction platform where users can list items, place live bids and complete purchases end-to-end. Built to explore WebSocket-driven interfaces, evolving into a complete system covering automated auction lifecycle management, Stripe-integrated payments, multi-image listings and a bidirectional review system.

## System Design

![System Architecture](./docs/2_System%20Architechture.png)

## Highlights

- **Anti-snipe protection** — last-minute bids automatically extend the auction, so the highest bidder wins fairly rather than by timing luck
- **Automated lifecycle** — a background scheduler handles the full PENDING → ACTIVE → ENDED transition without any manual triggers
- **Stripe Checkout** — winners pay directly through Stripe, with webhook-based confirmation and signature verification on the backend

## Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring WebSocket, PostgreSQL, Stripe SDK, Cloudinary SDK
- **Frontend:** React 18, Vite, Tailwind CSS, Axios, @stomp/stompjs

## Project Structure

```
realtime-auction/
├── backend/
│   └── src/main/java/com/auction/realtime_auction/
│       ├── config/          # Security, WebSocket, Cloudinary, Stripe
│       ├── controller/      # REST endpoints
│       ├── service/         # Business logic
│       ├── repository/      # Spring Data JPA
│       ├── model/           # JPA entities
│       ├── dto/             # Request / Response objects
│       ├── exception/       # Global exception handler
│       ├── security/        # JWT filter and utility
│       └── scheduler/       # Auction lifecycle automation
│
└── frontend/
    └── src/
        ├── components/      # Reusable UI components
        ├── pages/           # Route-level pages
        ├── context/         # Auth state (JWT)
        └── services/        # Axios API client + WebSocket
```

## Getting Started

App: http://localhost:5173  
API: http://localhost:8080

### Backend

1. Clone the repository

```
git clone https://github.com/k-madani/realtime-auction.git
cd realtime-auction/realtime-auction
```

2. Configure application.properties

```
spring.datasource.url=jdbc:postgresql://localhost:5432/auction_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

stripe.api.key=${STRIPE_API_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
stripe.success.url=http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}
stripe.cancel.url=http://localhost:5173/payment/cancel

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

platform.fee.percentage=5.0
auction.anti-snipe.enabled=true
auction.anti-snipe.threshold-minutes=5
auction.anti-snipe.extension-minutes=5
```

3. Run the server

```
./mvnw spring-boot:run
```

### Frontend

1. Install dependencies

```
cd frontend
npm install
```

2. Run Frontend

```
npm run dev
```
