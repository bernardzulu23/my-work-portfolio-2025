# TODO: Fix Build Errors

## Completed
- [x] Update SecurityEvent type to include 'rate_limit_exceeded' | 'suspicious_activity'
- [x] Remove RateLimitConfig from index.ts export
- [x] Change signal type in login.component.ts to RateLimitStatus | null
- [x] Add path mapping in tsconfig.json for environments
- [x] Change import in supabase.service.ts to use path mapping
- [x] Fix import in login.component.ts to import RateLimitStatus from SecurityService
- [x] Run build to verify fixes

## Next Steps
- [ ] All build errors have been resolved
