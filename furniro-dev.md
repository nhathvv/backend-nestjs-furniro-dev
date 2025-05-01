# Furniro Backend Documentation

## Project Overview

Furniro is an e-commerce backend application built using the NestJS framework. It provides a comprehensive set of APIs for managing an online furniture store, including user authentication, product management, category management, and file upload functionality.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Email Service**: Nodemailer
- **API Documentation**: Swagger UI
- **Validation**: Class-validator and class-transformer

## Project Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or remote instance)
- AWS S3 account (for file uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend-nestjs-furniro-dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on the `env.example` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/furniro
   JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
   JWT_ACCESS_TOKEN_EXPIRESIN=15m
   JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
   JWT_REFRESH_TOKEN_EXPIRESIN=7d
   JWT_EMAIL_VERIFY_SECRET=your_email_verify_secret
   JWT_EMAIL_VERIFY_EXPIRESIN=1d
   JWT_FORGOT_PASSWORD_SECRET=your_forgot_password_secret
   JWT_FORGOT_PASSWORD_EXPIRESIN=15m
   SENDER_EMAIL=your_email@example.com
   SENDER_PASSWORD=your_email_password
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_REGION=your_aws_s3_region
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available via Swagger UI at `/api` when the server is running.

## Core Features and Modules

### Authentication Module

The authentication module handles user registration, login, logout, email verification, and password reset functionality.

**Key Features**:
- User registration with email verification
- JWT-based authentication with access and refresh tokens
- Password reset functionality
- Account verification

### Users Module

Manages user accounts and profiles.

**Key Features**:
- User profile management
- User data CRUD operations
- Role-based access control

### Products Module

Handles product management for the furniture store.

**Key Features**:
- Creating, updating, and deleting products
- Filtering and searching products
- Managing product categories and attributes

### Categories Module

Handles the categorization of products.

**Key Features**:
- Creating and managing product categories
- Hierarchical category structure

### File Upload Module

Manages file uploads to AWS S3.

**Key Features**:
- Single and multiple file uploads
- File storage on AWS S3
- File path generation for database storage

### Mail Module

Handles sending emails for various application features.

**Key Features**:
- Email verification
- Password reset emails
- Notification emails

## Data Models

### User Schema

The User schema includes fields for user authentication and profile information.

### Product Schema

The Product schema defines the structure for furniture products, including:
- Product name and description
- Pricing information (original price, discount)
- Size and color attributes
- Stock quantity
- Product images
- Category association
- Audit fields (created, updated, deleted)

### Category Schema

The Category schema organizes products into a hierarchical structure.

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify user email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/users` - Get all users (admin)
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `DELETE /api/users/:id` - Delete a user (admin)

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category
- `PATCH /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### File Upload Endpoints
- `POST /api/upload/single` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files

## Development Workflow

### Running the Application
- `npm run dev` - Run in development mode with hot reloading
- `npm run start:prod` - Run in production mode

### Testing
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage report

### Code Formatting
- `npm run format` - Format code using Prettier
- `npm run lint` - Run ESLint to check code quality

## Deployment

The application can be deployed to any Node.js hosting service. Before deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Set up production environment variables

3. Start the production server:
   ```bash
   npm run start:prod
   ```

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured to allow specified origins
- API versioning is enabled
- Input validation is performed using class-validator

## Contributing

Guidelines for contributing to the project:

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Run tests
5. Submit a pull request

## License

[MIT Licensed](LICENSE) 