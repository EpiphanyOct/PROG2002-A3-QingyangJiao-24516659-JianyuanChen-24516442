# CharityConnect - PROG2002 A2 Assessment - Qingyang Jiao - 24516659

A dynamic website for managing charity events, built as part of the PROG2002 Web Development II assessment.

##  Project Overview

CharityConnect is a full-stack web application that connects charitable organizations with potential attendees. The platform allows users to discover, search, and learn about various charity events in their city.

**Key Features:**
- Browse upcoming charity events
- Search events by date, location, and category
- View detailed event information
- Track fundraising progress
- Professional, responsive design

##  Quick Start

### Prerequisites
- Node.js 14+ 
- MySQL 5.7+
- npm 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd web2-a2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   # Configure your MySQL credentials in .env file
   cp .env.example .env
   # Edit .env with your database settings
   
   # Initialize database
   node database/setup.js
   ```

4. **Start the server**
   ```bash
   npm start
   # Or for development with auto-restart
   npm run dev
   ```

5. **Access the website**
   - Website: http://localhost:3000
   - API: http://localhost:3000/api

## Project Structure

```
web2-a2/
├── api/                     # Backend API
│   ├── routes/             # API routes
│   │   ├── events.js       # Event endpoints
│   │   └── categories.js   # Category endpoints
│   ├── node_modules/       # Dependencies
│   ├── index.js            # Server entry point
│   ├── event_db.js         # Database connection
│   └── package.json        # API dependencies
├── client/                  # Frontend
│   ├── css/                # Stylesheets
│   │   ├── main.css        # Base styles
│   │   └── theme.css       # Theme colors
│   ├── js/                 # JavaScript
│   │   ├── main.js         # Core utilities
│   │   ├── home.js         # Home page logic
│   │   ├── search.js       # Search functionality
│   │   └── event-detail.js # Event details logic
│   ├── images/             # Static images
│   ├── index.html          # Home page
│   ├── search.html         # Search page
│   └── event-detail.html   # Event details page
├── database/                # Database
│   ├── charityevents_db.sql # Database schema
│   └── setup.js            # Database initialization
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Documentation

### API Endpoints
- `GET /api/events` - List all events
- `GET /api/events/search` - Search events
- `GET /api/events/:id` - Get event details
- `GET /api/categories` - List categories
- `GET /api/health` - Health check

### Pages
- **Home Page** (`/`) - Featured events and organization info
- **Search Page** (`/search`) - Event search and filtering
- **Event Details** (`/event-detail.html?id=X`) - Individual event information

## 🛠 Technology Stack

### Backend
- **Node.js** - Server-side runtime
- **Express.js** - Web framework
- **MySQL2** - Database client
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin support

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - No frameworks
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Database
- **MySQL** - Relational database
- **Normalized Schema** - Proper relationships
- **Sample Data** - 8+ charity events included

## Design Features

### Visual Design
- **Modern, Professional** - Clean charity-appropriate aesthetic
- **Responsive Layout** - Works on all devices
- **Accessible** - WCAG compliant design
- **Performance Optimized** - Fast loading times

### Color Palette
- Primary Blue: #2563eb (Trust, Professionalism)
- Primary Green: #059669 (Growth, Charity)
- Secondary Coral: #f97316 (Warmth, Energy)
- Accent Purple: #7c3aed (Creativity, Impact)

### Typography
- **Noto Sans SC** - Clean, readable body text
- **Noto Serif SC** - Elegant headings

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm test` - Run tests

### Code Style
- **ES6+ JavaScript** - Modern syntax
- **Modular Architecture** - Separated concerns
- **Clean Code** - Well-commented and documented
- **Error Handling** - Comprehensive error management

##  Assessment Requirements

###  Completed Requirements

**Database (20%)**
- [x] MySQL database design
- [x] Proper table relationships
- [x] 8+ sample events
- [x] Node.js connection

**API Development (20%)**
- [x] RESTful endpoints
- [x] Search functionality
- [x] Error handling
- [x] Input validation

**Frontend (20%)**
- [x] Home page with dynamic content
- [x] Search page with filters
- [x] Event details page
- [x] API integration

**JavaScript (20%)**
- [x] DOM manipulation
- [x] Event handling
- [x] Form validation
- [x] Modal management

**Integration & Optimization (20%)**
- [x] Full-stack integration
- [x] Performance optimization
- [x] Responsive design
- [x] Professional styling

##  Key Features

### User Experience
- **Intuitive Navigation** - Easy to find events
- **Real-time Search** - Instant results as you type
- **Responsive Design** - Perfect on any device
- **Loading States** - Clear feedback during operations
- **Error Handling** - Graceful error messages

### Technical Excellence
- **Security** - Input validation and SQL injection prevention
- **Performance** - Optimized queries and rendering
- **Scalability** - Modular architecture for future expansion
- **Maintainability** - Clean, documented, well-structured code

### Interactive Features
- **Dynamic Search** - Real-time results with debounced input
- **Modal System** - Professional popup management
- **Progress Tracking** - Fundraising visualization
- **Form Validation** - Client and server-side validation
- **Analytics** - User interaction tracking

##  Future Enhancements

### Phase 2 (Assessment 3)
- User authentication and registration
- Admin panel for event management
- Real payment processing
- Email notifications

### Advanced Features
- Mobile app integration
- Social media sharing
- Advanced analytics
- Event recommendations

##  License

This project is created for educational purposes as part of PROG2002 Web Development II assessment.

##  Support

For technical issues:
1. Check installation steps above
2. Verify database connection
3. Check browser console for error messages
4. Ensure all dependencies are installed


