# InvesTrack - Investment Portfolio Tracker

InvesTrack is a modern web application that helps you track and manage your investment portfolio. Built with Next.js and Supabase, it provides a user-friendly interface for monitoring your investments, analyzing performance, and making informed decisions.

## Features

- 📊 Real-time portfolio tracking
- 🔐 Secure user authentication
- 📈 Investment performance analytics
- 📱 Mobile-responsive design
- 🔄 Automatic data synchronization
- 📄 Statement upload and parsing
- 🎨 Modern, clean user interface

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- A Supabase account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oferfive/investrack.git
   cd investment-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
```

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/) 