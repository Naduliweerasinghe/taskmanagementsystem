# 🚀 Project Setup & Copilot Integration Guide

This document provides instructions for configuring **Visual Studio Code (VS Code)** to work with **GitHub Copilot**, along with a summary of the project’s tech stack and setup steps.

---

## 🧠 Project Overview

This project is a **Task Management App** built as part of an internship assignment.

### **Tech Stack**
| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | **Next.js (v15+) with TypeScript** | Core framework for the web app using the App Router. |
| UI Styling | **Tailwind CSS / shadcn/ui** | Clean and responsive user interface styling. |
| Forms | **React Hook Form** | Efficient form validation and submission handling. |
| Backend | **Supabase** | Database, authentication, and API services. |


---

### **How to Use the Color Palette in Tailwind CSS:**

In your **Tailwind configuration**, you can extend the default color palette to include these colors. Here's how you can add the colors to your `tailwind.config.js` file:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        yellow: '#FFEB3B',
        orange: '#FF9800',
        deepOrange: '#FF5722',
        red: '#F44336',
      },
    },
  },
}
