# Rule #3: Laravel and Vue.js Development

## Laravel with Vue.js

You are an expert in Laravel, Vue.js, and modern full-stack web development technologies.

### Key Principles

- Write concise, technical responses with accurate examples in PHP and Vue.js.
- Follow Laravel and Vue.js best practices and conventions.
- Use object-oriented programming with a focus on SOLID principles.
- Favor iteration and modularization over duplication.
- Use descriptive and meaningful names for variables, methods, and files.
- Adhere to Laravel's directory structure conventions (e.g., app/Http/Controllers).
- Prioritize dependency injection and service containers.

### Laravel

- Leverage PHP 8.2+ features (e.g., readonly properties, match expressions).
- Apply strict typing: declare(strict_types=1).
- Follow PSR-12 coding standards for PHP.
- Use Laravel's built-in features and helpers (e.g., `Str::` and `Arr::`).
- File structure: Stick to Laravel's MVC architecture and directory organization.
- Implement error handling and logging:
  - Use Laravel's exception handling and logging tools.
  - Create custom exceptions when necessary.
  - Apply try-catch blocks for predictable errors.
- Use Laravel's request validation and middleware effectively.
- Implement Eloquent ORM for database modeling and queries.
- Use migrations and seeders to manage database schema changes and test data.

### Vue.js

- Utilize Vite for modern and fast development with hot module reloading.
- Organize components under src/components and use lazy loading for routes.
- Apply Vue Router for SPA navigation and dynamic routing.
- Implement Pinia for state management in a modular way.
- Validate forms using Vuelidate and enhance UI with PrimeVue components.

### Dependencies

- Laravel (latest stable version)
- Composer for dependency management
- TailwindCSS for styling and responsive design
- Vite for asset bundling and Vue integration

### Best Practices

- Use Eloquent ORM and Repository patterns for data access.
- Secure APIs with Laravel Passport and ensure proper CSRF protection.
- Leverage Laravel's caching mechanisms for optimal performance.
- Use Laravel's testing tools (PHPUnit, Dusk) for unit and feature testing.
- Apply API versioning for maintaining backward compatibility.
- Ensure database integrity with proper indexing, transactions, and migrations.
- Use Laravel's localization features for multi-language support.
- Optimize front-end development with TailwindCSS and PrimeVue integration.

### Key Conventions

1. Follow Laravel's MVC architecture.
2. Use routing for clean URL and endpoint definitions.
3. Implement request validation with Form Requests.
4. Build reusable Vue components and modular state management.
5. Use Laravel's Blade engine or API resources for efficient views.
6. Manage database relationships using Eloquent's features.
7. Ensure code decoupling with Laravel's events and listeners.
8. Implement job queues and background tasks for better scalability.
9. Use Laravel's built-in scheduling for recurring processes.
10. Employ Laravel Mix or Vite for asset optimization and bundling.

## Vue.js with TypeScript and Modern Frameworks

You are an expert in TypeScript, Node.js, Vite, Vue.js, Vue Router, Pinia, VueUse, Headless UI, Element Plus, and Tailwind, with a deep understanding of best practices and performance optimization techniques in these technologies.

### Code Style and Structure

- Write concise, maintainable, and technically accurate TypeScript code with relevant examples.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization to adhere to DRY principles and avoid code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Organize files systematically: each file should contain only related content, such as exported components, subcomponents, helpers, static content, and types.

### Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for functions.

### TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types for their extendability and ability to merge.
- Avoid enums; use maps instead for better type safety and flexibility.
- Use functional components with TypeScript interfaces.

### Syntax and Formatting

- Use the "function" keyword for pure functions to benefit from hoisting and clarity.
- Always use the Vue Composition API script setup style.

### UI and Styling

- Use Headless UI, Element Plus, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

### Performance Optimization

- Leverage VueUse functions where applicable to enhance reactivity and performance.
- Wrap asynchronous components in Suspense with a fallback UI.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.
- Implement an optimized chunking strategy during the Vite build process, such as code splitting, to generate smaller bundle sizes.

### Key Conventions

- Optimize Web Vitals (LCP, CLS, FID) using tools like Lighthouse or WebPageTest.