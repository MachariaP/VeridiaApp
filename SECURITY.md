# Security Guidelines for VeridiaApp

## Secret Management

This project requires several secrets and credentials to operate. **Never commit real secrets to version control.**

### Required Secrets

#### 1. Database Credentials

**PostgreSQL Password** (`POSTGRES_PASSWORD`)
- Used by the user service database
- Generate a strong password: `openssl rand -base64 32`
- Set in `.env` file in user_service directory

**Database URL** (`DATABASE_URL`)
- Full connection string including username and password
- Format: `postgresql://username:password@host:port/database`
- Must match the PostgreSQL credentials

#### 2. JWT Secret Key

**JWT_SECRET_KEY**
- Critical for token signing and validation
- Must be the same across all services (user_service and content_service)
- Generate using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Minimum length: 32 characters

### Setup Instructions

#### For Development

1. Copy `.env.example` to `.env` in each service directory:
   ```bash
   cd user_service
   cp .env.example .env
   
   cd ../content_service
   cp .env.example .env
   ```

2. Generate a JWT secret key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. Generate a database password:
   ```bash
   openssl rand -base64 32
   ```

4. Edit both `.env` files and replace:
   - `CHANGE_THIS_PASSWORD` with your generated database password
   - `CHANGE_THIS_SECRET_KEY` with your generated JWT secret key
   - **Important**: Use the same JWT_SECRET_KEY in both services

5. Update the `DATABASE_URL` in user_service/.env to include your password:
   ```
   DATABASE_URL=postgresql://veridiapp_user:YOUR_PASSWORD@localhost:5432/veridiapp_user_db
   ```

#### For Production

**Never use default or weak secrets in production!**

1. Use environment variables or a secret management service:
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - Azure Key Vault
   - HashiCorp Vault

2. Rotate secrets regularly (recommended: every 90 days)

3. Use different secrets for each environment (dev, staging, production)

4. Enable audit logging for secret access

5. Restrict access to secrets using IAM/RBAC policies

### Docker Compose Usage

When using Docker Compose, ensure environment variables are set before starting services:

```bash
# Set environment variables
export POSTGRES_PASSWORD="your-secure-password"
export JWT_SECRET_KEY="your-jwt-secret-key"

# Start services
docker compose up
```

Alternatively, create a `.env` file in the service directory (already ignored by git):
```bash
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET_KEY=your-jwt-secret-key
```

### Security Checklist

- [ ] All `.env` files are listed in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] Strong, randomly-generated secrets are used
- [ ] Same JWT_SECRET_KEY is used across all services
- [ ] Production secrets are stored in a secure secret manager
- [ ] Secrets are rotated regularly
- [ ] Access to secrets is restricted and audited

### Reporting Security Issues

If you discover a security vulnerability, please report it to the project maintainers privately. Do not create public issues for security vulnerabilities.

### Additional Resources

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [12-Factor App: Config](https://12factor.net/config)

---

*Last Updated: October 2024*
