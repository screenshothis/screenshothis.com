# common

This package provides shared type definitions and configurations for API key rate limiting.

## Exports

- `keyLimits`: Configuration for different subscription plans and their rate limit settings
- `Limit`: TypeScript type defining the structure of rate limit settings

## Usage Example

```ts
import { keyLimits, Limit } from '@screenshothis/common';

// Access rate limits for a specific plan
const freePlanLimits = keyLimits.free;

// Example of working with the Limit type
const customLimit: Limit = {
    rateLimitMax: 100,
}
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
