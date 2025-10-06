# PawfectMatch Premium - Development Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up development environment:**
   ```bash
   ./scripts/dev-setup.sh
   ```

3. **Start development servers:**
   ```bash
   pnpm dev
   ```

## Available Scripts

### Development
- `pnpm dev` - Start development servers
- `pnpm build` - Build for production
- `pnpm start` - Start production servers

### Quality Assurance
- `pnpm type-check` - TypeScript type checking
- `pnpm lint` - ESLint checking
- `pnpm format` - Format code with Prettier
- `pnpm quality-gate` - Run comprehensive quality checks

### Testing
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:integration` - Run integration tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:visual` - Run visual regression tests
- `pnpm test:load` - Run load tests
- `pnpm test:chaos` - Run chaos engineering tests
- `pnpm test:security` - Run security tests
- `pnpm test:performance` - Run performance tests

### Security & Performance
- `pnpm audit` - Security audit
- `pnpm test:security` - Security testing
- `pnpm test:performance` - Performance testing

## Architecture

- **Frontend**: Next.js 15 with React 18
- **Mobile**: React Native with Expo
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Testing**: Jest, Cypress, Playwright, k6
- **Quality**: ESLint, Prettier, SonarQube
- **CI/CD**: GitHub Actions with TurboRepo

## Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Enterprise-grade rules
- **Prettier**: Consistent formatting
- **Testing**: 80%+ coverage required
- **Security**: Zero vulnerabilities
- **Performance**: Core Web Vitals optimized

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run quality gate: `pnpm quality-gate`
4. Submit pull request
5. Pass CI/CD pipeline

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Run `pnpm type-check` to identify issues
2. **Linting errors**: Run `pnpm lint --fix` to auto-fix
3. **Test failures**: Check test output and fix issues
4. **Build failures**: Ensure all dependencies are installed

### Getting Help

- Check the [Professional Development Workflow](PROFESSIONAL_DEVELOPMENT_WORKFLOW.md)
- Review [API Documentation](API.md)
- Check [Testing Guide](TESTING_GUIDE.md)
