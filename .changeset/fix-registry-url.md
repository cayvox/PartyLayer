---
"@cantonconnect/sdk": patch
---

fix: correct DEFAULT_REGISTRY_URL to base URL

The DEFAULT_REGISTRY_URL was incorrectly set to include the full path `/v1/wallets.json`, 
which caused the RegistryClient to construct an invalid URL by appending `/v1/{channel}/registry.json` to it.

Before: `https://registry.cantonconnect.xyz/v1/wallets.json/v1/stable/registry.json` (404)
After: `https://registry.cantonconnect.xyz/v1/stable/registry.json` (correct)
