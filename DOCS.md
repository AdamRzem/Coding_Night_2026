# BlogApp — Complete Site Documentation

This document serves as the comprehensive knowledge base for BlogApp, a modern blogging platform. It covers every page, feature, and capability so that support agents and chatbots can answer any user question accurately.

---

## 1. What is BlogApp?

BlogApp is a lightweight, modern blogging website where users can create and read blog posts, view posting activity over time in an interactive graph, switch between light and dark themes, and contact the site owners via a built-in contact form with an interactive map. It is built with SvelteKit and Supabase.

**Tagline:** "Share your thoughts with the world."

**Version:** 1.0

---

## 2. Site Pages & Navigation

The site has a sticky top navigation bar with four main links. On desktop, each link shows an icon and a text label. On mobile (small screens), only the icon is displayed. The currently active page is highlighted in indigo.

| Page | URL Path | Description |
|------|----------|-------------|
| Posts (Home) | `/` | The homepage — view and create blog posts |
| Graph | `/graph` | Interactive line chart of posting activity over time |
| Settings | `/settings` | Theme/appearance customisation (light or dark mode) |
| Contact | `/contact` | Contact information, interactive map, and a contact form |

The site logo in the top-left corner reads **"BlogApp"** (with a lightning bolt icon) and links back to the homepage.

A footer at the bottom of every page displays: "© [current year] BlogApp. Built with SvelteKit."

---

## 3. Posts Page (Homepage) — `/`

### What it does
This is the main page of the site. It displays a list of the most recent blog posts and provides a form to create new posts.

### Creating a new post
1. At the top of the page there is a **"Create New Post"** form.
2. Users fill in two required fields:
   - **Title** — The post title (text input, required).
   - **Content** — The post body (textarea, required).
3. Click the **"Publish Post"** button to submit.
4. While submitting, the button shows a spinning animation and says "Posting..."
5. On success, the new post appears instantly at the top of the list without a page reload (optimistic UI update), and the form fields are cleared.
6. If either field is left empty, an error message appears: "Title and text are required."
7. If a server error occurs, the error message from the server is displayed.

### Viewing posts
- Posts are displayed below the creation form as styled cards.
- Each post card shows:
  - **Title** (bold, becomes indigo on hover)
  - **Date** (formatted as "Month Day", e.g. "Feb 21", shown in a small pill/badge in the top-right corner of the card)
  - **Content** (the post body text)
- Posts are sorted by creation date, newest first.
- Up to 3 posts are loaded at a time from the database.
- If there are no posts yet, a placeholder message is shown: "No posts yet — Be the first to publish something!"

---

## 4. Graph Page — `/graph`

### What it does
This page shows an **interactive line chart** visualising how many blog posts were created on each day.

### Chart details
- The chart renders a smooth line graph (with filled area under the line) using **Chart.js**.
- The X-axis shows dates (formatted as "Month Day", e.g. "Feb 21").
- The Y-axis shows the number of posts (integer steps, starting from zero).
- The chart covers the full date range from the earliest post to today, filling in zero for any days with no posts.
- The chart adapts its colours to light/dark theme (indigo tones).
- Hovering over data points shows a tooltip with the exact count.

### Summary statistics
Below the chart, three stat cards are displayed:
1. **Total Posts** — The total number of posts ever created (displayed as a large indigo number).
2. **First Post** — The date of the oldest post (e.g. "Feb 15, 2026"). Shows a dash "—" if no posts exist.
3. **Latest Post** — The date of the most recent post. Shows a dash "—" if no posts exist.

---

## 5. Settings Page — `/settings`

### What it does
This page lets users customise the visual appearance of BlogApp.

### Appearance / Theme Toggle
- Users can choose between two modes:
  - **Light** — "Clean & bright" appearance with a white/light gray background.
  - **Dark** — "Easy on the eyes" appearance with a dark gray/near-black background.
- The currently selected mode is highlighted with an indigo border and checkmark icon.
- Clicking either option switches the theme instantly across the entire site.
- The preference is **saved in the browser's local storage**, so it persists across sessions and page reloads.
- On first visit, the theme defaults to the user's operating system preference (if the OS is set to dark mode, the site starts in dark mode; otherwise it starts in light mode).

### About section
A small section at the bottom states: "BlogApp v1.0 — Built with SvelteKit & Supabase."

---

## 6. Contact Page — `/contact`

### What it does
This page provides ways for users to reach out to the BlogApp team. It contains contact details, an interactive map, and a contact form.

### Contact Information
Displayed in a card on the left side (or stacked on mobile):
- **Address:** Nowy Sącz, Poland
- **Email:** contact@example.com
- **Phone:** +48 123 456 789

### Interactive Map
On the right side, an interactive map (powered by **Leaflet** with OpenStreetMap tiles) is displayed showing the location of Nowy Sącz, Poland (coordinates: 49.6249, 20.6872). A marker pin on the map opens a popup reading "Our Location — Nowy Sącz, Poland." Users can zoom and pan the map.

### Contact Form — Send a Message
Below the info and map section, there is a contact form with the following fields:
- **Name** — The sender's name (text input, required).
- **Email** — The sender's email address (email input, required).
- **Message** — The message body (textarea, required).
- A **"Send Message"** button submits the form.
- After submission, a status message is shown:
  - "Sending..." while the email is being sent.
  - "Email sent!" on success (and the form fields are cleared).
  - An error message if something goes wrong (e.g., "Failed to send email").
- Emails are sent to the site owner's email address. The sender's email is set as the reply-to address, so the owner can reply directly.

---

## 7. Chatbot

BlogApp includes an integrated **Chatling** AI chatbot (ID: 9196135874). The chatbot widget appears on every page of the site and can answer user questions about BlogApp.

---

## 8. Theme & Design

### Visual style
- Modern, clean design with rounded cards (2xl border radius), subtle shadows, and smooth transitions.
- Primary accent colour: **Indigo** (used for buttons, active navigation, highlights, and chart colours).
- Background: Light gray (`gray-50`) in light mode, near-black (`gray-950`) in dark mode.
- Cards: White in light mode, dark gray (`gray-900`) in dark mode, with subtle borders.
- Typography: System font stack, with bold headings and relaxed body text line-height.

### Responsiveness
- Fully responsive layout that adapts to all screen sizes.
- Navigation labels are hidden on small screens (only icons shown).
- Contact page content stacks vertically on mobile.
- The graph and stat cards reflow for mobile.

### Transitions
- Background and text colour changes animate smoothly over 300ms when switching themes.
- Card hover effects include shadow increase and border colour change.
- Buttons have hover and active states with colour transitions.

---

## 9. Technology Stack

| Technology | Purpose |
|------------|---------|
| **SvelteKit 2** (Svelte 5) | Full-stack web framework (pages, server routes, routing) |
| **Supabase** | Backend-as-a-service — PostgreSQL database for storing blog posts |
| **Tailwind CSS 4** | Utility-first CSS framework for styling |
| **Chart.js** | JavaScript charting library for the activity graph |
| **Leaflet** | Interactive map library (with OpenStreetMap tiles) for the contact page |
| **Nodemailer** | Server-side email sending (via Gmail SMTP) for the contact form |
| **Chatling** | AI chatbot widget embedded on every page |
| **TypeScript** | Type-safe JavaScript used throughout the project |
| **Vite** | Build tool and dev server |

---

## 10. Database

BlogApp uses a **Supabase** PostgreSQL database with a table called **`BlogPost`**.

### BlogPost table schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer (auto) | Unique identifier for each post |
| `title` | text | The title of the blog post |
| `text` | text | The body content of the blog post |
| `createdAt` | timestamp | The date and time the post was created |

Posts are read and written via the Supabase JavaScript client on the server side.

---

## 11. Frequently Asked Questions (FAQ)

### General

**Q: What is BlogApp?**
A: BlogApp is a simple, modern blogging platform where you can write and read posts, view activity statistics, and contact the site owners.

**Q: Is BlogApp free to use?**
A: Yes, the site is free to browse and use. There are no paywalls or premium tiers.

**Q: Do I need an account to use BlogApp?**
A: No. BlogApp does not require user registration or login. Anyone can create posts and browse the site.

### Posts

**Q: How do I create a new blog post?**
A: Go to the homepage (Posts page), fill in the Title and Content fields in the "Create New Post" form, and click "Publish Post."

**Q: Can I edit or delete a post after publishing?**
A: Currently, there is no edit or delete functionality available on the site. Once a post is published, it remains as-is.

**Q: How many posts are shown on the homepage?**
A: The homepage displays up to 3 of the most recent posts.

**Q: Are posts public?**
A: Yes, all posts are visible to everyone who visits the site.

### Graph

**Q: What does the graph show?**
A: The Graph page shows a line chart of how many blog posts were created on each day, from the earliest post date to today.

**Q: What are the statistics below the graph?**
A: Three cards show: Total Posts (number of all posts), First Post (date of the earliest post), and Latest Post (date of the most recent post).

### Settings

**Q: How do I switch between light and dark mode?**
A: Go to the Settings page and click either the "Light" or "Dark" option. The change applies immediately to the entire site.

**Q: Will my theme preference be saved?**
A: Yes, your theme choice is saved in your browser's local storage and will persist across sessions.

**Q: What is the default theme?**
A: On your first visit, BlogApp follows your operating system's preference. If your OS is set to dark mode, the site will start in dark mode; otherwise, it defaults to light mode.

### Contact

**Q: How can I contact the BlogApp team?**
A: You can use the contact form on the Contact page to send a message, or reach out via the listed email (contact@example.com) or phone (+48 123 456 789).

**Q: Where is BlogApp based?**
A: BlogApp is based in Nowy Sącz, Poland.

**Q: What happens when I submit the contact form?**
A: Your message is sent as an email to the site owner. You will see a confirmation ("Email sent!") once it's been delivered. The owner can reply directly to your email address.

**Q: What is the map on the contact page?**
A: It is an interactive OpenStreetMap showing the physical location of BlogApp in Nowy Sącz, Poland. You can zoom in/out and pan the map.

### Technical

**Q: What technologies does BlogApp use?**
A: SvelteKit (Svelte 5), Supabase (PostgreSQL), Tailwind CSS, Chart.js, Leaflet, Nodemailer, and TypeScript.

**Q: Is the site mobile-friendly?**
A: Yes, BlogApp is fully responsive and works on all screen sizes, from mobile phones to large desktop monitors.

**Q: Is there a chatbot on the site?**
A: Yes, a Chatling AI chatbot is available on every page to help answer user questions.

---

## 12. Site Map Summary

```
/              → Posts (Homepage) — Read and create blog posts
/graph         → Activity Graph — Line chart of posts over time + statistics
/settings      → Settings — Light/dark theme toggle
/contact       → Contact — Contact info, interactive map, and message form
/api/send-email → (Internal API) — Handles contact form email sending
```

---

*This document is the authoritative knowledge base for BlogApp and should be used to answer any user questions about the site's features, pages, functionality, and design.*
