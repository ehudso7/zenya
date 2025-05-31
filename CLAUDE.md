# Development Guidelines for Zenya Project

## Meta-Guidelines for AI Generation Excellence

### Core Directive
All AI generations must drastically exceed limitations by implementing and adhering to strict rules, guidelines, dos and don'ts to ensure quality, performance, reliability, legality, and security all pass with flying colors.

### Instruction Processing Protocol

Whenever receiving any instruction, follow this 5-step process:

1. **Refine** - Improve the instruction for clarity, specificity, and effectiveness
2. **Perspective** - Create a relevant perspective for interpreting the instruction
3. **Present Refined** - Format: `Refined: [refined instruction]`
4. **State Perspective** - Format: `Perspective: [chosen perspective]`
5. **Execute** - Format: `Execution: [answer]`

### Implementation Standards

#### Quality Assurance
- Every generation must meet or exceed industry best practices
- Code must be production-ready with no placeholders or TODOs
- Implement comprehensive error handling and edge case coverage
- Ensure accessibility compliance (WCAG 2.1 AA minimum)
- Follow security-first development principles

#### Performance Optimization
- Optimize for lowest latency and highest throughput
- Implement caching strategies at all appropriate layers
- Use lazy loading and code splitting by default
- Profile and benchmark all performance-critical paths
- Target Core Web Vitals excellence (LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### Reliability Engineering
- Design for 99.99% uptime availability
- Implement circuit breakers and retry mechanisms
- Use graceful degradation patterns
- Ensure idempotency in all operations
- Implement comprehensive logging and monitoring

#### Legal Compliance
- Ensure GDPR, CCPA, and other privacy law compliance
- Implement proper data retention and deletion policies
- Use appropriate licensing for all dependencies
- Respect intellectual property rights
- Implement audit trails for compliance tracking

#### Security Standards
- Follow OWASP Top 10 security practices
- Implement defense-in-depth strategies
- Use encryption for data at rest and in transit
- Implement proper authentication and authorization
- Regular security audits and penetration testing mindset
- Never expose sensitive data or credentials

### Development Efficiency Principles

#### Time Optimization
- Always proceed with what is technologically possible as of May 28th, 2025
- Leverage latest stable versions of all frameworks and tools
- Use AI-assisted development tools and copilots
- Implement automated testing and CI/CD pipelines
- Reuse proven patterns and components

#### Cost Optimization
- Choose serverless and managed services where appropriate
- Implement auto-scaling to match demand
- Use cost-effective storage and compute solutions
- Optimize bundle sizes and network requests
- Implement efficient caching strategies

#### Quality at Speed
- Use type-safe languages and strict linting
- Implement automated code quality checks
- Use component libraries for consistent UI/UX
- Leverage framework conventions to reduce boilerplate
- Implement progressive enhancement strategies

### Continuous Improvement
- Stay updated with latest best practices
- Regularly refactor and optimize existing code
- Monitor and act on performance metrics
- Gather and implement user feedback
- Document all decisions and implementations

### Decision Framework
When making technical decisions, prioritize in this order:
1. **Security** - Never compromise on security
2. **Reliability** - Ensure stable, predictable behavior
3. **Performance** - Optimize for user experience
4. **Maintainability** - Write clean, documented code
5. **Cost** - Optimize resource usage
6. **Time** - Deliver efficiently without sacrificing quality

### AI Generation Checklist
Before completing any task, verify:
- ✅ Security vulnerabilities addressed
- ✅ Performance optimized
- ✅ Error handling comprehensive
- ✅ Code is production-ready
- ✅ Documentation complete
- ✅ Tests implemented
- ✅ Accessibility standards met
- ✅ Legal compliance verified

## General Development Principles

### Programming Approach
- Always follow best practices for each language/framework
- Write clean, maintainable, and well-documented code
- Use functional programming patterns where applicable
- Implement proper error handling and validation
- Follow security best practices
- Optimize for performance
- Write comprehensive tests

## Language and Framework Specific Guidelines

### JAX (Machine Learning)
- Use functional programming patterns
- Leverage JAX's transformations (jit, vmap, pmap, grad)
- Implement efficient vectorized operations
- Use proper device placement strategies
- Follow best practices for numerical stability

### Web Scraping (Python)
- Use BeautifulSoup for simple HTML parsing
- Use Selenium for JavaScript-heavy sites
- Consider advanced tools: jina, firecrawl, scrapfly
- Implement proper rate limiting and respect robots.txt
- Handle errors gracefully with retries
- Use session management for complex scenarios

### Flutter Development

#### Clean Architecture
- Strict layer separation: Presentation, Domain, Data
- Feature-first organization:
  ```
  lib/
    features/
      feature_name/
        presentation/
          pages/
          widgets/
          providers/
        domain/
          entities/
          repositories/
          usecases/
        data/
          models/
          datasources/
          repositories/
  ```
- Dependencies flow: Presentation → Domain ← Data
- Domain layer has no dependencies

#### State Management with Riverpod
- Use `@riverpod` annotation with code generation
- Implement StateNotifier for complex state
- Use AsyncNotifier for async operations
- Follow functional programming patterns
- Proper error handling with AsyncValue

#### State Management with Bloc
- Use flutter_bloc with Freezed for state classes
- Implement proper event-to-state mapping
- Use BlocProvider for dependency injection
- Follow MVI pattern: Events → Bloc → States
- Implement proper error states

#### Error Handling
- Use Dartz for functional error handling
- Implement Either<Failure, Success> pattern
- Create specific failure types
- Handle errors at appropriate layers

#### Dependency Injection
- Use GetIt for service locator pattern
- Register dependencies in injection container
- Follow dependency inversion principle

#### Testing
- Unit tests for business logic
- Widget tests for UI components
- Integration tests for features
- Use mockito for mocking
- Aim for high test coverage

### Android Development (Kotlin)
- Follow MVI architecture pattern
- Use Kotlin coroutines for async operations
- Implement proper lifecycle management
- Use Hilt for dependency injection
- Follow Material Design guidelines

### iOS Development (SwiftUI)
- Use MVVM architecture
- Leverage Combine framework
- Implement proper state management
- Follow Apple's Human Interface Guidelines
- Use async/await for modern concurrency

### Chrome Extensions
- Use Manifest V3
- Implement proper permissions model
- Handle background service workers correctly
- Follow Chrome Web Store policies
- Optimize for performance

### Web Development

#### React
- Use functional components with hooks
- Implement proper state management (Redux/Context)
- Follow component composition patterns
- Use TypeScript for type safety
- Implement proper error boundaries

#### Vue
- Use Composition API
- Implement proper reactivity
- Follow single-file component pattern
- Use Pinia for state management

#### TypeScript/Pixi.js
- Implement proper type definitions
- Use object pooling for performance
- Optimize rendering pipeline
- Handle game loop efficiently
- Implement proper asset management

### Deep Learning
- Use PyTorch/TensorFlow best practices
- Implement proper data pipelines
- Use mixed precision training
- Implement checkpointing
- Monitor training metrics

### Unity Development
- Follow SOLID principles
- Use object pooling
- Optimize draw calls
- Implement proper LOD systems
- Use async operations appropriately

### Backend Development
- Implement RESTful API design
- Use proper authentication/authorization
- Implement rate limiting
- Follow database best practices
- Use caching strategies

## Code Quality Standards

### Documentation
- Write clear, concise comments
- Document complex algorithms
- Provide usage examples
- Maintain up-to-date README

### Testing
- Write unit tests first (TDD when applicable)
- Achieve high code coverage
- Test edge cases
- Implement integration tests
- Use continuous integration

### Performance
- Profile before optimizing
- Use appropriate data structures
- Implement caching where beneficial
- Optimize database queries
- Monitor performance metrics

### Security
- Never hardcode secrets
- Validate all inputs
- Use prepared statements for SQL
- Implement proper authentication
- Follow OWASP guidelines
- Use environment variables for configuration

## Project Organization

### Version Control
- Write meaningful commit messages
- Follow git flow or similar branching strategy
- Keep commits atomic
- Review code before merging

### Code Style
- Follow language-specific conventions
- Use consistent formatting
- Implement linting rules
- Use prettier/formatter tools

### Dependency Management
- Keep dependencies up to date
- Audit for security vulnerabilities
- Use lock files
- Document dependency choices

## Communication
- Be concise and direct
- Explain technical decisions clearly
- Provide actionable feedback
- Document important decisions

## Python Cybersecurity Tool Development

### Key Principles
- Write concise, technical responses with accurate Python examples
- Use functional, declarative programming; avoid classes where possible
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., is_encrypted, has_valid_signature)
- Use lowercase with underscores for directories and files
- Follow the Receive an Object, Return an Object (RORO) pattern

### Python/Cybersecurity Guidelines
- Use `def` for pure, CPU-bound routines; `async def` for network/I/O operations
- Add type hints for all function signatures
- Validate inputs with Pydantic v2 models
- Organize file structure:
  - `scanners/` (port, vulnerability, web)
  - `enumerators/` (dns, smb, ssh)
  - `attackers/` (brute_forcers, exploiters)
  - `reporting/` (console, HTML, JSON)
  - `utils/` (crypto_helpers, network_helpers)
  - `types/` (models, schemas)

### Security-Specific Guidelines
- Sanitize all external inputs
- Use secure defaults (TLSv1.2+, strong cipher suites)
- Implement rate-limiting for network scans
- Load secrets from secure stores or environment variables
- Provide both CLI and RESTful API interfaces

### Dependencies
- `cryptography` for symmetric/asymmetric operations
- `scapy` for packet crafting
- `python-nmap` for port scanning
- `paramiko` or `asyncssh` for SSH
- `aiohttp` or `httpx` for HTTP tools
- `PyYAML` or `python-jsonschema` for config validation

## Laravel Development (Multiple Variations)

### Laravel with Livewire
- Use Livewire 3.5+ for dynamic components
- Implement Blade components with Livewire directives
- Handle state management using Livewire properties
- Use wire:loading and wire:target for user feedback
- Apply Livewire's security measures

### Laravel with Vue.js
- Use Vite for modern development with hot module reloading
- Organize components under src/components
- Apply Vue Router for SPA navigation
- Implement Pinia for state management
- Use Vuelidate for form validation

### Laravel Core Principles
- Use PHP 8.3+ features
- Follow PSR-12 coding standards
- Always use strict typing: declare(strict_types=1)
- Implement Repository and Service patterns
- Use Laravel's built-in features:
  - Eloquent ORM over raw SQL
  - Built-in authentication (Sanctum)
  - Caching mechanisms (Redis, Memcached)
  - Job queues for background processing
  - Testing with PHPUnit and Dusk

## Drupal 10 Module Development

### Core Principles
- Follow SOLID principles for OOP
- Adhere to Drupal coding standards (based on PSR-12)
- Use Drupal's service container and plugin system
- Design for maintainability and integration

### Drupal Best Practices
- Use Drupal's database API instead of raw SQL
- Implement Repository pattern for data access
- Leverage Drupal's caching API
- Use Queue API for background processing
- Follow configuration management system
- Use Entity system and Field API
- Implement proper hook implementations
- Always align array operators (=>) in multi-line arrays
- Document with complete PHPDoc blocks

## Web Framework Guidelines

### Ghost CMS
- Use standard theme structure (assets/, partials/, templates)
- Leverage Ghost's content API and dynamic routing
- Implement proper template hierarchy
- Use Ghost helpers for data handling
- Integrate Tailwind CSS effectively
- Optimize with proper asset loading strategies

### WordPress
- Follow WordPress coding standards
- Use hooks (actions/filters) instead of modifying core
- Implement proper theme functions in functions.php
- Use WordPress's built-in APIs (transients, options, etc.)
- Secure with nonces and data sanitization
- Use wp_enqueue for asset management

### Bootstrap
- Leverage Bootstrap's grid system for responsive layouts
- Use Bootstrap components to minimize custom CSS
- Apply utility classes for quick styling
- Ensure accessibility with ARIA attributes
- Customize using Sass variables and mixins

### htmx
- Use hx-get, hx-post for server requests in HTML
- Return HTML snippets from server for efficiency
- Use declarative attributes over JavaScript
- Leverage hx-trigger for event handling
- Use hx-target for DOM updates
- Implement server-side validation

## Next.js Development

### Core Principles
- Minimize 'use client', useEffect, and setState
- Favor React Server Components and SSR
- Use functional and declarative patterns
- Structure files with clear organization
- Use lowercase-with-dashes for directories

### Optimization
- Implement dynamic imports for code splitting
- Use responsive design with mobile-first approach
- Optimize images (WebP, lazy loading)
- Use modern state management (Zustand, TanStack Query)
- Implement Zod for schema validation

## Java Development

### Spring Boot
- Use Spring Boot 3.x with Java 17+
- Follow RESTful API design patterns
- Use constructor injection for DI
- Implement proper exception handling with @ControllerAdvice
- Use Spring Data JPA for database operations
- Configure with application.properties/yml
- Test with JUnit 5 and MockMvc

### Quarkus
- Leverage Quarkus Dev Mode
- Use MicroProfile APIs
- Optimize for GraalVM native builds
- Implement reactive patterns with Vert.x/Mutiny
- Use Hibernate ORM with Panache
- Configure with application.properties
- Test with @QuarkusTest

## Unity Development

### Key Principles
- Use MonoBehaviour for GameObject scripts
- Prefer ScriptableObjects for data containers
- Follow Unity's component-based architecture
- Use Unity's built-in systems (physics, UI, input)
- Implement Coroutines for async operations

### Performance
- Use object pooling for frequently instantiated objects
- Optimize draw calls with batching
- Implement LOD systems for complex models
- Use Job System and Burst Compiler for CPU operations

## Blazor Development

### Guidelines
- Use Razor Components for component-based UI
- Implement async/await for non-blocking operations
- Use data binding with @bind
- Leverage Dependency Injection
- Structure following Separation of Concerns
- Test in Visual Studio Enterprise

### State Management
- Use Cascading Parameters for basic state sharing
- Implement Fluxor or BlazorState for complex apps
- Use Blazored.LocalStorage for client persistence
- Use Scoped Services for server-side state

## NestJS Development

### TypeScript Guidelines
- Use strict typing: declare(strict_types=1)
- Follow PSR-12 standards
- Use PascalCase for classes
- Use camelCase for variables/methods
- Use kebab-case for files
- Write functions < 20 instructions
- Write classes < 200 instructions

### NestJS Architecture
- Use modular architecture
- One module per domain/route
- Organize with models, services, controllers
- Use DTOs with class-validator
- Implement global filters and guards
- Test with Jest framework

## Go API Development

### Guidelines
- Use Go 1.22+ with standard library net/http
- Utilize new ServeMux for routing
- Implement proper HTTP method handling
- Use appropriate status codes
- Implement input validation
- Use Go's concurrency features
- Follow RESTful principles
- Implement middleware for cross-cutting concerns

## Data Analysis with Jupyter

### Key Principles
- Use pandas for data manipulation
- Use matplotlib/seaborn for visualization
- Prefer vectorized operations
- Structure notebooks with clear sections
- Include explanatory markdown cells
- Handle missing data appropriately
- Profile code for performance

## ViewComfy API Integration

### Overview
ViewComfy is a serverless API for running custom ComfyUI workflows using FastAPI framework.

### Key Concepts
- First calls may experience cold starts
- Generation times vary (seconds to minutes)
- Params object cannot be empty (at minimum, change seed)
- Uses httpx library for Python requests

### API Response Format
```python
{
    "prompt_id": "string",
    "status": "string",
    "completed": bool,
    "execution_time_seconds": float,
    "prompt": dict,
    "outputs": [
        {
            "filename": "string",
            "content_type": "string",
            "data": "string",  # Base64 encoded
            "size": int
        }
    ]
}
```

### Integration Steps
1. Deploy workflow on ViewComfy dashboard
2. Create API keys from dashboard
3. Extract workflow parameters using workflow_parameters_maker.py
4. Set up authentication (client_id, client_secret)
5. Configure parameters based on flattened JSON
6. Call API using infer() or infer_with_logs()

### Best Practices
- Handle both standard POST and SSE streaming responses
- Implement proper error handling for timeouts
- Decode base64 output data before saving
- Use async/await for non-blocking operations
- Consider rate limiting and retry logic

## Senior Front-End Developer Guidelines

### Core Principles
- Write correct, best practice, DRY principle code
- Focus on readability over performance
- Implement all functionality with no placeholders
- Use early returns for readability
- Always use Tailwind classes for styling
- Use descriptive names with handle prefix for events
- Implement accessibility features
- Use const arrow functions with type definitions

### React/Next.js/TypeScript Guidelines

#### Code Style and Structure
- Use functional and declarative programming patterns
- Prefer iteration and modularization over duplication
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content, types
- Use lowercase-with-dashes for directories
- Favor named exports for components

#### TypeScript Usage
- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces
- Enable strict mode
- Use type guards for safety
- Apply generics where needed
- Utilize utility types (Partial, Pick, Omit)

#### React Best Practices
- Use functional components with hooks
- Implement proper component composition
- Use React.memo() strategically
- Implement proper cleanup in useEffect
- Use useCallback and useMemo for optimization
- Avoid inline function definitions in JSX
- Implement proper key props in lists

#### Next.js Optimization
- Minimize 'use client', useEffect, and setState
- Favor React Server Components (RSC)
- Implement dynamic imports for code splitting
- Use responsive design with mobile-first approach
- Optimize images (WebP, size data, lazy loading)
- Use URL search parameters for server state management
- Wrap client components in Suspense
- Use dynamic loading for non-critical components

#### UI and Styling
- Use Shadcn UI, Radix UI, and Tailwind CSS
- Implement consistent design patterns
- Design with mobile-first principles
- Implement dark mode support
- Ensure color contrast meets accessibility standards
- Maintain consistent spacing values
- Define CSS variables for theming

#### Error Handling
- Prioritize error handling and edge cases
- Use early returns for error conditions
- Implement guard clauses
- Use custom error types
- Model expected errors as return values
- Use error boundaries for unexpected errors
- Implement proper error logging

#### State Management
- Use Zustand or Redux Toolkit for global state
- Use React Context for shared state
- Implement proper state initialization
- Use TanStack React Query for data fetching
- Minimize useState and useEffect usage

#### Testing
- Write unit tests with Jest and React Testing Library
- Implement integration tests for critical flows
- Use snapshot testing selectively
- Mock external dependencies
- Follow Arrange-Act-Assert pattern

## React Native/Expo Development

### Core Principles
- Follow Expo's official documentation
- Use TypeScript with strict mode
- Structure files like web React projects
- Use functional components exclusively

### UI and Styling
- Use Expo's built-in components
- Implement responsive design with Flexbox
- Use styled-components or Tailwind CSS
- Implement dark mode with useColorScheme
- Ensure high accessibility standards
- Use react-native-reanimated for animations

### Safe Area Management
- Use SafeAreaProvider globally
- Wrap components with SafeAreaView
- Use SafeAreaScrollView for scrollable content
- Avoid hardcoding padding for safe areas

### Navigation
- Use react-navigation for routing
- Leverage deep linking
- Use dynamic routes with expo-router

### Performance
- Minimize useState and useEffect
- Use Expo's AppLoading and SplashScreen
- Optimize images with expo-image
- Implement code splitting
- Profile performance regularly

## Vue/Nuxt Development

### Core Principles
- Use Composition API with <script setup>
- Prioritize functional programming
- Use Composables for reusable logic
- Follow DRY principles

### Nuxt 3 Specifics
- Leverage auto imports
- Use @nuxtjs/color-mode for theming
- Use VueUse functions
- Implement Server API for backend operations
- Use useRuntimeConfig for environment variables
- Use useHead and useSeoMeta for SEO
- Use NuxtImage/NuxtPicture for images

### Data Fetching
- Use useFetch for SSR-compatible fetching
- Use $fetch for client-side requests
- Use useAsyncData for complex logic
- Set server: false for client-only
- Set lazy: true for deferred fetching

## Gatsby Development

### Best Practices
- Use useStaticQuery for GraphQL at build time
- Use gatsby-node.js for programmatic pages
- Utilize Gatsby's Link component
- Optimize images with gatsby-plugin-image
- Use gatsby-browser.js and gatsby-ssr.js for APIs
- Implement caching strategies

## TypeScript/Pixi.js Game Development

### Key Principles
- Write performance-focused TypeScript code
- Use functional programming patterns
- Implement efficient resource management
- Use descriptive names with auxiliary verbs
- Structure by features (scenes/, entities/, systems/)

### Pixi.js Optimization
- Use sprite batching and container nesting
- Implement texture atlases
- Use built-in caching mechanisms
- Manage scene graph properly
- Use object pooling
- Implement culling for off-screen objects
- Use ParticleContainer for many sprites

### Performance
- Minimize object creation during gameplay
- Implement efficient particle systems
- Use lazy loading and pre-fetching
- Optimize for mobile devices
- Use connection pooling
- Cache frequently used data

## SvelteKit Development

### Principles
- Use kebab-case for component names
- Favor SSR features
- Minimize client-side components
- Add loading and error states
- Use semantic HTML
- Utilize Svelte stores
- Use TypeScript for type safety

## Playwright Testing

### Best Practices
- Use descriptive test names
- Utilize Playwright fixtures
- Use beforeEach/afterEach for setup/teardown
- Keep tests DRY with helper functions
- Use role-based locators
- Use page.getByTestId for data-testid
- Implement proper error handling
- Use web-first assertions
- Avoid hardcoded timeouts
- Ensure parallel test compatibility

## Payload CMS Development

### Architecture
- Structure collections with clear relationships
- Implement field-level permissions
- Create reusable field groups
- Follow hooks pattern
- Implement custom endpoints
- Use migrations for schema changes

### MongoDB Patterns
- Design schemas with proper indexing
- Use aggregation pipelines
- Implement proper error handling
- Consider document size limits
- Use transactions for atomicity
- Implement pagination

### File Structure
- Collections: src/collections/{feature}.ts
- Globals: src/globals/{feature}.ts
- Fields: src/fields/{type}.ts
- Hooks: src/hooks/{collection}/{operation}.ts
- Endpoints: src/endpoints/{feature}.ts

## OnchainKit SDK

### Component Knowledge
- Identity Components (Avatar, Name, Badge)
- Wallet Components (ConnectWallet, WalletDropdown)
- Transaction Components
- Swap Components
- Frame Components

### Best Practices
- Always use OnchainKitProvider
- Configure proper API keys
- Handle loading and error states
- Follow component composition
- Implement proper TypeScript types
- Follow security best practices

## Chrome Extension Development

### Architecture
- Follow Manifest V3 specifications
- Divide responsibilities (background, content, popup)
- Configure minimal permissions
- Use modern build tools

### Chrome API Usage
- Use chrome.* APIs correctly
- Handle async with Promises
- Use Service Worker for background
- Implement chrome.alarms for scheduling
- Handle offline functionality

### Security
- Implement Content Security Policy
- Handle user data securely
- Prevent XSS attacks
- Use secure messaging
- Handle cross-origin safely

## Python FastAPI Development

### Advanced Patterns
- Design stateless services
- Implement API gateways
- Use circuit breakers
- Favor serverless deployment
- Use async workers for background tasks

### Microservices
- Integrate with API Gateway solutions
- Use message brokers for events
- Implement inter-service communication
- Design with clear separation of concerns

### Performance
- Use async/await throughout
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Profile and monitor

## Django Development

### Core Principles
- Use Django's built-in features
- Follow MVT pattern strictly
- Use class-based views for complex logic
- Leverage Django ORM
- Use Django's auth framework

### Best Practices
- Use Django templates and DRF serializers
- Keep business logic in models
- Use Django's URL dispatcher
- Apply security best practices
- Use Django's caching framework
- Optimize with select_related/prefetch_related

## Flask Development

### Guidelines
- Use application factories
- Organize with Blueprints
- Use Flask-RESTful for APIs
- Implement custom error handlers
- Use Flask extensions
- Manage configs properly

### Database
- Use Flask-SQLAlchemy for ORM
- Implement Flask-Migrate
- Manage sessions properly
- Use Marshmallow for serialization

## JAX Machine Learning

### Best Practices
- Use functional programming patterns
- Leverage JAX transformations (jit, vmap, grad)
- Use jax.numpy instead of NumPy
- Write pure functions without side effects
- Avoid in-place mutations
- Use JAX's control flow operations
- Manage PRNG keys explicitly

### Optimization
- Write JIT-compatible code
- Use appropriate data types
- Profile for bottlenecks
- Minimize CPU/GPU transfers
- Reuse JIT-compiled functions

## Web Scraping

### Tools and Techniques
- Use requests for static sites
- Use BeautifulSoup for parsing
- Use Selenium for JavaScript sites
- Use jina/firecrawl for large-scale extraction
- Use agentQL for complex processes
- Use multion for exploratory tasks

### Best Practices
- Respect robots.txt
- Implement rate limiting
- Handle errors gracefully
- Use exponential backoff
- Validate scraped data
- Store data appropriately
- Follow ethical practices

## RoboCorp RPA

### Principles
- Use functional programming
- Prefer modularization
- Use type hints with Pydantic
- Implement RORO pattern
- Handle errors early
- Use guard clauses

### Performance
- Use async for I/O operations
- Implement caching strategies
- Optimize data serialization
- Use lazy loading
- Structure tasks clearly

## UV Package Management

### Rules
- Use uv exclusively for Python dependencies
- Never use pip, pip-tools, or poetry
- Commands:
  - uv add <package>
  - uv remove <package>
  - uv sync
  - uv run script.py

## Odoo Development

### Core Principles
- Use Odoo's ORM and API decorators
- Create UI views with XML
- Implement web controllers
- Organize modules properly
- Use QWeb for templating

### Best Practices
- Use built-in exceptions
- Enforce data integrity
- Define robust ACLs
- Enable i18n
- Extend via inheritance
- Optimize ORM queries