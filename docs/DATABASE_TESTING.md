# Zenya AI - Database Testing Documentation

## Overview

This document provides comprehensive information about database testing for Zenya AI, including schema validation, RLS (Row Level Security) policies, performance testing, and Supabase-specific features.

## Database Schema

### Core Tables

1. **users** - User profiles and authentication data
   - Primary key: `id` (UUID)
   - Indexes: email, last_login
   - RLS: Users can only read/update their own data

2. **lessons** - Educational content
   - Primary key: `id` (UUID)
   - Foreign key: `curriculum_id`
   - Indexes: curriculum_id, order_index, search_vector (GIN)
   - RLS: Public read access when active

3. **user_progress** - Tracks user learning progress
   - Primary key: `id` (UUID)
   - Foreign keys: `user_id`, `lesson_id`, `curriculum_id`
   - Indexes: user_id, status, composite indexes
   - RLS: Users can only manage their own progress

4. **user_sessions** - Learning session tracking
   - Primary key: `id` (UUID)
   - Foreign keys: `user_id`, `lesson_id`
   - Indexes: user_id, started_at
   - RLS: Users can only manage their own sessions

5. **curriculums** - Course organization
   - Primary key: `id` (UUID)
   - Indexes: slug (unique), difficulty_level
   - RLS: Public read access when active

6. **audit_logs** - Security and compliance logging
   - Primary key: `id` (UUID)
   - Indexes: timestamp, user_id, event_type
   - RLS: Users see own logs, admins see all

### Materialized Views

1. **user_learning_stats** - Aggregated user metrics
2. **lesson_analytics** - Lesson performance metrics

## Testing Scripts

### 1. Comprehensive Database Operations Test

```bash
./scripts/test-database-operations.ts
```

This script tests:
- Database schema validation
- RLS policy enforcement
- Query performance
- Data integrity constraints
- Advanced features (full-text search, materialized views)
- Supabase-specific features

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. RLS Policy Testing

```bash
./scripts/test-rls-policies.ts
```

This script specifically tests:
- User data isolation
- CRUD permissions per table
- Cross-user access prevention
- Admin vs user access levels
- Authentication state handling

### 3. Performance Testing

```bash
./scripts/test-database-performance.ts
```

This script tests:
- Query execution times
- Index effectiveness
- Complex join performance
- Pagination efficiency
- Concurrent query handling
- Materialized view performance

## Test Results Interpretation

### Performance Thresholds

- **Fast**: < 50ms ✅
- **Acceptable**: < 200ms ⚠️
- **Slow**: < 500ms 🔸
- **Critical**: > 500ms 🔴

### RLS Policy Status

- **PASS**: Policy correctly enforces access rules
- **FAIL**: Policy has security vulnerabilities

## Common Issues and Solutions

### 1. Slow Queries

**Issue**: Queries taking > 200ms

**Solutions**:
- Add appropriate indexes
- Use materialized views for complex aggregations
- Implement query result caching
- Optimize join operations

### 2. RLS Policy Failures

**Issue**: Users can access other users' data

**Solutions**:
- Review policy conditions
- Ensure `auth.uid()` is used correctly
- Test with multiple user contexts
- Verify foreign key relationships

### 3. Data Integrity Issues

**Issue**: Invalid data can be inserted

**Solutions**:
- Add CHECK constraints
- Implement database triggers
- Use proper data types
- Add NOT NULL constraints where needed

## Database Optimization Recommendations

### 1. Indexing Strategy

```sql
-- High-priority indexes
CREATE INDEX CONCURRENTLY idx_user_progress_user_status 
ON user_progress(user_id, status) 
WHERE status IN ('in_progress', 'completed');

CREATE INDEX CONCURRENTLY idx_lessons_curriculum_order_active 
ON lessons(curriculum_id, order_index, is_active) 
WHERE is_active = true;
```

### 2. Query Optimization

- Use covering indexes for frequently accessed columns
- Implement partial indexes for filtered queries
- Regular VACUUM and ANALYZE operations
- Monitor pg_stat_statements for slow queries

### 3. RLS Best Practices

- Keep policies simple and efficient
- Use database functions for complex logic
- Test policies with different user roles
- Monitor policy performance impact

### 4. Maintenance Tasks

```sql
-- Refresh materialized views (schedule daily)
SELECT refresh_analytics_views();

-- Update user streaks (schedule hourly)
SELECT update_user_streaks();

-- Clean old audit logs (schedule monthly)
SELECT cleanup_old_audit_logs();
```

## Security Considerations

### 1. RLS Policy Security

- Always use `auth.uid()` for user identification
- Implement proper admin role checks
- Test cross-user access attempts
- Audit policy changes

### 2. Data Protection

- Encrypt sensitive data at rest
- Use SSL for all connections
- Implement audit logging
- Regular security reviews

### 3. Access Control

- Service role key only for admin operations
- Anon key for public operations
- User-specific tokens for authenticated requests
- Regular key rotation

## Monitoring and Alerts

### 1. Performance Monitoring

```sql
-- Monitor slow queries
SELECT * FROM slow_query_monitor;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### 2. Security Monitoring

```sql
-- Monitor failed access attempts
SELECT * FROM audit_logs
WHERE outcome = 'FAILURE'
AND timestamp > NOW() - INTERVAL '1 hour';

-- Check for unusual access patterns
SELECT user_id, COUNT(*) as access_count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 100;
```

## Backup and Recovery

### 1. Backup Strategy

- Daily automated backups
- Point-in-time recovery enabled
- Regular backup testing
- Offsite backup storage

### 2. Recovery Procedures

1. Identify recovery point
2. Restore from backup
3. Apply WAL logs if needed
4. Verify data integrity
5. Update audit logs

## Compliance and Audit

### 1. Audit Requirements

- All data modifications logged
- User access tracked
- Retention policies enforced
- Regular audit reviews

### 2. Compliance Checks

- GDPR data handling
- User data deletion
- Access logs retention
- Security incident response

## Troubleshooting Guide

### Common Error Messages

1. **"permission denied for table"**
   - Check RLS policies
   - Verify user authentication
   - Review table permissions

2. **"violates check constraint"**
   - Validate input data
   - Review constraint definitions
   - Update application validation

3. **"deadlock detected"**
   - Review transaction logic
   - Implement retry mechanism
   - Optimize query order

## Contact and Support

For database-related issues:
1. Check this documentation
2. Review test results
3. Contact the development team
4. File an issue in the repository

---

Last updated: December 2024