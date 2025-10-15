﻿/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        "card-foreground": 'hsl(var(--card-foreground))',
        primary: 'hsl(var(--primary))',
        "primary-foreground": 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        "secondary-foreground": 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        "muted-foreground": 'hsl(var(--muted-foreground))',
        destructive: 'hsl(var(--destructive))',
        "destructive-foreground": 'hsl(var(--destructive-foreground))',
        success: 'hsl(var(--success))',
        "success-foreground": 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        "warning-foreground": 'hsl(var(--warning-foreground))',
        info: 'hsl(var(--info))',
        "info-foreground": 'hsl(var(--info-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
