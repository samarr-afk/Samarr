# SharePlate - File Sharing Application

## Overview

SharePlate is a modern web application that enables secure file sharing through a clean, user-friendly interface. The application allows users to upload files, generate shareable codes and links, and retrieve files using those identifiers. It's built as a full-stack TypeScript application with a React frontend and Express backend, using Telegram as the file storage backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives for accessibility and customization
- **Styling**: Tailwind CSS with CSS variables for theming, including custom brand colors and design tokens
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer middleware for handling multipart/form-data with 2GB file size limit
- **API Design**: RESTful endpoints with standardized error handling and request logging
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless database provider
- **File Storage**: Telegram Bot API used as cloud storage backend
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **In-Memory Fallback**: MemStorage class for development/testing without database

### File Sharing System
- **Share Codes**: 6-character alphanumeric codes for easy sharing
- **Share Links**: Full URLs for direct access
- **File Metadata**: Tracks original filename, size, MIME type, and upload timestamp
- **Telegram Integration**: Files stored as Telegram messages with file ID tracking for retrieval

### Authentication & Authorization
- **Admin Panel**: Password-based authentication for administrative functions
- **Session Management**: Express sessions with PostgreSQL session store
- **Public Access**: File retrieval available without authentication using share codes/links

### Development & Build System
- **Development**: Vite dev server with HMR and error overlay
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Code Quality**: Consistent imports, path aliases, and TypeScript strict mode

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for Node.js
- **react**: Frontend UI library with hooks and modern patterns

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **tailwindcss**: Utility-first CSS framework for styling

### File Handling & Utilities
- **multer**: Middleware for handling file uploads
- **react-dropzone**: Drag-and-drop file upload interface
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking and enhanced development experience
- **drizzle-kit**: Database migration and schema management tooling

### Third-Party Integrations
- **Telegram Bot API**: Used as cloud storage backend for uploaded files
- **Replit Integration**: Development environment optimizations and error handling