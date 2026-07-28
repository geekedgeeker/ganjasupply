# GanjaSupply

Premium Supply Management System - A production-quality static web application.

## Quick Start

1. Download or clone the GanjaSupply folder
2. Open `index.html` in a web browser
3. Sign in with credentials:
   - Username: `Gunna` / Password: `GunnaSmokes420`
   - Username: `Snoopy` / Password: `SnoopyLoves420`
4. Deploy to GitHub Pages or any static hosting platform

## Features

- Zero dependencies - no build process, package manager, or backend required
- Premium 420-inspired aesthetic with glass morphism design
- JSON-based authentication with role-based access control
- Editable data tables across all management interfaces
- Fully responsive design for desktop, tablet, and mobile
- Session persistence using browser storage
- Professional documentation suite

## Project Structure

```
GanjaSupply/
├── assets/
│   ├── css/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── components.css
│   │   ├── main.css
│   │   ├── animations.css
│   │   └── docs.css
│   └── js/
│       └── auth.js
├── data/
│   └── UserDB.json
├── docs/
│   └── index.html
├── pages/
│   ├── sign-in.html
│   ├── dashboard.html
│   ├── inventory.html
│   ├── orders.html
│   ├── suppliers.html
│   ├── users.html
│   ├── reports.html
│   └── settings.html
└── index.html
```

## Deployment

### GitHub Pages

1. Create a new repository on GitHub
2. Upload the GanjaSupply folder contents
3. Navigate to Settings > Pages
4. Select main branch as source
5. Select / (root) as directory
6. Save and wait for deployment

### Alternative Platforms

- Netlify
- Vercel
- Cloudflare Pages
- Any static web host

## Documentation

Comprehensive documentation is available in the `docs/` directory. Open `docs/index.html` in a browser to view the complete documentation including:

- Installation instructions
- Project structure details
- Authentication system overview
- Customization guide
- Hosting instructions
- Maintenance procedures

## Configuration

### User Management

Edit `data/UserDB.json` to add or modify users:

```json
{
  "users": [
    {
      "id": "unique_id",
      "username": "username",
      "password": "password",
      "role": "owner",
      "created_at": "2024-01-15T00:00:00Z",
      "last_login": null,
      "active": true
    }
  ]
}
```

### Styling

Modify CSS variables in `assets/css/variables.css` to customize the visual identity.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved.

## Version

1.0.0
